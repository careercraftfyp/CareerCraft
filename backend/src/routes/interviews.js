import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { supabase } from '../lib/supabase.js';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TAVUS_API_BASE = 'https://tavusapi.com/v2';

// Default persona: "excited" interview persona
const DEFAULT_PERSONA_ID = 'pdac61133ac5';
const DEFAULT_REPLICA_ID = 'r5f0577fc829';

import { requireAuth } from '../middleware/auth.js';

/**
 * Route: Initialize Interview Session
 * POST /api/interviews/initialize
 */
router.post('/initialize', requireAuth, async (req, res) => {
    try {
        const { position, field = '', difficulty = 'medium', mode = 'voice + video', company = '', jobDescription = '', resumeText = '' } = req.body;

        if (!position) {
            return res.status(400).json({ error: 'Position / Job role is required' });
        }

        const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

        // 1. Generate Interview Questions and Resume Summary via OpenAI
        const questionsResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'system',
                content: `You are an elite executive recruiter. Your goal is to generate a highly professional, structured interview sequence AND condense the candidate's resume for a fast-paced live AI interviewer.`
            }, {
                role: 'user',
                content: `Task 1: Generate 6 structured interview questions for a ${difficulty} difficulty ${position} position in the ${field} field. 
                Task 2: Summarize the candidate's resume into 5 ultra-dense bullet points focusing on key metrics, tech stacks, and achievements.

                Context:
                Company: ${company}. 
                Job Description: ${jobDescription}.
                Candidate Resume: ${resumeText}.
                
                The response MUST be a JSON object with two keys:
                1. "questions": an array of 6 strings (intro, technical, behavioral, closing).
                2. "resumeSummary": A string containing the 5-bullet summary. If no resume, return "No resume provided."
                
                Example: { "questions": ["Q1", ...], "resumeSummary": "- Lead Dev at X\\n- Built Y\\n..." }`
            }],
            response_format: { type: "json_object" }
        });

        let questions = [];
        let resumeSummary = 'No resume provided.';
        try {
            const rawContent = questionsResponse.choices[0].message.content;
            const parsed = JSON.parse(rawContent);
            questions = parsed.questions || [];
            resumeSummary = parsed.resumeSummary || 'No resume provided.';
            if (questions.length === 0) {
                questions = Array.isArray(parsed) ? parsed : [];
            }
        } catch (e) {
            console.error('Failed to parse questions/summary JSON', e);
            questions = [
                "Tell me about yourself and your background.",
                `What drew you specifically to the ${position} role?`,
                "Describe a complex technical challenge you solved recently and what your approach was.",
                "How do you stay current with new technologies or industry developments?",
                "Tell me about a time you had to navigate a difficult situation with a colleague or stakeholder.",
                "Where do you see your career in the next three years, and how does this role fit into that?"
            ];
        }

        // 2. Insert record into Supabase
        const { data: dbSession, error: dbError } = await supabase
            .from('interviews')
            .insert([{
                user_id: userId,
                job_role: position,
                job_field: field,
                difficulty,
                mode,
                questions,
                status: 'in_progress'
            }])
            .select()
            .single();

        if (dbError) {
            throw new Error(`Database error: ${dbError.message}`);
        }

        // 3. Create a Tavus Conversation
        const interviewContext = `
        You are a seasoned Senior Director of Talent at ${company || 'a prestigious firm'}, conducting a high-stakes screening interview for the ${position} role.
        You are not hostile, but you are exacting. You have interviewed hundreds of candidates and have zero patience for rehearsed, hollow answers.
        Your demeanor is calm, composed, and professionally intense — like a partner at a top consulting firm.

        [CANDIDATE RESUME SUMMARY]:
        ${resumeSummary}

        [RESPONSE DISCIPLINE — NON-NEGOTIABLE]:
        1. BREVITY: Every response must be 1-2 sentences maximum. You are assessing, not explaining.
        2. NO AFFIRMATIONS: Never say "Great answer", "That's interesting", "Good point", or any filler. Transition directly and cleanly to your next question.
        3. MAINTAIN PACE: Keep the interview moving. Do not linger on any single answer.

        [INTERVIEWING STYLE]:
        - Ask one question at a time. Never stack multiple questions.
        - If an answer is vague or generic, calmly ask for a specific example: "Can you give me a concrete example of that?"
        - If an answer lacks measurable impact, probe: "What was the actual outcome? Numbers, results, impact?"
        - If their answer does not align with their resume, note it professionally: "Your resume mentions X — how does that connect to what you just described?"
        - If they give a strong, specific answer, acknowledge it with silence and move on. Your silence is your approval.
        - Never repeat a question. If they don't answer it well, move on and note it mentally.

        [INTERVIEW STRUCTURE]:
        Work through the following questions in order. Use your judgment to probe deeper on any question before moving forward.
        ${questions.map((q, i) => `[Q${i + 1}] ${q}`).join('\n')}

        Begin the interview now. Open with a single, welcoming but businesslike sentence, then ask them to walk you through their background briefly.`;

        const tavusPayload = {
            persona_id: DEFAULT_PERSONA_ID,
            replica_id: DEFAULT_REPLICA_ID,
            conversation_name: `Mock Interview - ${position}`,
            conversational_context: interviewContext,
            custom_greeting: `Good to meet you. We have a focused session today for the ${position} role — let's make good use of the time. Please walk me through your background and what brought you to this opportunity.`,
            properties: {
                max_call_duration: 3600,
                participant_left_timeout: 10,
                enable_recording: true,
                apply_greenscreen: false,
                language: 'english'
            }
        };

        const tavusRes = await fetch(`${TAVUS_API_BASE}/conversations`, {
            method: 'POST',
            headers: {
                'x-api-key': process.env.TAVUS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tavusPayload)
        });

        if (!tavusRes.ok) {
            const errText = await tavusRes.text();
            throw new Error(`Tavus API error: ${tavusRes.status} - ${errText}`);
        }

        const tavusData = await tavusRes.json();

        // Save Tavus ID
        await supabase.from('interviews').update({
            tavus_conversation_id: tavusData.conversation_id
        }).eq('id', dbSession.id);

        res.json({
            message: 'Interview session initialized',
            sessionId: dbSession.id,
            conversationId: tavusData.conversation_id,
            conversationUrl: tavusData.conversation_url,
            status: tavusData.status,
            questions,
            meta: {
                position,
                company
            }
        });

    } catch (error) {
        console.error('Error initializing interview:', error);
        res.status(500).json({ error: error.message || 'Failed to initialize interview' });
    }
});

/**
 * Route: End Interview Session
 * POST /api/interviews/:conversationId/end
 */
router.post('/:conversationId/end', requireAuth, async (req, res) => {
    try {
        const { conversationId } = req.params;

        const tavusRes = await fetch(`${TAVUS_API_BASE}/conversations/${conversationId}/end`, {
            method: 'POST',
            headers: {
                'x-api-key': process.env.TAVUS_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!tavusRes.ok) {
            const errText = await tavusRes.text();
            throw new Error(`Tavus API error: ${tavusRes.status} - ${errText}`);
        }

        res.json({ message: 'Interview session ended successfully' });

    } catch (error) {
        console.error('Error ending interview:', error);
        res.status(500).json({ error: error.message || 'Failed to end interview' });
    }
});

/**
 * Route: Evaluate Interview Audio
 * POST /api/interviews/:sessionId/evaluate
 * Note: Expects audio blob in the request generated from frontend MediaRecorder
 */
import multer from 'multer';
import FormData from 'form-data';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: os.tmpdir() });

router.post('/:sessionId/evaluate', requireAuth, upload.single('audio'), async (req, res) => {
    try {
        const { sessionId } = req.params;
        const file = req.file;

        if (!file) {
            // Fallback for missing audio (e.g. microphone disabled or denied)
            const fallbackEvaluation = {
                overallScore: 0,
                communicationScore: 0,
                contentRelevanceScore: 0,
                strengths: ['N/A'],
                improvements: ['Hardware missing: Enable microphone to receive actionable feedback'],
                feedback: 'No audio was recorded during this session. Please ensure you have granted microphone permissions and are speaking clearly into your device.'
            };

            await supabase.from('interviews').update({
                transcript: '[No Audio Data]',
                evaluation: fallbackEvaluation,
                status: 'completed'
            }).eq('id', sessionId);

            return res.json({
                message: 'Processed with missing audio',
                transcript: '[No Audio Data]',
                evaluation: fallbackEvaluation
            });
        }

        // Fetch session data
        const { data: session, error: fetchErr } = await supabase
            .from('interviews')
            .select('*')
            .eq('id', sessionId)
            .single();

        if (fetchErr || !session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        console.log(`Processing evaluation for session: ${sessionId}, file: ${file.path}`);

        // 1. Rename file to ensure Whisper API accepts it
        const audioPath = `${file.path}.webm`;
        fs.renameSync(file.path, audioPath);

        // 2. Transcribe Audio and Analyze Acoustics Concurrently
        const audioStream = fs.createReadStream(audioPath);
        
        const pythonScriptPath = path.join(__dirname, '../utils/audio_analyzer.py');
        const acousticAnalysisPromise = new Promise((resolve) => {
            // Use 'python3' or 'python' based on environment, usually 'python' works on windows/venv
            const pythonProcess = spawn('python', [pythonScriptPath, audioPath]);
            let dataString = '';
            
            pythonProcess.stdout.on('data', (data) => {
                dataString += data.toString();
            });
            
            pythonProcess.on('close', (code) => {
                try {
                    const result = JSON.parse(dataString);
                    resolve(result);
                } catch (e) {
                    console.error('Failed to parse python acoustic analysis output:', dataString);
                    resolve({ status: 'error', error_message: 'Failed to parse output' });
                }
            });
            
            pythonProcess.on('error', (err) => {
                console.error('Failed to start python script:', err);
                resolve({ status: 'error', error_message: 'Python script failed to start' });
            });
        });

        const [transcription, acousticAnalysis] = await Promise.all([
            openai.audio.transcriptions.create({
                file: audioStream,
                model: 'whisper-1',
                language: 'en'
            }),
            acousticAnalysisPromise
        ]);

        const transcript = transcription.text;
        console.log('Transcription successful:', transcript);

        // Clean up the uploaded temp file
        try { fs.unlinkSync(audioPath); } catch (e) { console.error('Failed to cleanup temp file', e); }

        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({ error: 'No speech detected in audio.' });
        }

        let acousticText = '';
        if (acousticAnalysis.status === 'success') {
            acousticText = `
The following is the NLP acoustic analysis of the candidate's actual voice recording:
- Speech Rate: ${acousticAnalysis.estimated_syllables_per_minute} syllables/min (${acousticAnalysis.speech_rate_category})
- Tone/Emotion: ${acousticAnalysis.tone_analysis}
- Pauses/Hesitations Detected: ${acousticAnalysis.pauses_detected} (Long hesitations: ${acousticAnalysis.long_hesitations})

IMPORTANT: Use this acoustic analysis to inform the "communicationScore", "strengths", and "improvements". If they are monotone or have many long hesitations, reduce the communication score and note it in improvements. If their speech rate is Optimal and tone is Dynamic, praise it in strengths.`;
        }

        // 2. Evaluate Transcript using OpenAI
        const evaluationPrompt = `
You are an expert AI technical recruiter evaluating a candidate's interview performance.
Job Role: ${session.job_role}
Difficulty: ${session.difficulty}

The following were the interview questions asked:
${session.questions ? session.questions.map((q, i) => `${i + 1}. ${q}`).join('\n') : 'Not available'}

The following is the raw speech transcript from the candidate's audio:
"${transcript}"
${acousticText}

Provide a comprehensive, objective performance report. Your response MUST be a valid JSON object matching the following structure exactly:
{
    "overallScore": <integer between 0-100 representing overall performance>,
    "communicationScore": <integer between 0-100 based on clarity, articulation, and vocal delivery>,
    "contentRelevanceScore": <integer between 0-100 based on answering the questions asked>,
    "strengths": [<array of 2-3 strings highlighting strengths>],
    "improvements": [<array of 2-3 actionable areas for improvement>],
    "feedback": "<A brief 2-3 sentence summary of the performance>"
}`;

        const evaluationResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'system',
                content: 'You are an objective and constructive AI interviewer evaluator.'
            }, {
                role: 'user',
                content: evaluationPrompt
            }],
            response_format: { type: "json_object" }
        });

        let evaluationData;
        try {
            evaluationData = JSON.parse(evaluationResponse.choices[0].message.content);
            if (acousticAnalysis.status === 'success') {
                evaluationData.acousticAnalysis = acousticAnalysis;
            }
        } catch (e) {
            console.error('Failed to parse evaluation JSON', e);
            throw new Error('Failed to parse evaluation output from AI');
        }

        // 3. Save Transcript and Evaluation to Supabase
        const { error: updateErr } = await supabase
            .from('interviews')
            .update({
                transcript,
                evaluation: evaluationData,
                status: 'completed'
            })
            .eq('id', sessionId);

        if (updateErr) {
            console.error(`Database update error: ${updateErr.message}`);
            // Non-fatal, we still return the evaluation
        }

        res.json({
            message: 'Evaluation processed successfully',
            transcript,
            evaluation: evaluationData
        });

    } catch (error) {
        console.error('Error evaluating interview:', error);
        
        // Failsafe: Update DB status to failed so frontend stops polling infinitely
        try {
            await supabase.from('interviews').update({ status: 'failed' }).eq('id', req.params.sessionId);
        } catch (dbErr) {
            console.error('Failed to update session to failed state:', dbErr);
        }

        // Ensure temp file is cleaned up on error if it exists
        if (req.file?.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
            try { fs.unlinkSync(req.file.path + '.webm'); } catch (e) { }
        }
        res.status(500).json({ error: error.message || 'Failed to evaluate interview' });
    }
});

/**
 * Route: Get Interview Report
 * GET /api/interviews/:sessionId/report
 */
router.get('/:sessionId/report', requireAuth, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const { data: session, error } = await supabase
            .from('interviews')
            .select('evaluation, status')
            .eq('id', sessionId)
            .single();

        if (error || !session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.status === 'failed') {
            return res.status(500).json({ error: 'Evaluation failed on the server. Audio could not be processed.' });
        }

        if (session.status !== 'completed' || !session.evaluation) {
            return res.status(202).json({ message: 'Evaluation is still processing' });
        }

        res.json(session.evaluation);
    } catch (error) {
        console.error('Error fetching interview report:', error);
        res.status(500).json({ error: 'Failed to fetch interview report' });
    }
});

/**
 * Route: Get AI Training Recommendations
 * GET /api/interviews/recommendations
 * Generates personalized drills based on interview performance:
 *  - communicationScore low  → speaking/confidence exercises
 *  - domain_knowledge weak + CS/tech field → short code-debug exercises
 *  - structure weak → story-structuring drills
 *  - reasoning weak → analytical puzzles
 */
router.get('/recommendations', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch latest completed interviews
        const { data: interviews, error: fetchErr } = await supabase
            .from('interviews')
            .select('evaluation, job_role, job_field')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(5);

        if (fetchErr) throw fetchErr;

        if (!interviews || interviews.length === 0) {
            return res.json({
                recommendations: [],
                weakAreas: [],
                message: 'No completed interviews found. Start a mock interview to activate personalized training!'
            });
        }

        // 2. Build performance summary
        const feedbackSummary = interviews.map(i => ({
            role: i.job_role,
            field: i.job_field,
            overallScore: i.evaluation?.overallScore,
            communicationScore: i.evaluation?.communicationScore,
            contentRelevanceScore: i.evaluation?.contentRelevanceScore,
            strengths: i.evaluation?.strengths || [],
            improvements: i.evaluation?.improvements || []
        }));

        const jobField = interviews[0]?.job_field || 'General';
        const jobRole = interviews[0]?.job_role || '';

        const isTechField = ['computer science', 'software', 'data science', 'engineering', 'developer', 'programmer', 'coding'].some(kw =>
            jobField.toLowerCase().includes(kw) || jobRole.toLowerCase().includes(kw)
        );

        // 3. Generate smart, contextual exercises via OpenAI
        const recommendationPrompt = `
You are an elite AI Career Coach. A candidate has completed ${interviews.length} mock interview(s).

Performance History:
${JSON.stringify(feedbackSummary, null, 2)}

Job Field: ${jobField} | Is Technical/CS Field: ${isTechField}

TASK: Identify the 2 biggest weaknesses and generate 2 highly targeted training exercises.

STRICT EXERCISE TYPE RULES:
- If communicationScore < 65 OR "communication" is in improvements → Use exercise_type: "speaking_drill"
  The scenario MUST include: (a) an exact spoken script/prompt to practice out loud, (b) a step-by-step speaking routine (e.g., "Record yourself for 60s saying X, then replay and note filler words").
- If (domain_knowledge OR technical skill) weak AND isTechField=true → Use exercise_type: "code_debug"
  The scenario MUST include: a real buggy code snippet (8-15 lines, Python or JavaScript) with a clearly stated bug goal. Include line numbers. Make the bug realistic (off-by-one, wrong variable, missing return, type error, etc.).
- If structure/organization is weak → Use exercise_type: "story_structure"
  The scenario MUST include: 5-6 scrambled story bullet points that the candidate must reorder into a coherent STAR format.
- If reasoning/logic is weak → Use exercise_type: "analytical_puzzle"
  The scenario MUST include: a short case study or logical puzzle (3-5 sentences) the candidate must reason through.

Each exercise MUST have these exact fields:
{
  "area_of_focus": "string (e.g., 'Communication Confidence', 'Code Debugging', 'Answer Structure')",
  "exercise_type": "speaking_drill | code_debug | story_structure | analytical_puzzle | behavioral",
  "skill_tag": "communication | domain_knowledge | structure | reasoning",
  "difficulty_level": <1-5: 1=very easy, 5=expert. Base it on scores: score<50→1-2, 50-70→3, >70→4-5>,
  "domain": "${jobField}",
  "title": "string (catchy, specific drill name)",
  "description": "string (2-3 sentences explaining what the drill is, why it helps this person specifically)",
  "scenario": "string (the ACTUAL exercise content — the script, code, scrambled bullets, or puzzle)",
  "steps": ["step 1", "step 2", "step 3", "step 4"] (3-5 concrete action steps to complete this exercise),
  "targeted_advice": "string (coach's secret tip — for code_debug reveal the exact bug & fix; for speaking give the ideal answer framework with keywords)"
}

Return ONLY this JSON:
{
  "weakAreas": ["area1", "area2"],
  "exercises": [ ...2 exercises... ]
}`;

        const aiResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a specialized AI Career Coach. Generate precise, field-appropriate interview training exercises. Always follow the exercise_type rules exactly.' },
                { role: 'user', content: recommendationPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const recData = JSON.parse(aiResponse.choices[0].message.content);

        // 4. Save exercises to practice_sessions table
        const practiceEntries = (recData.exercises || []).map(ex => ({
            user_id: userId,
            area_of_focus: ex.area_of_focus,
            exercise_type: ex.exercise_type,
            skill_tag: ex.skill_tag || 'communication',
            difficulty_level: ex.difficulty_level || 2,
            domain: ex.domain || jobField,
            content: {
                title: ex.title,
                description: ex.description,
                scenario: ex.scenario,
                steps: ex.steps || [],
                targeted_advice: ex.targeted_advice
            }
        }));

        const { data: savedSessions, error: saveErr } = await supabase
            .from('practice_sessions')
            .insert(practiceEntries)
            .select();

        if (saveErr) {
            console.error('Error saving practice sessions:', saveErr);
        }

        res.json({
            weakAreas: recData.weakAreas || [],
            recommendations: savedSessions || practiceEntries
        });

    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

/**
 * Route: Complete a Practice Session
 * PATCH /api/interviews/recommendations/:id/complete
 */
router.patch('/recommendations/:id/complete', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('practice_sessions')
            .update({ status: 'completed' })
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Practice session marked as completed' });
    } catch (error) {
        console.error('Error completing practice session:', error);
        res.status(500).json({ error: 'Failed to complete practice session' });
    }
});

export default router;
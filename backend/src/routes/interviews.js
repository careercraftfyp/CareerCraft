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

// Middleware to mock auth for now
const mockAuth = (req, res, next) => {
    req.user = { id: '00000000-0000-0000-0000-000000000000', name: 'Candidate' };
    next();
};

/**
 * Route: Initialize Interview Session
 * POST /api/interviews/initialize
 */
router.post('/initialize', mockAuth, async (req, res) => {
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
                `What interested you in the ${position} role specifically?`,
                "Describe a complex technical challenge you solved recently.",
                "How do you approach learning new technologies or frameworks?",
                "Give an example of a time you had to work with a difficult teammate.",
                "Where do you see yourself in three years?"
            ]; // Improved fallback
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
        You are a CRITICAL senior executive recruiter for ${company || 'a top-tier firm'} interviewing for the ${position} position.
        
        [CANDIDATE RESUME SUMMARY]:
        ${resumeSummary}

        [CRITICAL LATENCY CONSTRAINTS - YOU MUST OBEY]:
        1. UNDER 2 SENTENCES: Every single response you give MUST be less than 2 sentences. Never go over.
        2. ZERO FILLER: Do not say "That's great", "I understand", "Good answer", "Let's move on". Ask the next question immediately and aggressively.
        3. NO WAITING: If they stop speaking for 2 seconds, immediately ask a follow-up or move to the next question.

        [PERSONALITY]:
        - You have incredibly high standards.
        - Be skeptical. If an answer is vague, press for details immediately.
        - If their verbal answer contradicts their resume summary, point it out.
        
        [INTERVIEW SCRIPT]:
        ${questions.map((q, i) => `[Q${i + 1}] ${q}`).join('\n')}
        
        Start now by briefly telling them to introduce themselves based on their resume.`;

        const tavusPayload = {
            persona_id: DEFAULT_PERSONA_ID,
            replica_id: DEFAULT_REPLICA_ID,
            conversation_name: `Mock Interview - ${position}`,
            conversational_context: interviewContext,
            custom_greeting: `Hello. I'm assessing you for the ${position} role. Quickly introduce yourself and your background.`,
            properties: {
                max_call_duration: 3600,
                participant_left_timeout: 10,
                enable_recording: true,
                apply_greenscreen: false,
                language: 'english',
                // AGGRESSIVE LATENCY & SPONTANEITY SETTINGS
                turn_taking_patience: "low",
                replica_interruptibility: "high",
                turn_detection_model: "sparrow-1",
                replica_is_master: true // If supported, tells replica to lead
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
router.post('/:conversationId/end', mockAuth, async (req, res) => {
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

const upload = multer({ dest: os.tmpdir() });

router.post('/:sessionId/evaluate', mockAuth, upload.single('audio'), async (req, res) => {
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

        // 1. Transcribe Audio using Whisper API
        const audioStream = fs.createReadStream(file.path);
        const transcription = await openai.audio.transcriptions.create({
            file: audioStream,
            model: 'whisper-1',
            language: 'en'
        });

        const transcript = transcription.text;
        console.log('Transcription successful:', transcript);

        // Clean up the uploaded temp file
        try { fs.unlinkSync(file.path); } catch (e) { console.error('Failed to cleanup temp file', e); }

        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({ error: 'No speech detected in audio.' });
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

Provide a comprehensive, objective performance report. Your response MUST be a valid JSON object matching the following structure exactly:
{
    "overallScore": <integer between 0-100 representing overall performance>,
    "communicationScore": <integer between 0-100 based on clarity and articulation>,
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
        // Ensure temp file is cleaned up on error if it exists
        if (req.file?.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        res.status(500).json({ error: error.message || 'Failed to evaluate interview' });
    }
});

/**
 * Route: Get Interview Report
 * GET /api/interviews/:sessionId/report
 */
router.get('/:sessionId/report', mockAuth, async (req, res) => {
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
 */
router.get('/recommendations', mockAuth, async (req, res) => {
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
                message: 'No completed interviews found to analyze. Start a mock interview to get recommendations!'
            });
        }

        // 2. Aggregate feedback for AI analysis
        const feedbackSummary = interviews.map((i, idx) => ({
            role: i.job_role,
            scores: i.evaluation,
            strengths: i.evaluation.strengths,
            improvements: i.evaluation.improvements
        }));

        // 3. Ask OpenAI to generate targeted exercises
        const recommendationPrompt = `
You are an elite AI Career Coach. Analyze the following interview performance history of a candidate:
${JSON.stringify(feedbackSummary, null, 2)}

Identify the candidate's top 2 recurring weaknesses. 
For each weakness, generate one highly specific, actionable practice exercise.
The response MUST be a valid JSON object matching this structure:
{
    "weakAreas": ["string"],
    "exercises": [
        {
            "area_of_focus": "string",
            "exercise_type": "behavioral | technical_drill | structured_response",
            "title": "string",
            "description": "string",
            "scenario": "string",
            "targeted_advice": "string"
        }
    ]
}`;

        const aiResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'system',
                content: 'You are a precise and helpful AI Career Coach specialized in interview preparation.'
            }, {
                role: 'user',
                content: recommendationPrompt
            }],
            response_format: { type: "json_object" }
        });

        const recData = JSON.parse(aiResponse.choices[0].message.content);

        // 4. Save generated exercises to practice_sessions
        const practiceEntries = recData.exercises.map(ex => ({
            user_id: userId,
            area_of_focus: ex.area_of_focus,
            exercise_type: ex.exercise_type,
            content: {
                title: ex.title,
                description: ex.description,
                scenario: ex.scenario,
                targeted_advice: ex.targeted_advice
            }
        }));

        const { data: savedSessions, error: saveErr } = await supabase
            .from('practice_sessions')
            .insert(practiceEntries)
            .select();

        if (saveErr) {
            console.error('Error saving practice sessions:', saveErr);
            // Return generated data even if save fails
        }

        res.json({
            weakAreas: recData.weakAreas,
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
router.patch('/recommendations/:id/complete', mockAuth, async (req, res) => {
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

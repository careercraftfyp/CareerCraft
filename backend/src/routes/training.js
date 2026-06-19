import express from 'express';
import OpenAI from 'openai';
import multer from 'multer';
import fs from 'fs';
import os from 'os';
import FormData from 'form-data';
import dotenv from 'dotenv';
import { supabase } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── STATIC BEHAVIORAL QUESTIONS ──────────────────────────────────────────────
const STATIC_STAR_QUESTIONS = [
    "Tell me about a time you faced a significant challenge.",
    "Describe a situation where you had to work under pressure.",
    "Give an example of when you showed leadership.",
    "Tell me about a conflict with a teammate and how you resolved it.",
    "Describe a time you failed and what you learned from it.",
];

// ── FEATURE 1: STAR STORY BUILDER ─────────────────────────────────────────────

/**
 * GET /api/training/star/questions?domain=Computer Science
 * Returns a merged array of static + GPT-generated domain questions.
 */
router.get('/star/questions', async (req, res) => {
    const { domain = 'General' } = req.query;

    let dynamicQuestions = [];
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'user',
                content: `Generate 5 behavioral interview questions specifically for a student or professional in the field of "${domain}". 
These should be STAR-method compatible questions that test domain-relevant skills.
Return ONLY a JSON array of strings. No explanation, no markdown, no preamble.
Example format: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`
            }],
            response_format: { type: 'json_object' }
        });

        const raw = response.choices[0].message.content;
        // GPT might wrap in an object even with json_object mode
        const parsed = JSON.parse(raw);
        dynamicQuestions = Array.isArray(parsed) ? parsed : (parsed.questions || Object.values(parsed)[0] || []);
    } catch (err) {
        console.error('GPT question generation failed, using static only:', err);
    }

    // Shuffle helper
    const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

    const allQuestions = shuffle([...STATIC_STAR_QUESTIONS, ...dynamicQuestions]);
    res.json({ questions: allQuestions, staticCount: STATIC_STAR_QUESTIONS.length });
});

/**
 * POST /api/training/star
 * Polishes a STAR answer via GPT and saves it to star_stories.
 */
router.post('/star', requireAuth, async (req, res) => {
    try {
        const { domain, question, situation, task, action, result } = req.body;
        if (!domain || !question || !situation || !task || !action || !result) {
            return res.status(400).json({ error: 'All STAR fields are required.' });
        }

        const prompt = `You are a professional interview coach. A candidate has filled in their STAR method answer below.

Domain/Field: ${domain}
Question: ${question}

Situation: ${situation}
Task: ${task}
Action: ${action}
Result: ${result}

Do TWO things:
1. Write a polished, fluent, interview-ready version of their answer in 150-200 words. Make it confident, specific, and impactful.
2. Provide exactly 3 short improvement tips (each max 1 sentence).

Respond ONLY in this JSON format, no markdown, no preamble:
{
  "polished_answer": "...",
  "improvement_tips": ["tip1", "tip2", "tip3"]
}`;

        const gptRes = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a professional interview coach. Respond only in the exact JSON structure requested.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
        });

        const aiData = JSON.parse(gptRes.choices[0].message.content);

        // Try to save to DB — but don't block the AI result if the table is missing
        let savedStory = null;
        try {
            const { data: story, error: dbError } = await supabase
                .from('star_stories')
                .insert([{
                    user_id: req.user.id,
                    domain,
                    question,
                    situation,
                    task,
                    action,
                    result,
                    polished_answer: aiData.polished_answer,
                    improvement_tips: aiData.improvement_tips
                }])
                .select()
                .single();

            if (dbError) {
                console.warn('DB save failed (table may not exist yet):', dbError.message);
            } else {
                savedStory = story;
            }
        } catch (dbErr) {
            console.warn('DB insert error (non-fatal):', dbErr.message);
        }

        // Always return the AI result to the frontend
        res.json({
            success: true,
            story: savedStory || {
                id: null,
                domain,
                question,
                situation,
                task,
                action,
                result,
                polished_answer: aiData.polished_answer,
                improvement_tips: aiData.improvement_tips,
                created_at: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error('Error in POST /training/star:', err);
        res.status(500).json({ error: err.message || 'Failed to process STAR answer.' });
    }
});

/**
 * GET /api/training/star/stories
 * Returns all STAR stories for the authenticated user.
 */
router.get('/star/stories', requireAuth, async (req, res) => {
    try {
        const { data: stories, error } = await supabase
            .from('star_stories')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            // Table may not exist yet — return empty array instead of crashing
            console.warn('star_stories table not ready:', error.message);
            return res.json({ stories: [] });
        }
        res.json({ stories: stories || [] });
    } catch (err) {
        console.error('Error in GET /training/star/stories:', err);
        res.json({ stories: [] }); // fail silently, don't break the page
    }
});

/**
 * DELETE /api/training/star/stories/:id
 * Deletes a STAR story owned by the authenticated user.
 */
router.delete('/star/stories/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('star_stories')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id);

        if (error) {
            console.warn('Delete failed (table may not exist):', error.message);
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error in DELETE /training/star/stories/:id:', err);
        res.json({ success: false, error: 'Failed to delete story.' });
    }
});

// ── FEATURE 2: ELEVATOR PITCH TRAINER ─────────────────────────────────────────

/**
 * POST /api/training/pitch
 * Evaluates a pitch via GPT and saves the attempt.
 */
router.post('/pitch', requireAuth, async (req, res) => {
    try {
        const { pitchText, domain } = req.body;
        if (!pitchText || !domain) {
            return res.status(400).json({ error: 'pitchText and domain are required.' });
        }

        const wordCount = pitchText.trim().split(/\s+/).length;

        // Get current attempt number
        const { count } = await supabase
            .from('pitch_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.user.id)
            .eq('domain', domain);

        const attemptNumber = (count || 0) + 1;

        const prompt = `You are an expert career coach evaluating a one-minute elevator pitch for a candidate in the field of "${domain}".

Their pitch:
"${pitchText}"

Word count: ${wordCount} (ideal is 120–150 words for 60 seconds)

Evaluate the pitch on THREE dimensions, each scored out of 10:
1. Structure Score: Does it follow Intro → Skills/Experience → Goal/Value Proposition?
2. Tone Score: Is it confident, professional, and engaging (not robotic or too casual)?
3. Overall Score: Holistic impression — would this pitch impress a recruiter?

Also provide:
- "feedback": 2-3 sentence constructive feedback paragraph pointing out what worked and what to improve
- "example_pitch": A short 120-word example pitch tailored to the "${domain}" field as a reference

Respond ONLY in this exact JSON format, no markdown, no preamble:
{
  "structureScore": 7,
  "toneScore": 8,
  "overallScore": 7,
  "feedback": "...",
  "example_pitch": "..."
}`;

        const gptRes = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You evaluate elevator pitches and return structured JSON feedback.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
        });

        const aiData = JSON.parse(gptRes.choices[0].message.content);

        const { data: attempt, error: dbError } = await supabase
            .from('pitch_attempts')
            .insert([{
                user_id: req.user.id,
                domain,
                pitch_text: pitchText,
                word_count: wordCount,
                structure_score: aiData.structureScore,
                tone_score: aiData.toneScore,
                overall_score: aiData.overallScore,
                feedback: aiData.feedback,
                example_pitch: aiData.example_pitch,
                attempt_number: attemptNumber
            }])
            .select()
            .single();

        if (dbError) throw dbError;

        res.json({ success: true, attempt });
    } catch (err) {
        console.error('Error in POST /training/pitch:', err);
        res.status(500).json({ error: err.message || 'Failed to evaluate pitch.' });
    }
});

/**
 * GET /api/training/pitch/history?domain=Computer Science
 * Returns all pitch attempts for the user, optionally filtered by domain.
 */
router.get('/pitch/history', requireAuth, async (req, res) => {
    try {
        const { domain } = req.query;
        let query = supabase
            .from('pitch_attempts')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: true });

        if (domain) {
            query = query.eq('domain', domain);
        }

        const { data: attempts, error } = await query;
        if (error) throw error;
        res.json({ attempts: attempts || [] });
    } catch (err) {
        console.error('Error in GET /training/pitch/history:', err);
        res.status(500).json({ error: 'Failed to fetch pitch history.' });
    }
});

/**
 * POST /api/training/transcribe
 * Transcribes audio using Whisper (reused from interview pipeline).
 */
const upload = multer({ dest: os.tmpdir() });
router.post('/transcribe', requireAuth, upload.single('audio'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No audio file provided.' });

        const audioPath = `${file.path}.webm`;
        fs.renameSync(file.path, audioPath);

        const audioStream = fs.createReadStream(audioPath);
        const transcription = await openai.audio.transcriptions.create({
            file: audioStream,
            model: 'whisper-1',
            language: 'en'
        });

        try { fs.unlinkSync(audioPath); } catch (e) { }

        res.json({ transcript: transcription.text });
    } catch (err) {
        console.error('Error in POST /training/transcribe:', err);
        if (req.file?.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
            try { fs.unlinkSync(req.file.path + '.webm'); } catch (e) { }
        }
        res.status(500).json({ error: 'Failed to transcribe audio.' });
    }
});

// ── FEATURE 3: DRILL SKILL BREAKDOWN ─────────────────────────────────────────

/**
 * GET /api/training/drills/skill-breakdown
 * Aggregates practice_sessions by skill_tag for radar chart.
 */
router.get('/drills/skill-breakdown', requireAuth, async (req, res) => {
    try {
        const { data: sessions, error } = await supabase
            .from('practice_sessions')
            .select('skill_tag, status')
            .eq('user_id', req.user.id);

        if (error) throw error;

        const tags = ['communication', 'reasoning', 'domain_knowledge', 'structure'];
        const breakdown = {};

        tags.forEach(tag => {
            const tagSessions = (sessions || []).filter(s => s.skill_tag === tag);
            const completed = tagSessions.filter(s => s.status === 'completed').length;
            const total = tagSessions.length;
            // Score: % completion scaled to 0-100, minimum 10 if any exist
            breakdown[tag] = total === 0 ? 0 : Math.max(10, Math.round((completed / total) * 100));
        });

        res.json({ breakdown });
    } catch (err) {
        console.error('Error in GET /training/drills/skill-breakdown:', err);
        res.status(500).json({ error: 'Failed to fetch skill breakdown.' });
    }
});

/**
 * GET /api/training/drills?domain=X&skill_tag=Y&difficulty_level=Z
 * Returns filtered practice sessions for the user.
 */
router.get('/drills', requireAuth, async (req, res) => {
    try {
        const { domain, skill_tag, difficulty_level } = req.query;

        let query = supabase
            .from('practice_sessions')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (domain && domain !== 'All') query = query.eq('domain', domain);
        if (skill_tag && skill_tag !== 'All') query = query.eq('skill_tag', skill_tag);
        if (difficulty_level && difficulty_level !== 'All') query = query.eq('difficulty_level', parseInt(difficulty_level));

        const { data: drills, error } = await query;
        if (error) throw error;

        res.json({ drills: drills || [] });
    } catch (err) {
        console.error('Error in GET /training/drills:', err);
        res.status(500).json({ error: 'Failed to fetch drills.' });
    }
});

/**
 * POST /api/training/speaking-feedback
 * Evaluates a spoken answer transcript and returns AI coaching suggestions.
 */
router.post('/speaking-feedback', requireAuth, async (req, res) => {
    try {
        const { transcript, prompt, domain } = req.body;
        if (!transcript || !prompt) {
            return res.status(400).json({ error: 'transcript and prompt are required.' });
        }

        const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'right', 'so', 'actually', 'kind of', 'sort of'];
        const lowerTranscript = transcript.toLowerCase();
        const foundFillers = fillerWords.filter(fw => {
            const regex = new RegExp(`\\b${fw}\\b`, 'gi');
            return regex.test(lowerTranscript);
        });

        const prompt_text = `You are an expert communication coach evaluating a spoken interview answer.

Domain/Field: ${domain || 'General'}
Interview Prompt: "${prompt}"
Candidate's Spoken Answer (transcript): "${transcript}"
Filler words detected: ${foundFillers.length > 0 ? foundFillers.join(', ') : 'None'}

Evaluate the response and provide coaching. Return ONLY this JSON:
{
  "clarity_score": <integer 0-100>,
  "confidence_score": <integer 0-100>,
  "structure_score": <integer 0-100>,
  "filler_count": <integer: total filler word occurrences>,
  "strengths": ["strength 1", "strength 2"],
  "suggestions": ["specific improvement tip 1", "specific improvement tip 2", "specific improvement tip 3"],
  "improved_version": "<A polished 2-3 sentence version of what they said, as a model answer>",
  "overall_feedback": "<1-2 sentence summary of performance>"
}`;

        const gptRes = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a communication coach. Evaluate spoken interview answers and return structured JSON feedback.' },
                { role: 'user', content: prompt_text }
            ],
            response_format: { type: 'json_object' }
        });

        const feedback = JSON.parse(gptRes.choices[0].message.content);
        res.json({ success: true, feedback, fillerWords: foundFillers });

    } catch (err) {
        console.error('Error in POST /training/speaking-feedback:', err);
        res.status(500).json({ error: 'Failed to evaluate speaking response.' });
    }
});

export default router;

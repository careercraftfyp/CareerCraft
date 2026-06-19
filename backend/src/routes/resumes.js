import express from 'express';
import multer from 'multer';
import { PDFParse as pdf } from 'pdf-parse';
import OpenAI from 'openai';
import { parseResume } from '../utils/atsParser.js';
import { supabase } from '../lib/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer to store files in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed currently'));
        }
    }
});

import { requireAuth } from '../middleware/auth.js';

// Route: Get Latest Resume
router.get('/latest', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'no rows returned'
        
        if (data) {
            try {
                if (data.parsed_text && data.parsed_text.startsWith('{')) {
                    const parsed = JSON.parse(data.parsed_text);
                    data.analysis = parsed.analysis || {};
                    data.full_text = parsed.extractedText || '';
                }
            } catch (e) {}
        }
        res.json(data || null);
    } catch (error) {
        console.error('Error fetching latest resume:', error);
        res.status(500).json({ error: 'Failed to fetch latest resume' });
    }
});

// Route: Get Resume History
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        const processedData = data.map(r => {
            try {
                if (r.parsed_text && r.parsed_text.startsWith('{')) {
                    const parsed = JSON.parse(r.parsed_text);
                    return { ...r, analysis: parsed.analysis || {}, full_text: parsed.extractedText || '' };
                }
            } catch (e) {}
            return { ...r, analysis: {}, full_text: r.parsed_text || '' };
        });
        res.json(processedData);
    } catch (error) {
        console.error('Error fetching resume history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Route: Upload, Parse & Score Resume
router.post('/upload', requireAuth, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // 1. Extract text from PDF
        const parser = new pdf({ data: req.file.buffer });
        const pdfData = await parser.getText();
        const extractedText = pdfData.text;

        if (!extractedText || extractedText.trim().length < 50) {
            return res.status(400).json({ error: 'Resume content is too short or could not be read.' });
        }

        // 2. ATS Algorithmic Analysis (Strict deterministic scoring)
        const analysis = parseResume(extractedText);

        if (!analysis) {
            return res.status(500).json({ error: 'Failed to parse resume optimally.' });
        }

        // 3. AI Qualitative Feedback (OpenAI)
        try {
            const prompt = `
                You are an elite career coach and ATS optimization expert. 
                I have already scored this resume algorithmically. Your job is ONLY to provide personalized, qualitative feedback based on the exact text.
                Identify critical missing keywords, layout/formatting warnings, and specific actionable rewrite suggestions.

                Resume Text:
                """
                ${extractedText.substring(0, 4000)}
                """

                Output exactly this JSON structure:
                {
                    "missing_critical_keywords": ["string"],
                    "critical_errors": [
                        { "issue": "string", "fix": "string" }
                    ],
                    "formatting_warnings": ["string"],
                    "actionable_feedback": ["string"]
                }
            `;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You output only structured JSON containing personalized resume feedback." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });

            const aiFeedback = JSON.parse(response.choices[0].message.content);
            
            // Merge AI qualitative feedback with deterministic scores
            analysis.missing_critical_keywords = [...new Set([...analysis.missing_critical_keywords, ...(aiFeedback.missing_critical_keywords || [])])].filter(k => k !== "N/A");
            analysis.critical_errors = [...analysis.critical_errors, ...(aiFeedback.critical_errors || [])];
            analysis.formatting_warnings = [...analysis.formatting_warnings, ...(aiFeedback.formatting_warnings || [])];
            
            // Override the generic actionable feedback with AI's personalized feedback
            if (aiFeedback.actionable_feedback && aiFeedback.actionable_feedback.length > 0) {
                analysis.actionable_feedback = aiFeedback.actionable_feedback;
            }

        } catch (aiError) {
            console.error("AI feedback generation failed, falling back to algorithmic feedback only:", aiError);
            // It will just use the algorithmic responses generated by parseResume if OpenAI fails
        }

        // 3. Save to Supabase DB
        const { error: dbError } = await supabase
            .from('resumes')
            .insert([{
                user_id: req.user.id,
                file_name: req.file.originalname,
                storage_path: 'local', // Required mapping for actual schema
                parsed_text: JSON.stringify({ extractedText: extractedText.substring(0, 5000), analysis }) // Schema Bypass
            }]);

        if (dbError) {
            console.error('Database error saving resume:', dbError);
            // We continue even if DB fails to return the result to user, 
            // but we log it. In a real app, you might want to handle this better.
        }

        res.json({
            message: 'Resume analyzed successfully',
            fileName: req.file.originalname,
            analysis: analysis,
            parsedTextPreview: extractedText.substring(0, 150) + '...',
            fullText: extractedText.substring(0, 3000)
        });

    } catch (error) {
        console.error('Error during resume processing:', error);
        res.status(500).json({ error: error.message || 'Failed to process resume' });
    }
});

export default router;

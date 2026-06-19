import express from 'express';
import multer from 'multer';
import { PDFParse as pdf } from 'pdf-parse';
import OpenAI from 'openai';
import { parseResume } from '../utils/atsParser.js';
import { supabase } from '../lib/supabase.js';
import dotenv from 'dotenv';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { progressEmitter } from '../utils/progressEmitter.js';

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

// Route: SSE Resume Progress Updates
router.get('/progress', requireAuth, (req, res) => {
    const userId = req.user.id;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Send initial connection notice
    res.write(`data: ${JSON.stringify({ step: 'init', message: 'SSE Connection Established' })}\n\n`);

    const listener = (data) => {
        if (data.userId === userId) {
            res.write(`data: ${JSON.stringify({ step: data.step, message: data.message })}\n\n`);
        }
    };

    progressEmitter.on('progress', listener);

    req.on('close', () => {
        progressEmitter.off('progress', listener);
    });
});

// Route: Upload, Parse & Score Resume
router.post('/upload', requireAuth, aiLimiter, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Validate PDF Magic Number (%PDF-)
        const magicNumber = req.file.buffer.slice(0, 4).toString('utf-8');
        if (magicNumber !== '%PDF') {
            return res.status(400).json({ error: 'Invalid file format. The file is not a valid PDF document.' });
        }

        // 1. Extract text from PDF
        progressEmitter.sendProgress(req.user.id, 'pdf_extraction', 'Extracting resume text content...');
        const parser = new pdf({ data: req.file.buffer });
        const pdfData = await parser.getText();
        const extractedText = pdfData.text;

        if (!extractedText || extractedText.trim().length < 50) {
            return res.status(400).json({ error: 'Resume content is too short or could not be read.' });
        }

        // 2. ATS Algorithmic Analysis (Strict deterministic scoring)
        progressEmitter.sendProgress(req.user.id, 'heuristic_analysis', 'Running algorithmic parsing rules...');
        const analysis = parseResume(extractedText);

        if (!analysis) {
            return res.status(500).json({ error: 'Failed to parse resume optimally.' });
        }

        // 3. AI Qualitative Feedback (OpenAI)
        try {
            progressEmitter.sendProgress(req.user.id, 'ai_evaluation', 'Consulting AI coaching engine (GPT-4o-mini) for detailed grading feedback...');
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

            // Dynamic ATS Scoring Adjustments based on combined AI and heuristic findings
            const keywordPenalty = analysis.missing_critical_keywords.length * 4; 
            const errorPenalty = analysis.critical_errors.length * 8;
            const warningPenalty = analysis.formatting_warnings.length * 2;
            
            analysis.ats_compatibility_score = Math.max(0, analysis.ats_compatibility_score - keywordPenalty - errorPenalty - warningPenalty);
            
            // Recalculate overall score
            analysis.overall_score = Math.round((analysis.ats_compatibility_score + analysis.impact_score + analysis.action_verbs_score) / 3);

        } catch (aiError) {
            console.error("AI feedback generation failed, falling back to algorithmic feedback only:", aiError);
            // It will just use the algorithmic responses generated by parseResume if OpenAI fails
        }

        // 4. Upload PDF to Supabase Storage
        progressEmitter.sendProgress(req.user.id, 'storage_sync', 'Syncing PDF document with secure cloud storage...');
        const fileExt = req.file.originalname.split('.').pop();
        const fileName = `${req.user.id}_${Date.now()}.${fileExt}`;
        
        let publicUrl = 'local';
        const { data: storageData, error: storageError } = await supabase.storage
            .from('resumes')
            .upload(fileName, req.file.buffer, {
                contentType: 'application/pdf',
                upsert: false
            });

        if (storageError) {
            console.error('Failed to upload PDF to storage:', storageError);
        } else {
            const { data: publicUrlData } = supabase.storage
                .from('resumes')
                .getPublicUrl(fileName);
            if (publicUrlData) {
                publicUrl = publicUrlData.publicUrl;
            }
        }

        // 5. Save to Supabase DB
        progressEmitter.sendProgress(req.user.id, 'database_sync', 'Saving analyzed metrics to database history...');
        const { error: dbError } = await supabase
            .from('resumes')
            .insert([{
                user_id: req.user.id,
                file_name: req.file.originalname,
                storage_path: publicUrl,
                parsed_text: JSON.stringify({ extractedText: extractedText.substring(0, 5000), analysis }) // Schema Bypass
            }]);

        if (dbError) {
            console.error('Database error saving resume:', dbError);
        }

        progressEmitter.sendProgress(req.user.id, 'complete', 'Resume analyzed successfully!');
        
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

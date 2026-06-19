import express from 'express';
import multer from 'multer';
import { PDFParse as pdf } from 'pdf-parse';
import OpenAI from 'openai';
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

const mockAuth = (req, res, next) => {
    req.user = { id: '00000000-0000-0000-0000-000000000000' };
    next();
};

// Route: Get Latest Resume
router.get('/latest', mockAuth, async (req, res) => {
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
        res.json(data || null);
    } catch (error) {
        console.error('Error fetching latest resume:', error);
        res.status(500).json({ error: 'Failed to fetch latest resume' });
    }
});

// Route: Get Resume History
router.get('/', mockAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching resume history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Route: Upload, Parse & Score Resume
router.post('/upload', mockAuth, upload.single('resume'), async (req, res) => {
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

        // 2. AI Analysis via OpenAI - Strict ATS mode
        const prompt = `
            You are an ultra-strict, enterprise-grade Applicant Tracking System (ATS) and a top-tier executive career coach.
            Your job is to relentlessly analyze the provided resume text against modern ATS compatibility standards and industry best practices.
            Do not be polite; be brutally honest and highly analytical to ensure maximum optimization.

            Resume Text:
            """
            ${extractedText}
            """

            Provide a comprehensive, highly structured JSON report. The JSON MUST exactly match the following structure:
            {
                "overall_score": 0-100, // Be extremely strict. A 70 is average, 90+ is exceptional.
                "ats_compatibility_score": 0-100, // How well it parses. Look for hidden characters, weird formatting, or lack of standard sections.
                "impact_score": 0-100, // How well achievements are quantified (metrics, $, %, time).
                "action_verbs_score": 0-100, // Usage of strong, varied action verbs to start bullet points.
                "field_of_expertise": "string", // Best guess at their industry/role.
                "top_skills": ["string", "string"], // Up to 5 core hard skills detected.
                "missing_critical_keywords": ["string"], // Industry-standard keywords they likely missed for a senior role in their field.
                "critical_errors": [
                    { "issue": "string", "fix": "string" }
                ], // MAJOR issues: missing contact info, unparseable sections, generic summaries, lack of metrics.
                "formatting_warnings": [
                    "string"
                ], // MINOR issues: inconsistent dates, passive voice, weak verbs, overused buzzwords.
                "actionable_feedback": [
                    "string"
                ] // Specific, targeted advice on how to rewrite specific sentences for higher impact.
            }
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a merciless, highly analytical ATS parsing engine and elite career coach. You ONLY output valid JSON matching the exact requested structure." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(response.choices[0].message.content);

        // 3. Save to Supabase DB
        const { error: dbError } = await supabase
            .from('resumes')
            .insert([{
                user_id: req.user.id,
                file_name: req.file.originalname,
                analysis: analysis,
                full_text: extractedText.substring(0, 5000) // Increased limit for history
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

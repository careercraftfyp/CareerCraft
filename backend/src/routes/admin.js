import express from 'express';
import { supabase } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Middleware to enforce admin access
const requireAdmin = (req, res, next) => {
    if (req.user?.email !== 'careercraftfyp@gmail.com') {
        return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    next();
};

// Apply auth and admin check to all routes in this router
router.use(requireAuth, requireAdmin);

router.get('/users', async (req, res) => {
    try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Admin Fetch Users Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/resumes', async (req, res) => {
    try {
        const { data, error } = await supabase.from('resumes').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Admin Fetch Resumes Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/interviews', async (req, res) => {
    try {
        const { data, error } = await supabase.from('interviews').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Admin Fetch Interviews Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/ats_reports', async (req, res) => {
    try {
        const { data, error } = await supabase.from('ats_reports').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Admin Fetch ATS Reports Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/practice_sessions', async (req, res) => {
    try {
        const { data, error } = await supabase.from('practice_sessions').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Admin Fetch Practice Sessions Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/practice_sessions', async (req, res) => {
    try {
        const { error } = await supabase.from('practice_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Admin Delete Practice Sessions Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;

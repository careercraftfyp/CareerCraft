import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Middleware to verify Supabase JWT
// The frontend will send the active session JWT in the Authorization header
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized or invalid token' });
    }

    // Attach user to request object
    req.user = user;
    next();
};

// Example Protected Route: Get User Profile Data
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;

        res.json({ profile: data });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Example Protected Route: Update Profile
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { full_name } = req.body;

        const { data, error } = await supabase
            .from('users')
            .upsert({
                id: req.user.id,
                full_name,
                updated_at: new Date()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Profile updated successfully', profile: data });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;

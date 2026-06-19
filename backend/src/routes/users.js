import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

import { requireAuth } from '../middleware/auth.js';

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
                email: req.user.email,
                full_name,
                updated_at: new Date()
            }, { onConflict: 'id' })
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

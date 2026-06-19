import { supabase } from '../lib/supabase.js';

export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or malformed Authorization header' });
        }

        const token = authHeader.split(' ')[1];
        
        // Securely verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Attach the authenticated user to the request
        req.user = user;
        next();
    } catch (err) {
        console.error('Authentication Error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

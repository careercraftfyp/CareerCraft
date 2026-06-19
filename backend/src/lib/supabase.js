import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase URL or Service Role Key is missing in backend .env');
}

// NOTE: We use the SERVICE ROLE KEY on the backend. This bypasses Row Level Security (RLS)
// so the backend can freely insert/update data. We must ensure our API routes
// verify the user's JWT token before performing actions on their behalf.
export const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

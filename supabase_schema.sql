-- Database Schema for CareerCraft AI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Extends Supabase Auth Auth.users)
-- Note: 'id' references the 'id' column in the built-in auth.users table.
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: We use a trigger to automatically insert a row into public.users when a user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Resumes Table
CREATE TABLE public.resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  parsed_text TEXT, -- The extracted text from PDF/Word
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ATS Reports Table
CREATE TABLE public.ats_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  job_description TEXT NOT NULL,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  missing_keywords jsonb DEFAULT '[]'::jsonb,
  actionable_feedback jsonb DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Interviews Table
CREATE TABLE public.interviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  job_role TEXT NOT NULL,
  job_field TEXT,
  difficulty TEXT DEFAULT 'medium',
  mode TEXT DEFAULT 'voice + video',
  questions jsonb DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  tavus_conversation_id TEXT,
  transcript text,
  evaluation jsonb,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  feedback_data jsonb, -- Legacy/Extra feedback
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 5. STAR Stories Table (Training Hub)
CREATE TABLE public.star_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  question TEXT NOT NULL,
  situation TEXT,
  task TEXT,
  action TEXT,
  result TEXT,
  polished_answer TEXT,
  improvement_tips TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Pitch Attempts Table (Training Hub)
CREATE TABLE public.pitch_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  pitch_text TEXT NOT NULL,
  word_count INT,
  structure_score INT CHECK (structure_score BETWEEN 0 AND 10),
  tone_score INT CHECK (tone_score BETWEEN 0 AND 10),
  overall_score INT CHECK (overall_score BETWEEN 0 AND 10),
  feedback TEXT,
  example_pitch TEXT,
  attempt_number INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Practice Sessions Table (Training Hub)
CREATE TABLE public.practice_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  area_of_focus TEXT,
  exercise_type TEXT,
  domain TEXT DEFAULT 'General',
  skill_tag TEXT CHECK (skill_tag IN ('communication', 'reasoning', 'domain_knowledge', 'structure')) DEFAULT 'communication',
  difficulty_level INT CHECK (difficulty_level BETWEEN 1 AND 5) DEFAULT 1,
  content JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-----------------------------------------------------
-- RLS (Row Level Security) Setup
-----------------------------------------------------
-- This ensures users can only read/write their own data.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.star_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for public.users
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE USING (auth.uid() = id);

-- Policies for public.resumes
CREATE POLICY "Users can manage own resumes" 
ON public.resumes FOR ALL USING (auth.uid() = user_id);

-- Policies for public.ats_reports
CREATE POLICY "Users can manage own ats reports" 
ON public.ats_reports FOR ALL USING (auth.uid() = user_id);

-- Policies for public.interviews
CREATE POLICY "Users can manage own interviews" 
ON public.interviews FOR ALL USING (auth.uid() = user_id);

-- Policies for public.star_stories
CREATE POLICY "Users can manage their own stories"
ON public.star_stories FOR ALL USING (auth.uid() = user_id);

-- Policies for public.pitch_attempts
CREATE POLICY "Users can manage their own pitch attempts"
ON public.pitch_attempts FOR ALL USING (auth.uid() = user_id);

-- Policies for public.practice_sessions
CREATE POLICY "Users can manage own practice sessions" 
ON public.practice_sessions FOR ALL USING (auth.uid() = user_id);

-- 8. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    protocol TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (anyone can send a message)
CREATE POLICY "Enable public insert" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admins) to view messages
CREATE POLICY "Enable read for authenticated users" ON public.contact_messages
    FOR SELECT USING (auth.role() = 'authenticated');

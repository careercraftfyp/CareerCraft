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

-----------------------------------------------------
-- RLS (Row Level Security) Setup
-----------------------------------------------------
-- This ensures users can only read/write their own data.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

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

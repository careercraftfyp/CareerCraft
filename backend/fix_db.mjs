import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

// Direct PostgreSQL connection to Supabase
const client = new Client({
  connectionString: `postgresql://postgres.xmcjocfazadjugkirmcl:${process.env.SUPABASE_DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false }
});

const sql = `
-- ─── Enable UUID extension ───────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. Users Table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Resumes Table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  parsed_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. ATS Reports Table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ats_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  job_description TEXT NOT NULL,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  missing_keywords jsonb DEFAULT '[]'::jsonb,
  actionable_feedback jsonb DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. Interviews Table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interviews (
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
  feedback_data jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ─── 5. STAR Stories Table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.star_stories (
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

-- ─── 6. Pitch Attempts Table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pitch_attempts (
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

-- ─── 7. Practice Sessions Table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.practice_sessions (
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

-- ─── 8. Contact Messages Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  protocol TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.star_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies (CREATE only if not already exists) ────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='resumes' AND policyname='Users can manage own resumes') THEN
    CREATE POLICY "Users can manage own resumes" ON public.resumes FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ats_reports' AND policyname='Users can manage own ats reports') THEN
    CREATE POLICY "Users can manage own ats reports" ON public.ats_reports FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='interviews' AND policyname='Users can manage own interviews') THEN
    CREATE POLICY "Users can manage own interviews" ON public.interviews FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='star_stories' AND policyname='Users can manage their own stories') THEN
    CREATE POLICY "Users can manage their own stories" ON public.star_stories FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pitch_attempts' AND policyname='Users can manage their own pitch attempts') THEN
    CREATE POLICY "Users can manage their own pitch attempts" ON public.pitch_attempts FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='practice_sessions' AND policyname='Users can manage own practice sessions') THEN
    CREATE POLICY "Users can manage own practice sessions" ON public.practice_sessions FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contact_messages' AND policyname='Enable public insert') THEN
    CREATE POLICY "Enable public insert" ON public.contact_messages FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contact_messages' AND policyname='Enable read for authenticated users') THEN
    CREATE POLICY "Enable read for authenticated users" ON public.contact_messages FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- ─── Performance Indexes ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_ats_reports_user_id ON public.ats_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON public.interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_star_stories_user_id ON public.star_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_attempts_user_id ON public.pitch_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON public.practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON public.resumes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON public.interviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_created_at ON public.practice_sessions(created_at DESC);
`;

async function run() {
  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully.\n');

    console.log('🛠️  Running schema migration...');
    await client.query(sql);
    console.log('✅ Schema applied successfully.\n');

    // Verify tables exist
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    console.log('📋 Tables in public schema:');
    result.rows.forEach(r => console.log('   ✓', r.table_name));

    // Verify indexes
    const idxResult = await client.query(`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
      ORDER BY indexname;
    `);
    console.log('\n📊 Performance indexes:');
    idxResult.rows.forEach(r => console.log('   ✓', r.indexname));

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Connection closed.');
  }
}

run();

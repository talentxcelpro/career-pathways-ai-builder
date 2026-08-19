-- ============================================================================
-- SUPABASE MIGRATION: SKILL GRAPH, CREDENTIALS & INGESTION LIFECYCLE
-- 1. Sets verification_status DEFAULT to 'NEEDS_REVIEW' (No unverified auto-approvals)
-- 2. Creates Normalized Skill Graph (skills, course_skills, career_skills, job_skills, user_skills)
-- 3. Creates Credentials & Passport Table (user_credentials)
-- ============================================================================

-- 1. Alter aggregated_courses table to enforce DEFAULT = 'NEEDS_REVIEW'
ALTER TABLE IF EXISTS public.aggregated_courses 
ALTER COLUMN verification_status SET DEFAULT 'NEEDS_REVIEW';

-- 2. Normalized Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- 'Technical', 'Business', 'People', 'Creative', 'Industry', 'Fundamentals'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Course Skills Join Table (Course -> Skill Mapping)
CREATE TABLE IF NOT EXISTS public.course_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT REFERENCES public.aggregated_courses(id) ON DELETE CASCADE,
  skill_id TEXT REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level TEXT DEFAULT 'Intermediate', -- 'Foundational', 'Intermediate', 'Advanced'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, skill_id)
);

-- 4. Career Skills Join Table (Career -> Skill Requirements)
CREATE TABLE IF NOT EXISTS public.career_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id TEXT NOT NULL,
  skill_id TEXT REFERENCES public.skills(id) ON DELETE CASCADE,
  importance_weight DECIMAL(3,2) DEFAULT 1.00, -- 1.00 = Core Required, 0.50 = Nice to Have
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(career_id, skill_id)
);

-- 5. Job Skills Join Table (Job -> Required Competencies)
CREATE TABLE IF NOT EXISTS public.job_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL,
  skill_id TEXT REFERENCES public.skills(id) ON DELETE CASCADE,
  required_level TEXT DEFAULT 'Intermediate',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, skill_id)
);

-- 6. User Skills Table (Learner's Passport Skill Inventory)
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_id TEXT REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level TEXT DEFAULT 'Intermediate',
  verification_status TEXT DEFAULT 'SELF_REPORTED', -- 'SELF_REPORTED', 'VERIFIED_CREDENTIAL', 'TESTED'
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- 7. User Credentials Table (Verified Certificates & Credentials)
CREATE TABLE IF NOT EXISTS public.user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id TEXT REFERENCES public.aggregated_courses(id) ON DELETE SET NULL,
  course_title TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  credential_type TEXT DEFAULT 'FREE_CERTIFICATE', -- 'FREE_CERTIFICATE', 'DIGITAL_BADGE', 'PROCTORED_EXAM'
  credential_url TEXT,
  certificate_file_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  verification_status TEXT DEFAULT 'NEEDS_REVIEW', -- 'NEEDS_REVIEW', 'VERIFIED', 'REJECTED'
  verification_method TEXT DEFAULT 'MANUAL_AUDIT', -- 'MANUAL_AUDIT', 'CREDLY_OAUTH', 'ISSUER_API'
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies
CREATE POLICY "Public Read Skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public Read Course Skills" ON public.course_skills FOR SELECT USING (true);
CREATE POLICY "Public Read Career Skills" ON public.career_skills FOR SELECT USING (true);
CREATE POLICY "Public Read Job Skills" ON public.job_skills FOR SELECT USING (true);

CREATE POLICY "Users Read Own Skills" ON public.user_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users Manage Own Skills" ON public.user_skills FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users Read Own Credentials" ON public.user_credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users Manage Own Credentials" ON public.user_credentials FOR ALL USING (auth.uid() = user_id);

-- 10. Seed Core Skill Taxonomy Across Domains
INSERT INTO public.skills (id, name, slug, category) VALUES
  ('skill-sql', 'SQL & Database Queries', 'sql', 'Technical'),
  ('skill-powerbi', 'Power BI & DAX', 'power-bi', 'Technical'),
  ('skill-python', 'Python Programming', 'python', 'Technical'),
  ('skill-ai-foundations', 'AI & Machine Learning Foundations', 'ai-foundations', 'Technical'),
  ('skill-hr-analytics', 'HR Analytics & People Metrics', 'hr-analytics', 'People'),
  ('skill-ops-management', 'Operations & Process Optimization', 'operations-management', 'Business'),
  ('skill-financial-modeling', 'Financial Modeling & Valuation', 'financial-modeling', 'Business'),
  ('skill-cybersecurity', 'Network & Cloud Security', 'cybersecurity', 'Technical')
ON CONFLICT (id) DO NOTHING;

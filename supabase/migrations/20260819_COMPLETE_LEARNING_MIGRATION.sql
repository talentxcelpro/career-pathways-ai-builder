-- ============================================================================
-- TALENTXCEL LEARNING — COMPLETE PRODUCTION DATABASE MIGRATION (V2 FIXED)
-- Copy & Paste this entire file into Supabase SQL Editor and click "Run"
-- ============================================================================

-- 1. Create Learning Providers Table
CREATE TABLE IF NOT EXISTS public.learning_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  website TEXT NOT NULL,
  logo TEXT,
  description TEXT,
  provider_type TEXT NOT NULL,
  trust_level TEXT NOT NULL DEFAULT 'Official',
  country TEXT DEFAULT 'USA',
  verified BOOLEAN DEFAULT true,
  course_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Aggregated Courses Table (Enforces DEFAULT = 'NEEDS_REVIEW')
CREATE TABLE IF NOT EXISTS public.aggregated_courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  provider_id TEXT REFERENCES public.learning_providers(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_logo TEXT,
  source_url TEXT NOT NULL,
  canonical_url TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  category TEXT NOT NULL,
  domain TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'Beginner',
  duration_text TEXT NOT NULL,
  duration_minutes INT,
  free_type TEXT NOT NULL DEFAULT '100% Free',
  is_free BOOLEAN DEFAULT true,
  certificate_type TEXT DEFAULT 'NO_CERTIFICATE',
  certificate_cost TEXT DEFAULT 'Free',
  skills TEXT[] DEFAULT '{}',
  career_relevance TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'English',
  thumbnail_url TEXT,
  verification_status TEXT DEFAULT 'NEEDS_REVIEW',
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Dedicated Learning Skills Table (UUID PK to match Supabase conventions)
CREATE TABLE IF NOT EXISTS public.learning_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Course Skills Join Table
CREATE TABLE IF NOT EXISTS public.course_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT REFERENCES public.aggregated_courses(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.learning_skills(id) ON DELETE CASCADE,
  proficiency_level TEXT DEFAULT 'Intermediate',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, skill_id)
);

-- 5. Career Skills Join Table
CREATE TABLE IF NOT EXISTS public.career_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id TEXT NOT NULL,
  skill_id UUID REFERENCES public.learning_skills(id) ON DELETE CASCADE,
  importance_weight DECIMAL(3,2) DEFAULT 1.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(career_id, skill_id)
);

-- 6. Job Skills Join Table
CREATE TABLE IF NOT EXISTS public.job_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL,
  skill_id UUID REFERENCES public.learning_skills(id) ON DELETE CASCADE,
  required_level TEXT DEFAULT 'Intermediate',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, skill_id)
);

-- 7. User Skills Inventory
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_id UUID REFERENCES public.learning_skills(id) ON DELETE CASCADE,
  proficiency_level TEXT DEFAULT 'Intermediate',
  verification_status TEXT DEFAULT 'SELF_REPORTED',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- 8. User Credentials Management
CREATE TABLE IF NOT EXISTS public.user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id TEXT REFERENCES public.aggregated_courses(id) ON DELETE SET NULL,
  course_title TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  credential_type TEXT DEFAULT 'FREE_CERTIFICATE',
  credential_url TEXT,
  certificate_file_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  verification_status TEXT DEFAULT 'NEEDS_REVIEW',
  verification_method TEXT DEFAULT 'MANUAL_AUDIT',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Course Handoff Events
CREATE TABLE IF NOT EXISTS public.course_handoff_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT REFERENCES public.aggregated_courses(id) ON DELETE SET NULL,
  provider_id TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  monetized_url TEXT NOT NULL,
  user_id UUID,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  source_page TEXT DEFAULT 'learning_hub'
);

-- 10. Create Unique Indexes & GIN Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_aggregated_courses_canonical ON public.aggregated_courses(canonical_url);
CREATE INDEX IF NOT EXISTS idx_aggregated_courses_provider ON public.aggregated_courses(provider_id);
CREATE INDEX IF NOT EXISTS idx_aggregated_courses_status ON public.aggregated_courses(verification_status);
CREATE INDEX IF NOT EXISTS idx_aggregated_courses_skills ON public.aggregated_courses USING GIN (skills);

-- 11. Enable Row Level Security (RLS)
ALTER TABLE public.learning_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aggregated_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_handoff_events ENABLE ROW LEVEL SECURITY;

-- 12. RLS Public Policies
DROP POLICY IF EXISTS "Public Read Providers" ON public.learning_providers;
CREATE POLICY "Public Read Providers" ON public.learning_providers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Verified Courses" ON public.aggregated_courses;
CREATE POLICY "Public Read Verified Courses" ON public.aggregated_courses FOR SELECT USING (verification_status = 'VERIFIED');

DROP POLICY IF EXISTS "Public Insert Handoff Events" ON public.course_handoff_events;
CREATE POLICY "Public Insert Handoff Events" ON public.course_handoff_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Learning Skills" ON public.learning_skills;
CREATE POLICY "Public Read Learning Skills" ON public.learning_skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Course Skills" ON public.course_skills;
CREATE POLICY "Public Read Course Skills" ON public.course_skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Career Skills" ON public.career_skills;
CREATE POLICY "Public Read Career Skills" ON public.career_skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Job Skills" ON public.job_skills;
CREATE POLICY "Public Read Job Skills" ON public.job_skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users Manage Own Skills" ON public.user_skills;
CREATE POLICY "Users Manage Own Skills" ON public.user_skills FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users Manage Own Credentials" ON public.user_credentials;
CREATE POLICY "Users Manage Own Credentials" ON public.user_credentials FOR ALL USING (auth.uid() = user_id);

-- 13. Seed Core Learning Providers
INSERT INTO public.learning_providers (id, name, slug, website, logo, description, provider_type, trust_level, country, verified, course_count)
VALUES 
  ('microsoft-learn', 'Microsoft Learn', 'microsoft-learn', 'https://learn.microsoft.com/en-us/training/', 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo_%282012%29.svg', 'Official interactive learning paths for Microsoft Azure, Power BI, Python, Data Engineering, and C#.', 'Tech Company', 'Official', 'USA', true, 1),
  ('mit-ocw', 'MIT OpenCourseWare', 'mit-ocw', 'https://ocw.mit.edu', 'https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg', 'Free, open publication of material from thousands of MIT courses covering CS, AI, Math, and Engineering.', 'University', 'Official', 'USA', true, 1),
  ('ibm-skillsbuild', 'IBM SkillsBuild', 'ibm-skillsbuild', 'https://skillsbuild.org', 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg', 'Free learning, credentials, and coaching in AI, Cybersecurity, Cloud, and Data Analytics.', 'Tech Company', 'Official', 'USA', true, 1),
  ('freecodecamp', 'freeCodeCamp', 'freecodecamp', 'https://www.freecodecamp.org', 'https://upload.wikimedia.org/wikipedia/commons/3/39/FreeCodeCamp_logo.svg', 'Renowned non-profit platform offering thousands of free interactive programming and web dev certifications.', 'Non-Profit', 'Official', 'USA', true, 1)
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 14. Seed Core Skill Taxonomy
INSERT INTO public.learning_skills (name, slug, category) VALUES
  ('SQL & Database Queries', 'sql', 'Technical'),
  ('Power BI & DAX', 'power-bi', 'Technical'),
  ('Python Programming', 'python', 'Technical'),
  ('AI & Machine Learning Foundations', 'ai-foundations', 'Technical'),
  ('HR Analytics & People Metrics', 'hr-analytics', 'People'),
  ('Operations & Process Optimization', 'operations-management', 'Business'),
  ('Financial Modeling & Valuation', 'financial-modeling', 'Business'),
  ('Network & Cloud Security', 'cybersecurity', 'Technical')
ON CONFLICT (name) DO NOTHING;

-- 15. Seed Flagship Verified Courses
INSERT INTO public.aggregated_courses (id, title, slug, provider_id, provider_name, provider_logo, source_url, canonical_url, short_description, category, domain, level, duration_text, free_type, is_free, certificate_type, skills, career_relevance, verification_status)
VALUES 
  (
    'course-ms-powerbi-data-analyst',
    'Microsoft Power BI Data Analyst Certification Path',
    'microsoft-power-bi-data-analyst',
    'microsoft-learn',
    'Microsoft Learn',
    'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo_%282012%29.svg',
    'https://learn.microsoft.com/en-us/training/powerplatform/power-bi',
    'https://learn.microsoft.com/en-us/training/powerplatform/power-bi',
    'Master data modeling, DAX queries, interactive dashboards, and business intelligence with Microsoft Power BI.',
    'Data Science & Analytics',
    'Technology & IT',
    'Beginner',
    '6 Hours',
    'FREE TO LEARN',
    true,
    'PAID_CERTIFICATE',
    ARRAY['Power BI', 'DAX Queries', 'Data Modeling', 'Business Intelligence', 'Data Visualization'],
    ARRAY['Data Analyst', 'BI Developer', 'Business Analyst'],
    'VERIFIED'
  ),
  (
    'course-mit-intro-cs-python',
    'MIT 6.001x: Introduction to Computer Science and Programming Using Python',
    'mit-intro-computer-science-python',
    'mit-ocw',
    'MIT OpenCourseWare',
    'https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg',
    'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/',
    'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/',
    'Rigorous introduction to Python programming, computational thinking, and algorithm complexity by MIT faculty.',
    'Programming & Web Dev',
    'Technology & IT',
    'Beginner',
    '20 Hours',
    '100% FREE',
    true,
    'NO_CERTIFICATE',
    ARRAY['Python', 'Algorithms', 'Computational Thinking', 'Data Structures', 'Problem Solving'],
    ARRAY['Software Developer', 'Python Developer', 'Data Scientist'],
    'VERIFIED'
  ),
  (
    'course-fcc-relational-database-sql',
    'freeCodeCamp Relational Database & SQL Certification',
    'freecodecamp-relational-database-sql',
    'freecodecamp',
    'freeCodeCamp',
    'https://upload.wikimedia.org/wikipedia/commons/3/39/FreeCodeCamp_logo.svg',
    'https://www.freecodecamp.org/learn/relational-database/',
    'https://www.freecodecamp.org/learn/relational-database/',
    'Hands-on interactive PostgreSQL & Bash terminal certification inside VS Code containers.',
    'Data Science & Analytics',
    'Technology & IT',
    'Beginner',
    '30 Hours',
    '100% FREE',
    true,
    'FREE_CERTIFICATE',
    ARRAY['SQL', 'PostgreSQL', 'Bash Shell', 'Git Version Control', 'Database Design'],
    ARRAY['Database Administrator', 'Backend Developer', 'Data Analyst'],
    'VERIFIED'
  ),
  (
    'course-ibm-ai-foundations',
    'IBM Artificial Intelligence Foundations',
    'ibm-artificial-intelligence-foundations',
    'ibm-skillsbuild',
    'IBM SkillsBuild',
    'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
    'https://skillsbuild.org/students/course-catalog/artificial-intelligence',
    'https://skillsbuild.org/students/course-catalog/artificial-intelligence',
    'Foundational AI concepts, Machine Learning algorithms, Ethics in AI, and practical Watson studio applications.',
    'Artificial Intelligence & ML',
    'Technology & IT',
    'Beginner',
    '8 Hours',
    '100% FREE',
    true,
    'FREE_CERTIFICATE',
    ARRAY['Artificial Intelligence', 'Machine Learning', 'AI Ethics', 'Watson AI', 'Neural Networks'],
    ARRAY['AI Engineer', 'Machine Learning Specialist', 'AI Consultant'],
    'VERIFIED'
  )
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

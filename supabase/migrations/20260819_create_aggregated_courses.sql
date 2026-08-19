-- ============================================================================
-- SUPABASE MIGRATION: TALENTXCEL LEARNING AGGREGATOR INFRASTRUCTURE
-- Table: public.aggregated_courses
-- Table: public.learning_providers
-- Table: public.course_handoff_events
-- ============================================================================

-- 1. Create Verified Providers Table
CREATE TABLE IF NOT EXISTS public.learning_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  website TEXT NOT NULL,
  logo TEXT,
  description TEXT,
  provider_type TEXT NOT NULL, -- 'Tech Company', 'University', 'Non-Profit'
  trust_level TEXT NOT NULL DEFAULT 'Official',
  country TEXT DEFAULT 'USA',
  verified BOOLEAN DEFAULT true,
  course_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Aggregated Courses Table
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
  level TEXT NOT NULL DEFAULT 'Beginner', -- 'Beginner', 'Intermediate', 'Advanced'
  duration_text TEXT NOT NULL,
  duration_minutes INT,
  free_type TEXT NOT NULL DEFAULT '100% Free', -- '100% Free', 'Free Audit', 'Free Trial'
  is_free BOOLEAN DEFAULT true,
  certificate_type TEXT DEFAULT 'NO_CERTIFICATE', -- 'FREE_CERTIFICATE', 'PAID_CERTIFICATE', 'NO_CERTIFICATE'
  certificate_cost TEXT DEFAULT 'Free',
  skills TEXT[] DEFAULT '{}',
  career_relevance TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'English',
  thumbnail_url TEXT,
  verification_status TEXT DEFAULT 'VERIFIED', -- 'VERIFIED', 'NEEDS_REVIEW', 'BROKEN'
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Unique Index for Link Deduplication
CREATE UNIQUE INDEX IF NOT EXISTS idx_aggregated_courses_canonical 
ON public.aggregated_courses(canonical_url);

CREATE INDEX IF NOT EXISTS idx_aggregated_courses_provider 
ON public.aggregated_courses(provider_id);

CREATE INDEX IF NOT EXISTS idx_aggregated_courses_status 
ON public.aggregated_courses(verification_status);

-- 4. Create Course Handoff Events Table (Analytics & Monetization)
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

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.learning_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aggregated_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_handoff_events ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: Public Read Access
CREATE POLICY "Public Read Providers" 
ON public.learning_providers FOR SELECT USING (true);

CREATE POLICY "Public Read Verified Courses" 
ON public.aggregated_courses FOR SELECT USING (verification_status = 'VERIFIED');

CREATE POLICY "Public Insert Handoff Events" 
ON public.course_handoff_events FOR INSERT WITH CHECK (true);

-- 7. Seed Flagship Verified Providers
INSERT INTO public.learning_providers (id, name, slug, website, logo, description, provider_type, trust_level, country, verified, course_count)
VALUES 
  ('microsoft-learn', 'Microsoft Learn', 'microsoft-learn', 'https://learn.microsoft.com/en-us/training/', 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo_%282012%29.svg', 'Official interactive learning paths for Microsoft Azure, Power BI, Python, Data Engineering, and C#.', 'Tech Company', 'Official', 'USA', true, 1),
  ('mit-ocw', 'MIT OpenCourseWare', 'mit-ocw', 'https://ocw.mit.edu', 'https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg', 'Free, open publication of material from thousands of MIT courses covering CS, AI, Math, and Engineering.', 'University', 'Official', 'USA', true, 1),
  ('ibm-skillsbuild', 'IBM SkillsBuild', 'ibm-skillsbuild', 'https://skillsbuild.org', 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg', 'Free learning, credentials, and coaching in AI, Cybersecurity, Cloud, and Data Analytics.', 'Tech Company', 'Official', 'USA', true, 1),
  ('freecodecamp', 'freeCodeCamp', 'freecodecamp', 'https://www.freecodecamp.org', 'https://upload.wikimedia.org/wikipedia/commons/3/39/FreeCodeCamp_logo.svg', 'Renowned non-profit platform offering thousands of free interactive programming and web dev certifications.', 'Non-Profit', 'Official', 'USA', true, 1)
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 8. Seed Verified Flagship Courses
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

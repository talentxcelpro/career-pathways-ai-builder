-- Drop existing tables to recreate with correct schema
DROP TABLE IF EXISTS public.users_profile CASCADE;
DROP TABLE IF EXISTS public.work_experience CASCADE;
DROP TABLE IF EXISTS public.education CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.certifications CASCADE;
DROP TABLE IF EXISTS public.awards CASCADE;
DROP TABLE IF EXISTS public.volunteer_experience CASCADE;
DROP TABLE IF EXISTS public.publications CASCADE;
DROP TABLE IF EXISTS public.interests CASCADE;
DROP TABLE IF EXISTS public.references CASCADE;

-- Create updated schema matching your specification
-- ================================
-- 📁 Table: users_profile
-- ================================
CREATE TABLE IF NOT EXISTS public.users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  professional_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================
-- 📁 Table: work_experience
-- ================================
CREATE TABLE IF NOT EXISTS public.work_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT,
  company_name TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  responsibilities TEXT[],
  key_achievements TEXT[],
  technologies_used TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================
-- 📁 Table: education
-- ================================
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  degree TEXT,
  institution TEXT,
  graduation_date DATE,
  gpa_honors TEXT,
  relevant_coursework TEXT[],
  academic_projects TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================
-- 📁 Table: skills
-- ================================
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  technical_skills TEXT[],
  programming_languages TEXT[],
  tools_software TEXT[],
  soft_skills TEXT[],
  languages_spoken TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================
-- 📁 Table: projects
-- ================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_title TEXT,
  description TEXT,
  technologies_used TEXT[],
  github_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================
-- 📁 Table: certifications
-- ================================
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  certificate_name TEXT,
  issuer TEXT,
  date_earned DATE,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================
-- 📁 Table: awards
-- ================================
CREATE TABLE IF NOT EXISTS public.awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  award_title TEXT,
  issued_by TEXT,
  award_date DATE,
  award_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================
-- 📁 Table: volunteer_experience
-- ================================
CREATE TABLE IF NOT EXISTS public.volunteer_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT,
  organization TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================
-- 📁 Table: publications
-- ================================
CREATE TABLE IF NOT EXISTS public.publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  publication_source TEXT,
  publication_date DATE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================
-- 📁 Table: interests
-- ================================
CREATE TABLE IF NOT EXISTS public.interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interest_items TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================
-- 📁 Table: references_info
-- ================================
CREATE TABLE IF NOT EXISTS public.references_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reference_name TEXT,
  title TEXT,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================
-- 📁 Table: custom_sections
-- ================================
CREATE TABLE IF NOT EXISTS public.custom_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  section_title TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.references_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_sections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own profile data" ON public.users_profile
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own work experience" ON public.work_experience  
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own education" ON public.education
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skills" ON public.skills
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own certifications" ON public.certifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own awards" ON public.awards
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own volunteer experience" ON public.volunteer_experience
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own publications" ON public.publications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interests" ON public.interests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own references" ON public.references_info
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own custom sections" ON public.custom_sections
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger for users_profile
CREATE TRIGGER update_users_profile_updated_at 
  BEFORE UPDATE ON public.users_profile 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Create career experience table
CREATE TABLE public.career_experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  location TEXT,
  employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  achievements TEXT[],
  skills_used TEXT[],
  tools_used TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create career education table
CREATE TABLE public.career_education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  institution_name TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  grade TEXT,
  gpa TEXT,
  honors TEXT,
  description TEXT,
  activities TEXT[],
  coursework TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create career projects table
CREATE TABLE public.career_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT CHECK (project_type IN ('personal', 'professional', 'academic', 'open-source')),
  technologies TEXT[],
  start_date DATE,
  end_date DATE,
  is_ongoing BOOLEAN DEFAULT false,
  project_url TEXT,
  github_url TEXT,
  demo_url TEXT,
  role TEXT,
  achievements TEXT[],
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create career skills table
CREATE TABLE public.career_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  skill_category TEXT CHECK (skill_category IN ('technical', 'soft', 'language', 'tool', 'framework')),
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5) DEFAULT 1,
  endorsements_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  years_of_experience INTEGER,
  last_used DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

-- Create career certifications table
CREATE TABLE public.career_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  certification_name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  verification_status TEXT CHECK (verification_status IN ('verified', 'pending', 'expired', 'revoked')) DEFAULT 'pending',
  description TEXT,
  skills_gained TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create testimonials/recommendations table
CREATE TABLE public.career_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommender_name TEXT NOT NULL,
  recommender_title TEXT,
  recommender_company TEXT,
  recommender_email TEXT,
  recommender_linkedin TEXT,
  relationship TEXT NOT NULL,
  testimonial_text TEXT NOT NULL,
  skills_endorsed TEXT[],
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skill gap analysis table
CREATE TABLE public.skill_gap_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_role TEXT NOT NULL,
  target_industry TEXT,
  current_skills TEXT[],
  required_skills TEXT[],
  skill_gaps TEXT[],
  recommended_actions JSONB,
  competitiveness_score INTEGER CHECK (competitiveness_score BETWEEN 0 AND 100),
  last_analyzed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.career_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_gap_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for career_experience
CREATE POLICY "Users can view their own experience" ON public.career_experience FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own experience" ON public.career_experience FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own experience" ON public.career_experience FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own experience" ON public.career_experience FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for career_education
CREATE POLICY "Users can view their own education" ON public.career_education FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own education" ON public.career_education FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own education" ON public.career_education FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own education" ON public.career_education FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for career_projects
CREATE POLICY "Users can view their own projects" ON public.career_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects" ON public.career_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.career_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.career_projects FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for career_skills
CREATE POLICY "Users can view their own skills" ON public.career_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own skills" ON public.career_skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own skills" ON public.career_skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own skills" ON public.career_skills FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for career_certifications
CREATE POLICY "Users can view their own certifications" ON public.career_certifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own certifications" ON public.career_certifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own certifications" ON public.career_certifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own certifications" ON public.career_certifications FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for career_testimonials
CREATE POLICY "Users can view their own testimonials" ON public.career_testimonials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view public testimonials" ON public.career_testimonials FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert their own testimonials" ON public.career_testimonials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own testimonials" ON public.career_testimonials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own testimonials" ON public.career_testimonials FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for skill_gap_analysis
CREATE POLICY "Users can view their own skill gaps" ON public.skill_gap_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own skill gaps" ON public.skill_gap_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own skill gaps" ON public.skill_gap_analysis FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own skill gaps" ON public.skill_gap_analysis FOR DELETE USING (auth.uid() = user_id);

-- Create update triggers for all tables
CREATE TRIGGER update_career_experience_updated_at
  BEFORE UPDATE ON public.career_experience
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_education_updated_at
  BEFORE UPDATE ON public.career_education
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_projects_updated_at
  BEFORE UPDATE ON public.career_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_skills_updated_at
  BEFORE UPDATE ON public.career_skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_certifications_updated_at
  BEFORE UPDATE ON public.career_certifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_testimonials_updated_at
  BEFORE UPDATE ON public.career_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skill_gap_analysis_updated_at
  BEFORE UPDATE ON public.skill_gap_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add bio field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
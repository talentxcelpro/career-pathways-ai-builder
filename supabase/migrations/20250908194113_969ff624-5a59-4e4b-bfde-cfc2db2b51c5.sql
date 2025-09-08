-- Phase 1: Complete Learning-Employment Bridge Infrastructure

-- Create job market analysis tables
CREATE TABLE IF NOT EXISTS public.job_market_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_posting_source TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT,
  skills_required TEXT[] NOT NULL DEFAULT '{}',
  skill_frequency INTEGER DEFAULT 1,
  location TEXT,
  salary_range_min INTEGER,
  salary_range_max INTEGER,
  experience_level TEXT,
  education_level TEXT,
  industry TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  raw_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skill demand tracking table
CREATE TABLE IF NOT EXISTS public.skill_demand_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_name TEXT NOT NULL,
  demand_score INTEGER NOT NULL DEFAULT 0,
  growth_rate NUMERIC(5,2) DEFAULT 0,
  average_salary INTEGER,
  job_count INTEGER DEFAULT 0,
  trend_period TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  industry_breakdown JSONB DEFAULT '{}',
  location_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(skill_name, trend_period, period_start)
);

-- Create job-focused course content table (extends existing courses)
CREATE TABLE IF NOT EXISTS public.job_focused_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  target_job_titles TEXT[] NOT NULL DEFAULT '{}',
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  skill_level_mapping JSONB DEFAULT '{}', -- {skill: {beginner: false, intermediate: true, advanced: false}}
  job_readiness_score INTEGER DEFAULT 0, -- 0-100
  employment_outcome_rate NUMERIC(5,2) DEFAULT 0, -- % of students who got jobs
  average_salary_increase INTEGER DEFAULT 0,
  hiring_partners TEXT[] DEFAULT '{}', -- Companies that hire from this course
  job_guarantee BOOLEAN DEFAULT false,
  interview_prep_included BOOLEAN DEFAULT false,
  portfolio_projects_count INTEGER DEFAULT 0,
  real_world_projects JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enhanced user course enrollments with job tracking
CREATE TABLE IF NOT EXISTS public.user_course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completion_date TIMESTAMP WITH TIME ZONE,
  current_module_id UUID,
  current_lesson_id UUID,
  total_time_spent INTEGER DEFAULT 0, -- in minutes
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  skill_assessments_passed JSONB DEFAULT '{}',
  portfolio_projects_completed JSONB DEFAULT '[]',
  certificates_earned TEXT[] DEFAULT '{}',
  job_application_count INTEGER DEFAULT 0,
  interview_count INTEGER DEFAULT 0,
  job_offers_received INTEGER DEFAULT 0,
  employment_status TEXT, -- 'seeking', 'employed', 'not_seeking'
  post_course_salary INTEGER,
  course_rating INTEGER CHECK (course_rating >= 1 AND course_rating <= 5),
  course_review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create skill verification system
CREATE TABLE IF NOT EXISTS public.skill_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  proficiency_level TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'expert'
  verification_method TEXT NOT NULL, -- 'course_completion', 'assessment', 'project', 'employer'
  verification_source TEXT, -- course_id, assessment_id, project_id, company_id
  verification_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  verification_score INTEGER, -- 0-100
  portfolio_evidence JSONB DEFAULT '{}',
  employer_verified BOOLEAN DEFAULT false,
  public_verification BOOLEAN DEFAULT true,
  verification_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job application integration table
CREATE TABLE IF NOT EXISTS public.learning_job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
  relevant_courses TEXT[] DEFAULT '{}', -- course IDs
  skills_demonstrated TEXT[] DEFAULT '{}',
  portfolio_projects_used TEXT[] DEFAULT '{}',
  learning_match_score INTEGER DEFAULT 0, -- 0-100
  skill_gap_analysis JSONB DEFAULT '{}',
  recommended_learning JSONB DEFAULT '[]',
  application_outcome TEXT, -- 'pending', 'rejected', 'interview', 'offer', 'hired'
  outcome_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning analytics table
CREATE TABLE IF NOT EXISTS public.learning_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL, -- 'course_progress', 'skill_acquisition', 'job_readiness', 'employment_outcome'
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  additional_data JSONB DEFAULT '{}',
  course_id UUID,
  skill_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  INDEX(user_id, metric_type, metric_date)
);

-- Enable RLS on all tables
ALTER TABLE public.job_market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_demand_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_focused_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Job market analysis - admin only for write, public read
CREATE POLICY "Job market analysis viewable by everyone" ON public.job_market_analysis FOR SELECT USING (true);
CREATE POLICY "Job market analysis manageable by admins" ON public.job_market_analysis FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Skill demand trends - admin only for write, public read
CREATE POLICY "Skill trends viewable by everyone" ON public.skill_demand_trends FOR SELECT USING (true);
CREATE POLICY "Skill trends manageable by admins" ON public.skill_demand_trends FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Job focused courses - admin only for write, public read
CREATE POLICY "Job focused courses viewable by everyone" ON public.job_focused_courses FOR SELECT USING (true);
CREATE POLICY "Job focused courses manageable by admins" ON public.job_focused_courses FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- User course progress - users can only see their own
CREATE POLICY "Users can view their own progress" ON public.user_course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own progress" ON public.user_course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_course_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all progress" ON public.user_course_progress FOR SELECT USING (auth.jwt()->>'role' = 'admin');

-- Skill verifications - users own their data, public can view verified skills
CREATE POLICY "Users can view their own skill verifications" ON public.skill_verifications FOR SELECT USING (auth.uid() = user_id OR public_verification = true);
CREATE POLICY "Users can create their own skill verifications" ON public.skill_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own skill verifications" ON public.skill_verifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all skill verifications" ON public.skill_verifications FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Learning job applications - users own their data
CREATE POLICY "Users can view their own learning applications" ON public.learning_job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own learning applications" ON public.learning_job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own learning applications" ON public.learning_job_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all learning applications" ON public.learning_job_applications FOR SELECT USING (auth.jwt()->>'role' = 'admin');

-- Learning analytics - users own their data
CREATE POLICY "Users can view their own analytics" ON public.learning_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own analytics" ON public.learning_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all analytics" ON public.learning_analytics FOR SELECT USING (auth.jwt()->>'role' = 'admin');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_market_skills ON public.job_market_analysis USING GIN(skills_required);
CREATE INDEX IF NOT EXISTS idx_job_market_title ON public.job_market_analysis(job_title);
CREATE INDEX IF NOT EXISTS idx_job_market_date ON public.job_market_analysis(scraped_at);
CREATE INDEX IF NOT EXISTS idx_skill_demand_name ON public.skill_demand_trends(skill_name);
CREATE INDEX IF NOT EXISTS idx_skill_demand_period ON public.skill_demand_trends(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course ON public.user_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_skill_verifications_user ON public.skill_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_verifications_skill ON public.skill_verifications(skill_name);
CREATE INDEX IF NOT EXISTS idx_learning_applications_user ON public.learning_job_applications(user_id);

-- Create update triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add update triggers to all tables
CREATE TRIGGER update_job_market_analysis_updated_at BEFORE UPDATE ON public.job_market_analysis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_skill_demand_trends_updated_at BEFORE UPDATE ON public.skill_demand_trends FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_focused_courses_updated_at BEFORE UPDATE ON public.job_focused_courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_course_progress_updated_at BEFORE UPDATE ON public.user_course_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_skill_verifications_updated_at BEFORE UPDATE ON public.skill_verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_learning_job_applications_updated_at BEFORE UPDATE ON public.learning_job_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
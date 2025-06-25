
-- Additional tables for comprehensive jobs module

-- Job categories for better organization
CREATE TABLE public.job_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.job_categories(id),
  icon_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job alerts for users
CREATE TABLE public.job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  keywords TEXT[],
  location TEXT,
  employment_type TEXT[],
  experience_level TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  is_remote BOOLEAN,
  is_active BOOLEAN DEFAULT true,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'immediate')),
  last_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job views tracking for analytics
CREATE TABLE public.job_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Company follows
CREATE TABLE public.company_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Interview schedules
CREATE TABLE public.interview_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
  scheduled_by UUID REFERENCES auth.users(id),
  interview_type TEXT DEFAULT 'video' CHECK (interview_type IN ('phone', 'video', 'in-person', 'technical')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_url TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Candidate shortlists
CREATE TABLE public.candidate_shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shortlisted_by UUID REFERENCES auth.users(id),
  match_score DECIMAL(3,2),
  notes TEXT,
  status TEXT DEFAULT 'shortlisted' CHECK (status IN ('shortlisted', 'contacted', 'interview_scheduled', 'rejected')),
  shortlisted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Job recommendations tracking
CREATE TABLE public.job_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  match_score DECIMAL(3,2),
  recommendation_reason TEXT,
  is_viewed BOOLEAN DEFAULT false,
  is_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add category_id to jobs table
ALTER TABLE public.jobs ADD COLUMN category_id UUID REFERENCES public.job_categories(id);

-- Add additional fields to jobs table for better functionality
ALTER TABLE public.jobs ADD COLUMN application_deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.jobs ADD COLUMN external_url TEXT;
ALTER TABLE public.jobs ADD COLUMN is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN views_count INTEGER DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN applications_count INTEGER DEFAULT 0;

-- Add additional fields to companies table
ALTER TABLE public.companies ADD COLUMN cover_image_url TEXT;
ALTER TABLE public.companies ADD COLUMN culture_description TEXT;
ALTER TABLE public.companies ADD COLUMN benefits TEXT[];
ALTER TABLE public.companies ADD COLUMN tech_stack TEXT[];
ALTER TABLE public.companies ADD COLUMN social_links JSONB;
ALTER TABLE public.companies ADD COLUMN employee_count_range TEXT;
ALTER TABLE public.companies ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- Enable RLS on all new tables
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_categories (public read)
CREATE POLICY "Anyone can view job categories" ON public.job_categories FOR SELECT USING (is_active = true);

-- RLS Policies for job_alerts
CREATE POLICY "Users can manage their own job alerts" ON public.job_alerts FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for job_views
CREATE POLICY "Users can view their own job views" ON public.job_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create job views" ON public.job_views FOR INSERT WITH CHECK (true);

-- RLS Policies for company_follows
CREATE POLICY "Users can manage their own company follows" ON public.company_follows FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for interview_schedules
CREATE POLICY "Users can view their own interviews" ON public.interview_schedules FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.job_applications WHERE id = application_id AND user_id = auth.uid())
  OR auth.uid() = scheduled_by
);
CREATE POLICY "Employers can manage interviews" ON public.interview_schedules FOR ALL USING (auth.uid() = scheduled_by);

-- RLS Policies for candidate_shortlists
CREATE POLICY "Users can view their own shortlist status" ON public.candidate_shortlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Employers can manage shortlists" ON public.candidate_shortlists FOR ALL USING (auth.uid() = shortlisted_by);

-- RLS Policies for job_recommendations
CREATE POLICY "Users can view their own recommendations" ON public.job_recommendations FOR ALL USING (auth.uid() = user_id);

-- Insert sample job categories
INSERT INTO public.job_categories (name, slug, description, icon_name) VALUES
('Technology', 'technology', 'Software development, IT, and tech roles', 'Code'),
('Design', 'design', 'UI/UX, graphic design, and creative roles', 'Palette'),
('Marketing', 'marketing', 'Digital marketing, content, and growth roles', 'Megaphone'),
('Sales', 'sales', 'Business development and sales positions', 'TrendingUp'),
('Data Science', 'data-science', 'Analytics, ML, and data engineering', 'Database'),
('Product', 'product', 'Product management and strategy roles', 'Package'),
('Operations', 'operations', 'Business operations and management', 'Settings'),
('Finance', 'finance', 'Accounting, finance, and business analysis', 'DollarSign'),
('Human Resources', 'human-resources', 'HR, recruiting, and people operations', 'Users'),
('Customer Success', 'customer-success', 'Support, success, and customer relations', 'Heart');

-- Create indexes for better performance
CREATE INDEX idx_job_alerts_user ON public.job_alerts(user_id);
CREATE INDEX idx_job_views_job ON public.job_views(job_id);
CREATE INDEX idx_job_views_user ON public.job_views(user_id);
CREATE INDEX idx_company_follows_user ON public.company_follows(user_id);
CREATE INDEX idx_company_follows_company ON public.company_follows(company_id);
CREATE INDEX idx_interview_schedules_application ON public.interview_schedules(application_id);
CREATE INDEX idx_candidate_shortlists_job ON public.candidate_shortlists(job_id);
CREATE INDEX idx_job_recommendations_user ON public.job_recommendations(user_id);
CREATE INDEX idx_jobs_category ON public.jobs(category_id);
CREATE INDEX idx_jobs_featured ON public.jobs(is_featured);

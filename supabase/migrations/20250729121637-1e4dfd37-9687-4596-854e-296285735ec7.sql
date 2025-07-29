-- Create job_applications table (simplified)
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resume_url TEXT,
  redirect_url TEXT,
  status TEXT DEFAULT 'applied',
  application_data JSONB DEFAULT '{}',
  bot_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scraping_jobs_queue table
CREATE TABLE IF NOT EXISTS public.scraping_jobs_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL,
  source_id UUID,
  scrape_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending',
  jobs_found INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_jobs_queue ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies
DROP POLICY IF EXISTS "Users can view their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can create their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can manage scraping queue" ON public.scraping_jobs_queue;

CREATE POLICY "Users can view their own applications" 
ON public.job_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
ON public.job_applications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" 
ON public.job_applications 
FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "Admins can manage scraping queue" 
ON public.scraping_jobs_queue 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON public.job_applications(applied_at);
CREATE INDEX IF NOT EXISTS idx_scraping_queue_status ON public.scraping_jobs_queue(status);
CREATE INDEX IF NOT EXISTS idx_scraping_queue_scrape_at ON public.scraping_jobs_queue(scrape_at);

-- Add triggers
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON public.job_applications;
DROP TRIGGER IF EXISTS update_scraping_jobs_queue_updated_at ON public.scraping_jobs_queue;

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scraping_jobs_queue_updated_at
  BEFORE UPDATE ON public.scraping_jobs_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Raj and Shelly bots with proper array syntax
INSERT INTO public.ai_bots (name, email, role, content_domains, distribution_channels, department, tone_style, frequency, is_active) VALUES
('Raj Kumar', 'raj@talentxcel.in', 'Senior Talent Acquisition Specialist', ARRAY['job_posting', 'recruitment', 'career_guidance'], ARRAY['website', 'email'], ARRAY['HR', 'Recruitment'], 'professional', 'daily', true),
('Shelly Sharma', 'shelly@talentxcel.in', 'Global Recruitment Manager', ARRAY['job_posting', 'international_recruitment', 'talent_sourcing'], ARRAY['website', 'social_media'], ARRAY['HR', 'Global_Recruitment'], 'friendly', 'daily', true)
ON CONFLICT (email) DO NOTHING;
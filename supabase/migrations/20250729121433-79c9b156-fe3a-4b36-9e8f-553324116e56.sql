-- Create job_applications table for user applications (if not exists)
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL,
  bot_id UUID REFERENCES ai_bots(id),
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resume_url TEXT,
  redirect_url TEXT,
  status TEXT DEFAULT 'applied',
  application_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scraping_jobs_queue table for managing scraping tasks (if not exists)
CREATE TABLE IF NOT EXISTS public.scraping_jobs_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL,
  source_id UUID REFERENCES job_scraping_sources(id),
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

-- Add missing columns to jobs table for bot publishing (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'posted_by_bot') THEN
    ALTER TABLE public.jobs ADD COLUMN posted_by_bot UUID REFERENCES ai_bots(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'source_url') THEN
    ALTER TABLE public.jobs ADD COLUMN source_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'seo_keywords') THEN
    ALTER TABLE public.jobs ADD COLUMN seo_keywords TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'country') THEN
    ALTER TABLE public.jobs ADD COLUMN country TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'original_post_date') THEN
    ALTER TABLE public.jobs ADD COLUMN original_post_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Enable RLS for new tables
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_jobs_queue ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can create their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can manage scraping queue" ON public.scraping_jobs_queue;

-- Create RLS policies for job_applications
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

-- Create RLS policies for scraping_jobs_queue
CREATE POLICY "Admins can manage scraping queue" 
ON public.scraping_jobs_queue 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- Create indexes for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_bot_id ON public.job_applications(bot_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON public.job_applications(applied_at);

CREATE INDEX IF NOT EXISTS idx_scraping_queue_status ON public.scraping_jobs_queue(status);
CREATE INDEX IF NOT EXISTS idx_scraping_queue_scrape_at ON public.scraping_jobs_queue(scrape_at);
CREATE INDEX IF NOT EXISTS idx_scraping_queue_source_id ON public.scraping_jobs_queue(source_id);

CREATE INDEX IF NOT EXISTS idx_jobs_posted_by_bot ON public.jobs(posted_by_bot);
CREATE INDEX IF NOT EXISTS idx_jobs_country ON public.jobs(country);
CREATE INDEX IF NOT EXISTS idx_jobs_source_url ON public.jobs(source_url);

-- Add updated_at triggers (drop and recreate to avoid conflicts)
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

-- Insert default scraping sources for Indian and Global job sites
INSERT INTO public.job_scraping_sources (source_name, base_url, scraping_config, search_keywords, location_filters, is_active, scraping_frequency) VALUES
-- Indian Job Sites (60%)
('Naukri.com', 'https://www.naukri.com', '{"type": "job_board", "country": "India", "selectors": {"title": ".jobTupleHeader .ellipsis", "company": ".companyInfo .ellipsis", "location": ".jobTupleFooter .ellipsis"}}', '["software", "developer", "engineer", "manager", "analyst"]', '["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"]', true, 'daily'),
('TimesJobs', 'https://www.timesjobs.com', '{"type": "job_board", "country": "India", "selectors": {"title": ".joblist-comp-name", "company": ".joblist-comp-name", "location": ".job-location"}}', '["IT", "software", "technical", "management"]', '["India"]', true, 'daily'),
('Monster India', 'https://www.monsterindia.com', '{"type": "job_board", "country": "India", "selectors": {"title": ".job-tittle", "company": ".company-name", "location": ".location"}}', '["technology", "finance", "marketing", "sales"]', '["India"]', true, 'daily'),
('Shine.com', 'https://www.shine.com', '{"type": "job_board", "country": "India", "selectors": {"title": ".job_title", "company": ".recruiter_name", "location": ".job_location"}}', '["fresher", "experienced", "graduate"]', '["India"]', true, 'daily'),

-- Global Job Sites (40%)  
('Indeed Global', 'https://www.indeed.com', '{"type": "job_board", "country": "Global", "selectors": {"title": "[data-testid=job-title]", "company": "[data-testid=company-name]", "location": "[data-testid=job-location]"}}', '["remote", "software", "developer", "engineer", "manager"]', '["Remote", "United States", "United Kingdom", "Canada", "Australia"]', true, 'daily'),
('Glassdoor', 'https://www.glassdoor.com', '{"type": "job_board", "country": "Global", "selectors": {"title": ".job-search-key-1rd69b5", "company": ".job-search-key-1rd69b5", "location": ".job-search-key-1rd69b5"}}', '["technology", "software", "data", "product"]', '["Global"]', true, 'daily'),
('Remote OK', 'https://remoteok.io', '{"type": "job_board", "country": "Global", "selectors": {"title": ".company", "company": ".company", "location": ".location"}}', '["remote", "programming", "design", "marketing"]', '["Remote"]', true, 'daily'),
('We Work Remotely', 'https://weworkremotely.com', '{"type": "job_board", "country": "Global", "selectors": {"title": ".title", "company": ".company", "location": ".region"}}', '["remote work", "programming", "customer support"]', '["Remote"]', true, 'daily')

ON CONFLICT (source_name) DO NOTHING;

-- Create Raj and Shelly bots if they don't exist
INSERT INTO public.ai_bots (name, email, role, content_domains, distribution_channels, department, tone_style, frequency, is_active) VALUES
('Raj Kumar', 'raj@talentxcel.in', 'Senior Talent Acquisition Specialist', '["job_posting", "recruitment", "career_guidance"]', '["website", "email"]', '["HR", "Recruitment"]', 'professional', 'daily', true),
('Shelly Sharma', 'shelly@talentxcel.in', 'Global Recruitment Manager', '["job_posting", "international_recruitment", "talent_sourcing"]', '["website", "social_media"]', '["HR", "Global_Recruitment"]', 'friendly', 'daily', true)

ON CONFLICT (email) DO NOTHING;
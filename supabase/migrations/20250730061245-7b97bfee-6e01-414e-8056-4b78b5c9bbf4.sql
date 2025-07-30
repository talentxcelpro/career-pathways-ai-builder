-- Create job scraping sources table
CREATE TABLE IF NOT EXISTS public.job_scraping_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  scraping_config JSONB DEFAULT '{}',
  search_keywords TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_scraping_sources ENABLE ROW LEVEL SECURITY;

-- Create policies for job scraping sources
CREATE POLICY "Anyone can view active scraping sources" 
ON public.job_scraping_sources 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage scraping sources" 
ON public.job_scraping_sources 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- Insert some sample scraping sources
INSERT INTO public.job_scraping_sources (source_name, source_url, scraping_config, search_keywords, is_active) VALUES
('Indeed India', 'https://in.indeed.com', '{"country": "India", "location": "India"}', '{"software engineer", "developer", "data scientist", "product manager"}', true),
('Naukri', 'https://www.naukri.com', '{"country": "India", "location": "India"}', '{"software engineer", "developer", "data analyst", "project manager"}', true),
('LinkedIn Global', 'https://linkedin.com/jobs', '{"country": "Global", "location": "Global"}', '{"software engineer", "developer", "data scientist", "product manager"}', true),
('AngelList', 'https://angel.co/jobs', '{"country": "Global", "location": "Global"}', '{"software engineer", "startup", "developer", "product manager"}', true);

-- Create scraped_jobs table if it doesn't exist (referenced by job-publisher function)
CREATE TABLE IF NOT EXISTS public.scraped_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT,
  bot_id UUID,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_description TEXT,
  source_url TEXT,
  salary TEXT,
  employment_type TEXT DEFAULT 'full_time',
  experience_level TEXT DEFAULT 'mid',
  skills TEXT[],
  posted_date TIMESTAMP WITH TIME ZONE,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'draft',
  processing_status TEXT DEFAULT 'pending',
  published_job_id UUID,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on scraped_jobs
ALTER TABLE public.scraped_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for scraped_jobs
CREATE POLICY "Admins can manage scraped jobs" 
ON public.scraped_jobs 
FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view scraped jobs" 
ON public.scraped_jobs 
FOR SELECT 
USING (true);
-- Create scraped_jobs table for storing raw job data from external sources
CREATE TABLE public.scraped_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES ai_bots(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  salary TEXT,
  job_description TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_platform TEXT NOT NULL,
  posted_at TIMESTAMP WITH TIME ZONE,
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'draft',
  seo_keywords TEXT[],
  enhanced_description TEXT,
  enhanced_title TEXT,
  processing_status TEXT DEFAULT 'pending',
  error_message TEXT,
  published_job_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on scraped_jobs
ALTER TABLE public.scraped_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for scraped_jobs
CREATE POLICY "Admins can manage scraped jobs" 
ON public.scraped_jobs 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- Create job_scraping_sources table for managing scraping sources
CREATE TABLE public.job_scraping_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  scraping_config JSONB NOT NULL DEFAULT '{}',
  search_keywords TEXT[],
  location_filters TEXT[],
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  scraping_frequency TEXT DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  jobs_scraped_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on job_scraping_sources
ALTER TABLE public.job_scraping_sources ENABLE ROW LEVEL SECURITY;

-- Create policies for job_scraping_sources
CREATE POLICY "Admins can manage scraping sources" 
ON public.job_scraping_sources 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- Add bot assignment table for scraping sources
CREATE TABLE public.bot_scraping_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES ai_bots(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES job_scraping_sources(id) ON DELETE CASCADE,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  location_preferences TEXT[] DEFAULT '{}',
  max_jobs_per_scrape INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bot_id, source_id)
);

-- Enable RLS on bot_scraping_assignments
ALTER TABLE public.bot_scraping_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for bot_scraping_assignments
CREATE POLICY "Admins can manage bot scraping assignments" 
ON public.bot_scraping_assignments 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- Add indexes for performance
CREATE INDEX idx_scraped_jobs_bot_id ON public.scraped_jobs(bot_id);
CREATE INDEX idx_scraped_jobs_status ON public.scraped_jobs(status);
CREATE INDEX idx_scraped_jobs_source_platform ON public.scraped_jobs(source_platform);
CREATE INDEX idx_scraped_jobs_scraped_at ON public.scraped_jobs(scraped_at);

-- Add updated_at triggers
CREATE TRIGGER update_scraped_jobs_updated_at
  BEFORE UPDATE ON public.scraped_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_scraping_sources_updated_at
  BEFORE UPDATE ON public.job_scraping_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default job scraping sources
INSERT INTO public.job_scraping_sources (source_name, base_url, scraping_config, search_keywords) VALUES
('Indeed India', 'https://in.indeed.com', '{"search_path": "/jobs", "selectors": {"title": ".jobTitle", "company": ".companyName", "location": ".companyLocation"}}', '{"software engineer", "developer", "analyst", "manager"}'),
('Naukri', 'https://www.naukri.com', '{"search_path": "/jobs", "selectors": {"title": ".title", "company": ".company", "location": ".location"}}', '{"IT", "software", "engineering", "finance"}');

-- Insert default content templates for job enhancement (into existing table)
INSERT INTO public.bot_content_templates (template_name, content_type, prompt_template, system_message) VALUES
('SEO Job Enhancement', 'job', 'Rewrite the following job description into an SEO-optimized job post for TalentXcel career portal.

Focus on:
- Clear, compelling job title
- Keywords like: {industry}, {skills}, hiring now, jobs in India
- Make it human-like and readable
- Add relevant hashtags
- Include salary expectations if mentioned
- Emphasize growth opportunities

Original Job:
Title: {job_title}
Company: {company}
Location: {location}
Description: {job_description}

Rewrite this as an engaging job post that will rank well in search results:', 'You are an expert content writer specializing in SEO-optimized job descriptions for the Indian job market. Make content engaging and search-friendly.'),

('Tech Blog Generator', 'blog', 'Generate a short, insightful blog post about {topic} targeting {audience} in India. 

Requirements:
- 300-500 words
- SEO-friendly title
- Relevant hashtags
- Inspiring and informative tone
- Include actionable tips
- Focus on Indian job market context

Topic: {topic}
Target Audience: {audience}', 'You are a career advisor and content creator who writes engaging blog posts about technology careers and professional development in India.'),

('Career Article Writer', 'article', 'Write a comprehensive article about {topic} for professionals in India.

Requirements:
- 800-1200 words
- Strong SEO title and meta description
- Clear structure with headings
- Include statistics and trends
- Actionable advice
- Professional tone
- Relevant to Indian job market

Topic: {topic}
Focus Area: {focus_area}', 'You are a senior career counselor and industry expert who writes authoritative articles about career development and industry trends in India.');
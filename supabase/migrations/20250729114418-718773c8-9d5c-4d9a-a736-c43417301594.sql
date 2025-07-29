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

-- Create bot_generated_content table for tracking all AI-generated content
CREATE TABLE public.bot_generated_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES ai_bots(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'job', 'article', 'blog', 'post'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  seo_keywords TEXT[],
  category TEXT,
  tags TEXT[],
  source_job_id UUID REFERENCES scraped_jobs(id),
  published_entity_id UUID, -- ID of the published job/article/post
  status TEXT NOT NULL DEFAULT 'draft',
  generation_cost NUMERIC DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bot_generated_content
ALTER TABLE public.bot_generated_content ENABLE ROW LEVEL SECURITY;

-- Create policies for bot_generated_content
CREATE POLICY "Admins can manage bot generated content" 
ON public.bot_generated_content 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- Create bot_content_templates table for storing AI prompts and templates
CREATE TABLE public.bot_content_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES ai_bots(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'job', 'article', 'blog', 'post'
  prompt_template TEXT NOT NULL,
  system_message TEXT,
  example_input TEXT,
  example_output TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bot_content_templates
ALTER TABLE public.bot_content_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for bot_content_templates
CREATE POLICY "Admins can manage bot content templates" 
ON public.bot_content_templates 
FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view active templates" 
ON public.bot_content_templates 
FOR SELECT 
USING (is_active = true);

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

CREATE INDEX idx_bot_generated_content_bot_id ON public.bot_generated_content(bot_id);
CREATE INDEX idx_bot_generated_content_type ON public.bot_generated_content(content_type);
CREATE INDEX idx_bot_generated_content_status ON public.bot_generated_content(status);

-- Add updated_at triggers
CREATE TRIGGER update_scraped_jobs_updated_at
  BEFORE UPDATE ON public.scraped_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_generated_content_updated_at
  BEFORE UPDATE ON public.bot_generated_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_content_templates_updated_at
  BEFORE UPDATE ON public.bot_content_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_scraping_sources_updated_at
  BEFORE UPDATE ON public.job_scraping_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
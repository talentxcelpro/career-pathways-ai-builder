-- Create SEO meta tags table for storing generated tags
CREATE TABLE IF NOT EXISTS public.seo_meta_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('job', 'company', 'course', 'profile', 'tool', 'article')),
  content_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  keywords TEXT[],
  generated_by TEXT DEFAULT 'ai' CHECK (generated_by IN ('ai', 'manual')),
  generation_version TEXT DEFAULT 'v1.0',
  performance_score INTEGER DEFAULT 0,
  click_through_rate NUMERIC(5,4) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_type, content_id)
);

-- Enable RLS
ALTER TABLE public.seo_meta_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view active SEO meta tags"
ON public.seo_meta_tags FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage SEO meta tags"
ON public.seo_meta_tags FOR ALL
USING (is_app_admin(auth.uid()));

-- Create SEO performance tracking table
CREATE TABLE IF NOT EXISTS public.seo_performance_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  content_type TEXT,
  content_id UUID,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  organic_clicks INTEGER DEFAULT 0,
  organic_impressions INTEGER DEFAULT 0,
  avg_position NUMERIC(4,1) DEFAULT 0,
  click_through_rate NUMERIC(5,4) DEFAULT 0,
  bounce_rate NUMERIC(5,4) DEFAULT 0,
  time_on_page INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue NUMERIC(10,2) DEFAULT 0,
  source TEXT DEFAULT 'google_search_console',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(url, date, source)
);

-- Enable RLS
ALTER TABLE public.seo_performance_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view SEO performance tracking"
ON public.seo_performance_tracking FOR SELECT
USING (is_app_admin(auth.uid()));

CREATE POLICY "System can insert SEO performance data"
ON public.seo_performance_tracking FOR INSERT
WITH CHECK (true);

-- Create SEO bulk processing jobs table
CREATE TABLE IF NOT EXISTS public.seo_bulk_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL CHECK (job_type IN ('meta_generation', 'schema_generation', 'sitemap_update', 'performance_sync')),
  content_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2) DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  progress_data JSONB DEFAULT '{}',
  configuration JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_bulk_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage SEO bulk jobs"
ON public.seo_bulk_jobs FOR ALL
USING (is_app_admin(auth.uid()));

-- Create function to auto-generate meta tags for new content
CREATE OR REPLACE FUNCTION public.auto_generate_meta_tags()
RETURNS TRIGGER AS $$
DECLARE
  content_data JSONB;
BEGIN
  -- Prepare content data based on table
  IF TG_TABLE_NAME = 'jobs' THEN
    content_data := jsonb_build_object(
      'id', NEW.id,
      'title', NEW.title,
      'company_name', NEW.company_name,
      'location', NEW.location,
      'employment_type', NEW.employment_type,
      'salary_min', NEW.salary_min,
      'salary_max', NEW.salary_max,
      'skills', NEW.skills
    );
  ELSIF TG_TABLE_NAME = 'companies' THEN
    content_data := jsonb_build_object(
      'id', NEW.id,
      'name', NEW.name,
      'industry', NEW.industry,
      'location', NEW.location,
      'size', NEW.size,
      'description', NEW.description
    );
  ELSIF TG_TABLE_NAME = 'courses' THEN
    content_data := jsonb_build_object(
      'id', NEW.id,
      'title', NEW.title,
      'instructor', NEW.instructor,
      'duration', NEW.duration,
      'level', NEW.level,
      'price', NEW.price,
      'skills', NEW.skills
    );
  END IF;

  -- Queue meta tag generation (async)
  INSERT INTO public.ai_operation_queue (
    user_id,
    operation_type,
    tool_slug,
    input_data,
    priority
  ) VALUES (
    COALESCE(NEW.created_by, NEW.posted_by, NEW.user_id, auth.uid()),
    'meta_generation',
    'ai-meta-generator',
    jsonb_build_object(
      'type', CASE 
        WHEN TG_TABLE_NAME = 'jobs' THEN 'job'
        WHEN TG_TABLE_NAME = 'companies' THEN 'company'
        WHEN TG_TABLE_NAME = 'courses' THEN 'course'
        ELSE 'content'
      END,
      'data', content_data,
      'auto_generated', true
    ),
    1
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for auto meta tag generation
DROP TRIGGER IF EXISTS auto_generate_job_meta_tags ON public.jobs;
CREATE TRIGGER auto_generate_job_meta_tags
  AFTER INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_meta_tags();

DROP TRIGGER IF EXISTS auto_generate_company_meta_tags ON public.companies;
CREATE TRIGGER auto_generate_company_meta_tags
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_meta_tags();

DROP TRIGGER IF EXISTS auto_generate_course_meta_tags ON public.courses;
CREATE TRIGGER auto_generate_course_meta_tags
  AFTER INSERT ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_meta_tags();

-- Create function to update SEO performance metrics
CREATE OR REPLACE FUNCTION public.update_seo_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update meta tags performance when tracking data changes
  UPDATE public.seo_meta_tags
  SET 
    click_through_rate = CASE 
      WHEN NEW.organic_impressions > 0 THEN NEW.organic_clicks::NUMERIC / NEW.organic_impressions 
      ELSE 0 
    END,
    impressions = NEW.organic_impressions,
    clicks = NEW.organic_clicks,
    performance_score = CASE
      WHEN NEW.avg_position <= 3 THEN 100
      WHEN NEW.avg_position <= 10 THEN 80
      WHEN NEW.avg_position <= 20 THEN 60
      WHEN NEW.avg_position <= 50 THEN 40
      ELSE 20
    END,
    updated_at = now()
  WHERE content_id = NEW.content_id 
    AND content_type = NEW.content_type
    AND NEW.content_id IS NOT NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for SEO performance updates
DROP TRIGGER IF EXISTS update_meta_tags_performance ON public.seo_performance_tracking;
CREATE TRIGGER update_meta_tags_performance
  AFTER INSERT OR UPDATE ON public.seo_performance_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_seo_performance_metrics();

-- Add updated_at triggers
CREATE TRIGGER update_seo_meta_tags_updated_at
  BEFORE UPDATE ON public.seo_meta_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_performance_tracking_updated_at
  BEFORE UPDATE ON public.seo_performance_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_bulk_jobs_updated_at
  BEFORE UPDATE ON public.seo_bulk_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_meta_tags_content ON public.seo_meta_tags(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_seo_meta_tags_active ON public.seo_meta_tags(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_seo_performance_tracking_date ON public.seo_performance_tracking(date DESC);
CREATE INDEX IF NOT EXISTS idx_seo_performance_tracking_url ON public.seo_performance_tracking(url);
CREATE INDEX IF NOT EXISTS idx_seo_bulk_jobs_status ON public.seo_bulk_jobs(status) WHERE status IN ('pending', 'processing');
-- Create job portal blocklist table
CREATE TABLE public.job_portal_blocklist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain text NOT NULL UNIQUE,
  portal_type text NOT NULL DEFAULT 'job_portal',
  reason text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_portal_blocklist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage portal blocklist" 
ON public.job_portal_blocklist 
FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "System can read portal blocklist" 
ON public.job_portal_blocklist 
FOR SELECT 
USING (true);

-- Insert common job portals
INSERT INTO public.job_portal_blocklist (domain, portal_type, reason) VALUES
('naukri.com', 'job_portal', 'Major Indian job portal'),
('linkedin.com', 'job_portal', 'Professional networking and job portal'),
('indeed.com', 'job_portal', 'Global job portal'),
('monsterindia.com', 'job_portal', 'Indian job portal'),
('shine.com', 'job_portal', 'Indian job portal'),
('glassdoor.com', 'job_portal', 'Job portal and company reviews'),
('foundit.in', 'job_portal', 'Indian job portal'),
('timesjobs.com', 'job_portal', 'Indian job portal'),
('jobstreet.com', 'job_portal', 'Southeast Asian job portal'),
('monster.com', 'job_portal', 'Global job portal'),
('careerbuilder.com', 'job_portal', 'US job portal'),
('ziprecruiter.com', 'job_portal', 'US job portal');

-- Create job source validation table
CREATE TABLE public.job_source_validations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url text NOT NULL,
  domain text NOT NULL,
  validation_result text NOT NULL, -- 'company_website', 'job_portal', 'unknown'
  confidence_score numeric DEFAULT 0.0,
  ai_reasoning text,
  validated_by uuid,
  validated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_source_validations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage source validations" 
ON public.job_source_validations 
FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "System can insert validations" 
ON public.job_source_validations 
FOR INSERT 
WITH CHECK (true);

-- Create job quality scores table
CREATE TABLE public.job_quality_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES public.scraped_jobs(id) ON DELETE CASCADE,
  overall_score integer NOT NULL DEFAULT 0,
  completeness_score integer NOT NULL DEFAULT 0,
  relevance_score integer NOT NULL DEFAULT 0,
  freshness_score integer NOT NULL DEFAULT 0,
  source_trust_score integer NOT NULL DEFAULT 0,
  ai_assessment jsonb DEFAULT '{}',
  human_review_score integer,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_quality_scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage quality scores" 
ON public.job_quality_scores 
FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "System can insert quality scores" 
ON public.job_quality_scores 
FOR INSERT 
WITH CHECK (true);

-- Add quality score to scraped_jobs
ALTER TABLE public.scraped_jobs 
ADD COLUMN IF NOT EXISTS quality_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS source_validation_id uuid REFERENCES public.job_source_validations(id),
ADD COLUMN IF NOT EXISTS is_portal_job boolean DEFAULT false;

-- Create automated scraping schedule table
CREATE TABLE public.scraping_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id uuid REFERENCES public.ai_bots(id) ON DELETE CASCADE,
  source_category text NOT NULL,
  target_urls text[] DEFAULT '{}',
  scraping_frequency interval NOT NULL DEFAULT '1 hour',
  max_jobs_per_run integer DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  last_run_at timestamp with time zone,
  next_run_at timestamp with time zone,
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scraping_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage scraping schedules" 
ON public.scraping_schedules 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- Create function to check if domain is blocked
CREATE OR REPLACE FUNCTION public.is_domain_blocked(domain_to_check text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.job_portal_blocklist 
    WHERE domain = domain_to_check 
    AND is_active = true
  );
$$;

-- Create function to extract domain from URL
CREATE OR REPLACE FUNCTION public.extract_domain(url text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO ''
AS $$
BEGIN
  -- Extract domain from URL
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(url, '^https?://(www\.)?', ''),
      '/.*$', ''
    )
  );
END;
$$;

-- Create trigger to update updated_at
CREATE TRIGGER update_job_portal_blocklist_updated_at
  BEFORE UPDATE ON public.job_portal_blocklist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_quality_scores_updated_at
  BEFORE UPDATE ON public.job_quality_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scraping_schedules_updated_at
  BEFORE UPDATE ON public.scraping_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
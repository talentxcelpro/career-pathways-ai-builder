-- Create comprehensive SEO pages management system
CREATE TABLE IF NOT EXISTS public.seo_landing_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url_path text NOT NULL UNIQUE,
  page_type text NOT NULL, -- 'job_location', 'skill_role', 'company_industry', etc.
  title text NOT NULL,
  meta_description text NOT NULL,
  h1_heading text NOT NULL,
  content_template text NOT NULL,
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  priority numeric DEFAULT 0.5,
  changefreq text DEFAULT 'weekly',
  is_generated boolean DEFAULT false,
  ai_generated boolean DEFAULT false,
  social_media_shared boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_crawled timestamp with time zone,
  traffic_score integer DEFAULT 0,
  conversion_rate numeric DEFAULT 0
);

-- Create index for performance
CREATE INDEX idx_seo_landing_pages_type ON public.seo_landing_pages(page_type);
CREATE INDEX idx_seo_landing_pages_priority ON public.seo_landing_pages(priority DESC);
CREATE INDEX idx_seo_landing_pages_generated ON public.seo_landing_pages(is_generated, ai_generated);

-- Enable RLS
ALTER TABLE public.seo_landing_pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read SEO pages" ON public.seo_landing_pages
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage SEO pages" ON public.seo_landing_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

-- Create massive content combinations table
CREATE TABLE IF NOT EXISTS public.seo_content_combinations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  combination_type text NOT NULL, -- 'role_location_skill', 'company_role_location', etc.
  parameters jsonb NOT NULL,
  estimated_search_volume integer DEFAULT 0,
  competition_level text DEFAULT 'medium',
  is_processed boolean DEFAULT false,
  landing_page_id uuid REFERENCES public.seo_landing_pages(id),
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_seo_combinations_type ON public.seo_content_combinations(combination_type);
CREATE INDEX idx_seo_combinations_processed ON public.seo_content_combinations(is_processed);

-- Social media content tracking
CREATE TABLE IF NOT EXISTS public.social_media_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform text NOT NULL, -- 'linkedin', 'twitter', 'facebook', 'instagram', 'youtube'
  content_type text NOT NULL, -- 'job_post', 'career_tip', 'success_story', 'course_promotion'
  title text NOT NULL,
  content text NOT NULL,
  media_urls jsonb DEFAULT '[]'::jsonb,
  hashtags jsonb DEFAULT '[]'::jsonb,
  target_audience jsonb DEFAULT '{}'::jsonb,
  scheduled_at timestamp with time zone,
  published_at timestamp with time zone,
  engagement_metrics jsonb DEFAULT '{}'::jsonb,
  reach_metrics jsonb DEFAULT '{}'::jsonb,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- AI content generation tracking
CREATE TABLE IF NOT EXISTS public.ai_content_generation_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL, -- 'landing_page', 'job_description', 'course_content', 'blog_post'
  template_type text NOT NULL,
  input_parameters jsonb NOT NULL,
  ai_model text DEFAULT 'gpt-4o',
  generated_content text,
  quality_score numeric DEFAULT 0,
  human_reviewed boolean DEFAULT false,
  status text DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message text,
  processing_time_ms integer,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Sitemap generation metadata
CREATE TABLE IF NOT EXISTS public.sitemap_generation_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sitemap_type text NOT NULL,
  total_urls integer DEFAULT 0,
  generated_urls integer DEFAULT 0,
  generation_time_ms integer DEFAULT 0,
  file_size_bytes bigint DEFAULT 0,
  s3_url text,
  status text DEFAULT 'pending',
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Content performance analytics
CREATE TABLE IF NOT EXISTS public.content_performance_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id uuid NOT NULL,
  content_type text NOT NULL,
  page_views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  bounce_rate numeric DEFAULT 0,
  time_on_page integer DEFAULT 0,
  conversion_events integer DEFAULT 0,
  social_shares integer DEFAULT 0,
  search_impressions integer DEFAULT 0,
  search_clicks integer DEFAULT 0,
  avg_position numeric DEFAULT 0,
  date_recorded date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now()
);

-- Update function for timestamps
CREATE OR REPLACE FUNCTION update_seo_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seo_landing_pages_updated_at
  BEFORE UPDATE ON public.seo_landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_pages_updated_at();
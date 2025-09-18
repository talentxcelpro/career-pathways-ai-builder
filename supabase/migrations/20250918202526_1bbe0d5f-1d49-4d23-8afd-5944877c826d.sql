-- Create Global SEO Content Management System for 1M+ pages

-- Core SEO content table for massive scale
CREATE TABLE IF NOT EXISTS public.global_seo_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('job_location', 'job_skill', 'job_role', 'company_location', 'company_industry', 'course_category', 'salary_guide', 'career_path', 'skill_guide', 'industry_report', 'location_guide', 'trending_topic')),
  primary_slug TEXT NOT NULL,
  secondary_slug TEXT,
  tertiary_slug TEXT,
  language_code TEXT NOT NULL DEFAULT 'en',
  country_code TEXT NOT NULL DEFAULT 'global',
  
  -- SEO Meta Data
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  h1_title TEXT NOT NULL,
  
  -- Content Blocks
  hero_content JSONB NOT NULL DEFAULT '{}',
  intro_content TEXT NOT NULL,
  main_content JSONB NOT NULL DEFAULT '{}',
  sidebar_content JSONB DEFAULT '{}',
  footer_content JSONB DEFAULT '{}',
  
  -- Structured Data
  structured_data JSONB NOT NULL DEFAULT '{}',
  breadcrumbs JSONB NOT NULL DEFAULT '[]',
  
  -- FAQ and Related Content
  faqs JSONB DEFAULT '[]',
  related_links JSONB DEFAULT '[]',
  internal_links JSONB DEFAULT '[]',
  
  -- SEO Performance
  target_keywords TEXT[] NOT NULL DEFAULT '{}',
  semantic_keywords TEXT[] DEFAULT '{}',
  search_volume INTEGER DEFAULT 0,
  competition_score DECIMAL(3,2) DEFAULT 0.5,
  quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  
  -- Generation and Optimization
  ai_model_used TEXT DEFAULT 'gpt-4o',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_optimized_at TIMESTAMP WITH TIME ZONE,
  optimization_version INTEGER DEFAULT 1,
  
  -- Publishing Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  publish_date TIMESTAMP WITH TIME ZONE,
  last_indexed_at TIMESTAMP WITH TIME ZONE,
  
  -- Performance Metrics
  page_views INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  bounce_rate DECIMAL(5,4) DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0,
  
  -- Automation
  auto_update_enabled BOOLEAN DEFAULT true,
  next_update_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance at scale
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_content_type_status ON public.global_seo_content (content_type, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_content_slugs ON public.global_seo_content (primary_slug, secondary_slug, tertiary_slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_content_locale ON public.global_seo_content (language_code, country_code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_content_performance ON public.global_seo_content (quality_score DESC, search_volume DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_content_publishing ON public.global_seo_content (status, publish_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_content_auto_update ON public.global_seo_content (auto_update_enabled, next_update_at) WHERE auto_update_enabled = true;

-- Global SEO sitemap management for millions of URLs
CREATE TABLE IF NOT EXISTS public.global_seo_sitemaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sitemap_type TEXT NOT NULL CHECK (sitemap_type IN ('main', 'jobs', 'companies', 'courses', 'locations', 'skills', 'industries', 'news', 'images', 'videos')),
  country_code TEXT NOT NULL DEFAULT 'global',
  language_code TEXT NOT NULL DEFAULT 'en',
  
  -- Sitemap Structure
  filename TEXT NOT NULL UNIQUE,
  s3_url TEXT,
  local_path TEXT,
  url_count INTEGER NOT NULL DEFAULT 0,
  max_urls INTEGER DEFAULT 50000,
  
  -- Content and Generation
  urls JSONB NOT NULL DEFAULT '[]',
  priority_range JSONB DEFAULT '{"min": 0.1, "max": 1.0}',
  changefreq TEXT DEFAULT 'weekly',
  
  -- Status and Performance
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'submitted', 'indexed', 'error')),
  file_size_mb DECIMAL(10,2),
  compression_ratio DECIMAL(5,4),
  
  -- Submission tracking
  submitted_to_google BOOLEAN DEFAULT false,
  submitted_to_bing BOOLEAN DEFAULT false,
  submitted_to_yandex BOOLEAN DEFAULT false,
  google_submission_date TIMESTAMP WITH TIME ZONE,
  bing_submission_date TIMESTAMP WITH TIME ZONE,
  
  -- Performance metrics
  indexed_urls INTEGER DEFAULT 0,
  crawl_errors INTEGER DEFAULT 0,
  last_crawl_date TIMESTAMP WITH TIME ZONE,
  
  -- Automation
  auto_regenerate BOOLEAN DEFAULT true,
  regeneration_frequency TEXT DEFAULT 'daily' CHECK (regeneration_frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
  next_regeneration TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_sitemaps_type_locale ON public.global_seo_sitemaps (sitemap_type, country_code, language_code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_sitemaps_status ON public.global_seo_sitemaps (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_sitemaps_auto_regen ON public.global_seo_sitemaps (auto_regenerate, next_regeneration) WHERE auto_regenerate = true;

-- Global SEO URL management for scale
CREATE TABLE IF NOT EXISTS public.global_seo_urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url_path TEXT NOT NULL UNIQUE,
  canonical_url TEXT NOT NULL,
  
  -- URL Classification
  url_type TEXT NOT NULL CHECK (url_type IN ('page', 'listing', 'detail', 'category', 'search', 'filter')),
  content_type TEXT NOT NULL,
  
  -- Localization
  language_code TEXT NOT NULL DEFAULT 'en',
  country_code TEXT NOT NULL DEFAULT 'global',
  regional_variant TEXT,
  
  -- SEO Properties
  priority DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (priority >= 0.0 AND priority <= 1.0),
  changefreq TEXT NOT NULL DEFAULT 'weekly',
  last_modified TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Content Reference
  content_id UUID REFERENCES public.global_seo_content(id) ON DELETE CASCADE,
  
  -- Performance and Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'redirect', 'error')),
  http_status INTEGER DEFAULT 200,
  redirect_url TEXT,
  
  -- Analytics
  monthly_views INTEGER DEFAULT 0,
  monthly_clicks INTEGER DEFAULT 0,
  ctr_percentage DECIMAL(5,4) DEFAULT 0,
  avg_position DECIMAL(5,2) DEFAULT 0,
  
  -- Indexing Status
  indexed_google BOOLEAN DEFAULT false,
  indexed_bing BOOLEAN DEFAULT false,
  last_crawled TIMESTAMP WITH TIME ZONE,
  crawl_errors TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_urls_type_locale ON public.global_seo_urls (url_type, language_code, country_code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_urls_status ON public.global_seo_urls (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_urls_performance ON public.global_seo_urls (monthly_views DESC, ctr_percentage DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_urls_indexing ON public.global_seo_urls (indexed_google, indexed_bing);

-- Global keyword research and tracking
CREATE TABLE IF NOT EXISTS public.global_seo_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  language_code TEXT NOT NULL DEFAULT 'en',
  country_code TEXT NOT NULL DEFAULT 'global',
  
  -- Keyword Metrics
  search_volume INTEGER NOT NULL DEFAULT 0,
  competition_score DECIMAL(3,2) DEFAULT 0.5,
  cpc_usd DECIMAL(8,2) DEFAULT 0,
  difficulty_score INTEGER DEFAULT 50 CHECK (difficulty_score >= 0 AND difficulty_score <= 100),
  
  -- Keyword Classification
  keyword_type TEXT NOT NULL CHECK (keyword_type IN ('primary', 'secondary', 'long_tail', 'brand', 'local', 'question')),
  intent_type TEXT NOT NULL CHECK (intent_type IN ('informational', 'navigational', 'transactional', 'commercial')),
  
  -- Trending and Seasonality
  trend_direction TEXT DEFAULT 'stable' CHECK (trend_direction IN ('rising', 'falling', 'stable', 'seasonal')),
  seasonal_pattern JSONB DEFAULT '{}',
  peak_months INTEGER[] DEFAULT '{}',
  
  -- Content Mapping
  target_urls TEXT[] DEFAULT '{}',
  content_gaps BOOLEAN DEFAULT false,
  
  -- Performance Tracking
  current_rank INTEGER,
  best_rank INTEGER,
  rank_history JSONB DEFAULT '[]',
  clicks_30d INTEGER DEFAULT 0,
  impressions_30d INTEGER DEFAULT 0,
  
  -- Data Sources
  data_source TEXT DEFAULT 'internal' CHECK (data_source IN ('internal', 'google_keyword_planner', 'semrush', 'ahrefs', 'ubersuggest')),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_keywords_search_volume ON public.global_seo_keywords (search_volume DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_keywords_locale ON public.global_seo_keywords (language_code, country_code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_keywords_performance ON public.global_seo_keywords (current_rank ASC, clicks_30d DESC);

-- Global SEO automation jobs queue
CREATE TABLE IF NOT EXISTS public.global_seo_automation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL CHECK (job_type IN ('generate_content', 'update_sitemap', 'submit_urls', 'analyze_performance', 'optimize_content', 'keyword_research', 'competitor_analysis')),
  
  -- Job Configuration
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  batch_size INTEGER DEFAULT 100,
  target_locale TEXT DEFAULT 'en-global',
  
  -- Job Parameters
  parameters JSONB NOT NULL DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  
  -- Execution Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Progress Tracking
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  success_rate DECIMAL(5,4) DEFAULT 0,
  
  -- Results and Logging
  results JSONB DEFAULT '{}',
  error_log TEXT,
  execution_time_seconds INTEGER,
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_automation_queue_status ON public.global_seo_automation_queue (status, priority DESC, scheduled_for ASC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_global_seo_automation_queue_type ON public.global_seo_automation_queue (job_type, status);

-- RLS Policies
ALTER TABLE public.global_seo_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_seo_sitemaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_seo_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_seo_automation_queue ENABLE ROW LEVEL SECURITY;

-- Admin access for SEO management
CREATE POLICY "Admin can manage global SEO content" ON public.global_seo_content FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin can manage global SEO sitemaps" ON public.global_seo_sitemaps FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin can manage global SEO URLs" ON public.global_seo_urls FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin can manage global SEO keywords" ON public.global_seo_keywords FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin can manage global SEO automation" ON public.global_seo_automation_queue FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Public read access for published content
CREATE POLICY "Public can read published SEO content" ON public.global_seo_content FOR SELECT USING (status = 'published');
CREATE POLICY "Public can read active URLs" ON public.global_seo_urls FOR SELECT USING (status = 'active');

-- Update triggers
CREATE OR REPLACE FUNCTION public.update_global_seo_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_global_seo_content_updated_at
  BEFORE UPDATE ON public.global_seo_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_global_seo_updated_at_column();

CREATE TRIGGER update_global_seo_sitemaps_updated_at
  BEFORE UPDATE ON public.global_seo_sitemaps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_global_seo_updated_at_column();

CREATE TRIGGER update_global_seo_urls_updated_at
  BEFORE UPDATE ON public.global_seo_urls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_global_seo_updated_at_column();

CREATE TRIGGER update_global_seo_automation_queue_updated_at
  BEFORE UPDATE ON public.global_seo_automation_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_global_seo_updated_at_column();
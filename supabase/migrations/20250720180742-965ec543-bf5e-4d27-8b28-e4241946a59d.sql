-- Create SEO cache table for ISR/SSG-like behavior
CREATE TABLE public.seo_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  page_type TEXT NOT NULL,
  page_id TEXT,
  meta_data JSONB DEFAULT '{}',
  structured_data JSONB DEFAULT '{}',
  last_generated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  hit_count INTEGER DEFAULT 0,
  is_fresh BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create search engine submissions table
CREATE TABLE public.search_engine_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  engine_name TEXT NOT NULL, -- 'google', 'bing', 'yandex', etc.
  submission_type TEXT NOT NULL, -- 'sitemap', 'url', 'indexing'
  target_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'submitted', 'indexed', 'failed'
  response_data JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_checked TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SEO monitoring table
CREATE TABLE public.seo_monitoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  page_type TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}', -- Core Web Vitals, SEO scores, etc.
  search_rankings JSONB DEFAULT '{}',
  indexing_status JSONB DEFAULT '{}',
  internal_links_count INTEGER DEFAULT 0,
  external_links_count INTEGER DEFAULT 0,
  meta_quality_score INTEGER DEFAULT 0,
  structured_data_errors JSONB DEFAULT '[]',
  performance_score INTEGER DEFAULT 0,
  accessibility_score INTEGER DEFAULT 0,
  monitored_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create breadcrumb navigation table
CREATE TABLE public.breadcrumb_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_pattern TEXT NOT NULL, -- URL pattern to match
  breadcrumb_structure JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create internal linking optimization table
CREATE TABLE public.internal_links_optimization (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  link_type TEXT DEFAULT 'contextual', -- 'contextual', 'navigation', 'footer'
  relevance_score NUMERIC DEFAULT 0.0,
  position_in_content INTEGER,
  is_follow BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hreflang configurations
CREATE TABLE public.hreflang_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  language_code TEXT NOT NULL, -- 'en', 'hi', 'en-IN', etc.
  region_code TEXT, -- 'IN', 'US', etc.
  alternate_url TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_engine_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breadcrumb_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_links_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hreflang_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SEO cache (public read, admin write)
CREATE POLICY "Anyone can read SEO cache" ON public.seo_cache FOR SELECT USING (true);
CREATE POLICY "System can manage SEO cache" ON public.seo_cache FOR ALL USING (true);

-- RLS Policies for search engine submissions (admin only)
CREATE POLICY "Admins can manage search submissions" ON public.search_engine_submissions FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS Policies for SEO monitoring (admin only)
CREATE POLICY "Admins can manage SEO monitoring" ON public.seo_monitoring FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS Policies for breadcrumb configs (public read, admin write)
CREATE POLICY "Anyone can read breadcrumb configs" ON public.breadcrumb_configs FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage breadcrumb configs" ON public.breadcrumb_configs FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS Policies for internal links (public read, system write)
CREATE POLICY "Anyone can read internal links" ON public.internal_links_optimization FOR SELECT USING (true);
CREATE POLICY "System can manage internal links" ON public.internal_links_optimization FOR ALL USING (true);

-- RLS Policies for hreflang (public read, admin write)
CREATE POLICY "Anyone can read hreflang configs" ON public.hreflang_configs FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage hreflang configs" ON public.hreflang_configs FOR ALL 
USING (is_app_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_seo_cache_key ON public.seo_cache(cache_key);
CREATE INDEX idx_seo_cache_expires ON public.seo_cache(expires_at);
CREATE INDEX idx_search_submissions_status ON public.search_engine_submissions(status);
CREATE INDEX idx_seo_monitoring_url ON public.seo_monitoring(page_url);
CREATE INDEX idx_breadcrumb_pattern ON public.breadcrumb_configs(page_pattern);
CREATE INDEX idx_internal_links_source ON public.internal_links_optimization(source_url);
CREATE INDEX idx_hreflang_url ON public.hreflang_configs(page_url);

-- Create trigger for updated_at
CREATE TRIGGER update_seo_cache_updated_at BEFORE UPDATE ON public.seo_cache
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_search_submissions_updated_at BEFORE UPDATE ON public.search_engine_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_monitoring_updated_at BEFORE UPDATE ON public.seo_monitoring
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_breadcrumb_configs_updated_at BEFORE UPDATE ON public.breadcrumb_configs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_internal_links_updated_at BEFORE UPDATE ON public.internal_links_optimization
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hreflang_configs_updated_at BEFORE UPDATE ON public.hreflang_configs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default breadcrumb configurations
INSERT INTO public.breadcrumb_configs (page_pattern, breadcrumb_structure) VALUES
('/jobs/:id', '[{"name": "Home", "url": "/"}, {"name": "Jobs", "url": "/jobs"}, {"name": "Job Details", "url": ""}]'),
('/companies/:id', '[{"name": "Home", "url": "/"}, {"name": "Companies", "url": "/companies"}, {"name": "Company Profile", "url": ""}]'),
('/learning/:id', '[{"name": "Home", "url": "/"}, {"name": "Learning", "url": "/learning"}, {"name": "Course Details", "url": ""}]'),
('/network/:section', '[{"name": "Home", "url": "/"}, {"name": "Network", "url": "/network"}, {"name": "{{section}}", "url": ""}]'),
('/profile/:id', '[{"name": "Home", "url": "/"}, {"name": "Network", "url": "/network"}, {"name": "Profile", "url": ""}]');

-- Insert default hreflang configurations for Hindi support
INSERT INTO public.hreflang_configs (page_url, language_code, region_code, alternate_url, is_default) VALUES
('/', 'en', 'IN', '/', true),
('/', 'hi', 'IN', '/hi', false),
('/jobs', 'en', 'IN', '/jobs', true),
('/jobs', 'hi', 'IN', '/hi/jobs', false),
('/companies', 'en', 'IN', '/companies', true),
('/companies', 'hi', 'IN', '/hi/companies', false),
('/learning', 'en', 'IN', '/learning', true),
('/learning', 'hi', 'IN', '/hi/learning', false);

-- Create tables for SEO metadata management
CREATE TABLE IF NOT EXISTS public.seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type TEXT NOT NULL,
  page_identifier TEXT NOT NULL,
  title TEXT,
  description TEXT,
  keywords TEXT[],
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'website',
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  canonical_url TEXT,
  schema_markup JSONB DEFAULT '{}',
  meta_robots TEXT DEFAULT 'index,follow',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(page_type, page_identifier)
);

-- Create tables for ad campaigns
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL, -- 'internal', 'google_ads', 'meta_ads'
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  targeting_rules JSONB DEFAULT '{}',
  creative_assets JSONB DEFAULT '{}',
  budget_settings JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tables for page builder content
CREATE TABLE IF NOT EXISTS public.page_builder_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name TEXT NOT NULL,
  page_slug TEXT NOT NULL UNIQUE,
  page_type TEXT DEFAULT 'custom', -- 'landing', 'blog', 'custom'
  page_content JSONB NOT NULL DEFAULT '{}',
  seo_settings JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  template_category TEXT,
  performance_score INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tables for content hub
CREATE TABLE IF NOT EXISTS public.content_hub (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'blog', 'newsletter', 'email', 'announcement'
  content TEXT NOT NULL,
  excerpt TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'review', 'published', 'archived'
  author_id UUID,
  editor_id UUID,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  seo_data JSONB DEFAULT '{}',
  publish_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tables for feature flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0,
  target_audience JSONB DEFAULT '{}',
  flag_type TEXT DEFAULT 'boolean', -- 'boolean', 'string', 'number', 'json'
  flag_value JSONB DEFAULT 'false',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tables for site redirects
CREATE TABLE IF NOT EXISTS public.site_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  redirect_type INTEGER DEFAULT 301, -- 301, 302, 307, 308
  is_active BOOLEAN DEFAULT true,
  hit_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(source_url)
);

-- Create tables for site announcements
CREATE TABLE IF NOT EXISTS public.site_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
  target_audience JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tables for performance analytics
CREATE TABLE IF NOT EXISTS public.performance_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_type TEXT NOT NULL, -- 'page_load', 'lighthouse', 'core_vitals', 'search'
  page_url TEXT,
  device_type TEXT,
  location TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Create tables for user behavior analytics
CREATE TABLE IF NOT EXISTS public.user_behavior_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  event_type TEXT NOT NULL, -- 'page_view', 'click', 'scroll', 'form_submit'
  page_url TEXT NOT NULL,
  element_selector TEXT,
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT,
  ip_address INET
);

-- Create tables for integration configs
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name TEXT NOT NULL UNIQUE,
  integration_type TEXT NOT NULL, -- 'analytics', 'marketing', 'social', 'payment'
  config_data JSONB NOT NULL DEFAULT '{}',
  credentials JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending', -- 'pending', 'success', 'error'
  error_message TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tables for AI prompt library (extending existing ai_prompt_templates)
CREATE TABLE IF NOT EXISTS public.ai_prompt_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_name TEXT NOT NULL,
  prompt_category TEXT NOT NULL, -- 'seo', 'content', 'ads', 'analysis'
  prompt_text TEXT NOT NULL,
  system_message TEXT,
  variables JSONB DEFAULT '[]',
  model_settings JSONB DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_builder_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_hub ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_library ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for SEO metadata
CREATE POLICY "Admins can manage SEO metadata" ON public.seo_metadata
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view active SEO metadata" ON public.seo_metadata
  FOR SELECT USING (is_active = true);

-- Create RLS policies for ad campaigns
CREATE POLICY "Admins can manage ad campaigns" ON public.ad_campaigns
  FOR ALL USING (is_app_admin(auth.uid()));

-- Create RLS policies for page builder
CREATE POLICY "Admins can manage page builder pages" ON public.page_builder_pages
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view published pages" ON public.page_builder_pages
  FOR SELECT USING (is_published = true);

-- Create RLS policies for content hub
CREATE POLICY "Admins can manage content hub" ON public.content_hub
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view published content" ON public.content_hub
  FOR SELECT USING (status = 'published');

-- Create RLS policies for feature flags
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view enabled feature flags" ON public.feature_flags
  FOR SELECT USING (is_enabled = true);

-- Create RLS policies for site redirects
CREATE POLICY "Admins can manage site redirects" ON public.site_redirects
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "System can update redirect hit counts" ON public.site_redirects
  FOR UPDATE USING (true);

-- Create RLS policies for site announcements
CREATE POLICY "Admins can manage site announcements" ON public.site_announcements
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view active announcements" ON public.site_announcements
  FOR SELECT USING (is_active = true AND (start_date <= now()) AND (end_date IS NULL OR end_date > now()));

-- Create RLS policies for performance analytics
CREATE POLICY "Admins can manage performance analytics" ON public.performance_analytics
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "System can insert performance analytics" ON public.performance_analytics
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for user behavior analytics
CREATE POLICY "Admins can view user behavior analytics" ON public.user_behavior_analytics
  FOR SELECT USING (is_app_admin(auth.uid()));

CREATE POLICY "System can insert user behavior analytics" ON public.user_behavior_analytics
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for integration configs
CREATE POLICY "Admins can manage integration configs" ON public.integration_configs
  FOR ALL USING (is_app_admin(auth.uid()));

-- Create RLS policies for AI prompt library
CREATE POLICY "Admins can manage AI prompt library" ON public.ai_prompt_library
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view active AI prompts" ON public.ai_prompt_library
  FOR SELECT USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seo_metadata_page_type ON public.seo_metadata(page_type);
CREATE INDEX IF NOT EXISTS idx_seo_metadata_active ON public.seo_metadata(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_page_builder_published ON public.page_builder_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_content_hub_status ON public.content_hub(status);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON public.feature_flags(is_enabled);
CREATE INDEX IF NOT EXISTS idx_site_redirects_source ON public.site_redirects(source_url);
CREATE INDEX IF NOT EXISTS idx_site_announcements_active ON public.site_announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_performance_analytics_timestamp ON public.performance_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_behavior_timestamp ON public.user_behavior_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_integration_configs_active ON public.integration_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_library_category ON public.ai_prompt_library(prompt_category);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seo_metadata_updated_at
  BEFORE UPDATE ON public.seo_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_campaigns_updated_at
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_builder_pages_updated_at
  BEFORE UPDATE ON public.page_builder_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_hub_updated_at
  BEFORE UPDATE ON public.content_hub
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_redirects_updated_at
  BEFORE UPDATE ON public.site_redirects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_announcements_updated_at
  BEFORE UPDATE ON public.site_announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_configs_updated_at
  BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_prompt_library_updated_at
  BEFORE UPDATE ON public.ai_prompt_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

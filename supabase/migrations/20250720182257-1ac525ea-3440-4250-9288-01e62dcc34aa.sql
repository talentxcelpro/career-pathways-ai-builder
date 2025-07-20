
-- Create advanced admin platform tables

-- 1. SEO Metadata Management
CREATE TABLE IF NOT EXISTS public.seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'page', 'job', 'company', 'course', etc.
  entity_id UUID,
  page_path TEXT,
  title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  schema_markup JSONB DEFAULT '{}',
  canonical_url TEXT,
  is_indexable BOOLEAN DEFAULT true,
  custom_meta JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(entity_type, entity_id),
  UNIQUE(page_path)
);

-- 2. Ad Campaigns Management
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL, -- 'internal', 'google_ads', 'meta_ads'
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  target_audience JSONB DEFAULT '{}',
  content JSONB NOT NULL, -- headlines, descriptions, images, etc.
  targeting_rules JSONB DEFAULT '{}',
  budget_settings JSONB DEFAULT '{}',
  performance_data JSONB DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. A/B Testing Management
CREATE TABLE IF NOT EXISTS public.ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL, -- 'page', 'campaign', 'content'
  entity_type TEXT NOT NULL,
  entity_id UUID,
  variants JSONB NOT NULL, -- Array of variants with their configs
  traffic_allocation NUMERIC DEFAULT 0.5,
  status TEXT DEFAULT 'draft', -- 'draft', 'running', 'completed', 'paused'
  success_metrics TEXT[] DEFAULT '{}',
  results JSONB DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 4. Page Builder Content
CREATE TABLE IF NOT EXISTS public.page_builder_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name TEXT NOT NULL,
  page_slug TEXT UNIQUE NOT NULL,
  page_type TEXT DEFAULT 'landing', -- 'landing', 'content', 'template'
  content_blocks JSONB NOT NULL DEFAULT '[]',
  seo_config JSONB DEFAULT '{}',
  design_config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  is_template BOOLEAN DEFAULT false,
  template_category TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 5. Content Hub
CREATE TABLE IF NOT EXISTS public.content_hub (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'blog', 'email', 'newsletter', 'social'
  content TEXT NOT NULL,
  excerpt TEXT,
  tags TEXT[] DEFAULT '{}',
  seo_metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'archived'
  publish_date TIMESTAMP WITH TIME ZONE,
  distribution_channels TEXT[] DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  ai_prompts JSONB DEFAULT '{}',
  approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 6. Feature Flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  target_audience JSONB DEFAULT '{}', -- user segments, roles, etc.
  rollout_percentage NUMERIC DEFAULT 0,
  conditions JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 7. Site Redirects
CREATE TABLE IF NOT EXISTS public.site_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path TEXT UNIQUE NOT NULL,
  to_path TEXT NOT NULL,
  redirect_type INTEGER DEFAULT 301, -- 301, 302, etc.
  is_active BOOLEAN DEFAULT true,
  hit_count INTEGER DEFAULT 0,
  last_hit TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 8. Site Announcements
CREATE TABLE IF NOT EXISTS public.site_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  announcement_type TEXT DEFAULT 'banner', -- 'banner', 'modal', 'toast'
  target_audience JSONB DEFAULT '{}',
  display_conditions JSONB DEFAULT '{}',
  styling JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 9. Performance Analytics
CREATE TABLE IF NOT EXISTS public.performance_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metric_type TEXT NOT NULL, -- 'pageview', 'engagement', 'conversion', etc.
  metric_value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  date_bucket DATE DEFAULT CURRENT_DATE
);

-- 10. User Behavior Analytics
CREATE TABLE IF NOT EXISTS public.user_behavior_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  event_type TEXT NOT NULL, -- 'click', 'scroll', 'view', 'conversion'
  page_path TEXT NOT NULL,
  element_selector TEXT,
  event_data JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. Integration Configs
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name TEXT UNIQUE NOT NULL,
  integration_type TEXT NOT NULL, -- 'analytics', 'email', 'social', 'webhook'
  config_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'idle', -- 'idle', 'syncing', 'error'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 12. AI Prompt Library
CREATE TABLE IF NOT EXISTS public.ai_prompt_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_name TEXT NOT NULL,
  prompt_category TEXT NOT NULL, -- 'seo', 'content', 'ads', 'analysis'
  prompt_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  model_config JSONB DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  performance_rating NUMERIC,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_metadata_entity ON public.seo_metadata(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_seo_metadata_path ON public.seo_metadata(page_path);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON public.ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_page_builder_slug ON public.page_builder_pages(page_slug);
CREATE INDEX IF NOT EXISTS idx_content_hub_status ON public.content_hub(status);
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON public.feature_flags(flag_name);
CREATE INDEX IF NOT EXISTS idx_redirects_from_path ON public.site_redirects(from_path);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.site_announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_performance_analytics_entity ON public.performance_analytics(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_performance_analytics_date ON public.performance_analytics(date_bucket);
CREATE INDEX IF NOT EXISTS idx_user_behavior_page ON public.user_behavior_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_user_behavior_event ON public.user_behavior_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_integration_configs_name ON public.integration_configs(integration_name);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_category ON public.ai_prompt_library(prompt_category);

-- Enable RLS on all tables
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_builder_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_hub ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_library ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admins can manage everything
CREATE POLICY "Admins can manage SEO metadata" ON public.seo_metadata FOR ALL TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage ad campaigns" ON public.ad_campaigns FOR ALL TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage A/B tests" ON public.ab_tests FOR ALL TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage page builder" ON public.page_builder_pages FOR ALL TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage content hub" ON public.content_hub FOR ALL TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags FOR ALL TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage redirects" ON public.site_redirects FOR ALL TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage announcements" ON public.site_announcements FOR ALL TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can view performance analytics" ON public.performance_analytics FOR SELECT TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can view user behavior" ON public.user_behavior_analytics FOR SELECT TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage integrations" ON public.integration_configs FOR ALL TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage AI prompts" ON public.ai_prompt_library FOR ALL TO authenticated USING (is_app_admin(auth.uid()));

-- Public can view published content
CREATE POLICY "Public can view published pages" ON public.page_builder_pages FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Public can view published content" ON public.content_hub FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Public can view active announcements" ON public.site_announcements FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Public can view SEO metadata" ON public.seo_metadata FOR SELECT TO anon USING (true);

-- System can insert analytics
CREATE POLICY "System can insert performance analytics" ON public.performance_analytics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "System can insert user behavior" ON public.user_behavior_analytics FOR INSERT TO authenticated WITH CHECK (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seo_metadata_updated_at BEFORE UPDATE ON public.seo_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ad_campaigns_updated_at BEFORE UPDATE ON public.ad_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ab_tests_updated_at BEFORE UPDATE ON public.ab_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_builder_updated_at BEFORE UPDATE ON public.page_builder_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_hub_updated_at BEFORE UPDATE ON public.content_hub FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_redirects_updated_at BEFORE UPDATE ON public.site_redirects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.site_announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integration_configs_updated_at BEFORE UPDATE ON public.integration_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_prompt_library_updated_at BEFORE UPDATE ON public.ai_prompt_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO public.feature_flags (flag_name, description, is_enabled) VALUES
('advanced_seo_manager', 'Enable advanced SEO management tools', true),
('ai_content_generator', 'Enable AI-powered content generation', true),
('ab_testing_platform', 'Enable A/B testing capabilities', true),
('page_builder', 'Enable drag-and-drop page builder', true),
('advanced_analytics', 'Enable advanced analytics dashboard', true),
('personalization_engine', 'Enable content personalization', false)
ON CONFLICT (flag_name) DO NOTHING;

INSERT INTO public.ai_prompt_library (prompt_name, prompt_category, prompt_template, variables) VALUES
('seo_meta_description', 'seo', 'Create an engaging meta description for a {{content_type}} about {{topic}}. Keep it under 160 characters and include the primary keyword "{{keyword}}".', '{"content_type": "string", "topic": "string", "keyword": "string"}'),
('blog_title_generator', 'content', 'Generate 5 compelling blog post titles about {{topic}} for {{target_audience}}. Make them SEO-friendly and engaging.', '{"topic": "string", "target_audience": "string"}'),
('ad_headline_creator', 'ads', 'Create 3 compelling ad headlines for {{product_service}} targeting {{audience}}. Each headline should be under 30 characters and focus on {{benefit}}.', '{"product_service": "string", "audience": "string", "benefit": "string"}'),
('content_optimizer', 'seo', 'Optimize this content for SEO: {{content}}. Improve keyword density for "{{keyword}}", enhance readability, and suggest internal linking opportunities.', '{"content": "text", "keyword": "string"}')
ON CONFLICT (prompt_name) DO NOTHING;

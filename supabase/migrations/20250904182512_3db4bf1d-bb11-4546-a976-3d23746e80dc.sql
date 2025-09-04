-- Fix: Create SEO monitoring table without conflict on metric_name
CREATE TABLE IF NOT EXISTS public.seo_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  metric_category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'active',
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(metric_name)
);

CREATE INDEX IF NOT EXISTS idx_seo_monitoring_metric_name ON public.seo_monitoring(metric_name);
CREATE INDEX IF NOT EXISTS idx_seo_monitoring_category ON public.seo_monitoring(metric_category);
CREATE INDEX IF NOT EXISTS idx_seo_monitoring_created_at ON public.seo_monitoring(created_at);

-- Enable RLS
ALTER TABLE public.seo_monitoring ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (for monitoring dashboards)
CREATE POLICY "Public read access for SEO monitoring"
  ON public.seo_monitoring
  FOR SELECT
  USING (true);

-- Create policy for service role to insert/update
CREATE POLICY "Service role full access"
  ON public.seo_monitoring
  FOR ALL
  USING (true);

-- Insert initial SEO monitoring metrics
INSERT INTO public.seo_monitoring (metric_name, metric_value, metric_category, status, details) VALUES
('total_seo_pages_generated', 0, 'content', 'active', '{"description": "Total number of SEO pages generated"}'),
('sitemap_entries_count', 0, 'sitemap', 'active', '{"description": "Total entries in sitemap"}'),
('cache_hit_rate', 95.5, 'performance', 'active', '{"description": "SEO content cache hit rate percentage"}'),
('automation_success_rate', 100, 'automation', 'active', '{"description": "SEO automation job success rate"}'),
('content_freshness_score', 85, 'content', 'active', '{"description": "Content freshness score (0-100)"}')
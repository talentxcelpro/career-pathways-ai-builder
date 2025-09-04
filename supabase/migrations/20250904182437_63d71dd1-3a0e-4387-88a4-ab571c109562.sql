-- Complete SEO automation setup with cron jobs
-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Set up daily SEO automation (runs every day at 2 AM UTC)
SELECT cron.schedule(
  'daily-seo-automation',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/seo-automation-engine',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"}'::jsonb,
    body := '{"automation_type": "daily_seo", "trigger": "cron"}'::jsonb
  );
  $$
);

-- Set up weekly bulk SEO generation (runs every Sunday at 3 AM UTC)
SELECT cron.schedule(
  'weekly-bulk-seo',
  '0 3 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/bulk-seo-optimizer',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"}'::jsonb,
    body := '{"process_type": "weekly_optimization", "trigger": "cron"}'::jsonb
  );
  $$
);

-- Set up hourly sitemap refresh (runs every hour)
SELECT cron.schedule(
  'hourly-sitemap-refresh',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/enhanced-sitemap',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"}'::jsonb,
    body := '{"refresh_type": "hourly", "trigger": "cron"}'::jsonb
  );
  $$
);

-- Create SEO monitoring table for real-time tracking
CREATE TABLE IF NOT EXISTS public.seo_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  metric_category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'active',
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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
ON CONFLICT (metric_name) DO NOTHING;
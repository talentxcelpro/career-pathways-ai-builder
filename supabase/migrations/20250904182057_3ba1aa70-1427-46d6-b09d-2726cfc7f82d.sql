-- Just add the platform metrics for tracking
INSERT INTO public.platform_metrics (metric_name, metric_category, metric_value, time_period, period_start, period_end, metadata)
VALUES
  ('seo_system_activated', 'seo', 1, 'daily', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', '{"activation_time":"automated","status":"active","features":["monitoring","cache","automation"]}'::jsonb)
ON CONFLICT (metric_name, period_start) DO UPDATE SET
  metric_value = EXCLUDED.metric_value,
  metadata = EXCLUDED.metadata;
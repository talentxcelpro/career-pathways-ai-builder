-- Emergency Quota Cleanup Migration
-- 1. Unschedule all orphaned / failing pg_cron jobs calling dead endpoints
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobname)
    FROM cron.job
    WHERE jobname IN (
      'smart-email-processor-every-2min',
      'process-email-queue-unified',
      'process-emails',
      'process-email-queue-auto',
      'process-email-queue',
      'process-email-automation',
      'daily-seo-automation',
      'weekly-bulk-seo',
      'hourly-sitemap-refresh',
      'sitemap-refresh-6h',
      'sitemap-refresh',
      'news-automation-every-2-hours'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron unschedule skipped: %', SQLERRM;
END $$;

-- 2. Truncate high-churn telemetry table to immediately recover storage
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'claim1_growth_events'
  ) THEN
    TRUNCATE TABLE public.claim1_growth_events;
  END IF;
END $$;

-- ============================================================================
-- EMERGENCY QUOTA FIX: November 2026 Pro Plan Quota Breach
-- Migration: 20261120050000_emergency_quota_fix_nov2026.sql
-- Root causes:
--   1. Realtime CDC still publishing high-churn tables (Disk I/O drain)
--   2. Stale pg_net HTTP response logs bloating net schema
--   3. cron.job_run_details table bloating
--   4. Large audit/telemetry/distribution log tables growing unbounded
--   5. seo_keyword_hubs / distribution_posts accumulating stale rows
-- ============================================================================

BEGIN;

-- =========================================================================
-- 1. KILL ALL ACTIVE pg_cron JOBS (belt-and-suspenders)
-- =========================================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    FOR r IN (SELECT jobid, jobname FROM cron.job) LOOP
      BEGIN
        PERFORM cron.unschedule(r.jobid);
        RAISE NOTICE 'Unscheduled cron job: % (id: %)', r.jobname, r.jobid;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not unschedule job %: %', r.jobid, SQLERRM;
      END;
    END LOOP;

    -- Truncate run logs to reclaim disk
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'cron' AND table_name = 'job_run_details'
    ) THEN
      TRUNCATE TABLE cron.job_run_details;
      RAISE NOTICE 'Truncated cron.job_run_details';
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron cleanup skipped: %', SQLERRM;
END $$;

-- =========================================================================
-- 2. PURGE pg_net HTTP RESPONSE LOGS
-- =========================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    -- Delete all completed/errored HTTP responses older than 1 hour
    DELETE FROM net._http_response WHERE created < now() - INTERVAL '1 hour';
    RAISE NOTICE 'Cleared pg_net._http_response logs';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_net cleanup skipped: %', SQLERRM;
END $$;

-- =========================================================================
-- 3. CANCEL STUCK EMAIL QUEUE & CANCEL PENDING NOTIFICATIONS
-- =========================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'email_automation_queue'
  ) THEN
    UPDATE public.email_automation_queue
    SET status = 'cancelled'
    WHERE status IN ('pending', 'failed') AND retry_count >= 3;
    RAISE NOTICE 'Cancelled stuck email queue entries';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'email_automation_queue cleanup skipped: %', SQLERRM;
END $$;

-- =========================================================================
-- 4. TRUNCATE HIGH-CHURN TELEMETRY & GROWTH EVENT TABLES
-- =========================================================================
DO $$
DECLARE
  t TEXT;
  tables_to_clean TEXT[] := ARRAY[
    'claim1_growth_events',
    'udx_audit_log',
    'admin_activity_log',
    'cron_execution_log',
    'distribution_delivery_logs',
    'universe_telemetry_events',
    'seo_automation_log',
    'ai_audit_log'
  ];
BEGIN
  FOREACH t IN ARRAY tables_to_clean LOOP
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = t
      ) THEN
        -- Delete rows older than 7 days to reclaim space
        EXECUTE format('DELETE FROM public.%I WHERE created_at < now() - INTERVAL ''7 days''', t);
        RAISE NOTICE 'Cleaned old rows from public.%', t;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped cleanup for %: %', t, SQLERRM;
    END;
  END LOOP;
END $$;

-- =========================================================================
-- 5. TRIM DISTRIBUTION POSTS (keep last 30 days only)
-- =========================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'distribution_posts'
  ) THEN
    DELETE FROM public.distribution_posts
    WHERE status IN ('published', 'failed', 'cancelled', 'skipped')
      AND created_at < now() - INTERVAL '30 days';
    RAISE NOTICE 'Trimmed old distribution_posts';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'distribution_posts cleanup skipped: %', SQLERRM;
END $$;

-- =========================================================================
-- 6. TRIM SEO KEYWORD HUBS (soft-delete dispatched entries > 60 days)
-- =========================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'seo_keyword_hubs'
  ) THEN
    DELETE FROM public.seo_keyword_hubs
    WHERE is_dispatched = true
      AND dispatched_at < now() - INTERVAL '60 days';
    RAISE NOTICE 'Trimmed old seo_keyword_hubs';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'seo_keyword_hubs cleanup skipped: %', SQLERRM;
END $$;

-- =========================================================================
-- 7. REALTIME PUBLICATION AUDIT: DROP REMAINING HIGH-CHURN TABLES
--    (belt-and-suspenders in case rollback re-added them)
-- =========================================================================
DO $$
DECLARE
  t TEXT;
  high_churn_tables TEXT[] := ARRAY[
    'jobs',
    'content_scores',
    'company_realtime_metrics',
    'claim1_listings',
    'txc_transactions',
    'user_presence',
    'ai_job_matches',
    'ai_career_recommendations',
    'distribution_posts',
    'seo_keyword_hubs',
    'distribution_delivery_logs',
    'claim1_growth_events',
    'universe_telemetry_events'
  ];
BEGIN
  FOREACH t IN ARRAY high_churn_tables LOOP
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = t
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', t);
        RAISE NOTICE 'Dropped % from supabase_realtime publication', t;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop % from publication: %', t, SQLERRM;
    END;
  END LOOP;
END $$;

-- =========================================================================
-- 8. VACUUM HIGH-BLOAT TABLES TO RECLAIM DISK SPACE
-- =========================================================================
-- Note: VACUUM cannot run inside a transaction block.
-- These are executed AFTER the COMMIT below.

COMMIT;

-- Post-commit VACUUMs (run outside transaction)
VACUUM (ANALYZE) public.jobs;
VACUUM (ANALYZE) public.profiles;
VACUUM (ANALYZE) public.posts;
VACUUM (ANALYZE) public.notifications;
VACUUM (ANALYZE) public.connections;
VACUUM (ANALYZE) public.job_applications;

-- =========================================================================
-- 9. QUERY: Show current table sizes for verification
-- =========================================================================
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS table_size,
  pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 20;

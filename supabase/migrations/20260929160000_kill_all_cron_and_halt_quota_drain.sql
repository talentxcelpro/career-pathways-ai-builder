-- ============================================================================
-- EMERGENCY QUOTA FIX: TERMINATE ALL CRON JOBS & HALT INFRASTRUCTURE DRAIN
-- ============================================================================
-- This migration halts the continuous automated background loops in Postgres 
-- that were firing HTTP requests to Edge Functions every 1-2 minutes, 
-- generating thousands of edge function invocations and log queries.

-- 1. Unconditionally unschedule ALL pg_cron jobs
DO $$
DECLARE
  r RECORD;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    FOR r IN (SELECT jobid, jobname FROM cron.job) LOOP
      BEGIN
        PERFORM cron.unschedule(r.jobid);
        RAISE NOTICE 'Successfully unscheduled cron job: % (jobid: %)', r.jobname, r.jobid;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not unschedule job %: %', r.jobid, SQLERRM;
      END LOOP;
    END IF;

    -- Truncate cron run logs to stop database bloat
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'cron' AND table_name = 'job_run_details'
    ) THEN
      TRUNCATE TABLE cron.job_run_details;
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron cleanup step skipped: %', SQLERRM;
END $$;

-- 2. Clear pg_net queued/completed HTTP requests if extension is enabled
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    DELETE FROM net._http_response WHERE created < now();
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_net cleanup skipped: %', SQLERRM;
END $$;

-- 3. Reset or cancel failing email queue records that trigger retry loops
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'email_automation_queue'
  ) THEN
    -- Mark failing items as cancelled so processor won't poll or retry them in loops
    UPDATE public.email_automation_queue
    SET status = 'cancelled'
    WHERE status IN ('pending', 'failed') AND retry_count >= 3;
  END IF;
END $$;

-- 4. Truncate heavy growth/telemetry event tables
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'claim1_growth_events'
  ) THEN
    TRUNCATE TABLE public.claim1_growth_events;
  END IF;
END $$;

-- Rollback M4: Unschedule nightly expiry sync job and drop function
BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'deactivate-expired-jobs') THEN
    PERFORM cron.unschedule('deactivate-expired-jobs');
  END IF;
END;
$$;

DROP FUNCTION IF EXISTS public.deactivate_expired_jobs();

COMMIT;

-- M4: Nightly expiry sync function + pg_cron job (sets is_active = false when status/job_status/expires_at/application_deadline expired)
BEGIN;

CREATE OR REPLACE FUNCTION public.deactivate_expired_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.jobs
  SET is_active = false
  WHERE is_active = true
    AND (
      coalesce(status, '') IN ('expired', 'closed', 'filled')
      OR coalesce(job_status, '') IN ('closed', 'expired')
      OR (expires_at IS NOT NULL AND expires_at <= now())
      OR (application_deadline IS NOT NULL AND application_deadline <= now())
    );

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

-- Schedule nightly at 02:15 UTC (unschedule any existing job with the same name first)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'deactivate-expired-jobs') THEN
    PERFORM cron.unschedule('deactivate-expired-jobs');
  END IF;
  PERFORM cron.schedule(
    'deactivate-expired-jobs',
    '15 2 * * *',
    'SELECT public.deactivate_expired_jobs();'
  );
END;
$$;

SELECT public.deactivate_expired_jobs() AS deactivated_now;

COMMIT;

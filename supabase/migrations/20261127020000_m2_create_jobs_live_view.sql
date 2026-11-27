-- M2: Create authoritative jobs_live view (Decision 1; expiry_date intentionally excluded)
BEGIN;

CREATE OR REPLACE VIEW public.jobs_live
WITH (security_invoker = true) AS
SELECT *
FROM public.jobs
WHERE is_active = true
  AND coalesce(job_status, '') NOT IN ('closed', 'expired')
  AND coalesce(status, '') NOT IN ('expired', 'closed', 'filled')
  AND (expires_at IS NULL OR expires_at > now())
  AND (application_deadline IS NULL OR application_deadline > now());

GRANT SELECT ON public.jobs_live TO anon, authenticated, service_role;

SELECT
  (SELECT count(*) FROM public.jobs) AS total_jobs,
  (SELECT count(*) FROM public.jobs_live) AS jobs_live_count;

COMMIT;

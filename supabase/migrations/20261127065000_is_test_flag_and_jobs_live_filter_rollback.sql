-- Rollback: Restore M2 jobs_live view and drop is_test column
BEGIN;

DROP VIEW IF EXISTS public.jobs_live;
CREATE VIEW public.jobs_live
WITH (security_invoker = true) AS
SELECT *
FROM public.jobs
WHERE is_active = true
  AND coalesce(job_status, '') NOT IN ('closed', 'expired')
  AND coalesce(status, '') NOT IN ('expired', 'closed', 'filled')
  AND (expires_at IS NULL OR expires_at > now())
  AND (application_deadline IS NULL OR application_deadline > now());

GRANT SELECT ON public.jobs_live TO anon, authenticated, service_role;

ALTER TABLE public.jobs DROP COLUMN IF EXISTS is_test;

COMMIT;

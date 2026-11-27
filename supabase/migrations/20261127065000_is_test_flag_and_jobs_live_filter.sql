-- Add is_test flag, backfill exact placeholder id, and filter jobs_live
BEGIN;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

UPDATE public.jobs
SET is_test = true
WHERE id = '8a8d3566-cbc7-465d-a706-8b44a79539cc'::uuid;

DROP VIEW IF EXISTS public.jobs_live;
CREATE VIEW public.jobs_live
WITH (security_invoker = true) AS
SELECT *
FROM public.jobs
WHERE is_active = true
  AND coalesce(is_test, false) = false
  AND coalesce(job_status, '') NOT IN ('closed', 'expired')
  AND coalesce(status, '') NOT IN ('expired', 'closed', 'filled')
  AND (expires_at IS NULL OR expires_at > now())
  AND (application_deadline IS NULL OR application_deadline > now());

GRANT SELECT ON public.jobs_live TO anon, authenticated, service_role;

SELECT
  (SELECT count(*) FROM public.jobs) AS total_jobs,
  (SELECT count(*) FROM public.jobs WHERE is_test = true) AS is_test_count,
  (SELECT count(*) FROM public.jobs_live) AS jobs_live_count;

COMMIT;

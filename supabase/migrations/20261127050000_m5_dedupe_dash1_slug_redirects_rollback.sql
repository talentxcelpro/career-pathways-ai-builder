-- Rollback M5: Restore is_active on deactivated "-1" twins (where not expired) and drop job_slug_redirects
BEGIN;

UPDATE public.jobs j
SET is_active = true
FROM public.job_slug_redirects r
WHERE j.id = r.source_job_id
  AND coalesce(j.status, '') NOT IN ('expired', 'closed', 'filled')
  AND coalesce(j.job_status, '') NOT IN ('closed', 'expired')
  AND (j.expires_at IS NULL OR j.expires_at > now())
  AND (j.application_deadline IS NULL OR j.application_deadline > now());

DROP TABLE IF EXISTS public.job_slug_redirects;

COMMIT;

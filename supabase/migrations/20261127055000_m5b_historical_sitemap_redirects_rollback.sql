-- Rollback M5b
BEGIN;
DELETE FROM public.job_slug_redirects WHERE source_job_id IS NULL;
COMMIT;

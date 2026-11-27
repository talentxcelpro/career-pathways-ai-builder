-- Rollback M3: Drop content_updated_at trigger, function, and column
BEGIN;

DROP TRIGGER IF EXISTS trg_jobs_content_updated_at ON public.jobs;
DROP FUNCTION IF EXISTS public.update_job_content_updated_at();
ALTER TABLE public.jobs DROP COLUMN IF EXISTS content_updated_at;

COMMIT;

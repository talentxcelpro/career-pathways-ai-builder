-- Rollback M2: Drop jobs_live view
BEGIN;

DROP VIEW IF EXISTS public.jobs_live;

COMMIT;

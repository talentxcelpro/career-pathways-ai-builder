-- Rollback Step 1: Drop public.job_slug_redirects
BEGIN;
DROP TABLE IF EXISTS public.job_slug_redirects;
COMMIT;

-- Clear all existing jobs for testing
TRUNCATE TABLE public.jobs RESTART IDENTITY CASCADE;

-- Also clear related data
TRUNCATE TABLE public.job_applications RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.job_views RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.saved_jobs RESTART IDENTITY CASCADE;
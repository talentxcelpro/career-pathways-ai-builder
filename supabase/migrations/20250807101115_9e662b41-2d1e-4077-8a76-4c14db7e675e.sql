-- Add missing columns for bulk job upload functionality
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS education_requirements TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_function TEXT;
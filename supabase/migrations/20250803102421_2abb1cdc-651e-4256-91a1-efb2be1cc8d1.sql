-- Fix job_applications schema - replace references to created_at with applied_at

-- Drop the incorrect index if it exists (safe operation, will ignore if not found)
DROP INDEX IF EXISTS idx_job_applications_created_at;

-- Create the correct index on applied_at
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON public.job_applications(applied_at DESC);
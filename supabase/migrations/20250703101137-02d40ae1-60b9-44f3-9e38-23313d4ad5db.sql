-- Add all missing columns to jobs table for complete job posting form
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS work_schedule text,
ADD COLUMN IF NOT EXISTS visibility_duration_days integer DEFAULT 15,
ADD COLUMN IF NOT EXISTS application_method text DEFAULT 'talentxcel_profile',
ADD COLUMN IF NOT EXISTS supporting_documents jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS job_status text DEFAULT 'open',
ADD COLUMN IF NOT EXISTS posted_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS applications_count integer DEFAULT 0;
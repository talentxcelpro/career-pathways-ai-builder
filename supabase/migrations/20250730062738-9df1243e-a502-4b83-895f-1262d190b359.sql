-- Add missing columns to scraped_jobs table
ALTER TABLE public.scraped_jobs 
ADD COLUMN IF NOT EXISTS employment_type text,
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]'::jsonb;
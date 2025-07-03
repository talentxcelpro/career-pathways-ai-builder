-- Fix experience level constraint to allow "fresher" and add educational/certification fields
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_experience_level_check;

-- Recreate constraint with "fresher" instead of "entry-level" to match frontend
ALTER TABLE public.jobs ADD CONSTRAINT jobs_experience_level_check 
CHECK (experience_level IN ('fresher', 'mid-level', 'senior-level', 'executive'));

-- Add educational qualification and certification fields
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS educational_qualification text,
ADD COLUMN IF NOT EXISTS certification_required text;
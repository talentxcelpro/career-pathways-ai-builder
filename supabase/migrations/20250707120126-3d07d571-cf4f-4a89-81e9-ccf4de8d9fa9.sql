-- Update experience_level constraint to use correct values that match the form
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_experience_level_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_experience_level_check 
CHECK (experience_level IS NULL OR experience_level IN ('fresher', 'mid-level', 'senior-level', 'executive'));
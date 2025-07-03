-- Add the corrected experience level constraint
ALTER TABLE public.jobs ADD CONSTRAINT jobs_experience_level_check 
CHECK (experience_level IN ('fresher', 'mid-level', 'senior-level', 'executive') OR experience_level IS NULL);
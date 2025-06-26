
-- Update employment_type constraint to allow NULL values
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_employment_type_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_employment_type_check 
CHECK (employment_type IS NULL OR employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship'));

-- Update experience_level constraint to allow NULL values  
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_experience_level_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_experience_level_check 
CHECK (experience_level IS NULL OR experience_level IN ('entry-level', 'mid-level', 'senior-level', 'executive'));

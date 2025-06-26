
-- Check what values are allowed in the employment_type constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'jobs_employment_type_check';

-- Drop the existing constraint that's causing issues
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_employment_type_check;

-- Recreate the constraint with the correct values that match our frontend
ALTER TABLE public.jobs ADD CONSTRAINT jobs_employment_type_check 
CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship'));

-- Also check and fix experience_level constraint if it exists
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname LIKE '%experience_level%';

-- Drop and recreate experience_level constraint with correct values
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_experience_level_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_experience_level_check 
CHECK (experience_level IN ('entry-level', 'mid-level', 'senior-level', 'executive'));

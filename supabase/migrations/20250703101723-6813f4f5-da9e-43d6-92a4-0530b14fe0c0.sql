-- First update existing "entry-level" to "fresher" to match frontend
UPDATE public.jobs SET experience_level = 'fresher' WHERE experience_level = 'entry-level';

-- Now drop and recreate the constraint
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_experience_level_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_experience_level_check 
CHECK (experience_level IN ('fresher', 'mid-level', 'senior-level', 'executive'));

-- Add educational qualification and certification fields
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS educational_qualification text,
ADD COLUMN IF NOT EXISTS certification_required text;
-- Drop the existing constraint first
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_experience_level_check;

-- Update all data to use correct values
UPDATE public.jobs 
SET experience_level = 'fresher' 
WHERE experience_level = 'entry-level';

-- Add the new columns
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS educational_qualification text,
ADD COLUMN IF NOT EXISTS certification_required text;
-- First ensure all experience_level values are updated to match our constraint
UPDATE public.jobs 
SET experience_level = CASE 
  WHEN experience_level = 'entry-level' THEN 'fresher'
  WHEN experience_level IS NULL THEN NULL
  ELSE experience_level 
END;

-- Now add the fields we need (constraint will be added separately)
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS educational_qualification text,
ADD COLUMN IF NOT EXISTS certification_required text;
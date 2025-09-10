-- Add missing columns to jobs table and then insert more diverse jobs
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS role_category TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT;

-- Update existing jobs with categories where missing
UPDATE public.jobs 
SET role_category = 'technology' 
WHERE role_category IS NULL AND (
  title ILIKE '%developer%' OR 
  title ILIKE '%engineer%' OR 
  title ILIKE '%programmer%' OR
  title ILIKE '%software%' OR
  title ILIKE '%data scientist%'
);

UPDATE public.jobs 
SET role_category = 'finance' 
WHERE role_category IS NULL AND (
  title ILIKE '%analyst%' OR 
  title ILIKE '%financial%' OR 
  title ILIKE '%accounting%' OR
  title ILIKE '%investment%'
);

UPDATE public.jobs 
SET role_category = 'marketing' 
WHERE role_category IS NULL AND (
  title ILIKE '%marketing%' OR 
  title ILIKE '%sales%' OR 
  title ILIKE '%content%'
);

-- Set default category for remaining jobs
UPDATE public.jobs 
SET role_category = 'general' 
WHERE role_category IS NULL;

-- Add industry information where missing
UPDATE public.jobs 
SET industry = 'Software Development' 
WHERE industry IS NULL AND role_category = 'technology';

UPDATE public.jobs 
SET industry = 'Financial Services' 
WHERE industry IS NULL AND role_category = 'finance';

UPDATE public.jobs 
SET industry = 'Marketing & Advertising' 
WHERE industry IS NULL AND role_category = 'marketing';
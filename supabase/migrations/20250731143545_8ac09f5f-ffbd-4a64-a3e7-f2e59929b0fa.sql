-- Add industry column to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS industry TEXT;

-- Add index for better performance on industry filtering
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON public.jobs(industry);

-- Update existing jobs with sample industries (optional)
UPDATE public.jobs 
SET industry = CASE 
  WHEN job_title ILIKE '%software%' OR job_title ILIKE '%developer%' OR job_title ILIKE '%engineer%' THEN 'Technology'
  WHEN job_title ILIKE '%sales%' OR job_title ILIKE '%business%' THEN 'Sales'
  WHEN job_title ILIKE '%marketing%' THEN 'Marketing'
  WHEN job_title ILIKE '%finance%' OR job_title ILIKE '%analyst%' THEN 'Finance'
  WHEN job_title ILIKE '%manager%' THEN 'Management'
  ELSE 'Technology'
END
WHERE industry IS NULL;
-- Fix the syntax error and complete the migration
-- Add new required columns gradually
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS location_city text,
ADD COLUMN IF NOT EXISTS location_state text,
ADD COLUMN IF NOT EXISTS job_description text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS visibility_status text DEFAULT 'active';

-- Update job_title from existing title column
UPDATE public.jobs 
SET job_title = COALESCE(title, job_summary, 'Untitled Position')
WHERE job_title IS NULL;

-- Update location fields
UPDATE public.jobs 
SET location_city = SPLIT_PART(location, ',', 1)
WHERE location_city IS NULL AND location IS NOT NULL;

UPDATE public.jobs 
SET location_state = TRIM(SPLIT_PART(location, ',', 2))
WHERE location_state IS NULL AND location IS NOT NULL;

-- Update job_description
UPDATE public.jobs 
SET job_description = COALESCE(detailed_description, description, requirements)
WHERE job_description IS NULL;

-- Update company_name from companies table
UPDATE public.jobs 
SET company_name = (
  SELECT name FROM public.companies WHERE companies.id = jobs.company_id
)
WHERE company_name IS NULL;

-- Update visibility_status based on existing flags
UPDATE public.jobs 
SET visibility_status = CASE 
  WHEN is_draft = true THEN 'draft'
  WHEN expires_at < now() THEN 'expired'
  ELSE 'active'
END
WHERE visibility_status = 'active';

-- Ensure required fields have values
UPDATE public.jobs 
SET job_title = 'Untitled Position' 
WHERE job_title IS NULL OR job_title = '';

UPDATE public.jobs 
SET company_name = 'Unknown Company' 
WHERE company_name IS NULL OR company_name = '';

-- Now make them NOT NULL
ALTER TABLE public.jobs 
ALTER COLUMN job_title SET NOT NULL;

ALTER TABLE public.jobs 
ALTER COLUMN company_name SET NOT NULL;

-- Normalize employment_type values
UPDATE public.jobs 
SET employment_type = CASE 
  WHEN LOWER(employment_type) = 'full-time' THEN 'Full-Time'
  WHEN LOWER(employment_type) = 'part-time' THEN 'Part-Time'
  WHEN LOWER(employment_type) = 'contract' THEN 'Contract'
  WHEN LOWER(employment_type) = 'internship' THEN 'Internship'
  WHEN LOWER(employment_type) = 'freelance' THEN 'Freelance'
  WHEN LOWER(employment_type) = 'temporary' THEN 'Temporary'
  ELSE 'Full-Time'
END;

-- Normalize work_mode values
UPDATE public.jobs 
SET work_mode = CASE 
  WHEN is_remote = true THEN 'Remote'
  WHEN LOWER(work_mode) = 'on-site' THEN 'On-site'
  WHEN LOWER(work_mode) = 'remote' THEN 'Remote'
  WHEN LOWER(work_mode) = 'hybrid' THEN 'Hybrid'
  WHEN LOWER(work_mode) = 'field-based' THEN 'Field-based'
  ELSE 'On-site'
END;
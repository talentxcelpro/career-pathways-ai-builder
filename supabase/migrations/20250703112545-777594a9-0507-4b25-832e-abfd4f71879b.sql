-- Create the improved jobs table schema with proper data migration
-- First, let's create a function to normalize employment types
CREATE OR REPLACE FUNCTION normalize_employment_type(input_type text)
RETURNS text AS $$
BEGIN
  RETURN CASE 
    WHEN LOWER(input_type) = 'full-time' THEN 'Full-Time'
    WHEN LOWER(input_type) = 'part-time' THEN 'Part-Time'
    WHEN LOWER(input_type) = 'contract' THEN 'Contract'
    WHEN LOWER(input_type) = 'internship' THEN 'Internship'
    WHEN LOWER(input_type) = 'freelance' THEN 'Freelance'
    WHEN LOWER(input_type) = 'temporary' THEN 'Temporary'
    ELSE 'Full-Time' -- default fallback
  END;
END;
$$ LANGUAGE plpgsql;

-- Create normalized work mode function
CREATE OR REPLACE FUNCTION normalize_work_mode(is_remote boolean, work_mode text)
RETURNS text AS $$
BEGIN
  IF is_remote = true THEN
    RETURN 'Remote';
  ELSIF work_mode IS NOT NULL THEN
    RETURN CASE 
      WHEN LOWER(work_mode) = 'on-site' THEN 'On-site'
      WHEN LOWER(work_mode) = 'remote' THEN 'Remote'
      WHEN LOWER(work_mode) = 'hybrid' THEN 'Hybrid'
      WHEN LOWER(work_mode) = 'field-based' THEN 'Field-based'
      ELSE 'On-site'
    END;
  ELSE
    RETURN 'On-site';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Backup the current jobs table
CREATE TABLE IF NOT EXISTS public.jobs_backup AS SELECT * FROM public.jobs;

-- Add new columns to existing jobs table gradually
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS location_city text,
ADD COLUMN IF NOT EXISTS location_state text,
ADD COLUMN IF NOT EXISTS job_description text,
ADD COLUMN IF NOT EXISTS key_responsibilities text[],
ADD COLUMN IF NOT EXISTS must_have_requirements text[],
ADD COLUMN IF NOT EXISTS preferred_requirements text[],
ADD COLUMN IF NOT EXISTS education_level text,
ADD COLUMN IF NOT EXISTS year_of_passing int,
ADD COLUMN IF NOT EXISTS max_education_gap int,
ADD COLUMN IF NOT EXISTS certifications text[],
ADD COLUMN IF NOT EXISTS min_experience int,
ADD COLUMN IF NOT EXISTS max_experience int,
ADD COLUMN IF NOT EXISTS preferred_company_types text[],
ADD COLUMN IF NOT EXISTS specific_tools text[],
ADD COLUMN IF NOT EXISTS jd_flyer_url text,
ADD COLUMN IF NOT EXISTS team_brochure_url text,
ADD COLUMN IF NOT EXISTS benefits_policy_url text,
ADD COLUMN IF NOT EXISTS contact_name text,
ADD COLUMN IF NOT EXISTS visibility_status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS ai_match_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS ai_skill_tags text[],
ADD COLUMN IF NOT EXISTS ai_priority boolean DEFAULT false;

-- Update existing data to match new schema
UPDATE public.jobs SET
  job_title = COALESCE(title, job_summary, 'Untitled Position'),
  location_city = SPLIT_PART(location, ',', 1),
  location_state = TRIM(SPLIT_PART(location, ',', 2)),
  job_description = COALESCE(detailed_description, description, requirements),
  education_level = minimum_education,
  year_of_passing = minimum_year_of_passing,
  max_education_gap = COALESCE(maximum_gap_allowed, max_education_gap),
  certifications = preferred_certifications_list,
  min_experience = minimum_experience_years,
  max_experience = maximum_experience_years,
  preferred_company_types = preferred_company_background,
  specific_tools = ARRAY[specific_tools_domains]::text[],
  contact_name = contact_person_name,
  visibility_status = CASE 
    WHEN is_draft = true THEN 'draft'
    WHEN expires_at < now() THEN 'expired'
    ELSE 'active'
  END,
  employment_type = normalize_employment_type(employment_type),
  work_mode = normalize_work_mode(is_remote, work_mode)
WHERE job_title IS NULL OR location_city IS NULL;

-- Add company_name column and populate it
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS company_name text;
UPDATE public.jobs SET company_name = (
  SELECT name FROM public.companies WHERE companies.id = jobs.company_id
) WHERE company_name IS NULL;

-- Make job_title and company_name NOT NULL after populating
UPDATE public.jobs SET 
  job_title = 'Untitled Position' WHERE job_title IS NULL OR job_title = '',
  company_name = 'Unknown Company' WHERE company_name IS NULL OR company_name = '';

ALTER TABLE public.jobs 
ALTER COLUMN job_title SET NOT NULL,
ALTER COLUMN company_name SET NOT NULL;

-- Add check constraints
ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_employment_type_check 
CHECK (employment_type IN ('Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance', 'Temporary'));

ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_work_mode_check 
CHECK (work_mode IN ('On-site', 'Remote', 'Hybrid', 'Field-based'));

ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_experience_type_check 
CHECK (experience_type IN ('Total Experience', 'Relevant Experience Only'));

ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_visibility_status_check 
CHECK (visibility_status IN ('active', 'expired', 'draft'));

-- Create job_documents table
CREATE TABLE IF NOT EXISTS public.job_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  document_type text CHECK (document_type IN ('jd_flyer', 'team_brochure', 'benefits_policy')),
  file_url text NOT NULL,
  filename text,
  uploaded_at timestamp with time zone DEFAULT now()
);

-- Clean up helper functions
DROP FUNCTION IF EXISTS normalize_employment_type(text);
DROP FUNCTION IF EXISTS normalize_work_mode(boolean, text);
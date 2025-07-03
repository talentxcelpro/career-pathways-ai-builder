-- Add the missing core columns first
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS location_city text,
ADD COLUMN IF NOT EXISTS location_state text,
ADD COLUMN IF NOT EXISTS job_description text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS visibility_status text DEFAULT 'active';

-- Now add the additional columns
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS key_responsibilities text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS must_have_requirements text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_requirements text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS education_level text,
ADD COLUMN IF NOT EXISTS year_of_passing int,
ADD COLUMN IF NOT EXISTS certifications text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS min_experience int,
ADD COLUMN IF NOT EXISTS max_experience int,
ADD COLUMN IF NOT EXISTS preferred_company_types text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS specific_tools text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS jd_flyer_url text,
ADD COLUMN IF NOT EXISTS team_brochure_url text,
ADD COLUMN IF NOT EXISTS benefits_policy_url text,
ADD COLUMN IF NOT EXISTS contact_name text,
ADD COLUMN IF NOT EXISTS contact_designation text,
ADD COLUMN IF NOT EXISTS ai_match_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS ai_skill_tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_priority boolean DEFAULT false;

-- Populate the new columns with data from existing columns
UPDATE public.jobs 
SET 
  job_title = COALESCE(title, job_summary, 'Untitled Position'),
  location_city = CASE 
    WHEN location IS NOT NULL THEN SPLIT_PART(location, ',', 1)
    ELSE NULL
  END,
  location_state = CASE 
    WHEN location IS NOT NULL THEN TRIM(SPLIT_PART(location, ',', 2))
    ELSE NULL
  END,
  job_description = COALESCE(detailed_description, description, requirements),
  company_name = COALESCE(
    (SELECT name FROM public.companies WHERE companies.id = jobs.company_id),
    'Unknown Company'
  ),
  visibility_status = CASE 
    WHEN is_draft = true THEN 'draft'
    WHEN expires_at < now() THEN 'expired'
    ELSE 'active'
  END;

-- Update fields from old schema columns
UPDATE public.jobs SET
  education_level = minimum_education,
  year_of_passing = minimum_year_of_passing,
  certifications = COALESCE(preferred_certifications_list, '{}'),
  min_experience = minimum_experience_years,
  max_experience = maximum_experience_years,
  preferred_company_types = COALESCE(preferred_company_background, '{}'),
  contact_name = contact_person_name,
  contact_designation = contact_person_designation;

-- Ensure required fields have values
UPDATE public.jobs 
SET 
  job_title = 'Untitled Position' WHERE job_title IS NULL OR job_title = '',
  company_name = 'Unknown Company' WHERE company_name IS NULL OR company_name = '';

-- Make critical fields NOT NULL
ALTER TABLE public.jobs 
ALTER COLUMN job_title SET NOT NULL,
ALTER COLUMN company_name SET NOT NULL;
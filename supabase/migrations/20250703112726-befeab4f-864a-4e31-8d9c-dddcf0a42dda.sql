-- Drop existing constraints that might conflict
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_employment_type_check;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_work_mode_check;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_experience_type_check;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_visibility_status_check;

-- Add the missing columns we need for the new schema
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS key_responsibilities text[],
ADD COLUMN IF NOT EXISTS must_have_requirements text[],
ADD COLUMN IF NOT EXISTS preferred_requirements text[],
ADD COLUMN IF NOT EXISTS education_level text,
ADD COLUMN IF NOT EXISTS year_of_passing int,
ADD COLUMN IF NOT EXISTS certifications text[],
ADD COLUMN IF NOT EXISTS min_experience int,
ADD COLUMN IF NOT EXISTS max_experience int,
ADD COLUMN IF NOT EXISTS preferred_company_types text[],
ADD COLUMN IF NOT EXISTS specific_tools text[],
ADD COLUMN IF NOT EXISTS jd_flyer_url text,
ADD COLUMN IF NOT EXISTS team_brochure_url text,
ADD COLUMN IF NOT EXISTS benefits_policy_url text,
ADD COLUMN IF NOT EXISTS contact_name text,
ADD COLUMN IF NOT EXISTS contact_designation text,
ADD COLUMN IF NOT EXISTS ai_match_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS ai_skill_tags text[],
ADD COLUMN IF NOT EXISTS ai_priority boolean DEFAULT false;

-- Copy data from old columns to new ones where applicable
UPDATE public.jobs SET
  education_level = minimum_education,
  year_of_passing = minimum_year_of_passing,
  certifications = preferred_certifications_list,
  min_experience = minimum_experience_years,
  max_experience = maximum_experience_years,
  preferred_company_types = preferred_company_background,
  contact_name = contact_person_name,
  contact_designation = contact_person_designation
WHERE education_level IS NULL;

-- Map array fields properly
UPDATE public.jobs SET
  key_responsibilities = COALESCE(key_responsibilities, '{}'),
  must_have_requirements = COALESCE(must_have_requirements, '{}'),
  preferred_requirements = COALESCE(nice_to_have, '{}'),
  specific_tools = CASE 
    WHEN specific_tools_domains IS NOT NULL 
    THEN ARRAY[specific_tools_domains]::text[]
    ELSE '{}'::text[]
  END
WHERE key_responsibilities IS NULL;

-- Create the job_documents table
CREATE TABLE IF NOT EXISTS public.job_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  document_type text CHECK (document_type IN ('jd_flyer', 'team_brochure', 'benefits_policy')),
  file_url text NOT NULL,
  filename text,
  uploaded_at timestamp with time zone DEFAULT now()
);

-- Add proper indexes
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON public.jobs USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(visibility_status);
CREATE INDEX IF NOT EXISTS idx_job_documents_job_id ON public.job_documents(job_id);
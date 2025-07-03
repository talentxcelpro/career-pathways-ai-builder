-- Populate the new columns with data from existing columns
UPDATE public.jobs 
SET 
  job_title = COALESCE(NULLIF(title, ''), NULLIF(job_summary, ''), 'Untitled Position'),
  location_city = CASE 
    WHEN location IS NOT NULL AND location != '' THEN SPLIT_PART(location, ',', 1)
    ELSE NULL
  END,
  location_state = CASE 
    WHEN location IS NOT NULL AND location != '' AND POSITION(',' in location) > 0 
    THEN TRIM(SPLIT_PART(location, ',', 2))
    ELSE NULL
  END,
  job_description = COALESCE(
    NULLIF(detailed_description, ''), 
    NULLIF(description, ''), 
    NULLIF(requirements, ''),
    'Job description will be updated soon.'
  ),
  company_name = COALESCE(
    (SELECT name FROM public.companies WHERE companies.id = jobs.company_id),
    'Unknown Company'
  ),
  visibility_status = CASE 
    WHEN is_draft = true THEN 'draft'
    WHEN expires_at IS NOT NULL AND expires_at < now() THEN 'expired'
    ELSE 'active'
  END,
  education_level = minimum_education,
  year_of_passing = minimum_year_of_passing,
  min_experience = minimum_experience_years,
  max_experience = maximum_experience_years,
  contact_name = contact_person_name,
  contact_designation = contact_person_designation;

-- Make required fields NOT NULL after populating them
ALTER TABLE public.jobs 
ALTER COLUMN job_title SET NOT NULL,
ALTER COLUMN company_name SET NOT NULL;

-- Create the job_documents table
CREATE TABLE IF NOT EXISTS public.job_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  document_type text CHECK (document_type IN ('jd_flyer', 'team_brochure', 'benefits_policy')),
  file_url text NOT NULL,
  filename text,
  uploaded_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on job_documents
ALTER TABLE public.job_documents ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Anyone can view active job documents" ON public.job_documents
FOR SELECT USING (
  job_id IN (SELECT id FROM public.jobs WHERE visibility_status = 'active')
);

CREATE POLICY "Job posters can manage their job documents" ON public.job_documents
FOR ALL USING (
  job_id IN (SELECT id FROM public.jobs WHERE posted_by = auth.uid())
);
-- Migrate to the new improved jobs table schema
-- First, create the new companies table structure if needed
CREATE TABLE IF NOT EXISTS public.companies_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  website text,
  industry text,
  size text,
  logo_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create the new jobs table with improved schema
CREATE TABLE IF NOT EXISTS public.jobs_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Company Info
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  company_website text,
  industry_domain text,
  company_size text,
  
  -- Job Overview
  job_title text NOT NULL,
  employment_type text CHECK (employment_type IN ('Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance', 'Temporary')),
  work_mode text CHECK (work_mode IN ('On-site', 'Remote', 'Hybrid', 'Field-based')),
  location_city text,
  location_state text,
  work_schedule text,
  experience_level text,
  application_deadline date,
  
  -- Description
  job_summary text,
  job_description text,
  key_responsibilities text[],
  must_have_requirements text[],
  preferred_requirements text[],
  
  -- Skills & Education
  required_skills text[],
  education_level text,
  field_of_study text[],
  year_of_passing int,
  max_education_gap int,
  certifications text[],
  
  -- Experience
  experience_type text CHECK (experience_type IN ('Total Experience', 'Relevant Experience Only')),
  min_experience int,
  max_experience int,
  preferred_industries text[],
  preferred_company_types text[],
  specific_tools text[],
  
  -- Salary & Benefits
  min_salary int,
  max_salary int,
  benefits text[],
  
  -- Supporting Documents (URLs to Supabase Storage)
  jd_flyer_url text,
  team_brochure_url text,
  benefits_policy_url text,
  
  -- Contact Person
  contact_name text,
  contact_designation text,
  contact_email text,
  contact_phone text,
  
  -- System Fields
  visibility_status text DEFAULT 'active' CHECK (visibility_status IN ('active', 'expired', 'draft')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  posted_by uuid REFERENCES auth.users(id),
  
  -- AI Enhancements
  ai_match_enabled boolean DEFAULT true,
  ai_skill_tags text[],
  ai_priority boolean DEFAULT false
);

-- Create job_documents table for file uploads
CREATE TABLE IF NOT EXISTS public.job_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs_new(id) ON DELETE CASCADE,
  document_type text CHECK (document_type IN ('jd_flyer', 'team_brochure', 'benefits_policy')),
  file_url text NOT NULL,
  filename text,
  uploaded_at timestamp with time zone DEFAULT now()
);

-- Copy existing companies data to new structure
INSERT INTO public.companies_new (id, name, website, industry, size, logo_url, created_at, user_id)
SELECT id, name, website, industry, size_range, logo_url, created_at, created_by
FROM public.companies
ON CONFLICT (id) DO NOTHING;

-- Migrate existing jobs data to new structure
INSERT INTO public.jobs_new (
  id, company_id, company_name, job_title, employment_type, work_mode,
  location_city, location_state, job_summary, job_description, 
  required_skills, min_salary, max_salary, benefits, contact_name,
  contact_designation, contact_email, contact_phone, visibility_status,
  created_at, updated_at, posted_by, application_deadline
)
SELECT 
  j.id,
  j.company_id,
  COALESCE(c.name, 'Unknown Company'),
  COALESCE(j.title, j.job_summary, 'Untitled Position'),
  j.employment_type,
  CASE 
    WHEN j.is_remote = true THEN 'Remote'
    WHEN j.work_mode IS NOT NULL THEN j.work_mode
    ELSE 'On-site'
  END,
  SPLIT_PART(j.location, ',', 1),
  TRIM(SPLIT_PART(j.location, ',', 2)),
  COALESCE(j.job_summary, j.description),
  COALESCE(j.detailed_description, j.description, j.requirements),
  j.skills_required,
  j.salary_min,
  j.salary_max,
  COALESCE(j.benefits_offered, j.benefits),
  j.contact_person_name,
  j.contact_person_designation,
  j.contact_person_email,
  j.contact_person_phone,
  CASE 
    WHEN j.is_draft = true THEN 'draft'
    WHEN j.expires_at < now() THEN 'expired'
    ELSE 'active'
  END,
  j.created_at,
  j.updated_at,
  j.posted_by,
  j.application_deadline::date
FROM public.jobs j
LEFT JOIN public.companies c ON j.company_id = c.id
ON CONFLICT (id) DO NOTHING;

-- Drop old tables and rename new ones
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

ALTER TABLE public.companies_new RENAME TO companies;
ALTER TABLE public.jobs_new RENAME TO jobs;

-- Create updated triggers and functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON public.jobs USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(visibility_status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_job_documents_job_id ON public.job_documents(job_id);
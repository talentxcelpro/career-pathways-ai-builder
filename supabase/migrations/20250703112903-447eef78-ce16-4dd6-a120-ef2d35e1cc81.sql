-- Complete the database migration with proper syntax
-- Create the job_documents table first
CREATE TABLE IF NOT EXISTS public.job_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  document_type text CHECK (document_type IN ('jd_flyer', 'team_brochure', 'benefits_policy')),
  file_url text NOT NULL,
  filename text,
  uploaded_at timestamp with time zone DEFAULT now()
);

-- Fix any remaining null values in required fields
UPDATE public.jobs 
SET job_title = 'Untitled Position' 
WHERE job_title IS NULL OR job_title = '';

UPDATE public.jobs 
SET company_name = 'Unknown Company' 
WHERE company_name IS NULL OR company_name = '';

-- Create useful indexes for the new schema
CREATE INDEX IF NOT EXISTS idx_jobs_job_title ON public.jobs(job_title);
CREATE INDEX IF NOT EXISTS idx_jobs_location_city ON public.jobs(location_city);
CREATE INDEX IF NOT EXISTS idx_jobs_location_state ON public.jobs(location_state);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON public.jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_work_mode ON public.jobs(work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_company_name ON public.jobs(company_name);
CREATE INDEX IF NOT EXISTS idx_jobs_visibility_status ON public.jobs(visibility_status);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON public.jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_application_deadline ON public.jobs(application_deadline);
CREATE INDEX IF NOT EXISTS idx_jobs_ai_match_enabled ON public.jobs(ai_match_enabled);
CREATE INDEX IF NOT EXISTS idx_job_documents_job_id ON public.job_documents(job_id);
CREATE INDEX IF NOT EXISTS idx_job_documents_type ON public.job_documents(document_type);

-- Add RLS policies for job_documents table
ALTER TABLE public.job_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job documents are viewable by job viewers" ON public.job_documents
FOR SELECT USING (
  job_id IN (
    SELECT id FROM public.jobs 
    WHERE visibility_status = 'active'
  )
);

CREATE POLICY "Job posters can manage job documents" ON public.job_documents
FOR ALL USING (
  job_id IN (
    SELECT id FROM public.jobs 
    WHERE posted_by = auth.uid()
  )
);
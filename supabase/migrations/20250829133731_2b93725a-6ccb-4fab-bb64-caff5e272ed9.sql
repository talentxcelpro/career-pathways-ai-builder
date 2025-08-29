-- Create enhanced applications table with structured fields
CREATE TABLE IF NOT EXISTS public.enhanced_job_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Resume and files
  resume_source text CHECK (resume_source IN ('existing', 'upload')) DEFAULT 'existing',
  resume_url text,
  cover_letter_url text,
  additional_files jsonb DEFAULT '[]'::jsonb,
  
  -- Structured application data
  current_role text,
  current_ctc numeric,
  expected_ctc numeric,
  notice_period text,
  preferred_location text,
  
  -- Contact and profile sync
  full_name text,
  email text,
  phone text,
  
  -- Application status and metadata
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected')),
  employer_notes text,
  
  -- Timestamps
  applied_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  status_updated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(job_id, user_id)
);

-- Enable RLS
ALTER TABLE public.enhanced_job_applications ENABLE ROW LEVEL SECURITY;

-- Policies for enhanced applications
CREATE POLICY "Users can view their own enhanced applications"
  ON public.enhanced_job_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enhanced applications"
  ON public.enhanced_job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enhanced applications"
  ON public.enhanced_job_applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Employers can view applications for their jobs"
  ON public.enhanced_job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = enhanced_job_applications.job_id 
      AND jobs.posted_by = auth.uid()
    )
  );

CREATE POLICY "Employers can update applications for their jobs"
  ON public.enhanced_job_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = enhanced_job_applications.job_id 
      AND jobs.posted_by = auth.uid()
    )
  );

-- Create enhanced platform_cvs table for central CV database
CREATE TABLE IF NOT EXISTS public.enhanced_platform_cvs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Basic info
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  location text,
  
  -- Professional info
  current_role text,
  current_company text,
  experience_years integer,
  skills text[],
  
  -- Profile data
  profile_summary text,
  education jsonb DEFAULT '[]'::jsonb,
  work_experience jsonb DEFAULT '[]'::jsonb,
  
  -- Files and links
  resume_url text,
  profile_picture_url text,
  linkedin_url text,
  portfolio_url text,
  uploaded_files jsonb DEFAULT '[]'::jsonb,
  
  -- Metadata
  added_from text DEFAULT 'platform' CHECK (added_from IN ('platform', 'application')),
  is_searchable boolean DEFAULT true,
  availability_status text DEFAULT 'open' CHECK (availability_status IN ('open', 'passive', 'unavailable')),
  
  -- Timestamps
  added_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_activity_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for platform CVs
ALTER TABLE public.enhanced_platform_cvs ENABLE ROW LEVEL SECURITY;

-- Policies for platform CVs
CREATE POLICY "Users can view their own CV"
  ON public.enhanced_platform_cvs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own CV"
  ON public.enhanced_platform_cvs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Employers can view searchable CVs"
  ON public.enhanced_platform_cvs FOR SELECT
  USING (
    is_searchable = true AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('employer', 'admin', 'super_admin')
      AND is_active = true
    )
  );

-- Create view for employer application dashboard
CREATE OR REPLACE VIEW public.job_applications_with_candidate_details AS
SELECT 
  ea.id as application_id,
  ea.job_id,
  ea.user_id,
  ea.status,
  ea.applied_at,
  ea.reviewed_at,
  ea.status_updated_at,
  
  -- Candidate details
  ea.full_name,
  ea.email,
  ea.phone,
  
  -- Application specifics
  ea.current_role,
  ea.current_ctc,
  ea.expected_ctc,
  ea.notice_period,
  ea.preferred_location,
  ea.resume_source,
  ea.resume_url,
  ea.cover_letter_url,
  ea.additional_files,
  ea.employer_notes,
  
  -- Job details
  j.title as job_title,
  j.company_name,
  j.location as job_location,
  
  -- Profile data from platform CV
  pcv.current_company,
  pcv.experience_years,
  pcv.skills,
  pcv.profile_picture_url,
  pcv.linkedin_url,
  pcv.portfolio_url
FROM public.enhanced_job_applications ea
JOIN public.jobs j ON ea.job_id = j.id
LEFT JOIN public.enhanced_platform_cvs pcv ON ea.user_id = pcv.user_id;

-- Function to sync application to platform CV
CREATE OR REPLACE FUNCTION sync_application_to_platform_cv()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update platform CV when application is created/updated
  INSERT INTO public.enhanced_platform_cvs (
    user_id,
    full_name,
    email,
    phone,
    location,
    current_role,
    resume_url,
    added_from,
    updated_at
  )
  VALUES (
    NEW.user_id,
    NEW.full_name,
    NEW.email,
    NEW.phone,
    NEW.preferred_location,
    NEW.current_role,
    NEW.resume_url,
    'application',
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, enhanced_platform_cvs.full_name),
    email = COALESCE(EXCLUDED.email, enhanced_platform_cvs.email),
    phone = COALESCE(EXCLUDED.phone, enhanced_platform_cvs.phone),
    location = COALESCE(EXCLUDED.location, enhanced_platform_cvs.location),
    current_role = COALESCE(EXCLUDED.current_role, enhanced_platform_cvs.current_role),
    resume_url = COALESCE(EXCLUDED.resume_url, enhanced_platform_cvs.resume_url),
    updated_at = NOW(),
    last_activity_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for syncing
CREATE TRIGGER sync_application_cv_trigger
  AFTER INSERT OR UPDATE ON public.enhanced_job_applications
  FOR EACH ROW
  EXECUTE FUNCTION sync_application_to_platform_cv();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_enhanced_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp updates
CREATE TRIGGER update_enhanced_applications_timestamp
  BEFORE UPDATE ON public.enhanced_job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_enhanced_applications_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enhanced_applications_job_user ON public.enhanced_job_applications(job_id, user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_applications_status ON public.enhanced_job_applications(status);
CREATE INDEX IF NOT EXISTS idx_enhanced_applications_applied_at ON public.enhanced_job_applications(applied_at);
CREATE INDEX IF NOT EXISTS idx_platform_cvs_searchable ON public.enhanced_platform_cvs(is_searchable) WHERE is_searchable = true;
CREATE INDEX IF NOT EXISTS idx_platform_cvs_skills ON public.enhanced_platform_cvs USING gin(skills);
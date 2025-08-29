-- Create unified candidates table with full-text search capabilities
CREATE TABLE public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  location text,
  title text,
  company text,
  skills text[] DEFAULT '{}',
  description text,
  resume_url text,
  profile_picture_url text,
  experience_years integer,
  looking_for_job boolean DEFAULT false,
  source text CHECK (source IN ('applied', 'platform')) NOT NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  application_id uuid REFERENCES public.job_applications(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create full-text search index for fast searching
CREATE INDEX candidates_search_idx ON public.candidates 
USING gin (
  to_tsvector('english', 
    COALESCE(full_name, '') || ' ' || 
    COALESCE(title, '') || ' ' || 
    COALESCE(company, '') || ' ' || 
    COALESCE(location, '') || ' ' || 
    array_to_string(COALESCE(skills, '{}'), ' ') || ' ' || 
    COALESCE(description, '')
  )
);

-- Create indexes for common filtering
CREATE INDEX candidates_source_idx ON public.candidates(source);
CREATE INDEX candidates_location_idx ON public.candidates(location);
CREATE INDEX candidates_company_idx ON public.candidates(company);
CREATE INDEX candidates_skills_idx ON public.candidates USING gin(skills);
CREATE INDEX candidates_active_idx ON public.candidates(is_active);

-- Enable RLS
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for candidates table
CREATE POLICY "Employers can view candidates" 
ON public.candidates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (is_employer = true OR employer_status = 'approved')
  )
);

CREATE POLICY "System can manage candidates" 
ON public.candidates 
FOR ALL 
USING (true);

-- Function to sync candidates from applications and profiles
CREATE OR REPLACE FUNCTION sync_candidates_from_applications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert/update candidates from job applications
  INSERT INTO public.candidates (
    user_id, full_name, email, phone, location, title, company, skills, 
    description, resume_url, profile_picture_url, experience_years, 
    source, job_id, application_id, created_at
  )
  SELECT DISTINCT
    p.id as user_id,
    COALESCE(p.full_name, ja.application_data->>'fullName', 'Unknown') as full_name,
    COALESCE(p.email, ja.application_data->>'email') as email,
    COALESCE(p.phone, ja.application_data->>'phone') as phone,
    COALESCE(p.location, ja.application_data->>'location') as location,
    COALESCE(p.title, ja.application_data->>'title') as title,
    COALESCE(p.current_company, j.company_name) as company,
    COALESCE(p.skills, ARRAY[]::text[]) as skills,
    COALESCE(p.about, ja.application_data->>'about') as description,
    COALESCE(ja.resume_url, p.resume_url) as resume_url,
    p.profile_picture_url,
    p.experience_years,
    'applied' as source,
    ja.job_id,
    ja.id as application_id,
    ja.applied_at as created_at
  FROM public.job_applications ja
  LEFT JOIN public.profiles p ON p.id = ja.user_id
  LEFT JOIN public.jobs j ON j.id = ja.job_id
  ON CONFLICT (application_id) 
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location,
    title = EXCLUDED.title,
    company = EXCLUDED.company,
    skills = EXCLUDED.skills,
    description = EXCLUDED.description,
    resume_url = EXCLUDED.resume_url,
    profile_picture_url = EXCLUDED.profile_picture_url,
    experience_years = EXCLUDED.experience_years,
    updated_at = now();

  -- Insert/update candidates from platform profiles
  INSERT INTO public.candidates (
    user_id, full_name, email, phone, location, title, company, skills, 
    description, resume_url, profile_picture_url, experience_years, 
    looking_for_job, source, created_at
  )
  SELECT DISTINCT
    p.id as user_id,
    p.full_name,
    p.email,
    p.phone,
    p.location,
    p.title,
    p.current_company as company,
    COALESCE(p.skills, ARRAY[]::text[]) as skills,
    p.about as description,
    p.resume_url,
    p.profile_picture_url,
    p.experience_years,
    p.looking_for_job,
    'platform' as source,
    p.created_at
  FROM public.profiles p
  WHERE p.user_role != 'employer' 
    AND p.is_profile_public = true
    AND (p.resume_url IS NOT NULL OR p.about IS NOT NULL OR p.skills IS NOT NULL)
  ON CONFLICT (user_id) WHERE source = 'platform'
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location,
    title = EXCLUDED.title,
    company = EXCLUDED.company,
    skills = EXCLUDED.skills,
    description = EXCLUDED.description,
    resume_url = EXCLUDED.resume_url,
    profile_picture_url = EXCLUDED.profile_picture_url,
    experience_years = EXCLUDED.experience_years,
    looking_for_job = EXCLUDED.looking_for_job,
    updated_at = now();
END;
$$;

-- Add unique constraint to prevent duplicates
ALTER TABLE public.candidates ADD CONSTRAINT candidates_application_unique UNIQUE (application_id);
ALTER TABLE public.candidates ADD CONSTRAINT candidates_platform_unique UNIQUE (user_id, source) DEFERRABLE INITIALLY DEFERRED;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_candidates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_candidates_updated_at
BEFORE UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION update_candidates_updated_at();

-- Initial sync of existing data
SELECT sync_candidates_from_applications();
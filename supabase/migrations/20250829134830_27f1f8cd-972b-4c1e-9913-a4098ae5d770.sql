-- Update enhanced_job_applications table to align with new form fields
ALTER TABLE public.enhanced_job_applications 
ADD COLUMN IF NOT EXISTS current_role text;

ALTER TABLE public.enhanced_job_applications 
ADD COLUMN IF NOT EXISTS current_ctc numeric;

ALTER TABLE public.enhanced_job_applications 
ADD COLUMN IF NOT EXISTS expected_ctc numeric;

ALTER TABLE public.enhanced_job_applications 
ADD COLUMN IF NOT EXISTS notice_period text;

ALTER TABLE public.enhanced_job_applications 
ADD COLUMN IF NOT EXISTS preferred_location text;

ALTER TABLE public.enhanced_job_applications 
ADD COLUMN IF NOT EXISTS additional_files jsonb DEFAULT '[]'::jsonb;

-- Create employer view for applications with candidate details
CREATE OR REPLACE VIEW public.job_applications_with_candidate_details AS
SELECT 
  eja.id as application_id,
  eja.job_id,
  eja.user_id,
  eja.status,
  eja.applied_at,
  eja.current_role,
  eja.current_ctc,
  eja.expected_ctc,
  eja.notice_period,
  eja.preferred_location,
  eja.resume_url,
  eja.cover_letter_url,
  eja.additional_files,
  eja.application_data,
  p.full_name,
  p.email,
  p.phone,
  p.location as candidate_location,
  p.profile_picture_url,
  j.title as job_title,
  j.company_name,
  j.posted_by as employer_id
FROM public.enhanced_job_applications eja
LEFT JOIN public.profiles p ON eja.user_id = p.id
LEFT JOIN public.jobs j ON eja.job_id = j.id;

-- Create RLS policy for employer view
CREATE POLICY "Employers can view applications for their jobs" ON public.enhanced_job_applications
FOR SELECT USING (
  job_id IN (SELECT id FROM public.jobs WHERE posted_by = auth.uid())
);

-- Function for secure employer access to applications
CREATE OR REPLACE FUNCTION public.get_employer_applications(employer_id uuid, target_job_id uuid DEFAULT NULL)
RETURNS TABLE (
  application_id uuid,
  job_id uuid,
  user_id uuid,
  status text,
  applied_at timestamp with time zone,
  current_role text,
  current_ctc numeric,
  expected_ctc numeric,
  notice_period text,
  preferred_location text,
  resume_url text,
  cover_letter_url text,
  additional_files jsonb,
  application_data jsonb,
  full_name text,
  email text,
  phone text,
  candidate_location text,
  profile_picture_url text,
  job_title text,
  company_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is the employer for the job(s)
  IF NOT EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE posted_by = employer_id 
    AND (target_job_id IS NULL OR id = target_job_id)
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to job applications';
  END IF;

  RETURN QUERY
  SELECT 
    eja.id,
    eja.job_id,
    eja.user_id,
    eja.status,
    eja.applied_at,
    eja.current_role,
    eja.current_ctc,
    eja.expected_ctc,
    eja.notice_period,
    eja.preferred_location,
    eja.resume_url,
    eja.cover_letter_url,
    eja.additional_files,
    eja.application_data,
    p.full_name,
    p.email,
    p.phone,
    p.location,
    p.profile_picture_url,
    j.title,
    j.company_name
  FROM public.enhanced_job_applications eja
  LEFT JOIN public.profiles p ON eja.user_id = p.id
  LEFT JOIN public.jobs j ON eja.job_id = j.id
  WHERE j.posted_by = employer_id
  AND (target_job_id IS NULL OR eja.job_id = target_job_id)
  ORDER BY eja.applied_at DESC;
END;
$$;

-- Function to update application status (for employers)
CREATE OR REPLACE FUNCTION public.update_application_status(
  application_id uuid,
  new_status text,
  employer_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  job_employer_id uuid;
  result jsonb;
BEGIN
  current_user_id := auth.uid();
  
  -- Get the employer ID for this application
  SELECT j.posted_by INTO job_employer_id
  FROM public.enhanced_job_applications eja
  JOIN public.jobs j ON eja.job_id = j.id
  WHERE eja.id = application_id;
  
  -- Verify the current user is the employer
  IF job_employer_id != current_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Update the application status
  UPDATE public.enhanced_job_applications
  SET 
    status = new_status,
    updated_at = now(),
    application_data = COALESCE(application_data, '{}'::jsonb) || 
                      jsonb_build_object('employer_notes', employer_notes, 'status_updated_at', now())
  WHERE id = application_id;
  
  IF FOUND THEN
    result := jsonb_build_object('success', true, 'message', 'Status updated successfully');
  ELSE
    result := jsonb_build_object('success', false, 'error', 'Application not found');
  END IF;
  
  RETURN result;
END;
$$;
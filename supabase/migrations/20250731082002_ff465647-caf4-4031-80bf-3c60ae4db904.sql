-- Create RPC function to get scraped job applications for admin CV viewer
CREATE OR REPLACE FUNCTION public.get_scraped_job_applications()
RETURNS TABLE (
  application_id uuid,
  job_id uuid,
  job_title text,
  external_url text,
  full_name text,
  email text,
  resume_url text,
  applied_at timestamptz,
  company_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    a.id as application_id,
    a.job_id,
    j.title as job_title,
    j.external_url,
    (a.application_data->>'fullName')::text as full_name,
    (a.application_data->>'email')::text as email,
    a.resume_url,
    a.applied_at,
    COALESCE(j.company_name, c.name) as company_name
  FROM job_applications a
  JOIN jobs j ON a.job_id = j.id
  LEFT JOIN companies c ON j.company_id = c.id
  WHERE j.external_url IS NOT NULL 
    AND j.external_url != ''
  ORDER BY a.applied_at DESC;
$$;
-- Create unified candidates view that merges applied candidates and platform candidates
CREATE OR REPLACE VIEW unified_candidates AS
-- Applied candidates from job_applications with profile data
SELECT 
  ja.id,
  ja.user_id,
  COALESCE(p.full_name, ja.application_data->>'fullName', 'Unknown') as name,
  COALESCE(p.email, ja.application_data->>'email', '') as email,
  COALESCE(p.headline, ja.application_data->>'position', 'Not specified') as title,
  COALESCE(ja.application_data->>'currentCompany', 'Not specified') as company,
  COALESCE(p.location, '') as location,
  COALESCE(p.skills, ARRAY[]::text[]) as skills,
  COALESCE(p.about, '') as description,
  ja.resume_url,
  p.profile_photo_url,
  null::text as linkedin_url,
  true as applied,
  'application'::text as source,
  ja.applied_at,
  ja.created_at
FROM job_applications ja
LEFT JOIN profiles p ON ja.user_id = p.id

UNION ALL

-- Platform candidates from candidates table
SELECT 
  c.id,
  c.user_id,
  c.name,
  c.email,
  c.title,
  c.company,
  c.location,
  c.skills,
  c.description,
  c.resume_url,
  c.profile_photo_url,
  c.linkedin_url,
  false as applied,
  'platform'::text as source,
  null::timestamp with time zone as applied_at,
  c.created_at
FROM candidates c;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_unified_candidates_search 
ON job_applications USING GIN (to_tsvector('english', 
  COALESCE((application_data->>'fullName'), '') || ' ' ||
  COALESCE((application_data->>'position'), '') || ' ' ||
  COALESCE((application_data->>'currentCompany'), '')
));

CREATE INDEX IF NOT EXISTS idx_candidates_search 
ON candidates USING GIN (to_tsvector('english', 
  COALESCE(name, '') || ' ' ||
  COALESCE(title, '') || ' ' ||
  COALESCE(company, '') || ' ' ||
  COALESCE(description, '')
));

-- Add RLS policy for the view
ALTER VIEW unified_candidates OWNER TO postgres;

-- Create a function to enable RLS-like behavior for views
CREATE OR REPLACE FUNCTION can_view_unified_candidates()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('employer', 'admin', 'super_admin') 
    AND is_active = true
  );
$$;
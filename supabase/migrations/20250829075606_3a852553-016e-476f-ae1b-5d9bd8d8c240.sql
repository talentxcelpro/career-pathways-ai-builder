-- Create unified candidates view that merges all candidate sources
CREATE OR REPLACE VIEW unified_candidates AS
-- Applied candidates from job_applications
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
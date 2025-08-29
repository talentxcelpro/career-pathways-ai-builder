-- First, let's populate the unified_candidates table with existing job applications
INSERT INTO unified_candidates (
  id, 
  name, 
  email, 
  phone, 
  location, 
  title, 
  company, 
  description, 
  skills, 
  experience_years, 
  resume_url, 
  profile_picture_url, 
  source, 
  application_data,
  file_name,
  file_type,
  updated_at
)
SELECT 
  ja.user_id as id,
  COALESCE(p.full_name, ja.application_data->>'fullName') as name,
  COALESCE(p.email, ja.application_data->>'email') as email,
  COALESCE(p.phone, ja.application_data->>'phoneNumber') as phone,
  COALESCE(p.location, ja.application_data->>'location') as location,
  p.title,
  p.current_company as company,
  p.about as description,
  p.skills,
  p.experience_years,
  ja.resume_url,
  p.profile_picture_url,
  'application' as source,
  ja.application_data,
  CASE 
    WHEN ja.resume_url IS NOT NULL THEN 
      SPLIT_PART(SPLIT_PART(ja.resume_url, '/', -1), '?', 1)
    ELSE NULL 
  END as file_name,
  CASE 
    WHEN ja.resume_url LIKE '%.pdf' THEN 'application/pdf'
    WHEN ja.resume_url LIKE '%.doc' THEN 'application/msword'
    WHEN ja.resume_url LIKE '%.docx' THEN 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ELSE 'application/pdf'
  END as file_type,
  NOW() as updated_at
FROM job_applications ja
LEFT JOIN profiles p ON ja.user_id = p.id
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  title = EXCLUDED.title,
  company = EXCLUDED.company,
  description = EXCLUDED.description,
  skills = EXCLUDED.skills,
  experience_years = EXCLUDED.experience_years,
  resume_url = EXCLUDED.resume_url,
  profile_picture_url = EXCLUDED.profile_picture_url,
  application_data = EXCLUDED.application_data,
  file_name = EXCLUDED.file_name,
  file_type = EXCLUDED.file_type,
  updated_at = NOW();

-- Also populate with platform profiles (users who haven't applied but are available)
INSERT INTO unified_candidates (
  id, 
  name, 
  email, 
  phone, 
  location, 
  title, 
  company, 
  description, 
  skills, 
  experience_years, 
  resume_url, 
  profile_picture_url, 
  source,
  updated_at
)
SELECT 
  p.id,
  p.full_name as name,
  p.email,
  p.phone,
  p.location,
  p.title,
  p.current_company as company,
  p.about as description,
  p.skills,
  p.experience_years,
  p.resume_url,
  p.profile_picture_url,
  'platform' as source,
  NOW() as updated_at
FROM profiles p
WHERE p.id NOT IN (SELECT id FROM unified_candidates)
  AND p.full_name IS NOT NULL
  AND p.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;
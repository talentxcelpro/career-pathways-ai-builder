-- Sync unified_candidates with profiles table to fix the data discrepancy
-- First, clear and repopulate unified_candidates with all current profiles

-- Remove test and invalid data
DELETE FROM unified_candidates 
WHERE name ILIKE '%test%' 
   OR name = 'Candidate' 
   OR name ILIKE '%draft%'
   OR email ILIKE '%@test.com'
   OR email ILIKE '%@example.com'
   OR email = 'user@example.com';

-- Update cv_file_id for profiles that have linked CV files
UPDATE unified_candidates 
SET cv_file_id = (
  SELECT cv.id 
  FROM cv_files cv 
  WHERE cv.user_id = unified_candidates.id 
    AND cv.parsing_status = 'completed'
  LIMIT 1
)
WHERE cv_file_id IS NULL;

-- Update source_type based on cv_file_id
UPDATE unified_candidates 
SET source_type = CASE 
  WHEN cv_file_id IS NOT NULL THEN 'cv_file'
  WHEN source IN ('platform', 'application') THEN 'profile'
  ELSE 'profile'
END;

-- Ensure activation_status is set correctly
UPDATE unified_candidates 
SET activation_status = 'active'
WHERE activation_status IS NULL;

-- Insert missing profiles that aren't in unified_candidates
INSERT INTO unified_candidates (
  id, name, email, phone, title, location, description, skills, 
  experience_years, company, industry, resume_url, portfolio_url, 
  linkedin_url, github_url, profile_picture_url, looking_for_job, 
  created_at, updated_at, activation_status, cv_file_id, source, source_type
)
SELECT 
  p.id, p.full_name, p.email, p.phone, p.title, p.location, p.about,
  p.skills, p.experience_years, p.current_company, p.industry,
  p.resume_url, p.portfolio_url, p.linkedin_url, p.github_url,
  p.profile_picture_url, p.looking_for_job, p.created_at, p.updated_at,
  COALESCE(p.activation_status, 'active'),
  p.cv_file_id,
  COALESCE(p.source, 'platform'),
  CASE 
    WHEN p.cv_file_id IS NOT NULL THEN 'cv_file'
    ELSE 'profile'
  END
FROM profiles p
WHERE p.id NOT IN (SELECT id FROM unified_candidates)
  AND p.email IS NOT NULL 
  AND p.full_name IS NOT NULL 
  AND p.full_name != ''
  AND p.full_name NOT ILIKE '%test%'
  AND p.email NOT ILIKE '%@test.com';
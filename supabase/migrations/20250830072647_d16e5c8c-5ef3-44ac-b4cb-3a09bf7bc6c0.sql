-- Fix career passport completion calculation to ensure consistency between private and public views

-- Update the calculate_career_passport_completion function to be more accurate
CREATE OR REPLACE FUNCTION public.calculate_career_passport_completion(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  completion_score INTEGER := 0;
  profile_completion INTEGER := 0;
  resumes_count INTEGER := 0;
  certifications_count INTEGER := 0;
  tests_count INTEGER := 0;
  connections_count INTEGER := 0;
  applications_count INTEGER := 0;
BEGIN
  -- Calculate profile completion (40% weight)
  SELECT 
    CASE 
      WHEN full_name IS NOT NULL AND LENGTH(TRIM(full_name)) > 0 THEN 10 ELSE 0 END +
    CASE 
      WHEN headline IS NOT NULL AND LENGTH(TRIM(headline)) > 10 THEN 8 ELSE 0 END +
    CASE 
      WHEN about IS NOT NULL AND LENGTH(TRIM(about)) > 50 THEN 8 ELSE 0 END +
    CASE 
      WHEN location IS NOT NULL AND LENGTH(TRIM(location)) > 0 THEN 4 ELSE 0 END +
    CASE 
      WHEN email IS NOT NULL AND LENGTH(TRIM(email)) > 0 THEN 4 ELSE 0 END +
    CASE 
      WHEN profile_picture_url IS NOT NULL THEN 6 ELSE 0 END
  INTO profile_completion
  FROM public.profiles 
  WHERE id = user_uuid;
  
  -- Count resumes (15% weight)
  SELECT COUNT(*) INTO resumes_count
  FROM public.ai_resumes
  WHERE user_id = user_uuid;
  
  -- Count certifications (15% weight)  
  SELECT COUNT(*) INTO certifications_count
  FROM public.certifications
  WHERE user_id = user_uuid;
  
  -- Count tests (10% weight)
  SELECT COUNT(*) INTO tests_count
  FROM public.assessment_attempts
  WHERE user_id = user_uuid AND status = 'completed';
  
  -- Count connections (10% weight)
  SELECT COUNT(*) INTO connections_count
  FROM public.connections
  WHERE (requester_id = user_uuid OR recipient_id = user_uuid) 
    AND status = 'accepted';
  
  -- Count job applications (10% weight)
  SELECT COUNT(*) INTO applications_count
  FROM public.job_applications
  WHERE user_id = user_uuid;
  
  -- Calculate final completion percentage
  completion_score := 
    profile_completion + 
    LEAST(resumes_count * 15, 15) +
    LEAST(certifications_count * 7, 15) +
    LEAST(tests_count * 5, 10) +
    LEAST(connections_count * 2, 10) +
    LEAST(applications_count * 2, 10);
    
  RETURN LEAST(completion_score, 100);
END;
$$;
-- Batch 5 (Fixed): Handle parameter name conflicts and fix remaining function search paths

-- Drop functions that have parameter name conflicts to avoid errors
DROP FUNCTION IF EXISTS public.calculate_career_passport_completion(uuid);
DROP FUNCTION IF EXISTS public.get_user_skills(uuid);
DROP FUNCTION IF EXISTS public.get_job_skills(uuid);
DROP FUNCTION IF EXISTS public.get_matching_candidates(uuid);

-- Recreate functions with proper search paths and consistent parameter names
CREATE OR REPLACE FUNCTION public.calculate_career_passport_completion(user_id_param uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  total_score INTEGER := 0;
  profile_record RECORD;
  experience_count INTEGER := 0;
  skill_count INTEGER := 0;
  education_count INTEGER := 0;
BEGIN
  -- Get profile data
  SELECT * INTO profile_record FROM profiles WHERE id = user_id_param;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Profile completion (30 points)
  IF profile_record.full_name IS NOT NULL AND LENGTH(TRIM(profile_record.full_name)) > 0 THEN
    total_score := total_score + 5;
  END IF;
  IF profile_record.title IS NOT NULL AND LENGTH(TRIM(profile_record.title)) > 0 THEN
    total_score := total_score + 5;
  END IF;
  IF profile_record.about IS NOT NULL AND LENGTH(TRIM(profile_record.about)) > 0 THEN
    total_score := total_score + 5;
  END IF;
  IF profile_record.profile_picture_url IS NOT NULL THEN
    total_score := total_score + 5;
  END IF;
  IF profile_record.linkedin_url IS NOT NULL AND LENGTH(TRIM(profile_record.linkedin_url)) > 0 THEN
    total_score := total_score + 5;
  END IF;
  IF profile_record.location IS NOT NULL AND LENGTH(TRIM(profile_record.location)) > 0 THEN
    total_score := total_score + 5;
  END IF;
  
  -- Experience section (25 points)
  SELECT COUNT(*) INTO experience_count FROM work_experiences WHERE user_id = user_id_param;
  total_score := total_score + LEAST(experience_count * 5, 25);
  
  -- Skills section (25 points)
  SELECT COUNT(*) INTO skill_count FROM user_skills WHERE user_id = user_id_param;
  total_score := total_score + LEAST(skill_count * 2, 25);
  
  -- Education section (20 points)
  SELECT COUNT(*) INTO education_count FROM education WHERE user_id = user_id_param;
  total_score := total_score + LEAST(education_count * 10, 20);
  
  RETURN LEAST(total_score, 100);
END;
$function$;

-- Fix create_notification function
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_module text DEFAULT 'general',
  p_related_id uuid DEFAULT NULL,
  p_action_url text DEFAULT NULL,
  p_priority text DEFAULT 'medium',
  p_icon text DEFAULT 'bell'
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    module,
    related_id,
    action_url,
    priority,
    icon
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_module,
    p_related_id,
    p_action_url,
    p_priority,
    p_icon
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- Fix get_user_skills function
CREATE OR REPLACE FUNCTION public.get_user_skills(user_id_param uuid)
 RETURNS TABLE(skill_name text, proficiency_level text, years_experience integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    s.name as skill_name,
    us.proficiency_level,
    us.years_experience
  FROM user_skills us
  JOIN skills s ON us.skill_id = s.id
  WHERE us.user_id = user_id_param
  ORDER BY us.proficiency_level DESC, us.years_experience DESC;
$function$;

-- Fix get_job_skills function
CREATE OR REPLACE FUNCTION public.get_job_skills(job_id_param uuid)
 RETURNS TABLE(skill_name text, is_required boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    s.name as skill_name,
    js.is_required
  FROM job_skills js
  JOIN skills s ON js.skill_id = s.id
  WHERE js.job_id = job_id_param
  ORDER BY js.is_required DESC, s.name ASC;
$function$;

-- Fix get_matching_candidates function
CREATE OR REPLACE FUNCTION public.get_matching_candidates(job_id_param uuid)
 RETURNS TABLE(
   user_id uuid,
   full_name text,
   email text,
   profile_picture_url text,
   title text,
   location text,
   match_score integer,
   matching_skills text[]
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH job_required_skills AS (
    SELECT UNNEST(j.skills_required) as skill_name
    FROM jobs j WHERE j.id = job_id_param
  ),
  candidate_matches AS (
    SELECT 
      p.id as user_id,
      p.full_name,
      p.email,
      p.profile_picture_url,
      p.title,
      p.location,
      ARRAY_AGG(DISTINCT us.skill_name) FILTER (WHERE us.skill_name IS NOT NULL) as user_skills,
      COUNT(DISTINCT us.skill_name) as skill_match_count
    FROM profiles p
    LEFT JOIN (
      SELECT 
        us.user_id,
        s.name as skill_name
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      WHERE s.name IN (SELECT skill_name FROM job_required_skills)
    ) us ON p.id = us.user_id
    WHERE p.full_name IS NOT NULL
    GROUP BY p.id, p.full_name, p.email, p.profile_picture_url, p.title, p.location
  )
  SELECT 
    cm.user_id,
    cm.full_name,
    cm.email,
    cm.profile_picture_url,
    cm.title,
    cm.location,
    CASE 
      WHEN cm.skill_match_count > 0 THEN (cm.skill_match_count * 20)::INTEGER
      ELSE 0
    END as match_score,
    COALESCE(cm.user_skills, ARRAY[]::text[]) as matching_skills
  FROM candidate_matches cm
  WHERE cm.skill_match_count > 0
  ORDER BY match_score DESC, cm.full_name ASC
  LIMIT 50;
END;
$function$;
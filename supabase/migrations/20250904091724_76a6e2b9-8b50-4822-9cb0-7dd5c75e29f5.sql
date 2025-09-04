-- Batch 5 (Schema-Corrected): Fix functions with proper table references and search paths

-- Drop all functions that had schema issues
DROP FUNCTION IF EXISTS public.get_user_skills(uuid);
DROP FUNCTION IF EXISTS public.get_job_skills(uuid);
DROP FUNCTION IF EXISTS public.get_matching_candidates(uuid);

-- Fix get_user_skills function to use actual table structure
CREATE OR REPLACE FUNCTION public.get_user_skills(user_id_param uuid)
 RETURNS TABLE(skill_name text, proficiency_level integer, years_experience numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    sm.name as skill_name,
    us.proficiency_level,
    us.years_experience
  FROM user_skills us
  JOIN skills_master sm ON us.skill_id = sm.id
  WHERE us.user_id = user_id_param
  ORDER BY us.proficiency_level DESC, us.years_experience DESC;
$function$;

-- Fix get_job_skills function to use actual table structure 
CREATE OR REPLACE FUNCTION public.get_job_skills(job_id_param uuid)
 RETURNS TABLE(skill_name text, is_required boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    sm.name as skill_name,
    jsr.is_required
  FROM job_skills_required jsr
  JOIN skills_master sm ON jsr.skill_id = sm.id
  WHERE jsr.job_id = job_id_param
  ORDER BY jsr.is_required DESC, sm.name ASC;
$function$;

-- Fix get_matching_candidates function with correct table references
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
    SELECT sm.name as skill_name, jsr.skill_id
    FROM job_skills_required jsr
    JOIN skills_master sm ON jsr.skill_id = sm.id
    WHERE jsr.job_id = job_id_param
  ),
  candidate_matches AS (
    SELECT 
      p.id as user_id,
      p.full_name,
      p.email,
      p.profile_picture_url,
      p.title,
      p.location,
      ARRAY_AGG(DISTINCT jrs.skill_name) FILTER (WHERE jrs.skill_name IS NOT NULL) as user_skills,
      COUNT(DISTINCT jrs.skill_name) as skill_match_count
    FROM profiles p
    LEFT JOIN user_skills us ON p.id = us.user_id
    LEFT JOIN job_required_skills jrs ON us.skill_id = jrs.skill_id
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
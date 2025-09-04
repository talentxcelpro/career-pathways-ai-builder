-- Batch 6 (Clean): Drop functions first, then recreate with search paths

-- Drop all existing functions that we need to fix
DROP FUNCTION IF EXISTS public.increment_job_views(uuid);
DROP FUNCTION IF EXISTS public.update_profile_views(uuid);
DROP FUNCTION IF EXISTS public.mark_notification_read(uuid);
DROP FUNCTION IF EXISTS public.get_trending_skills(integer);
DROP FUNCTION IF EXISTS public.get_connection_suggestions(uuid, integer);

-- Drop and recreate the problematic views without SECURITY DEFINER
DROP VIEW IF EXISTS public.user_profile_view CASCADE;
DROP VIEW IF EXISTS public.job_posting_view CASCADE;
DROP VIEW IF EXISTS public.company_profile_view CASCADE;
DROP VIEW IF EXISTS public.connection_summary_view CASCADE;
DROP VIEW IF EXISTS public.activity_feed_view CASCADE;
DROP VIEW IF EXISTS public.notification_summary_view CASCADE;

-- Create secure functions with proper search paths
CREATE OR REPLACE FUNCTION public.increment_job_views(job_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE jobs
  SET 
    views_count = COALESCE(views_count, 0) + 1,
    updated_at = NOW()
  WHERE id = job_uuid;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_profile_views(profile_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE profiles 
  SET 
    profile_views_count = COALESCE(profile_views_count, 0) + 1,
    updated_at = NOW()
  WHERE id = profile_uuid;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE notifications
  SET 
    is_read = true,
    read_at = NOW()
  WHERE id = notification_uuid
    AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_trending_skills(p_limit integer DEFAULT 10)
 RETURNS TABLE(skill_name text, usage_count bigint, growth_rate numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH skill_usage AS (
    SELECT 
      sm.name as skill_name,
      COUNT(*) as current_usage
    FROM user_skills us
    JOIN skills_master sm ON us.skill_id = sm.id
    WHERE us.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY sm.name
  ),
  skill_growth AS (
    SELECT 
      sm.name as skill_name,
      COUNT(*) as previous_usage
    FROM user_skills us
    JOIN skills_master sm ON us.skill_id = sm.id
    WHERE us.created_at >= NOW() - INTERVAL '60 days'
      AND us.created_at < NOW() - INTERVAL '30 days'
    GROUP BY sm.name
  )
  SELECT 
    su.skill_name,
    su.current_usage as usage_count,
    CASE 
      WHEN sg.previous_usage > 0 THEN 
        ((su.current_usage - sg.previous_usage)::numeric / sg.previous_usage) * 100
      ELSE 100.0
    END as growth_rate
  FROM skill_usage su
  LEFT JOIN skill_growth sg ON su.skill_name = sg.skill_name
  ORDER BY usage_count DESC, growth_rate DESC
  LIMIT p_limit;
$function$;

CREATE OR REPLACE FUNCTION public.get_connection_suggestions(user_uuid uuid, p_limit integer DEFAULT 10)
 RETURNS TABLE(
   suggested_user_id uuid,
   full_name text,
   title text,
   company_name text,
   mutual_connections integer,
   profile_picture_url text
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH user_connections AS (
    SELECT 
      CASE 
        WHEN requester_id = user_uuid THEN recipient_id
        ELSE requester_id
      END as connected_user_id
    FROM connections
    WHERE (requester_id = user_uuid OR recipient_id = user_uuid)
      AND status = 'accepted'
  ),
  suggestions AS (
    SELECT 
      p.id as suggested_user_id,
      p.full_name,
      p.title,
      p.current_company as company_name,
      COUNT(uc.connected_user_id) as mutual_connections,
      p.profile_picture_url
    FROM profiles p
    LEFT JOIN user_connections uc ON p.id = uc.connected_user_id
    WHERE p.id != user_uuid
      AND p.id NOT IN (SELECT connected_user_id FROM user_connections)
      AND p.full_name IS NOT NULL
    GROUP BY p.id, p.full_name, p.title, p.current_company, p.profile_picture_url
    HAVING COUNT(uc.connected_user_id) > 0
  )
  SELECT * FROM suggestions
  ORDER BY mutual_connections DESC, full_name ASC
  LIMIT p_limit;
$function$;
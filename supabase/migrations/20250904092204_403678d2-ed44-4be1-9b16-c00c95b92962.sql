-- Batch 6 (Fixed): Fix Security Definer Views and function conflicts

-- Drop the conflicting function first
DROP FUNCTION IF EXISTS public.create_notification(uuid,text,text,text,text,uuid,text,text,text);
DROP FUNCTION IF EXISTS public.create_notification(uuid,text,text,text);

-- Drop and recreate the problematic views without SECURITY DEFINER
DROP VIEW IF EXISTS public.user_profile_view CASCADE;
DROP VIEW IF EXISTS public.job_posting_view CASCADE;
DROP VIEW IF EXISTS public.company_profile_view CASCADE;
DROP VIEW IF EXISTS public.connection_summary_view CASCADE;
DROP VIEW IF EXISTS public.activity_feed_view CASCADE;
DROP VIEW IF EXISTS public.notification_summary_view CASCADE;

-- Create secure functions instead of security definer views
CREATE OR REPLACE FUNCTION public.get_user_profile_summary(user_id_param uuid)
 RETURNS TABLE(
   id uuid,
   full_name text,
   email text,
   title text,
   location text,
   profile_picture_url text,
   is_online boolean,
   last_seen timestamp with time zone,
   connection_count bigint,
   post_count bigint
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.full_name,
    p.email,
    p.title,
    p.location,
    p.profile_picture_url,
    p.is_online,
    p.last_seen,
    COALESCE(conn.connection_count, 0) as connection_count,
    COALESCE(posts.post_count, 0) as post_count
  FROM profiles p
  LEFT JOIN (
    SELECT 
      CASE 
        WHEN requester_id = user_id_param THEN recipient_id
        ELSE requester_id
      END as user_id,
      COUNT(*) as connection_count
    FROM connections
    WHERE (requester_id = user_id_param OR recipient_id = user_id_param)
      AND status = 'accepted'
    GROUP BY 1
  ) conn ON p.id = conn.user_id
  LEFT JOIN (
    SELECT author_id, COUNT(*) as post_count
    FROM posts
    WHERE author_id = user_id_param
    GROUP BY author_id
  ) posts ON p.id = posts.author_id
  WHERE p.id = user_id_param;
$function$;

-- Recreate create_notification function with proper signature
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_module text DEFAULT 'general',
  p_related_id uuid DEFAULT NULL,
  p_action_url text DEFAULT NULL,
  p_priority text DEFAULT 'medium',
  p_icon text DEFAULT NULL
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  notification_id uuid;
BEGIN
  -- Validate input parameters
  IF p_user_id IS NULL OR p_type IS NULL OR p_title IS NULL OR p_message IS NULL THEN
    RAISE EXCEPTION 'Required notification parameters cannot be null';
  END IF;
  
  -- Validate priority level
  IF p_priority NOT IN ('low', 'medium', 'high', 'urgent') THEN
    p_priority := 'medium';
  END IF;
  
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    module,
    related_id,
    action_url,
    priority,
    icon,
    is_read
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_module,
    p_related_id,
    p_action_url,
    p_priority,
    p_icon,
    false
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- Fix more functions with missing search paths
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
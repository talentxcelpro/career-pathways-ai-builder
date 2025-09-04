-- Batch 7: Remove remaining SECURITY DEFINER views and fix more function search paths

-- Drop remaining problematic views
DROP VIEW IF EXISTS public.admin_user_overview CASCADE;
DROP VIEW IF EXISTS public.system_metrics_view CASCADE;
DROP VIEW IF EXISTS public.engagement_analytics_view CASCADE;
DROP VIEW IF EXISTS public.content_moderation_view CASCADE;
DROP VIEW IF EXISTS public.performance_dashboard_view CASCADE;
DROP VIEW IF EXISTS public.user_activity_summary CASCADE;

-- Fix more functions with missing search paths
ALTER FUNCTION public.create_notification(uuid, text, text, text, text, uuid, text, text, text) SET search_path TO 'public';
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
ALTER FUNCTION public.update_user_last_seen() SET search_path TO 'public';
ALTER FUNCTION public.calculate_career_passport_completion(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_job_applications_with_status(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_job_view_count(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_user_network_stats(uuid) SET search_path TO 'public';
ALTER FUNCTION public.calculate_profile_completion_score(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_recommended_jobs(uuid, integer) SET search_path TO 'public';
ALTER FUNCTION public.update_engagement_metrics(uuid, text, text) SET search_path TO 'public';

-- Fix functions that might have complex signatures
DROP FUNCTION IF EXISTS public.send_bulk_notifications(uuid[], text, text, text, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.bulk_update_user_status(uuid[], text) CASCADE;
DROP FUNCTION IF EXISTS public.generate_analytics_report(text, date, date) CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_sessions() CASCADE;
DROP FUNCTION IF EXISTS public.archive_old_activities() CASCADE;

-- Recreate critical functions with proper search paths
CREATE OR REPLACE FUNCTION public.send_bulk_notifications(
  user_ids uuid[],
  notification_type text,
  title text,
  message text,
  module text DEFAULT 'system',
  action_url text DEFAULT NULL,
  priority text DEFAULT 'medium',
  icon text DEFAULT 'bell'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notification_count integer := 0;
  user_id uuid;
BEGIN
  FOREACH user_id IN ARRAY user_ids LOOP
    INSERT INTO notifications (
      user_id, type, title, message, module, action_url, priority, icon
    ) VALUES (
      user_id, notification_type, title, message, module, action_url, priority, icon
    );
    notification_count := notification_count + 1;
  END LOOP;
  
  RETURN notification_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < now() OR last_activity < now() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.archive_old_activities()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  archived_count integer;
BEGIN
  -- Archive activities older than 1 year
  WITH archived AS (
    DELETE FROM user_activities 
    WHERE created_at < now() - INTERVAL '1 year'
    RETURNING *
  )
  INSERT INTO user_activities_archive 
  SELECT * FROM archived;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$function$;
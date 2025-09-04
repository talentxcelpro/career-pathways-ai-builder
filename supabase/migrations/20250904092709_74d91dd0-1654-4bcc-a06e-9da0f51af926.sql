-- Batch 7 (Fixed): Remove remaining SECURITY DEFINER views and fix existing function search paths

-- Drop remaining problematic views
DROP VIEW IF EXISTS public.admin_user_overview CASCADE;
DROP VIEW IF EXISTS public.system_metrics_view CASCADE;
DROP VIEW IF EXISTS public.engagement_analytics_view CASCADE;
DROP VIEW IF EXISTS public.content_moderation_view CASCADE;
DROP VIEW IF EXISTS public.performance_dashboard_view CASCADE;
DROP VIEW IF EXISTS public.user_activity_summary CASCADE;

-- Fix functions with missing search paths (only those that exist)
DO $$
BEGIN
  -- Check and fix create_notification function
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_notification' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.create_notification(uuid, text, text, text, text, uuid, text, text, text) SET search_path TO 'public';
  END IF;

  -- Check and fix handle_new_user function
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
  END IF;

  -- Check and fix calculate_career_passport_completion function
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_career_passport_completion' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.calculate_career_passport_completion(uuid) SET search_path TO 'public';
  END IF;

  -- Check and fix get_job_applications_with_status function
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_job_applications_with_status' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.get_job_applications_with_status(uuid) SET search_path TO 'public';
  END IF;

  -- Check and fix update_job_view_count function
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_job_view_count' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.update_job_view_count(uuid) SET search_path TO 'public';
  END IF;

  -- Check and fix get_user_network_stats function
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_network_stats' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.get_user_network_stats(uuid) SET search_path TO 'public';
  END IF;

  -- Check and fix calculate_profile_completion_score function
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_profile_completion_score' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.calculate_profile_completion_score(uuid) SET search_path TO 'public';
  END IF;

  -- Check and fix get_recommended_jobs function
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_recommended_jobs' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.get_recommended_jobs(uuid, integer) SET search_path TO 'public';
  END IF;

  -- Check and fix update_engagement_metrics function
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_engagement_metrics' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.update_engagement_metrics(uuid, text, text) SET search_path TO 'public';
  END IF;
END $$;

-- Drop functions that might have complex signatures (only if they exist)
DROP FUNCTION IF EXISTS public.send_bulk_notifications CASCADE;
DROP FUNCTION IF EXISTS public.bulk_update_user_status CASCADE;
DROP FUNCTION IF EXISTS public.generate_analytics_report CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_sessions CASCADE;
DROP FUNCTION IF EXISTS public.archive_old_activities CASCADE;

-- Create essential utility functions with proper search paths
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
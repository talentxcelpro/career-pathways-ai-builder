-- Batch 7 (Minimal): Just remove SECURITY DEFINER views and create basic utility function

-- Drop remaining problematic views
DROP VIEW IF EXISTS public.admin_user_overview CASCADE;
DROP VIEW IF EXISTS public.system_metrics_view CASCADE;
DROP VIEW IF EXISTS public.engagement_analytics_view CASCADE;
DROP VIEW IF EXISTS public.content_moderation_view CASCADE;
DROP VIEW IF EXISTS public.performance_dashboard_view CASCADE;
DROP VIEW IF EXISTS public.user_activity_summary CASCADE;

-- Fix only functions we know exist based on the database schema
DO $$
BEGIN
  -- Check and fix create_notification function (this one exists)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_notification' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.create_notification SET search_path TO ''public''';
  END IF;

  -- Check and fix handle_new_user function if it exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.handle_new_user SET search_path TO ''public''';
  END IF;

  -- Check and fix calculate_career_passport_completion function if it exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_career_passport_completion' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.calculate_career_passport_completion SET search_path TO ''public''';
  END IF;
END $$;

-- Drop any existing bulk notification functions and recreate safely
DROP FUNCTION IF EXISTS public.send_bulk_notifications CASCADE;

-- Create essential utility function with proper search path
CREATE OR REPLACE FUNCTION public.send_bulk_notifications(
  user_ids uuid[],
  notification_type text,
  title text,
  message text,
  module text DEFAULT 'system'
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
    PERFORM create_notification(
      user_id, 
      notification_type, 
      title, 
      message, 
      module, 
      NULL, 
      NULL, 
      'medium', 
      'bell'
    );
    notification_count := notification_count + 1;
  END LOOP;
  
  RETURN notification_count;
END;
$function$;
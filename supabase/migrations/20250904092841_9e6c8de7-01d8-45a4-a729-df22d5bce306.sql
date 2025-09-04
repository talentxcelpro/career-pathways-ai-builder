-- Batch 7 (Simple): Just drop views to remove SECURITY DEFINER issues

-- Drop remaining problematic views
DROP VIEW IF EXISTS public.admin_user_overview CASCADE;
DROP VIEW IF EXISTS public.system_metrics_view CASCADE;
DROP VIEW IF EXISTS public.engagement_analytics_view CASCADE;
DROP VIEW IF EXISTS public.content_moderation_view CASCADE;
DROP VIEW IF EXISTS public.performance_dashboard_view CASCADE;
DROP VIEW IF EXISTS public.user_activity_summary CASCADE;

-- Create a simple utility function for notifications
CREATE OR REPLACE FUNCTION public.send_bulk_notifications(
  user_ids uuid[],
  notification_type text,
  title text,
  message text
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
    INSERT INTO notifications (user_id, type, title, message) 
    VALUES (user_id, notification_type, title, message);
    notification_count := notification_count + 1;
  END LOOP;
  
  RETURN notification_count;
END;
$function$;
-- Batch 8b: Simple function fixes with conflict resolution

-- Drop all conflicting notification functions
DROP FUNCTION IF EXISTS public.create_notification(uuid, text, text, text, text, uuid, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_notification(uuid, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_notification(uuid, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_notification CASCADE;

-- Create single notification function
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
  INSERT INTO notifications (
    user_id, type, title, message, module, related_id, action_url, priority, icon
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_module, p_related_id, p_action_url, p_priority, p_icon
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;
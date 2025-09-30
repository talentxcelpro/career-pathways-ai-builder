-- Add email event definition for new posts
INSERT INTO public.email_event_definitions (
  event_key,
  event_name,
  description,
  module_name,
  priority,
  is_enabled
) VALUES (
  'social.new_post',
  'Connection Posted',
  'Notify connections when someone posts',
  'social',
  'normal',
  true
)
ON CONFLICT (event_key) DO UPDATE SET
  event_name = EXCLUDED.event_name,
  description = EXCLUDED.description,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = now();

-- Function to notify connections when a new post is created
CREATE OR REPLACE FUNCTION public.notify_connections_new_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_author_name TEXT;
  v_post_preview TEXT;
  v_connection_record RECORD;
  v_connection_email TEXT;
  v_connection_name TEXT;
BEGIN
  -- Only process for published public posts
  IF NEW.status != 'published' OR NEW.is_public != true THEN
    RETURN NEW;
  END IF;

  -- Get author details
  SELECT full_name
  INTO v_author_name
  FROM profiles
  WHERE id = NEW.author_id;

  -- Create post preview (first 200 chars of content)
  v_post_preview := COALESCE(
    LEFT(NEW.content, 200) || CASE WHEN LENGTH(NEW.content) > 200 THEN '...' ELSE '' END,
    LEFT(COALESCE(NEW.headline, ''), 200)
  );

  -- Get all accepted connections (both directions)
  FOR v_connection_record IN
    SELECT DISTINCT 
      CASE 
        WHEN c.requester_id = NEW.author_id THEN c.recipient_id
        ELSE c.requester_id
      END as connection_id
    FROM connections c
    WHERE (c.requester_id = NEW.author_id OR c.recipient_id = NEW.author_id)
      AND c.status = 'accepted'
    LIMIT 100 -- Limit to avoid too many emails at once
  LOOP
    -- Get connection's email and name from auth.users
    SELECT au.email, p.full_name
    INTO v_connection_email, v_connection_name
    FROM auth.users au
    LEFT JOIN profiles p ON p.id = au.id
    WHERE au.id = v_connection_record.connection_id;

    -- Skip if no email
    IF v_connection_email IS NULL THEN
      CONTINUE;
    END IF;

    -- Enqueue email notification
    PERFORM public.enqueue_email_event(
      'social.new_post',
      v_connection_email,
      COALESCE(v_connection_name, 'User'),
      jsonb_build_object(
        'author_name', COALESCE(v_author_name, 'A connection'),
        'post_id', NEW.id,
        'post_preview', v_post_preview,
        'platform_url', 'https://talentxcel.in'
      ),
      0 -- Send immediately
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger for new posts
DROP TRIGGER IF EXISTS trigger_notify_connections_new_post ON public.posts;
CREATE TRIGGER trigger_notify_connections_new_post
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_connections_new_post();
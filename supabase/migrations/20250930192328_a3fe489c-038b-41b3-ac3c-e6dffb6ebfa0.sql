-- Fix email notifications to send to actual connections instead of hardcoded emails
-- This migration improves the notify_connections_new_post function with better error handling

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
  v_emails_queued INTEGER := 0;
BEGIN
  -- Only process for published public posts
  IF NEW.status != 'published' OR NEW.is_public != true THEN
    RAISE LOG 'Skipping notification - post not published or not public. Status: %, Public: %', NEW.status, NEW.is_public;
    RETURN NEW;
  END IF;

  -- Get author details
  SELECT full_name
  INTO v_author_name
  FROM profiles
  WHERE id = NEW.author_id;

  RAISE LOG 'Processing post notification for author: % (ID: %)', COALESCE(v_author_name, 'Unknown'), NEW.author_id;

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

    -- Skip if no email found
    IF v_connection_email IS NULL OR v_connection_email = '' THEN
      RAISE LOG 'Skipping connection % - no email found', v_connection_record.connection_id;
      CONTINUE;
    END IF;

    -- Log email queuing
    RAISE LOG 'Queuing email to: % (%) for post from % (%)', 
      v_connection_name, v_connection_email, v_author_name, NEW.author_id;

    -- Enqueue email notification with correct recipient email
    PERFORM public.enqueue_email_event(
      'social.new_post',
      v_connection_email,  -- This MUST be the connection's actual email, not a hardcoded value
      COALESCE(v_connection_name, 'User'),
      jsonb_build_object(
        'author_name', COALESCE(v_author_name, 'A connection'),
        'post_id', NEW.id,
        'post_preview', v_post_preview,
        'platform_url', 'https://talentxcel.in',
        'recipient_email', v_connection_email  -- Include in template data for verification
      ),
      0 -- Send immediately
    );

    v_emails_queued := v_emails_queued + 1;
  END LOOP;

  RAISE LOG 'Post notification complete. Queued % emails for post %', v_emails_queued, NEW.id;

  -- If no connections found, log it
  IF v_emails_queued = 0 THEN
    RAISE LOG 'WARNING: No connections found for author % (post %)', NEW.author_id, NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS trigger_notify_connections_new_post ON public.posts;
CREATE TRIGGER trigger_notify_connections_new_post
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_connections_new_post();

-- Add comment explaining the function
COMMENT ON FUNCTION public.notify_connections_new_post() IS 
  'Sends email notifications to all accepted connections when a user creates a new public post. 
   Queries actual connection emails from auth.users table, not hardcoded values.';
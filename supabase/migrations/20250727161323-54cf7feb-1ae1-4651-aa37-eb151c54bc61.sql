-- Fix the notify_post_activities function to handle cases where connections table access fails
CREATE OR REPLACE FUNCTION public.notify_post_activities()
RETURNS TRIGGER AS $$
BEGIN
  -- New post notification to connections
  IF TG_OP = 'INSERT' THEN
    -- Use a safer approach that doesn't fail if connections table has issues
    BEGIN
      INSERT INTO public.notifications (user_id, type, title, message, module, related_id, link, priority, icon, sound, is_read, created_at)
      SELECT 
        c.recipient_id,
        'new_post',
        'New Post from Connection',
        COALESCE((SELECT full_name FROM profiles WHERE id = NEW.author_id), 'Someone') || ' shared a new post',
        'network',
        NEW.id,
        '/network/posts',
        'low',
        'message-square',
        true,
        false,
        now()
      FROM connections c
      WHERE (c.requester_id = NEW.author_id OR c.recipient_id = NEW.author_id)
      AND c.status = 'accepted'
      AND c.recipient_id != NEW.author_id
      UNION
      SELECT 
        c.requester_id,
        'new_post',
        'New Post from Connection',
        COALESCE((SELECT full_name FROM profiles WHERE id = NEW.author_id), 'Someone') || ' shared a new post',
        'network',
        NEW.id,
        '/network/posts',
        'low',
        'message-square',
        true,
        false,
        now()
      FROM connections c
      WHERE c.recipient_id = NEW.author_id
      AND c.status = 'accepted';
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but don't fail the post creation
      RAISE NOTICE 'Failed to create post notifications: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
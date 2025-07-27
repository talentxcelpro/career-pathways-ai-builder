-- Check and fix the notify_connection function that might be referencing profiles
-- Let's recreate the function to handle missing profiles gracefully

CREATE OR REPLACE FUNCTION public.notify_connection()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Only create notification if profiles table exists and profile exists
    BEGIN
      PERFORM public.create_notification(
        NEW.recipient_id,
        'connection_request',
        'New Connection Request',
        COALESCE((SELECT full_name FROM public.profiles WHERE id = NEW.requester_id), 'Someone') || ' wants to connect with you.',
        'network',
        NEW.id,
        '/network/requests',
        'medium',
        'user-plus'
      );
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but don't fail the connection creation
      RAISE NOTICE 'Failed to create connection notification: %', SQLERRM;
    END;
  END IF;
  
  -- Notify when connection is accepted
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    BEGIN
      PERFORM public.create_notification(
        NEW.requester_id,
        'connection_accepted',
        'Connection Accepted!',
        COALESCE((SELECT full_name FROM public.profiles WHERE id = NEW.recipient_id), 'Someone') || ' accepted your connection request.',
        'network',
        NEW.id,
        '/network/people',
        'medium',
        'user-check'
      );
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but don't fail the connection update
      RAISE NOTICE 'Failed to create acceptance notification: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS notify_connection_trigger ON public.connections;
CREATE TRIGGER notify_connection_trigger
  AFTER INSERT OR UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.notify_connection();
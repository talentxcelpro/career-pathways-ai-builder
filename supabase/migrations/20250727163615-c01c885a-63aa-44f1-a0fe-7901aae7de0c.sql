-- Fix connections table RLS policies and add constraints to prevent issues

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their connections" ON public.connections;
DROP POLICY IF EXISTS "Users can view their own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can update their connections" ON public.connections;
DROP POLICY IF EXISTS "Users can update their own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can update connection status" ON public.connections;

-- Create simplified and secure RLS policies
CREATE POLICY "Users can view connections they are involved in" ON public.connections
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = recipient_id
  );

CREATE POLICY "Users can create connection requests" ON public.connections
  FOR INSERT WITH CHECK (
    auth.uid() = requester_id AND
    requester_id != recipient_id AND
    status = 'pending'
  );

CREATE POLICY "Recipients can update connection status" ON public.connections
  FOR UPDATE USING (
    auth.uid() = recipient_id AND 
    status = 'pending'
  ) WITH CHECK (
    auth.uid() = recipient_id AND
    status IN ('accepted', 'declined')
  );

-- Add unique constraint to prevent duplicate connection requests
CREATE UNIQUE INDEX IF NOT EXISTS unique_connection_pair 
ON public.connections (
  LEAST(requester_id, recipient_id), 
  GREATEST(requester_id, recipient_id)
) WHERE status IN ('pending', 'accepted');

-- Add check constraint to prevent self-connections
ALTER TABLE public.connections 
DROP CONSTRAINT IF EXISTS check_no_self_connection;

ALTER TABLE public.connections 
ADD CONSTRAINT check_no_self_connection 
CHECK (requester_id != recipient_id);

-- Create index for better performance on connection queries
CREATE INDEX IF NOT EXISTS idx_connections_recipient_status 
ON public.connections (recipient_id, status);

CREATE INDEX IF NOT EXISTS idx_connections_requester_status 
ON public.connections (requester_id, status);

-- Update the notify_connection function to be more robust
CREATE OR REPLACE FUNCTION public.notify_connection()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only proceed if profiles table exists and user exists
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- Notify recipient about new connection request
    BEGIN
      PERFORM public.create_notification(
        NEW.recipient_id,
        'connection_request',
        'New Connection Request',
        COALESCE((SELECT full_name FROM profiles WHERE id = NEW.requester_id), 'Someone') || ' wants to connect with you.',
        'network',
        NEW.id,
        '/network/requests',
        'medium',
        'user-plus'
      );
    EXCEPTION WHEN OTHERS THEN
      -- Log but don't fail the connection creation
      RAISE NOTICE 'Failed to create connection request notification: %', SQLERRM;
    END;
  END IF;
  
  -- Notify when connection is accepted
  IF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    BEGIN
      PERFORM public.create_notification(
        NEW.requester_id,
        'connection_accepted',
        'Connection Accepted!',
        COALESCE((SELECT full_name FROM profiles WHERE id = NEW.recipient_id), 'Someone') || ' accepted your connection request.',
        'network',
        NEW.id,
        '/network/people',
        'medium',
        'user-check'
      );
    EXCEPTION WHEN OTHERS THEN
      -- Log but don't fail the connection update
      RAISE NOTICE 'Failed to create connection accepted notification: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;
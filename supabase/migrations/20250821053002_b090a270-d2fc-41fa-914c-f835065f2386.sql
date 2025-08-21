-- Add online presence tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- Create index for faster queries on online users
CREATE INDEX IF NOT EXISTS idx_profiles_online_status ON public.profiles(is_online, last_seen);

-- Create function to update user online status
CREATE OR REPLACE FUNCTION public.update_user_presence(user_uuid UUID, is_online_status BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    is_online = is_online_status,
    last_seen = CASE 
      WHEN is_online_status = TRUE THEN NOW()
      ELSE last_seen
    END,
    updated_at = NOW()
  WHERE id = user_uuid;
END;
$$;

-- Create function to get time since last seen
CREATE OR REPLACE FUNCTION public.get_last_seen_text(last_seen_timestamp TIMESTAMP WITH TIME ZONE)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  time_diff INTERVAL;
  result TEXT;
BEGIN
  time_diff := NOW() - last_seen_timestamp;
  
  IF time_diff < INTERVAL '1 minute' THEN
    result := 'Just now';
  ELSIF time_diff < INTERVAL '1 hour' THEN
    result := EXTRACT(EPOCH FROM time_diff)::INTEGER / 60 || 'm ago';
  ELSIF time_diff < INTERVAL '1 day' THEN
    result := EXTRACT(EPOCH FROM time_diff)::INTEGER / 3600 || 'h ago';
  ELSIF time_diff < INTERVAL '7 days' THEN
    result := EXTRACT(EPOCH FROM time_diff)::INTEGER / 86400 || 'd ago';
  ELSE
    result := 'Over a week ago';
  END IF;
  
  RETURN result;
END;
$$;

-- Enable realtime for profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add profiles to realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;
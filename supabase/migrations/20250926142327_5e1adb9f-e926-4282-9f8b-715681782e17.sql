-- Drop existing function first to avoid conflicts
DROP FUNCTION IF EXISTS public.validate_session(text);

-- Function to validate session
CREATE OR REPLACE FUNCTION public.validate_session(session_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  session_exists BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.secure_sessions 
    WHERE token_hash = session_token 
    AND expires_at > now() 
    AND is_active = true
  ) INTO session_exists;
  
  RETURN session_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
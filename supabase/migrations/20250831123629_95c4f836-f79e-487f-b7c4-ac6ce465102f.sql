-- Sessions Table for secure session management
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  valid BOOLEAN DEFAULT TRUE,
  device_fingerprint TEXT,
  ip_address INET,
  user_agent TEXT,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_valid ON public.sessions(valid);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own sessions" ON public.sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create sessions" ON public.sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update sessions" ON public.sessions
  FOR UPDATE USING (true);

CREATE POLICY "System can delete sessions" ON public.sessions
  FOR DELETE USING (true);

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  DELETE FROM public.sessions 
  WHERE expires_at < NOW() OR valid = FALSE;
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user session
CREATE OR REPLACE FUNCTION public.create_user_session(
  p_user_id UUID,
  p_token TEXT,
  p_expires_minutes INTEGER DEFAULT 15,
  p_device_fingerprint TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  session_id UUID;
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate expiration time
  expires_at := NOW() + (p_expires_minutes || ' minutes')::INTERVAL;
  
  -- Insert new session
  INSERT INTO public.sessions (
    user_id,
    token,
    expires_at,
    device_fingerprint,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_token,
    expires_at,
    p_device_fingerprint,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate session
CREATE OR REPLACE FUNCTION public.validate_session(p_token TEXT)
RETURNS TABLE(
  session_id UUID,
  user_id UUID,
  is_valid BOOLEAN,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    (s.valid AND s.expires_at > NOW()) as is_valid,
    s.expires_at
  FROM public.sessions s
  WHERE s.token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invalidate session
CREATE OR REPLACE FUNCTION public.invalidate_session(p_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE public.sessions 
  SET valid = FALSE, last_accessed = NOW()
  WHERE token = p_token;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh session
CREATE OR REPLACE FUNCTION public.refresh_session(
  p_old_token TEXT,
  p_new_token TEXT,
  p_expires_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
  session_user_id UUID;
  new_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get user_id from old session
  SELECT user_id INTO session_user_id
  FROM public.sessions
  WHERE token = p_old_token AND valid = TRUE AND expires_at > NOW();
  
  IF session_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate new expiration
  new_expires_at := NOW() + (p_expires_minutes || ' minutes')::INTERVAL;
  
  -- Invalidate old session
  UPDATE public.sessions SET valid = FALSE WHERE token = p_old_token;
  
  -- Create new session
  INSERT INTO public.sessions (user_id, token, expires_at)
  VALUES (session_user_id, p_new_token, new_expires_at);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
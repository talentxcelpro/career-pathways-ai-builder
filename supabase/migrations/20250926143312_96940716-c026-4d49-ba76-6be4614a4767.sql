-- Create secure_sessions table for session management
CREATE TABLE IF NOT EXISTS public.secure_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.secure_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only access their own sessions" ON public.secure_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_secure_sessions_token_hash ON public.secure_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_secure_sessions_user_id ON public.secure_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_secure_sessions_expires_at ON public.secure_sessions(expires_at);

-- Function to clean up expired sessions (runs via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.secure_sessions 
  WHERE expires_at < now() OR is_active = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
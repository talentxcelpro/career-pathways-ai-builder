-- PHASE 2: CORE SECURITY FIXES (Final Version)
-- Fix the column references and complete security hardening

-- 1. Fix critical functions by adding missing search_path
-- This addresses function search path mutable warnings

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    email,
    user_type
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'job_seeker'
  );
  RETURN NEW;
END;
$$;

-- 2. Replace overly permissive RLS policies
-- Fix profiles table with correct column names
DROP POLICY IF EXISTS "Anyone can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own and connected profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM public.connections 
    WHERE (requester_id = auth.uid() AND recipient_id = id)
    OR (requester_id = id AND recipient_id = auth.uid())
    AND status = 'accepted'
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  )
);

-- Secure posts table
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
CREATE POLICY "Users can view appropriate posts" 
ON public.posts 
FOR SELECT 
USING (
  auth.uid() = author_id OR
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.connections 
    WHERE (requester_id = auth.uid() AND recipient_id = author_id)
    OR (requester_id = author_id AND recipient_id = auth.uid())
    AND status = 'accepted'
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  )
);

-- Secure jobs table - require authentication for most job access
DROP POLICY IF EXISTS "Anyone can view jobs" ON public.jobs;
CREATE POLICY "Authenticated users can view active jobs" 
ON public.jobs 
FOR SELECT 
TO authenticated
USING (is_active = true AND job_status = 'open' AND expires_at > now());

-- Allow limited anonymous job viewing for public job board functionality
CREATE POLICY "Anonymous can view featured jobs only" 
ON public.jobs 
FOR SELECT 
TO anon
USING (is_active = true AND is_featured = true AND job_status = 'open' AND expires_at > now());

-- 3. Add security monitoring and rate limiting infrastructure
CREATE TABLE IF NOT EXISTS public.security_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  ip_address inet,
  action_type text NOT NULL,
  attempt_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, action_type)
);

-- Enable RLS on rate limiting table
ALTER TABLE public.security_rate_limits ENABLE ROW LEVEL SECURITY;

-- Add policy for rate limiting table
CREATE POLICY "System can manage rate limits" 
ON public.security_rate_limits 
FOR ALL 
USING (true);

-- 4. Create enhanced security monitoring function
CREATE OR REPLACE FUNCTION public.log_security_attempt(
  p_user_id uuid DEFAULT auth.uid(),
  p_action_type text DEFAULT 'unknown',
  p_ip_address inet DEFAULT inet_client_addr(),
  p_success boolean DEFAULT true
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_attempts integer := 0;
  is_blocked boolean := false;
BEGIN
  -- Check existing attempts in last hour
  SELECT COALESCE(attempt_count, 0) INTO current_attempts
  FROM public.security_rate_limits 
  WHERE (user_id = p_user_id OR ip_address = p_ip_address)
  AND action_type = p_action_type
  AND window_start > now() - interval '1 hour'
  ORDER BY window_start DESC
  LIMIT 1;
  
  -- Block if too many attempts
  IF current_attempts >= 10 THEN
    is_blocked := true;
    
    -- Log security event
    INSERT INTO public.security_events (
      user_id, event_type, description, ip_address, metadata
    ) VALUES (
      p_user_id, 'rate_limit_exceeded', 
      'User exceeded rate limit for ' || p_action_type,
      p_ip_address,
      jsonb_build_object('action', p_action_type, 'attempts', current_attempts + 1)
    );
  ELSE
    -- Update rate limit tracking
    INSERT INTO public.security_rate_limits (
      user_id, ip_address, action_type, attempt_count, window_start
    ) VALUES (
      p_user_id, p_ip_address, p_action_type, 1, now()
    )
    ON CONFLICT (user_id, action_type) DO UPDATE SET
      attempt_count = CASE 
        WHEN security_rate_limits.window_start < now() - interval '1 hour' 
        THEN 1 
        ELSE security_rate_limits.attempt_count + 1 
      END,
      window_start = CASE 
        WHEN security_rate_limits.window_start < now() - interval '1 hour' 
        THEN now() 
        ELSE security_rate_limits.window_start 
      END;
  END IF;
  
  RETURN NOT is_blocked;
END;
$$;
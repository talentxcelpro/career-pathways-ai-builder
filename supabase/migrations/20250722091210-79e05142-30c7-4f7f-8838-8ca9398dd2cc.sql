-- Phase 6: Security & Advanced Features Database Schema

-- Create security events table for comprehensive logging
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_category text NOT NULL DEFAULT 'authentication',
  severity text NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address inet,
  user_agent text,
  location_data jsonb DEFAULT '{}',
  device_fingerprint text,
  session_id text,
  details jsonb DEFAULT '{}',
  resolved_at timestamp with time zone,
  resolved_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create failed login attempts table
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  ip_address inet NOT NULL,
  attempt_count integer NOT NULL DEFAULT 1,
  first_attempt_at timestamp with time zone NOT NULL DEFAULT now(),
  last_attempt_at timestamp with time zone NOT NULL DEFAULT now(),
  blocked_until timestamp with time zone,
  user_agent text,
  location_data jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create IP blocklist table
CREATE TABLE IF NOT EXISTS public.ip_blocklist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address inet NOT NULL UNIQUE,
  reason text NOT NULL,
  blocked_by uuid REFERENCES auth.users(id),
  blocked_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_permanent boolean DEFAULT false,
  block_type text DEFAULT 'manual' CHECK (block_type IN ('manual', 'automatic', 'suspicious')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user sessions table for session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text NOT NULL,
  ip_address inet,
  user_agent text,
  device_info jsonb DEFAULT '{}',
  location_data jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_activity_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user security settings table
CREATE TABLE IF NOT EXISTS public.user_security_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'locked', 'restricted')),
  lockout_until timestamp with time zone,
  failed_login_count integer DEFAULT 0,
  last_failed_login timestamp with time zone,
  require_password_change boolean DEFAULT false,
  allowed_ip_addresses inet[] DEFAULT '{}',
  restricted_locations text[] DEFAULT '{}',
  two_factor_enabled boolean DEFAULT false,
  security_notifications boolean DEFAULT true,
  session_timeout_minutes integer DEFAULT 480,
  max_concurrent_sessions integer DEFAULT 3,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create security alerts table
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text NOT NULL,
  affected_user_id uuid REFERENCES auth.users(id),
  triggered_by_event_id uuid REFERENCES public.security_events(id),
  alert_data jsonb DEFAULT '{}',
  is_acknowledged boolean DEFAULT false,
  acknowledged_by uuid REFERENCES auth.users(id),
  acknowledged_at timestamp with time zone,
  auto_resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Security events: Admins can view all, users can view their own
CREATE POLICY "Admins can manage all security events" ON public.security_events
FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Users can view their own security events" ON public.security_events
FOR SELECT USING (auth.uid() = user_id);

-- Failed login attempts: Only admins can access
CREATE POLICY "Admins can manage failed login attempts" ON public.failed_login_attempts
FOR ALL USING (is_app_admin(auth.uid()));

-- IP blocklist: Only admins can access
CREATE POLICY "Admins can manage IP blocklist" ON public.ip_blocklist
FOR ALL USING (is_app_admin(auth.uid()));

-- User sessions: Users can view their own, admins can view all
CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
FOR SELECT USING (is_app_admin(auth.uid()));

-- User security settings: Users can view/update their own, admins can manage all
CREATE POLICY "Users can manage their security settings" ON public.user_security_settings
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all security settings" ON public.user_security_settings
FOR ALL USING (is_app_admin(auth.uid()));

-- Security alerts: Only admins can access
CREATE POLICY "Admins can manage security alerts" ON public.security_alerts
FOR ALL USING (is_app_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX idx_failed_logins_email ON public.failed_login_attempts(email);
CREATE INDEX idx_failed_logins_ip ON public.failed_login_attempts(ip_address);
CREATE INDEX idx_ip_blocklist_ip ON public.ip_blocklist(ip_address);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active, last_activity_at DESC);
CREATE INDEX idx_security_alerts_type ON public.security_alerts(alert_type);
CREATE INDEX idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX idx_security_alerts_unacknowledged ON public.security_alerts(is_acknowledged, created_at DESC);

-- Helper functions

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_event_category text DEFAULT 'authentication',
  p_severity text DEFAULT 'low',
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_location_data jsonb DEFAULT '{}',
  p_device_fingerprint text DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_details jsonb DEFAULT '{}'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO public.security_events (
    user_id, event_type, event_category, severity,
    ip_address, user_agent, location_data, device_fingerprint,
    session_id, details
  ) VALUES (
    p_user_id, p_event_type, p_event_category, p_severity,
    p_ip_address, p_user_agent, p_location_data, p_device_fingerprint,
    p_session_id, p_details
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Function to create security alert
CREATE OR REPLACE FUNCTION public.create_security_alert(
  p_alert_type text,
  p_severity text,
  p_title text,
  p_description text,
  p_affected_user_id uuid DEFAULT NULL,
  p_triggered_by_event_id uuid DEFAULT NULL,
  p_alert_data jsonb DEFAULT '{}'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alert_id uuid;
BEGIN
  INSERT INTO public.security_alerts (
    alert_type, severity, title, description,
    affected_user_id, triggered_by_event_id, alert_data
  ) VALUES (
    p_alert_type, p_severity, p_title, p_description,
    p_affected_user_id, p_triggered_by_event_id, p_alert_data
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

-- Function to check if IP is blocked
CREATE OR REPLACE FUNCTION public.is_ip_blocked(p_ip_address inet)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ip_blocklist 
    WHERE ip_address = p_ip_address 
    AND (expires_at IS NULL OR expires_at > now())
    AND (is_permanent = true OR expires_at > now())
  );
$$;

-- Function to suspend user account
CREATE OR REPLACE FUNCTION public.suspend_user_account(
  p_user_id uuid,
  p_reason text,
  p_duration_hours integer DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lockout_until timestamp with time zone;
BEGIN
  -- Calculate lockout duration
  IF p_duration_hours IS NOT NULL THEN
    lockout_until := now() + (p_duration_hours || ' hours')::interval;
  END IF;
  
  -- Update user security settings
  INSERT INTO public.user_security_settings (user_id, account_status, lockout_until)
  VALUES (p_user_id, 'suspended', lockout_until)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    account_status = 'suspended',
    lockout_until = lockout_until,
    updated_at = now();
  
  -- Log security event
  PERFORM public.log_security_event(
    p_user_id,
    'account_suspended',
    'security',
    'high',
    NULL,
    NULL,
    '{}',
    NULL,
    NULL,
    jsonb_build_object('reason', p_reason, 'duration_hours', p_duration_hours)
  );
  
  -- Create security alert
  PERFORM public.create_security_alert(
    'account_suspension',
    'high',
    'User Account Suspended',
    'User account has been suspended: ' || p_reason,
    p_user_id,
    NULL,
    jsonb_build_object('reason', p_reason, 'duration_hours', p_duration_hours)
  );
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_security_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_user_security_settings_updated_at
  BEFORE UPDATE ON public.user_security_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_user_security_settings_updated_at();
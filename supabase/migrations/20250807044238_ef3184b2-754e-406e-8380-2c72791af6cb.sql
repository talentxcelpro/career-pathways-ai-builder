-- PHASE 2: Security Definer Functions and Search Path Fixes

-- Fix critical security definer functions by adding SET search_path TO ''
-- This prevents search path hijacking attacks

-- 1. Fix commonly used security-sensitive functions
CREATE OR REPLACE FUNCTION public.validate_admin_operation(_required_role app_role DEFAULT 'admin'::app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  user_role app_role;
  role_hierarchy integer;
  required_hierarchy integer;
BEGIN
  -- Get current user's role
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
    AND is_active = true
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'moderator' THEN 3
      WHEN 'employer' THEN 4
      WHEN 'user' THEN 5
    END
  LIMIT 1;
  
  -- If no role found, deny access
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get hierarchy levels
  role_hierarchy := CASE user_role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'moderator' THEN 3
    WHEN 'employer' THEN 4
    WHEN 'user' THEN 5
  END;
  
  required_hierarchy := CASE _required_role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'moderator' THEN 3
    WHEN 'employer' THEN 4
    WHEN 'user' THEN 5
  END;
  
  -- User must have equal or higher privileges
  RETURN role_hierarchy <= required_hierarchy;
END;
$function$;

-- 2. Fix security event logging function
CREATE OR REPLACE FUNCTION public.log_security_event_secure(
  p_user_id uuid, 
  p_event_type text, 
  p_description text, 
  p_ip_address inet DEFAULT NULL::inet, 
  p_user_agent text DEFAULT NULL::text, 
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  event_id uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Validate input parameters
  IF p_user_id IS NULL OR p_event_type IS NULL OR p_description IS NULL THEN
    RAISE EXCEPTION 'Required parameters cannot be null';
  END IF;
  
  -- Only allow users to log events for themselves, or admins to log for any user
  IF current_user_id != p_user_id AND NOT public.validate_admin_operation('moderator') THEN
    RAISE EXCEPTION 'Insufficient permissions to log security event for this user';
  END IF;
  
  -- Insert security event
  INSERT INTO public.security_events (
    user_id,
    event_type,
    description,
    ip_address,
    user_agent,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_event_type,
    p_description,
    p_ip_address,
    p_user_agent,
    p_metadata,
    now()
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$function$;

-- 3. Fix user role assignment function
CREATE OR REPLACE FUNCTION public.assign_user_role_secure(
  _target_user_id uuid, 
  _new_role app_role, 
  _reason text DEFAULT 'Role assignment'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  assigner_id uuid;
  result jsonb;
BEGIN
  -- Get current user
  assigner_id := auth.uid();
  
  -- Check if assigner exists and has permission
  IF NOT public.can_user_assign_role(assigner_id, _new_role) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient permissions to assign this role'
    );
  END IF;
  
  -- Prevent self-promotion to super_admin (additional safety)
  IF assigner_id = _target_user_id AND _new_role = 'super_admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot self-promote to super_admin role'
    );
  END IF;
  
  -- Deactivate existing roles for the target user
  UPDATE public.user_roles
  SET is_active = false,
      updated_at = now()
  WHERE user_id = _target_user_id;
  
  -- Assign new role
  INSERT INTO public.user_roles (user_id, role, is_active, created_at)
  VALUES (_target_user_id, _new_role, true, now());
  
  -- Log the role change
  INSERT INTO public.admin_activity_log (
    admin_user_id,
    target_user_id,
    action_type,
    details,
    created_at
  ) VALUES (
    assigner_id,
    _target_user_id,
    'role_assignment',
    jsonb_build_object(
      'new_role', _new_role,
      'reason', _reason,
      'timestamp', now()
    ),
    now()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Role assigned successfully'
  );
END;
$function$;

-- 4. Create secure profile visibility policy updates
-- Update profiles RLS to be more restrictive by default
DROP POLICY IF EXISTS "Public profiles are visible to everyone" ON public.profiles;

-- Create more secure profile visibility policy
CREATE POLICY "Profiles visibility with privacy controls" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow users to see their own profile
  id = auth.uid() 
  OR 
  -- Allow viewing of public profiles only
  (is_profile_public = true)
  OR 
  -- Allow admins to see all profiles
  (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  ))
);

-- 5. Add enhanced security for user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate username
  generated_username := public.generate_username(
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'user'), 
    NEW.id
  );
  
  INSERT INTO public.profiles (id, full_name, email, profile_picture_url, username, is_profile_public)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    generated_username,
    false  -- Make new profiles private by default for better security
  );
  
  -- Log the user creation event
  INSERT INTO public.security_events (
    user_id,
    event_type,
    description,
    metadata,
    created_at
  ) VALUES (
    NEW.id,
    'user_created',
    'New user account created',
    jsonb_build_object(
      'email', NEW.email,
      'provider', COALESCE(NEW.app_metadata->>'provider', 'email')
    ),
    now()
  );
  
  RETURN NEW;
END;
$function$;
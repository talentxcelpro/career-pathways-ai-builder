-- ======================================
-- CRITICAL SECURITY FIXES - PHASE 1
-- ======================================

-- 1. Fix Security Definer Functions with proper search_path
-- First, let's fix the existing functions to have proper search_path

-- Update existing security definer functions with search_path
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_app_role(_user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
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
$function$;

CREATE OR REPLACE FUNCTION public.is_app_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'moderator')
      AND is_active = true
  );
$function$;

-- 2. Create secure role management functions that prevent privilege escalation
CREATE OR REPLACE FUNCTION public.can_user_assign_role(
  _assigner_id uuid,
  _target_role app_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  assigner_role app_role;
BEGIN
  -- Get the assigner's highest role
  SELECT role INTO assigner_role
  FROM public.user_roles
  WHERE user_id = _assigner_id
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
  
  -- Only super_admin can assign any role
  IF assigner_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Admin can assign moderator, employer, user but not super_admin or admin
  IF assigner_role = 'admin' AND _target_role IN ('moderator', 'employer', 'user') THEN
    RETURN true;
  END IF;
  
  -- Moderators can only assign user role
  IF assigner_role = 'moderator' AND _target_role = 'user' THEN
    RETURN true;
  END IF;
  
  -- Default deny
  RETURN false;
END;
$$;

-- 3. Create secure role assignment function with audit logging
CREATE OR REPLACE FUNCTION public.assign_user_role_secure(
  _target_user_id uuid,
  _new_role app_role,
  _reason text DEFAULT 'Role assignment'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- 4. Create function to validate admin permissions for sensitive operations
CREATE OR REPLACE FUNCTION public.validate_admin_operation(
  _required_role app_role DEFAULT 'admin'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- 5. Create secure function for logging security events with proper validation
CREATE OR REPLACE FUNCTION public.log_security_event_secure(
  p_user_id uuid,
  p_event_type text,
  p_description text,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;
-- PHASE 2: Security Definer Functions and Search Path Fixes (Fixed)

-- 1. Fix commonly used security-sensitive functions with correct type references
CREATE OR REPLACE FUNCTION public.validate_admin_operation(_required_role public.app_role DEFAULT 'admin'::public.app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role public.app_role;
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

-- 2. Create enhanced security monitoring for admin operations
CREATE OR REPLACE FUNCTION public.audit_admin_action(
  p_action_type text,
  p_target_resource text,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log admin actions for security monitoring
  INSERT INTO public.admin_activity_log (
    admin_user_id,
    action_type,
    details,
    ip_address,
    created_at
  ) VALUES (
    auth.uid(),
    p_action_type,
    jsonb_build_object(
      'resource', p_target_resource,
      'details', p_details,
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::json->>'user-agent'
    ),
    inet_client_addr(),
    now()
  );
  
  -- Also log as security event for high-privilege actions
  IF p_action_type IN ('role_assignment', 'user_deletion', 'data_export', 'system_config_change') THEN
    INSERT INTO public.security_events (
      user_id,
      event_type,
      description,
      ip_address,
      metadata,
      created_at
    ) VALUES (
      auth.uid(),
      'admin_action',
      'Admin performed ' || p_action_type || ' on ' || p_target_resource,
      inet_client_addr(),
      p_details,
      now()
    );
  END IF;
END;
$function$;

-- 3. Enhanced role assignment function with better security
CREATE OR REPLACE FUNCTION public.assign_user_role_secure(
  _target_user_id uuid, 
  _new_role public.app_role, 
  _reason text DEFAULT 'Role assignment'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  
  -- Audit the action
  PERFORM public.audit_admin_action(
    'role_assignment',
    'user:' || _target_user_id::text,
    jsonb_build_object(
      'new_role', _new_role,
      'reason', _reason,
      'target_user', _target_user_id
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Role assigned successfully'
  );
END;
$function$;

-- 4. Create more secure profile visibility policy
DROP POLICY IF EXISTS "Public profiles are visible to everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles visibility with privacy controls" ON public.profiles;

-- Create more secure profile visibility policy
CREATE POLICY "Secure profile visibility" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own profile
  id = auth.uid() 
  OR 
  -- Only public profiles are visible to others
  (is_profile_public = true AND is_ai_bot = false)
  OR 
  -- AI bots are visible if active
  (is_ai_bot = true)
  OR 
  -- Admins can see all profiles
  (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  ))
);

-- 5. Create enhanced input validation function
CREATE OR REPLACE FUNCTION public.validate_secure_input(
  input_data jsonb,
  validation_rules jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  errors text[] := '{}';
  key text;
  value text;
BEGIN
  -- Basic XSS prevention
  FOR key, value IN SELECT * FROM jsonb_each_text(input_data) LOOP
    -- Check for script tags and dangerous patterns
    IF value ~* '<script|javascript:|vbscript:|onload=|onerror=|onclick=' THEN
      errors := array_append(errors, key || ': Contains potentially dangerous content');
    END IF;
    
    -- Check for SQL injection patterns
    IF value ~* '(drop\s+table|truncate\s+table|delete\s+from|insert\s+into|update\s+.*\s+set|\-\-|\bor\b.*=.*\bor\b)' THEN
      errors := array_append(errors, key || ': Contains potentially dangerous SQL patterns');
    END IF;
    
    -- Length validation
    IF length(value) > 10000 THEN
      errors := array_append(errors, key || ': Value too long');
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'valid', array_length(errors, 1) IS NULL,
    'errors', to_jsonb(errors),
    'sanitized_data', input_data
  );
END;
$function$;
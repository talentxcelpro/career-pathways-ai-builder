-- PHASE 1: Critical Security Fixes - Data Protection and RLS Policies (Fixed)

-- 1. Enable RLS on critical unprotected tables that contain sensitive data

-- Enable RLS on batch_scraping_queue (contains scraping configuration data)
ALTER TABLE public.batch_scraping_queue ENABLE ROW LEVEL SECURITY;

-- Create admin-only policy for batch_scraping_queue
CREATE POLICY "Admins can manage batch scraping queue" 
ON public.batch_scraping_queue 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

-- Enable RLS on job_source_whitelist (critical security configuration)
ALTER TABLE public.job_source_whitelist ENABLE ROW LEVEL SECURITY;

-- Create admin-only policy for job_source_whitelist
CREATE POLICY "Admins can manage job source whitelist" 
ON public.job_source_whitelist 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

-- Enable RLS on salary_normalization_rules (contains salary calculation logic)
ALTER TABLE public.salary_normalization_rules ENABLE ROW LEVEL SECURITY;

-- Create admin-only policy for salary_normalization_rules
CREATE POLICY "Admins can manage salary normalization rules" 
ON public.salary_normalization_rules 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

-- 2. Fix critical role management function to prevent privilege escalation
-- First drop the existing function if it exists
DROP FUNCTION IF EXISTS public.assign_user_role_secure_v2(uuid, app_role, text);

CREATE OR REPLACE FUNCTION public.assign_user_role_secure_v2(
  _target_user_id uuid, 
  _new_role app_role, 
  _reason text DEFAULT 'Role assignment'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  assigner_id uuid;
  assigner_role app_role;
  target_current_role app_role;
  result jsonb;
BEGIN
  -- Get current user
  assigner_id := auth.uid();
  
  -- Validate inputs
  IF _target_user_id IS NULL OR _new_role IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid parameters'
    );
  END IF;
  
  -- Get assigner's role
  SELECT role INTO assigner_role
  FROM public.user_roles
  WHERE user_id = assigner_id
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
  
  -- Get target user's current role
  SELECT role INTO target_current_role
  FROM public.user_roles
  WHERE user_id = _target_user_id
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
  
  -- Enhanced permission checks
  
  -- Prevent self-promotion to super_admin
  IF assigner_id = _target_user_id AND _new_role = 'super_admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot self-promote to super_admin role'
    );
  END IF;
  
  -- Only super_admin can assign super_admin role
  IF _new_role = 'super_admin' AND assigner_role != 'super_admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super_admin can assign super_admin role'
    );
  END IF;
  
  -- Only super_admin can modify other super_admin accounts
  IF target_current_role = 'super_admin' AND assigner_role != 'super_admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient permissions to modify super_admin accounts'
    );
  END IF;
  
  -- Only super_admin can assign admin role
  IF _new_role = 'admin' AND assigner_role != 'super_admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super_admin can assign admin role'
    );
  END IF;
  
  -- Admin can assign moderator, employer, user
  IF assigner_role = 'admin' AND _new_role NOT IN ('moderator', 'employer', 'user') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Admins can only assign moderator, employer, or user roles'
    );
  END IF;
  
  -- Moderators can only assign user role
  IF assigner_role = 'moderator' AND _new_role != 'user' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Moderators can only assign user role'
    );
  END IF;
  
  -- Rate limiting check - prevent spam role changes
  IF EXISTS (
    SELECT 1 FROM public.admin_activity_log
    WHERE admin_user_id = assigner_id
    AND action_type = 'role_assignment'
    AND created_at > NOW() - INTERVAL '1 minute'
    GROUP BY admin_user_id
    HAVING COUNT(*) >= 5
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Rate limit exceeded. Please wait before making more role changes.'
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
  
  -- Enhanced logging with more security context
  INSERT INTO public.admin_activity_log (
    admin_user_id,
    target_user_id,
    action_type,
    details,
    ip_address,
    created_at
  ) VALUES (
    assigner_id,
    _target_user_id,
    'role_assignment',
    jsonb_build_object(
      'new_role', _new_role,
      'previous_role', target_current_role,
      'reason', _reason,
      'timestamp', now(),
      'assigner_role', assigner_role,
      'security_level', 'high'
    ),
    inet_client_addr(),
    now()
  );
  
  -- Log security event
  INSERT INTO public.security_events (
    user_id,
    event_type,
    description,
    ip_address,
    metadata,
    created_at
  ) VALUES (
    _target_user_id,
    'role_change',
    'User role changed from ' || COALESCE(target_current_role::text, 'none') || ' to ' || _new_role::text,
    inet_client_addr(),
    jsonb_build_object(
      'changed_by', assigner_id,
      'previous_role', target_current_role,
      'new_role', _new_role,
      'reason', _reason
    ),
    now()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Role assigned successfully with enhanced security validation'
  );
END;
$function$;
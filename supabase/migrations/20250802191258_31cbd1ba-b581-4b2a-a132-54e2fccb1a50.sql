-- Phase 1: Critical Database Security Fixes

-- 1. Fix SECURITY DEFINER functions by adding secure search_path
CREATE OR REPLACE FUNCTION public.log_user_activity(p_user_id uuid, p_activity_type text, p_activity_title text, p_activity_description text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb, p_related_entity_type text DEFAULT NULL::text, p_related_entity_id uuid DEFAULT NULL::uuid, p_is_public boolean DEFAULT true)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  activity_id uuid;
BEGIN
  -- Validate user exists and is authenticated
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot log activity for other users';
  END IF;
  
  INSERT INTO public.user_activities (
    user_id,
    activity_type,
    activity_title,
    activity_description,
    metadata,
    related_entity_type,
    related_entity_id,
    is_public
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_activity_title,
    p_activity_description,
    p_metadata,
    p_related_entity_type,
    p_related_entity_id,
    p_is_public
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$function$;

-- 2. Fix can_user_assign_role function
CREATE OR REPLACE FUNCTION public.can_user_assign_role(_assigner_id uuid, _target_role app_role)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  assigner_role app_role;
BEGIN
  -- Only allow authenticated users
  IF _assigner_id != auth.uid() THEN
    RETURN false;
  END IF;
  
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
$function$;

-- 3. Fix validate_admin_operation function
CREATE OR REPLACE FUNCTION public.validate_admin_operation(_required_role app_role DEFAULT 'admin'::app_role)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
  role_hierarchy integer;
  required_hierarchy integer;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Must be authenticated
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get current user's role
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = current_user_id
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

-- 4. Enable RLS on critical tables that don't have it
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- 5. Create secure RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Only super admins can manage roles" ON public.user_roles
  FOR ALL
  USING (public.validate_admin_operation('super_admin'::app_role));

-- 6. Create secure RLS policies for security_events table  
CREATE POLICY "Users can view their own security events" ON public.security_events
  FOR SELECT  
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all security events" ON public.security_events
  FOR SELECT
  USING (public.validate_admin_operation('admin'::app_role));

CREATE POLICY "System can insert security events" ON public.security_events
  FOR INSERT
  WITH CHECK (true);

-- 7. Restrict anonymous access and add authentication requirements
CREATE POLICY "Authenticated users only" ON public.profiles
  FOR ALL
  TO authenticated
  USING (true);

-- Drop overly permissive anonymous policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view active AI bots" ON public.ai_bots;
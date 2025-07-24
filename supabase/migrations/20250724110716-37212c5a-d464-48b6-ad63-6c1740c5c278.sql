-- Fix 1: Enable RLS on industry_skills_library table
ALTER TABLE public.industry_skills_library ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for industry_skills_library
CREATE POLICY "Anyone can view industry skills" 
ON public.industry_skills_library 
FOR SELECT 
USING (true);

-- Fix 2: Secure admin authentication - Create proper role-based access functions
CREATE OR REPLACE FUNCTION public.is_app_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'moderator')
      AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.has_app_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_app_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
  LIMIT 1
$$;

-- Fix 3: Update existing functions to use proper search_path and security
CREATE OR REPLACE FUNCTION public.is_company_admin_or_owner(company_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Check if user is company owner
    SELECT 1 FROM public.company_profiles 
    WHERE company_id = company_uuid AND owner_id = auth.uid()
    UNION
    -- Check if user is admin in team members (without recursion)
    SELECT 1 FROM public.company_team_members 
    WHERE company_id = company_uuid 
    AND user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
    AND is_active = true
  );
$$;

-- Fix 4: Create security alert function for suspicious activities
CREATE OR REPLACE FUNCTION public.log_security_event(
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
SET search_path = public
AS $$
DECLARE
  event_id uuid;
BEGIN
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
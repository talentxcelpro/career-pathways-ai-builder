-- Priority 1: Fix admin access control system
-- Create secure function to check admin status
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  );
$$;

-- Fix existing Security Definer functions to use proper search_path
CREATE OR REPLACE FUNCTION public.has_app_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
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
SET search_path TO ''
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

CREATE OR REPLACE FUNCTION public.is_app_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'moderator')
      AND is_active = true
  )
$$;

-- Priority 2: Restrict CV database access to only employer's own job postings
CREATE OR REPLACE VIEW public.employer_cv_database_secure AS
SELECT DISTINCT
  a.id as application_id,
  a.job_id,
  j.title as job_title,
  j.company_name,
  j.location,
  p.full_name,
  p.email,
  p.phone,
  a.resume_url,
  a.applied_at,
  a.status,
  CASE 
    WHEN j.external_url IS NOT NULL THEN 'scraped'
    ELSE 'platform'
  END as application_source
FROM job_applications a
JOIN jobs j ON a.job_id = j.id  
JOIN profiles p ON a.user_id = p.id
WHERE j.posted_by = auth.uid()  -- Only show CVs from employer's own jobs
   OR (
     j.company_id IN (
       SELECT ctm.company_id 
       FROM company_team_members ctm 
       WHERE ctm.user_id = auth.uid() 
       AND ctm.is_active = true
       AND ctm.role IN ('owner', 'admin', 'recruiter')
     )
   );

-- Add RLS policy for the secure view
CREATE POLICY "Employers can only view their own job applications"
ON job_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM jobs j 
    WHERE j.id = job_applications.job_id 
    AND (
      j.posted_by = auth.uid() 
      OR j.company_id IN (
        SELECT ctm.company_id 
        FROM company_team_members ctm 
        WHERE ctm.user_id = auth.uid() 
        AND ctm.is_active = true
        AND ctm.role IN ('owner', 'admin', 'recruiter')
      )
    )
  )
);

-- Priority 3: Add audit logging for CV access
CREATE TABLE public.cv_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL,
  applicant_id uuid NOT NULL,
  job_id uuid NOT NULL,
  access_type text NOT NULL, -- 'view', 'download', 'contact'
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.cv_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can view their own access logs"
ON public.cv_access_logs
FOR SELECT
USING (employer_id = auth.uid());

CREATE POLICY "System can insert access logs"
ON public.cv_access_logs
FOR INSERT
WITH CHECK (true);

-- Priority 4: Add server-side rate limiting for outreach
CREATE OR REPLACE FUNCTION public.check_outreach_limit_secure(employer_uuid uuid, recipient_count integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_month text;
  current_usage integer;
  is_premium boolean;
  monthly_limit integer;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Get current usage and premium status
  SELECT COALESCE(emails_sent, 0), COALESCE(ou.is_premium, false)
  INTO current_usage, is_premium
  FROM outreach_usage ou
  WHERE ou.employer_id = employer_uuid AND ou.month_year = current_month;
  
  -- Set limits: Free = 20/month, Premium = unlimited
  IF is_premium THEN
    monthly_limit := 999999; -- Unlimited for premium
  ELSE
    monthly_limit := 20; -- Reduced free tier limit for security
  END IF;
  
  -- Check if adding recipient_count would exceed limit
  RETURN (current_usage + recipient_count) <= monthly_limit;
END;
$$;

-- Add security event logging
CREATE TABLE public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  description text NOT NULL,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security events"
ON public.security_events
FOR SELECT
USING (public.is_current_user_admin());

CREATE POLICY "System can insert security events"
ON public.security_events
FOR INSERT
WITH CHECK (true);
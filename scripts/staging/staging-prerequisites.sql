-- scripts/staging/staging-prerequisites.sql
-- Foundational schema prerequisites for Task 002 hardening on newly provisioned staging environments.

-- 1. Ensure app_role enum exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'moderator', 'employer', 'user');
  END IF;
END $$;

-- 2. Ensure public.user_roles exists
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role)
);

-- 3. Ensure is_app_admin helper exists
CREATE OR REPLACE FUNCTION public.is_app_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  );
$$;

-- 4. Ensure resume_downloads table exists
CREATE TABLE IF NOT EXISTS public.resume_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resume_id UUID NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  last_download_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, resume_id)
);

-- 5. Ensure documents storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true) 
ON CONFLICT (id) DO NOTHING;

-- 6. Helper to prevent RLS recursion on company_team_members
CREATE OR REPLACE FUNCTION public.is_company_admin_or_owner(company_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_profiles 
    WHERE company_id = company_uuid AND owner_id = auth.uid()
    UNION
    SELECT 1 FROM public.company_team_members 
    WHERE company_id = company_uuid 
    AND user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  );
$$;

DROP POLICY IF EXISTS "Company admins can manage team members" ON public.company_team_members;
CREATE POLICY "Company admins can manage team members"
  ON public.company_team_members
  FOR ALL
  USING (public.is_company_admin_or_owner(company_id));

-- 7. Ensure employer job application viewing policy exists
DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON public.job_applications;
CREATE POLICY "Employers can view applications for their jobs"
ON public.job_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.company_team_members ctm ON j.company_id = ctm.company_id
    WHERE j.id = job_applications.job_id
      AND ctm.user_id = auth.uid()
      AND ctm.is_active = true
  )
);

-- Clean up ALL problematic RLS policies and create proper ones

-- Drop ALL existing policies on job_applications to start fresh
DROP POLICY IF EXISTS "Admins can view all applications" ON public.job_applications;
DROP POLICY IF EXISTS "Job posters can view applications for their jobs" ON public.job_applications;
DROP POLICY IF EXISTS "Users can create own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can create their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can insert job applications for valid jobs" ON public.job_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can update their own job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can view their own job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can delete their own job applications" ON public.job_applications;

-- Ensure the security definer function exists
CREATE OR REPLACE FUNCTION public.can_apply_to_job(job_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE id = job_uuid
  );
$$;

-- Create simple, clean RLS policies
CREATE POLICY "Users can view their own job applications"
ON public.job_applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job applications"
ON public.job_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job applications"
ON public.job_applications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job applications"
ON public.job_applications
FOR DELETE
USING (auth.uid() = user_id);

-- Admin access policy (simplified)
CREATE POLICY "Admins can manage all job applications"
ON public.job_applications
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin')
    AND is_active = true
  )
);
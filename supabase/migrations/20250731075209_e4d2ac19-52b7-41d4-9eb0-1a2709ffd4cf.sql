-- Fix RLS policies for job_applications to avoid "relation jobs does not exist" error

-- First, drop the existing problematic policy that references jobs table directly
DROP POLICY IF EXISTS "Users can apply to jobs they can view" ON public.job_applications;

-- Create security definer function to safely check if a job exists and user can access it
CREATE OR REPLACE FUNCTION public.can_apply_to_job(job_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE id = job_uuid
  );
$$;

-- Create new RLS policies for job_applications using the security definer function
CREATE POLICY "Users can view their own job applications"
ON public.job_applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert job applications for valid jobs"
ON public.job_applications
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  public.can_apply_to_job(job_id)
);

CREATE POLICY "Users can update their own job applications"
ON public.job_applications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job applications"
ON public.job_applications
FOR DELETE
USING (auth.uid() = user_id);
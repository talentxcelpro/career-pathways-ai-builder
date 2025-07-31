-- Fix the RLS policy that's causing the "relation jobs does not exist" error
-- by creating a security definer function to safely access the jobs table

-- Create a security definer function to check if user owns a job
CREATE OR REPLACE FUNCTION public.user_owns_job(job_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE id = job_uuid AND posted_by = auth.uid()
  );
$$;

-- Drop the problematic policy and recreate it using the function
DROP POLICY IF EXISTS "Job posters can view applications for their jobs" ON public.job_applications;

CREATE POLICY "Job posters can view applications for their jobs" 
ON public.job_applications 
FOR SELECT 
USING (public.user_owns_job(job_id));
-- Fix RLS policies for jobs table with correct column names

-- Enable RLS on jobs table
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Everyone can view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can view all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Company team members can manage company jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can manage all jobs" ON public.jobs;
DROP POLICY IF EXISTS "System can create bot jobs" ON public.jobs;

-- Create new comprehensive policies
CREATE POLICY "Everyone can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Company team members can manage their jobs" 
ON public.jobs 
FOR ALL 
USING (
  company_id IN (
    SELECT company_id 
    FROM company_team_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can manage all jobs" 
ON public.jobs 
FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "System can insert jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (true);

-- Also ensure scraped_jobs and job_applications have proper RLS
ALTER TABLE public.scraped_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Policies for scraped_jobs
CREATE POLICY "Admins can manage scraped jobs" 
ON public.scraped_jobs 
FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "System can manage scraped jobs" 
ON public.scraped_jobs 
FOR ALL 
USING (true);

-- Policies for job_applications  
CREATE POLICY "Users can manage their applications" 
ON public.job_applications 
FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all applications" 
ON public.job_applications 
FOR SELECT 
USING (is_app_admin(auth.uid()));
-- Clean up and recreate RLS policies properly

-- Drop all existing policies first
DROP POLICY IF EXISTS "Company team members can manage their jobs" ON public.jobs;
DROP POLICY IF EXISTS "Everyone can view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can manage all jobs" ON public.jobs;
DROP POLICY IF EXISTS "System can insert jobs" ON public.jobs;

-- Create clean policies for jobs table
CREATE POLICY "Public can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Company members can manage company jobs" 
ON public.jobs 
FOR ALL 
USING (
  company_id IN (
    SELECT company_id 
    FROM company_team_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins and system can manage all jobs" 
ON public.jobs 
FOR ALL 
USING (
  is_app_admin(auth.uid()) OR 
  auth.jwt() ->> 'role' = 'service_role'
);
-- Fix RLS policies for jobs table to allow proper access for testing

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can view published jobs" ON public.jobs;
DROP POLICY IF EXISTS "Company members can manage their jobs" ON public.jobs;

-- Create comprehensive RLS policies for jobs table
CREATE POLICY "Everyone can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can view all jobs" 
ON public.jobs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Company team members can manage company jobs" 
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
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'moderator')
    AND is_active = true
  )
);

CREATE POLICY "System can create bot jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (posted_by_bot IS NOT NULL);
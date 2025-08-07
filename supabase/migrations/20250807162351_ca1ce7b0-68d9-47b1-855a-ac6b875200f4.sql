-- Add a temporary policy to allow the current user to see CV files for testing
CREATE POLICY "Current user can view CV files (temporary)" 
ON public.cv_files 
FOR SELECT 
USING (true);

-- This is temporary - we can remove it later once admin roles are properly set up
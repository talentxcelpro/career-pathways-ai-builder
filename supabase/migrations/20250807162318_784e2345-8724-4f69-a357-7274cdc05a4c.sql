-- Add RLS policies to allow admins to view CV files
CREATE POLICY "Admins can view all CV files" 
ON public.cv_files 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

-- Allow system to insert CV files during processing
CREATE POLICY "System can insert CV files" 
ON public.cv_files 
FOR INSERT 
WITH CHECK (true);

-- Allow admins to update CV files
CREATE POLICY "Admins can update CV files" 
ON public.cv_files 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);
-- Create the resumes storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false);

-- Create storage policies for resumes bucket
CREATE POLICY "Employers can view resumes" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'resumes' AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('employer', 'admin', 'super_admin') 
    AND is_active = true
  )
);

CREATE POLICY "System can upload resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'resumes' AND 
  (
    auth.uid() IS NOT NULL OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
  )
);

CREATE POLICY "System can update resumes" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'resumes' AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  )
);
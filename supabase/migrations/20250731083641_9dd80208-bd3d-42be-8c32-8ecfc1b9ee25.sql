-- Create the resumes storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false);

-- Create storage policies for resumes bucket
CREATE POLICY "Users can view their own resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes' AND is_app_admin(auth.uid()));

CREATE POLICY "System can manage resumes" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'resumes');
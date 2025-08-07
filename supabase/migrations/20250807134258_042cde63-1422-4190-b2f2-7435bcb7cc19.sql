-- Create storage buckets for CV uploads and documents
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('documents', 'documents', false),
  ('resumes', 'resumes', false),
  ('portfolio', 'portfolio', false);

-- Create storage policies for CV uploads
CREATE POLICY "Authenticated users can upload CVs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'documents' AND EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('super_admin', 'admin') 
  AND is_active = true
));

-- Resume storage policies
CREATE POLICY "Users can upload their own resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Portfolio storage policies  
CREATE POLICY "Users can upload their own portfolio files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own portfolio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
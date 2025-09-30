-- Create cv-files storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('cv-files', 'cv-files', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']);

-- Create RLS policies for cv-files bucket
CREATE POLICY "Users can upload their own CV files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cv-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own CV files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cv-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all CV files" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'cv-files' AND EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('super_admin', 'admin') 
  AND is_active = true
));

CREATE POLICY "System can manage CV files" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'cv-files');
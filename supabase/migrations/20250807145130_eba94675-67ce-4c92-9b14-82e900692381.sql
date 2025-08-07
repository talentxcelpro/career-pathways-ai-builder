-- Create test-files storage bucket for CV parser testing
INSERT INTO storage.buckets (id, name, public) 
VALUES ('test-files', 'test-files', true);

-- Create policies for test-files bucket
CREATE POLICY "Allow public viewing of test files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'test-files');

CREATE POLICY "Allow service role to upload test files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'test-files');
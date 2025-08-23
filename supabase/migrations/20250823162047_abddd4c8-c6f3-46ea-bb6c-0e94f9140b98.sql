-- Create public storage bucket for post media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('post-media', 'post-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];

-- Create RLS policies for post-media bucket
CREATE POLICY "Public can view post media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'post-media');

CREATE POLICY "Authenticated users can upload post media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'post-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own post media" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'post-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own post media" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'post-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
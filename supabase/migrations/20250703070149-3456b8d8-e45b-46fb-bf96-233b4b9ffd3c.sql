-- Create post-media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for post-media bucket
CREATE POLICY "Users can upload to post-media bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view post-media files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'post-media');

CREATE POLICY "Users can update their own post-media files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own post-media files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);
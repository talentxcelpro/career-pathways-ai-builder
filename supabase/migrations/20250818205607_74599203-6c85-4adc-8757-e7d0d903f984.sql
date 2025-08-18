-- Create public 'reels' storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('reels','reels', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for reels bucket
-- Public can read files in reels
CREATE POLICY "Public read access for reels"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'reels' );

-- Authenticated users can upload to their own folder in reels
CREATE POLICY "Users can upload to their reels folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'reels' AND
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update files in their own folder
CREATE POLICY "Users can update their reels files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'reels' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete files in their own folder
CREATE POLICY "Users can delete their reels files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'reels' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('resumes', 'resumes', true),
  ('cover-letters', 'cover-letters', true),
  ('documents', 'documents', true),
  ('media', 'media', true),
  ('portfolio', 'portfolio', true),
  ('preferences', 'preferences', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

DROP POLICY IF EXISTS "Resume files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;

DROP POLICY IF EXISTS "Cover letter files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own cover letters" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own cover letters" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own cover letters" ON storage.objects;

DROP POLICY IF EXISTS "Document files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

DROP POLICY IF EXISTS "Media files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;

DROP POLICY IF EXISTS "Portfolio files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own portfolio" ON storage.objects;

DROP POLICY IF EXISTS "Preference files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own preferences" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own preferences" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON storage.objects;

-- Create comprehensive RLS policies for all buckets

-- Avatars bucket policies
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Resumes bucket policies
CREATE POLICY "Resume files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes');

CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Cover letters bucket policies
CREATE POLICY "Cover letter files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'cover-letters');

CREATE POLICY "Users can upload their own cover letters"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cover-letters' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own cover letters"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cover-letters' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own cover letters"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cover-letters' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Documents bucket policies
CREATE POLICY "Document files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Media bucket policies
CREATE POLICY "Media files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Portfolio bucket policies
CREATE POLICY "Portfolio files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

CREATE POLICY "Users can upload their own portfolio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own portfolio"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'portfolio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own portfolio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'portfolio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Preferences bucket policies
CREATE POLICY "Preference files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'preferences');

CREATE POLICY "Users can upload their own preferences"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'preferences' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own preferences"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'preferences' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own preferences"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'preferences' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

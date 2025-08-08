-- Ensure 'documents' storage bucket exists and is public, and allow public read access
-- Create bucket if missing, or set to public if it exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Allow public read access to files in the 'documents' bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Public read for documents'
  ) THEN
    CREATE POLICY "Public read for documents"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'documents');
  END IF;
END $$;

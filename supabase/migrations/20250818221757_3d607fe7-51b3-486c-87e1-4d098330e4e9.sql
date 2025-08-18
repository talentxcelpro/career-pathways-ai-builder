-- Create public storage bucket for post media and secure policies
-- 1) Create bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2) Policies for storage.objects scoped to 'post-media'
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view post media'
  ) THEN
    CREATE POLICY "Public can view post media"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'post-media');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload their own post media'
  ) THEN
    CREATE POLICY "Users can upload their own post media"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'post-media' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update their own post media'
  ) THEN
    CREATE POLICY "Users can update their own post media"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'post-media' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete their own post media'
  ) THEN
    CREATE POLICY "Users can delete their own post media"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'post-media' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;
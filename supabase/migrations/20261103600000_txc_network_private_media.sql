-- ============================================================================
-- Migration: 20261103600000_txc_network_private_media.sql
-- Mission: TXC-NETWORK-PROD-CLOSURE-003
-- Purpose: Media privacy architecture: Private storage bucket, RLS authorization,
--          signed URL support, and directory enumeration elimination.
-- ============================================================================

-- 1. Create dedicated private bucket for confidential & connections-only media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-media-private',
  'post-media-private',
  false,
  104857600, -- 100MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-matroska',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 104857600,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS on storage.objects for post-media-private

-- Allow authenticated users to upload their own private media
DROP POLICY IF EXISTS "Users can upload their own private post media" ON storage.objects;
CREATE POLICY "Users can upload their own private post media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'post-media-private'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own private media
DROP POLICY IF EXISTS "Users can update their own private post media" ON storage.objects;
CREATE POLICY "Users can update their own private post media"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'post-media-private'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own private media
DROP POLICY IF EXISTS "Users can delete their own private post media" ON storage.objects;
CREATE POLICY "Users can delete their own private post media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'post-media-private'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow authorized viewers (author or accepted connections) to select/download private media
DROP POLICY IF EXISTS "Authorized viewers can select private post media" ON storage.objects;
CREATE POLICY "Authorized viewers can select private post media"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'post-media-private'
  AND (
    -- Case 1: Post author
    (auth.uid())::text = (storage.foldername(name))[1]
    OR
    -- Case 2: Accepted connection of the author
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.status = 'accepted'
      AND (
        (c.requester_id = auth.uid() AND c.recipient_id::text = (storage.foldername(name))[1])
        OR
        (c.recipient_id = auth.uid() AND c.requester_id::text = (storage.foldername(name))[1])
      )
    )
  )
);

-- 3. Harden post-media public bucket against anonymous directory enumeration
-- Drop unrestricted public listing policies on storage.objects
DROP POLICY IF EXISTS "Anyone can view post media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view post-media files" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Post Media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view post media" ON storage.objects;

-- Allow authenticated users to select objects from post-media table
DROP POLICY IF EXISTS "Authenticated users can select post-media objects" ON storage.objects;
CREATE POLICY "Authenticated users can select post-media objects"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'post-media');

-- 4. Register migration in schema_migrations
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20261103600000', 'txc_network_private_media')
ON CONFLICT (version) DO NOTHING;

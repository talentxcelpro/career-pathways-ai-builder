-- ============================================================================
-- Migration Rollback: 20261103600000_txc_network_private_media_rollback.sql
-- Mission: TXC-NETWORK-PROD-CLOSURE-003
-- Safe rollback script for media privacy architecture
-- ============================================================================

DROP POLICY IF EXISTS "Authorized viewers can select private post media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own private post media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own private post media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own private post media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can select post-media objects" ON storage.objects;

-- Restore baseline post-media listing policy if required
CREATE POLICY "Users can view post-media files" ON storage.objects FOR SELECT USING (bucket_id = 'post-media');

-- Delete private bucket if required
DELETE FROM storage.buckets WHERE id = 'post-media-private';

DELETE FROM supabase_migrations.schema_migrations WHERE version = '20261103600000';

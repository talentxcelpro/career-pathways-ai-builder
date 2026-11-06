-- supabase/migrations/20261103090000_purge_legacy_storage_wildcard_policies.sql
-- Purge surviving 2025 legacy wildcard policies on storage.objects for 'documents' bucket
-- Discovered during Task 002N Independent Production Security Certification (TXC-RISK-001)

BEGIN;

-- 1. Drop over-permissive public wildcard policies from migration 20250807140852
DROP POLICY IF EXISTS "Anyone can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Document files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete documents" ON storage.objects;

-- 2. Drop legacy 'Users can...' policies with loose public role grants
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

COMMIT;

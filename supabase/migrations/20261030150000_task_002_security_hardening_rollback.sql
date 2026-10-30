-- Migration Rollback: 20261030150000_task_002_security_hardening_rollback.sql
-- Description: Rollback script for Task 002 Security Hardening
-- IMPORTANT SAFETY NOTE:
-- In accordance with pre-launch security directives, rolling back this migration
-- must NEVER automatically restore the insecure public SELECT policy on the documents
-- storage bucket. Candidate privacy must be preserved even during rollback.

-- 1. Rollback procedure record_resume_download_atomic if needed
DROP FUNCTION IF EXISTS public.record_resume_download_atomic(UUID);

-- 2. Rate Limiter Rollback (SEC-010)
DROP FUNCTION IF EXISTS public.check_rate_limit(TEXT, TEXT, INT, INT);
DROP TABLE IF EXISTS public.edge_rate_limits;

-- 2. Storage Policies Rollback
-- Retains documents bucket as private, but drops the newly created RLS policies if necessary
DROP POLICY IF EXISTS "Admins can manage documents" ON storage.objects;
DROP POLICY IF EXISTS "Employers can view applicant documents" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can insert own documents" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can read own documents" ON storage.objects;

-- Note on claim1_process_verified_bid:
-- Direct authenticated execution was revoked for security reasons.
-- To restore previous state in development only:
-- GRANT EXECUTE ON FUNCTION public.claim1_process_verified_bid TO authenticated;
-- (DO NOT UNCOMMENT IN PRODUCTION)

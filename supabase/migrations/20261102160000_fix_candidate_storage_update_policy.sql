-- Migration: 20261102160000_fix_candidate_storage_update_policy.sql
-- Description: Implement candidate UPDATE policy and folder isolation on storage.objects for the documents bucket
-- Task: 002I Candidate Storage Upsert Remediation & Staging Verification
--
-- Security Controls Enforced:
-- 1. Candidate can insert and update ONLY in their own folder (auth.uid() = storage.foldername(name)[1]).
-- 2. Candidate cannot upload, replace, or insert into another candidate's folder.
-- 3. Candidate cannot change document ownership to another user.
-- 4. Candidate cannot move documents between folders.
-- 5. Candidate can replace/upsert existing documents without RLS violations.
-- 6. Unauthenticated users (anon) have zero insert/update/delete permissions.
-- 7. Recruiters retain SELECT access strictly for active applicants to their company's jobs (no write/delete).
-- 8. Administrators retain full oversight.

-- 1. Tighten INSERT policy to require strict user folder matching
DROP POLICY IF EXISTS "Candidates can insert own documents" ON storage.objects;
CREATE POLICY "Candidates can insert own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (
      owner IS NULL
      OR auth.uid() = owner
    )
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 2. Implement UPDATE policy with matching USING and WITH CHECK guards
DROP POLICY IF EXISTS "Candidates can update own documents" ON storage.objects;
CREATE POLICY "Candidates can update own documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      auth.uid() = owner
      OR auth.uid()::text = (storage.foldername(name))[1]
    )
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND (
      owner IS NULL
      OR auth.uid() = owner
    )
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Rollback Instructions:
-- To rollback this remediation, execute:
-- DROP POLICY IF EXISTS "Candidates can update own documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Candidates can insert own documents" ON storage.objects;
-- CREATE POLICY "Candidates can insert own documents" ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'documents' AND (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1]));

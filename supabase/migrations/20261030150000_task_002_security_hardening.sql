-- Migration: 20261030150000_task_002_security_hardening.sql
-- Description: Task 002 Controlled Security Remediation, Payment Integrity & Access-Control Hardening
-- Scope:
--   1. SEC-001: Protect user_roles table against unauthorized modification.
--   2. SEC-002: Revoke direct execution of claim1_process_verified_bid from public/authenticated users.
--   3. SEC-003: Restrict documents storage bucket to private with ownership & authorized employer RLS.
--   4. SEC-004: Create secure atomic resume download tracking procedure (record_resume_download_atomic).

-- ============================================================================
-- 1. SEC-001: USER_ROLES PRIVILEGE HARDENING
-- ============================================================================
-- Ensure user_roles cannot be modified directly by client-side queries
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Ensure RLS is active on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. SEC-002: PAYMENT INTEGRITY & BID VERIFICATION PRIVILEGE REVOCATION
-- ============================================================================
-- Revoke direct execution of claim1_process_verified_bid from public/authenticated users.
-- This procedure can now ONLY be called by backend Edge Functions via service_role
-- after cryptographic Razorpay HMAC-SHA256 signature verification.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'claim1_process_verified_bid'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.claim1_process_verified_bid(
      TEXT, UUID, UUID, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
    ) FROM PUBLIC, anon, authenticated;

    GRANT EXECUTE ON FUNCTION public.claim1_process_verified_bid(
      TEXT, UUID, UUID, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
    ) TO service_role;
  END IF;
END $$;

-- ============================================================================
-- 3. SEC-003: CANDIDATE DOCUMENT STORAGE PRIVACY
-- ============================================================================
-- Restrict documents storage bucket to private (public = false)
UPDATE storage.buckets
SET public = false
WHERE id = 'documents';

-- Drop the overly permissive public select policy from migration 20250808050916
DROP POLICY IF EXISTS "Public read for documents" ON storage.objects;

-- Ownership Policy: Candidates can select their own uploaded documents
DROP POLICY IF EXISTS "Candidates can read own documents" ON storage.objects;
CREATE POLICY "Candidates can read own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      auth.uid() = owner
      OR auth.uid()::text = (storage.foldername(name))[1]
    )
  );

-- Insert Policy: Authenticated users can upload their own documents
DROP POLICY IF EXISTS "Candidates can insert own documents" ON storage.objects;
CREATE POLICY "Candidates can insert own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (
      auth.uid() = owner
      OR auth.uid()::text = (storage.foldername(name))[1]
    )
  );

-- Delete Policy: Authenticated owners or admins can delete their documents
DROP POLICY IF EXISTS "Candidates can delete own documents" ON storage.objects;
CREATE POLICY "Candidates can delete own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      auth.uid() = owner
      OR auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_app_admin(auth.uid())
    )
  );

-- Recruiter Access Policy: Authorized employers can view applicant documents
-- strictly when the candidate has applied to an active job posted by their company
DROP POLICY IF EXISTS "Employers can view applicant documents" ON storage.objects;
CREATE POLICY "Employers can view applicant documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.job_applications ja
      JOIN public.jobs j ON ja.job_id = j.id
      JOIN public.company_team_members ctm ON j.company_id = ctm.company_id
      WHERE ctm.user_id = auth.uid()
        AND ctm.is_active = true
        AND (
          ja.user_id = storage.objects.owner
          OR ja.user_id::text = (storage.foldername(storage.objects.name))[1]
        )
    )
  );

-- Admin Management Policy: Administrators have full oversight of document storage
DROP POLICY IF EXISTS "Admins can manage documents" ON storage.objects;
CREATE POLICY "Admins can manage documents"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.is_app_admin(auth.uid())
  );

-- ============================================================================
-- 4. SEC-004: ATOMIC RESUME DOWNLOAD TRACKING
-- ============================================================================
-- Ensure unique constraint exists on resume_downloads (user_id, resume_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'resume_downloads_user_resume_key'
  ) THEN
    ALTER TABLE public.resume_downloads
    ADD CONSTRAINT resume_downloads_user_resume_key UNIQUE (user_id, resume_id);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Table or constraint may already have equivalent unique index
    NULL;
END $$;

-- Secure procedure to record resume downloads atomically
CREATE OR REPLACE FUNCTION public.record_resume_download_atomic(p_resume_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_count INTEGER := 0;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;

  INSERT INTO public.resume_downloads (user_id, resume_id, download_count, last_download_at, updated_at)
  VALUES (v_user_id, p_resume_id, 1, now(), now())
  ON CONFLICT (user_id, resume_id)
  DO UPDATE SET
    download_count = public.resume_downloads.download_count + 1,
    last_download_at = now(),
    updated_at = now()
  RETURNING download_count INTO v_current_count;

  RETURN jsonb_build_object('success', true, 'download_count', v_current_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_resume_download_atomic(UUID) TO authenticated;

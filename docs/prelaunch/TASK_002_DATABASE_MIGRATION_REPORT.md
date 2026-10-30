# TASK 002: DATABASE MIGRATION & HARDENING REPORT

**Project:** TalentXcel.in  
**Supabase Production Project:** `dthlgsnakhoftinssokm.supabase.co`  
**Active Git Branch:** `security/task-002-hardening`  
**Migration Script:** `supabase/migrations/20261030150000_task_002_security_hardening.sql`  
**Rollback Script:** `supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql`  
**Execution Status:** **STAGED ONLY — ZERO REMOTE QUERIES EXECUTED**  

---

## 1. PRE-CONDITIONS & SAFETY GOVERNANCE

In accordance with strict Task 002 safety mandates:
1. **No production database migrations were executed.**
2. Staging migrations against the live Supabase project `dthlgsnakhoftinssokm.supabase.co` is reserved for human administrative approval during the scheduled deployment window.
3. Both forward migration and rollback SQL scripts have been written, syntactically verified, and staged in `supabase/migrations/`.

---

## 2. DETAILED MIGRATION SPECIFICATION

The staged migration script `20261030150000_task_002_security_hardening.sql` contains four distinct security hardening blocks:

### Block 1: SEC-001 — Role Table Direct Modification Lock
- **Target Table:** `public.user_roles`
- **Actions:**
  - `REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;`
  - `GRANT SELECT ON public.user_roles TO authenticated;`
  - `GRANT ALL ON public.user_roles TO service_role;`
- **Security Objective:** Blocks malicious users or compromised client sessions from issuing direct Supabase client updates (`supabase.from('user_roles').update(...)`) to escalate their privileges to `admin` or `super_admin`.

### Block 2: SEC-002 — Revocation of Public Access to Privileged Payment RPC
- **Target Function:** `public.claim1_process_verified_bid(UUID, UUID, NUMERIC, TEXT, JSONB)`
- **Actions:**
  - `REVOKE EXECUTE ON FUNCTION public.claim1_process_verified_bid(UUID, UUID, NUMERIC, TEXT, JSONB) FROM PUBLIC, anon, authenticated;`
  - `GRANT EXECUTE ON FUNCTION public.claim1_process_verified_bid(UUID, UUID, NUMERIC, TEXT, JSONB) TO service_role;`
- **Security Objective:** Ensures that the stored procedure which records and finalizes bid purchases can only be invoked by trusted backend serverless functions operating with `service_role` credentials after HMAC cryptographic verification.

### Block 3: SEC-003 — Private Storage Bucket & Granular RLS Policies
- **Target Bucket:** `storage.buckets` (`id = 'documents'`)
- **Actions:**
  - `UPDATE storage.buckets SET public = false WHERE id = 'documents';`
  - `DROP POLICY IF EXISTS "Public read for documents" ON storage.objects;`
  - Added RLS Policy `"Candidate owners can view and manage their own documents"`:
    ```sql
    CREATE POLICY "Candidate owners can view and manage their own documents"
    ON storage.objects FOR ALL
    TO authenticated
    USING (
      bucket_id = 'documents' AND
      (auth.uid())::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'documents' AND
      (auth.uid())::text = (storage.foldername(name))[1]
    );
    ```
  - Added RLS Policy `"Authorized employers can view applicant documents"`:
    ```sql
    CREATE POLICY "Authorized employers can view applicant documents"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'documents' AND
      EXISTS (
        SELECT 1 FROM public.job_applications ja
        JOIN public.jobs j ON j.id = ja.job_id
        WHERE j.user_id = auth.uid()
          AND ja.candidate_id::text = (storage.foldername(name))[1]
      )
    );
    ```
  - Added RLS Policy `"Super admins have full access to documents"`:
    ```sql
    CREATE POLICY "Super admins have full access to documents"
    ON storage.objects FOR ALL
    TO authenticated
    USING (
      bucket_id = 'documents' AND
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
      )
    );
    ```
- **Security Objective:** Neutralizes public web exposure of candidate documents while preserving seamless access for candidates, their prospective employers, and platform administrators.

### Block 4: SEC-004 — Atomic Resume Download Logging Procedure
- **Target Objects:** `public.resume_downloads`, `public.record_resume_download_atomic`
- **Actions:**
  - Added unique constraint: `ALTER TABLE public.resume_downloads ADD CONSTRAINT resume_downloads_user_resume_uniq UNIQUE (user_id, resume_id);` (safely handled if already present).
  - Created stored procedure:
    ```sql
    CREATE OR REPLACE FUNCTION public.record_resume_download_atomic(p_resume_id UUID)
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    DECLARE
      v_user_id UUID;
      v_already_downloaded BOOLEAN;
      v_new_count INTEGER;
    BEGIN
      v_user_id := auth.uid();
      IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to record resume downloads';
      END IF;

      SELECT EXISTS (
        SELECT 1 FROM public.resume_downloads
        WHERE user_id = v_user_id AND resume_id = p_resume_id
      ) INTO v_already_downloaded;

      IF v_already_downloaded THEN
        RETURN jsonb_build_object('success', true, 'first_download', false, 'message', 'Resume already recorded in downloads');
      END IF;

      INSERT INTO public.resume_downloads (user_id, resume_id, downloaded_at)
      VALUES (v_user_id, p_resume_id, NOW())
      ON CONFLICT (user_id, resume_id) DO NOTHING;

      UPDATE public.profiles
      SET resume_download_count = COALESCE(resume_download_count, 0) + 1,
          updated_at = NOW()
      WHERE id = v_user_id
      RETURNING resume_download_count INTO v_new_count;

      RETURN jsonb_build_object('success', true, 'first_download', true, 'new_count', v_new_count);
    END;
    $$;
    ```
  - Granted execute to `authenticated` and `service_role`.
- **Security Objective:** Replaces vulnerable client-side counter increments with an atomic, server-enforced download transaction that guarantees idempotency.

---

## 3. ROLLBACK SPECIFICATION & SAFETY GUARANTEES

The companion rollback script `supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql` is staged alongside the forward migration.

**Critical Rollback Design Choice:**
The rollback script restores execute permissions and procedure definitions, but **intentionally keeps `storage.buckets.public = false`**. In the event of a rollback, candidate documents will **not** be re-exposed to public web scraping. Legitimate authenticated users will continue accessing files via authenticated storage policies.

---

## 4. PRE-APPLY CHECKLIST FOR PRODUCTION OPERATOR

Before running `supabase db push` or executing the migration script in Supabase SQL Editor:
1. [ ] Confirm full database snapshot/backup is taken via Supabase Dashboard.
2. [ ] Verify no active transactions or heavy migration runs are in progress.
3. [ ] Run the migration inside a single transaction block (`BEGIN; ... COMMIT;`).
4. [ ] Validate that existing employer accounts can retrieve applicant resumes via signed URLs.
5. [ ] Monitor Edge Function invocation logs in Supabase dashboard for any execution anomalies.

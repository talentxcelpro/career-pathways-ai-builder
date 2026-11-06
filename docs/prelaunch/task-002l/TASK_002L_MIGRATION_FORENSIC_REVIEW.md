# TALENTXCEL.IN — TASK 002L MIGRATION FORENSIC REVIEW
## DEEP DDL, DML, RPC & POLICY AUDIT

**Target:** TalentXcel.in exclusively  
**Mission ID:** `TXC-SEC-002L`  
**Repository:** `talentxcelpro/career-pathways-ai-builder`  
**Inspected Directory:** `supabase/migrations/`  
**Database Architecture Target:** PostgreSQL 17.11 (Supabase Managed Engine)  
**Forensic Review Date:** 2026-11-03T07:30:00+05:30

---

### 1. Migration Inventory & Execution Sequence

| Sequence | Migration File | Target Scope | Dependency Prerequisites | Idempotency Safeguards |
|---|---|---|---|---|
| **01** | `20261030150000_task_002_security_hardening.sql` | SEC-001 (Roles), SEC-002 (Bids), SEC-003 (Storage), SEC-004 (Downloads), SEC-010 (Rate Limiting) | Tables: `user_roles`, `resume_downloads`, `storage.objects`, `jobs`, `job_applications`, `company_team_members`. | `DROP POLICY IF EXISTS`, `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `DO $$ BEGIN IF EXISTS ...`. |
| **02** | `20261102160000_fix_candidate_storage_update_policy.sql` | SEC-003 / Task 002I (Storage UPDATE & Strict Folder Isolation) | Sequence 01; bucket `documents` existing; `storage.foldername` helper. | `DROP POLICY IF EXISTS` before `CREATE POLICY`. |
| **Rollback** | `20261030150000_task_002_security_hardening_rollback.sql` | Reversal of Sequence 01 objects | Deployed Sequence 01 | `DROP FUNCTION IF EXISTS`, `DROP TABLE IF EXISTS`, `DROP POLICY IF EXISTS`. |

---

### 2. Migration 1: Deep Statement Forensic Analysis
**File:** `supabase/migrations/20261030150000_task_002_security_hardening.sql` (303 lines)

#### 2.1 SEC-001: User Role Privilege Hardening
- **SQL Statements:**
  ```sql
  REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
  GRANT SELECT ON public.user_roles TO authenticated;
  GRANT ALL ON public.user_roles TO service_role;
  ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
  ```
- **Operations:** `REVOKE`, `GRANT`, `ALTER TABLE`.
- **Target Table:** `public.user_roles`
- **Security Invariant:** Eliminates client-side privilege escalation. Authenticated users and anonymous callers have zero write access. All role assignments must occur via backend service-role procedures or triggers.
- **Data Impact:** Non-destructive. Existing role mappings (`user_id`, `role`) remain intact.

#### 2.2 SEC-002: Bid Verification Execution Revocation
- **SQL Statements:**
  ```sql
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
  ```
- **Operations:** Dynamic PL/pgSQL block, `REVOKE EXECUTE`, `GRANT EXECUTE`.
- **Target Function:** `public.claim1_process_verified_bid(TEXT, UUID, UUID, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB)`
- **Security Invariant:** Prevents client-side payment forgery. The bid settlement procedure can only be executed by Edge Functions with service-role privileges after verifying the HMAC-SHA256 signature from Razorpay.
- **Idempotency:** Guarded by `IF EXISTS` metadata check.

#### 2.3 SEC-003: Storage Bucket Privacy & RLS Policies
- **SQL Statements:**
  ```sql
  UPDATE storage.buckets SET public = false WHERE id = 'documents';
  DROP POLICY IF EXISTS "Public read for documents" ON storage.objects;
  DROP POLICY IF EXISTS "Candidates can read own documents" ON storage.objects;
  CREATE POLICY "Candidates can read own documents" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'documents' AND (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1]));
  DROP POLICY IF EXISTS "Candidates can insert own documents" ON storage.objects;
  CREATE POLICY "Candidates can insert own documents" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'documents' AND (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1]));
  DROP POLICY IF EXISTS "Candidates can delete own documents" ON storage.objects;
  CREATE POLICY "Candidates can delete own documents" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'documents' AND (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1] OR public.is_app_admin(auth.uid())));
  DROP POLICY IF EXISTS "Employers can view applicant documents" ON storage.objects;
  CREATE POLICY "Employers can view applicant documents" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'documents' AND EXISTS (...));
  DROP POLICY IF EXISTS "Admins can manage documents" ON storage.objects;
  CREATE POLICY "Admins can manage documents" ON storage.objects FOR ALL TO authenticated
    USING (bucket_id = 'documents' AND public.is_app_admin(auth.uid()));
  ```
- **Operations:** `UPDATE`, `DROP POLICY`, `CREATE POLICY`.
- **Target Table:** `storage.objects` (bucket: `documents`).
- **Security Invariant:** Reverses legacy public bucket exposure. Unauthenticated access is completely rejected. Recruiters can only access documents of candidates who have actively submitted a job application to their company.

#### 2.4 SEC-004: Atomic Resume Download Accounting
- **SQL Statements:**
  ```sql
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resume_downloads_user_resume_key') THEN
      ALTER TABLE public.resume_downloads ADD CONSTRAINT resume_downloads_user_resume_key UNIQUE (user_id, resume_id);
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL;
  END $$;

  CREATE OR REPLACE FUNCTION public.record_resume_download_atomic(p_resume_id UUID)
  RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
  ...
  INSERT INTO public.resume_downloads (user_id, resume_id, download_count, last_download_at, updated_at)
  VALUES (v_user_id, p_resume_id, 1, now(), now())
  ON CONFLICT (user_id, resume_id) DO UPDATE SET ...
  $$;
  GRANT EXECUTE ON FUNCTION public.record_resume_download_atomic(UUID) TO authenticated;
  ```
- **Operations:** Constraint creation, `CREATE OR REPLACE FUNCTION`, `GRANT EXECUTE`.
- **Target Object:** `public.record_resume_download_atomic(UUID)`
- **Security Invariant:** Replaces client-side counter increments with an atomic database UPSERT. Protected against concurrency race conditions via PostgreSQL row locking. Search path explicitly locked to `public`.

#### 2.5 SEC-010: Distributed Persistent Rate Limiting Engine
- **SQL Statements:**
  ```sql
  CREATE TABLE IF NOT EXISTS public.edge_rate_limits (
      rate_key TEXT PRIMARY KEY,
      endpoint TEXT NOT NULL,
      request_count INT NOT NULL DEFAULT 1,
      window_start TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
  );
  CREATE INDEX IF NOT EXISTS idx_edge_rate_limits_expires_at ON public.edge_rate_limits(expires_at);
  ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.edge_rate_limits FROM PUBLIC, anon, authenticated;
  GRANT ALL ON public.edge_rate_limits TO service_role;

  CREATE OR REPLACE FUNCTION public.check_rate_limit(
      p_rate_key TEXT,
      p_endpoint TEXT,
      p_max_requests INT,
      p_window_seconds INT
  ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  ...
  INSERT INTO public.edge_rate_limits ... ON CONFLICT (rate_key) DO UPDATE ...
  $$;
  REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
  GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INT, INT) TO service_role;
  ```
- **Operations:** `CREATE TABLE`, `CREATE INDEX`, `ALTER TABLE`, `REVOKE`, `GRANT`, `CREATE OR REPLACE FUNCTION`.
- **Target Table:** `public.edge_rate_limits`
- **Target Function:** `public.check_rate_limit(TEXT, TEXT, INT, INT)`
- **Security Invariant:** Provides shared multi-isolate persistent rate limiting across global Edge Function instances. Table and function access is strictly restricted to `service_role`. Search path locked to `public, pg_temp`.

---

### 3. Migration 2: Candidate Storage Upsert Remediation
**File:** `supabase/migrations/20261102160000_fix_candidate_storage_update_policy.sql` (56 lines)

#### 3.1 Problem Solved
Task 002H identified that when candidates attempted to replace/upsert their existing CV (`upsert: true`), Supabase Storage executed a SQL `UPDATE` against `storage.objects`. Because Migration 1 only provided `SELECT`, `INSERT`, and `DELETE` policies, the candidate's upsert was rejected with an RLS policy violation.

#### 3.2 SQL Operations
```sql
-- 1. Tighten INSERT policy to enforce folder isolation
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

-- 2. Implement matching UPDATE policy
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
```
- **Security Invariant:** 
  1. Candidate can insert and update ONLY in their own folder (`auth.uid()::text = (storage.foldername(name))[1]`).
  2. Candidate cannot upload, replace, or insert into another candidate's folder.
  3. Candidate cannot change document ownership to another user.
  4. Candidate cannot move documents between folders.
  5. Unauthenticated users (anon) have zero permissions.
  6. Enables seamless CV document replacement without RLS violations.

---

### 4. Database Function Name Reconciliation

| Documentation String | Actual SQL Function Name | Parameters | Return Type | Existence Verified |
|---|---|---|---|---|
| `check_edge_rate_limit` | **DOES NOT EXIST** | N/A | N/A | Informal documentation alias. |
| `check_rate_limit` | `public.check_rate_limit` | `(TEXT, TEXT, INT, INT)` | `JSONB` | **CONFIRMED IN SQL & STAGING** |
| `record_resume_download_atomic` | `public.record_resume_download_atomic` | `(UUID)` | `JSONB` | **CONFIRMED IN SQL & STAGING** |
| `is_app_admin` | `public.is_app_admin` | `(UUID)` | `BOOLEAN` | **CONFIRMED IN SQL & STAGING** |
| `claim1_process_verified_bid` | `public.claim1_process_verified_bid` | `(TEXT, UUID, UUID, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB)` | `JSONB` | **CONFIRMED IN SQL** |

---

### 5. Rollback Gap Analysis & Reversal Procedure

#### 5.1 Identified Gap in Migration 1 Rollback Script
The file `20261030150000_task_002_security_hardening_rollback.sql` contains:
```sql
DROP FUNCTION IF EXISTS public.record_resume_download_atomic(UUID);
DROP FUNCTION IF EXISTS public.check_rate_limit(TEXT, TEXT, INT, INT);
DROP TABLE IF EXISTS public.edge_rate_limits;
DROP POLICY IF EXISTS "Admins can manage documents" ON storage.objects;
DROP POLICY IF EXISTS "Employers can view applicant documents" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can insert own documents" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can read own documents" ON storage.objects;
```
**GAP IDENTIFIED:** It does **NOT** drop `"Candidates can update own documents"` installed by Migration 2. If executed after both migrations, an orphan UPDATE policy remains on `storage.objects`.

#### 5.2 Canonical Complete Rollback Sequence
In the event of a production rollback, the operator must execute the two-step rollback sequence:

**Step 1: Reversal of Migration 2 Objects**
```sql
DROP POLICY IF EXISTS "Candidates can update own documents" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can insert own documents" ON storage.objects;
```

**Step 2: Execution of Migration 1 Rollback Script**
Apply `supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql`.

#### 5.3 Intentional Non-Reversals
1. **Documents Bucket Privacy (`public = false`):** The rollback script deliberately leaves `documents` private to prevent data exposure.
2. **User Roles Revocation:** Does NOT restore direct `INSERT/UPDATE/DELETE` on `user_roles` to client roles (`anon`/`authenticated`).
3. **Bid Verification Revocation:** Does NOT restore direct client execution on `claim1_process_verified_bid`.

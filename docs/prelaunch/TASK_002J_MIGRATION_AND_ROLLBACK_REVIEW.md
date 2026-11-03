# TASK 002J — MIGRATION AND ROLLBACK REVIEW

**Target Application:** TalentXcel.in  
**Evaluation Mode:** Independent Database DDL & Operational Audit  
**Status:** MIGRATIONS AUDITED — ROLLBACK PROCEDURES VERIFIED  

---

## 1. MIGRATION INVENTORY & EXECUTION SEQUENCE

Task 002 introduces two forward migrations and one dedicated rollback migration:

| Sequence | Migration File Name | Purpose & Security Scope | Dependency | Idempotency Safeguards |
| :---: | :--- | :--- | :--- | :--- |
| **1** | [`supabase/migrations/20261030150000_task_002_security_hardening.sql`](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/migrations/20261030150000_task_002_security_hardening.sql) | Core security baseline: RLS, admin privilege revocation, bucket privatization, atomic resume downloads, persistent rate limits | Existing Supabase schema | `DROP POLICY IF EXISTS`, `CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION` |
| **2** | [`supabase/migrations/20261102160000_fix_candidate_storage_update_policy.sql`](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/migrations/20261102160000_fix_candidate_storage_update_policy.sql) | Candidate document upsert remediation: Tightens INSERT policy and implements UPDATE policy with folder confinement | Follows `20261030150000` | `DROP POLICY IF EXISTS`, dual `USING` / `WITH CHECK` clauses |
| **Rollback** | [`supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql`](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql) | Atomic reversion script for `20261030150000` | Target rollback state | Reinstates previous grants and policies safely |

---

## 2. DATABASE DEFENSE IN-DEPTH INSPECTION

### 2.1 Function Search Path Injection Defense
- **Vulnerability:** Unanchored `SECURITY DEFINER` functions can be hijacked by malicious search paths.
- **Audit Finding:** All routines declared in Task 002 migrations explicitly enforce `SET search_path = public`:
  - `public.is_app_admin(UUID)`: `SET search_path = public`
  - `public.record_resume_download_atomic(UUID)`: `SET search_path = public`
  - `public.check_edge_rate_limit(TEXT, INT, INT)`: `SET search_path = public`
- **Result:** Immune to search path manipulation.

### 2.2 Table-Level Access Control & Grant Boundaries
- Write access on `public.user_roles` revoked from `anon` and `authenticated`:
  ```sql
  REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
  GRANT SELECT ON public.user_roles TO authenticated;
  ```
- Direct execution on `claim1_process_verified_bid` revoked from client roles:
  ```sql
  REVOKE EXECUTE ON FUNCTION public.claim1_process_verified_bid FROM PUBLIC, anon, authenticated;
  GRANT EXECUTE ON FUNCTION public.claim1_process_verified_bid TO service_role;
  ```
- Persistent rate limits table `public.edge_rate_limits` access:
  ```sql
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.edge_rate_limits TO service_role;
  REVOKE ALL ON public.edge_rate_limits FROM anon, authenticated;
  ```

---

## 3. ROLLBACK PROCEDURES & IDEMPOTENCY

### 3.1 Migration Idempotency
- All `CREATE POLICY` statements are preceded by `DROP POLICY IF EXISTS`.
- All `CREATE TABLE` statements utilize `IF NOT EXISTS`.
- Stored procedures use `CREATE OR REPLACE FUNCTION`.
- Constraint additions check `pg_constraint` existence before executing `ALTER TABLE`.
- **Verdict:** Re-applying the migrations against an existing schema is safe and idempotent.

### 3.2 Rollback Execution Plan
In the event that production deployment necessitates an immediate rollback:
1. **Revert Candidate Upsert Policy:**
   ```sql
   DROP POLICY IF EXISTS "Candidates can update own documents" ON storage.objects;
   DROP POLICY IF EXISTS "Candidates can insert own documents" ON storage.objects;
   CREATE POLICY "Candidates can insert own documents" ON storage.objects FOR INSERT TO authenticated
     WITH CHECK (bucket_id = 'documents' AND (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1]));
   ```
2. **Revert Security Hardening Baseline:**
   Execute [`supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql`](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql):
   - Restores previous `claim1_process_verified_bid` execution grants.
   - Restores legacy `documents` storage policies.
   - Cleans up `public.edge_rate_limits` and `check_edge_rate_limit`.

---

## 4. IMPACT ASSESSMENT ON EXISTING PRODUCTION DATA

- **Zero Data Deletion:** Neither migration executes `DROP TABLE`, `TRUNCATE`, or `DROP COLUMN`.
- **Zero Schema Breaking Changes:** No existing table columns in `public` were renamed or modified.
- **Candidate Documents:** Existing objects in `storage.objects` inside the `documents` bucket retain their owners and paths. The UPDATE policy enables candidates to overwrite their existing documents without corrupting historical records.
- **Rate Limiting:** Table `edge_rate_limits` is a net-new operational table. Zero impact on customer records.

---

## 5. PRODUCTION DEPLOYMENT PROTOCOL & PRE-REQUISITES

Before executing migrations against production Supabase (`dthlgsnakhoftinssokm`):
1. **Snapshot Database:** Trigger a full manual PostgreSQL snapshot in the Supabase Dashboard.
2. **Verify Required Secrets:**
   - `RAZORPAY_KEY_ID` (Production key)
   - `RAZORPAY_KEY_SECRET` (Production secret)
   - `RAZORPAY_WEBHOOK_SECRET` (Production webhook secret)
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
3. **Execution Mode:** Apply migrations sequentially using transactional DDL (`BEGIN; ... COMMIT;`).

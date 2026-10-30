# TASK 002E: STAGING DATABASE MIGRATION READINESS & EXECUTION PROTOCOL

**Target System:** TalentXcel.in  
**Repository:** `career-pathways-ai-builder`  
**Branch:** `security/task-002-hardening`  
**Migration File:** `supabase/migrations/20261030150000_task_002_security_hardening.sql`  
**Rollback File:** `supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql`  
**Target Environment:** Staging Supabase PostgreSQL  
**Audit Timestamp:** 2026-10-30  
**Status:** **`STAGING READY`**  

---

## 1. MIGRATION SCOPE & SYNTACTIC VALIDATION

The staged migration `20261030150000_task_002_security_hardening.sql` encapsulates all required access-control, RPC privilege, storage bucket, and rate limiting hardening:

| Section # | Finding ID | Scope Description | Target Database Objects |
| :--- | :--- | :--- | :--- |
| **Section 1** | **SEC-001** | User Roles Privilege Hardening | `public.user_roles` (REVOKE INSERT/UPDATE/DELETE from anon, authenticated) |
| **Section 2** | **SEC-002** | Bid Verification Privilege Revocation | `public.claim1_process_verified_bid` (REVOKE EXECUTE from PUBLIC, anon, authenticated; GRANT to service_role) |
| **Section 3** | **SEC-003** | Candidate Document Storage Privacy | `storage.buckets` (`documents` public=false), `storage.objects` RLS policies |
| **Section 4** | **SEC-004** | Atomic Resume Download Tracking | `public.resume_downloads` constraint, `public.record_resume_download_atomic` procedure |
| **Section 5** | **SEC-010** | Distributed Persistent Rate Limiting | `public.edge_rate_limits` table & index, `public.check_rate_limit` procedure |

### 1.1 Syntactic and Semantic Verification
1. **Idempotency & Re-entrancy:**
   - Every statement uses `IF EXISTS`, `IF NOT EXISTS`, `CREATE OR REPLACE`, or conditional `DO $$ ... END $$;` blocks to prevent aborting on re-execution.
2. **Schema Reference Validation:**
   - Verified that referenced tables exist in the schema: `public.user_roles`, `public.job_applications`, `public.jobs`, `public.company_team_members`, `public.resume_downloads`, and `storage.objects`.
3. **Least Privilege Enforcement:**
   - Public and client-authenticated execution privileges are revoked for sensitive administrative and financial procedures.
   - All newly created tables (`edge_rate_limits`) have RLS enabled with `REVOKE ALL` from unprivileged roles.

---

## 2. TRANSACTION BEHAVIOUR & ROLLBACK LIMITATIONS

### 2.1 Transactional DDL Compatibility
PostgreSQL natively supports transactional DDL. In Supabase PostgreSQL, table creation, index creation, procedure definition, and permission grants/revokes can execute atomically inside an explicit `BEGIN ... COMMIT` block.

```sql
BEGIN;

-- Run 20261030150000_task_002_security_hardening.sql contents

COMMIT;
```

### 2.2 Rollback Script Analysis (`20261030150000_task_002_security_hardening_rollback.sql`)
1. **Reversible Objects:**
   - Procedures (`record_resume_download_atomic`, `check_rate_limit`) can be dropped cleanly via `DROP FUNCTION IF EXISTS`.
   - Table `edge_rate_limits` can be dropped cleanly via `DROP TABLE IF EXISTS`.
   - Newly added storage RLS policies can be removed via `DROP POLICY IF EXISTS`.
2. **Irreversible / Non-Restored Elements by Design (Safety Directive):**
   - **`storage.buckets.public`:** The rollback script intentionally does **NOT** restore `public = true` on the `documents` bucket. Re-exposing candidate CVs to the public internet upon rollback would constitute a severe data privacy violation.
   - **`claim1_process_verified_bid`:** Direct execution by `authenticated` is **NOT** re-granted in production. If local development testing requires direct RPC execution, commented instructions are provided for developers to execute manually.

---

## 3. STAGING EXECUTION PLAN & PROTOCOL

### Phase 1: Pre-Execution Environment Verification
Before applying the migration to the staging database:
1. Verify database connection string and target instance reference (`db.<project-ref>.supabase.co`).
2. Execute a pre-flight schema snapshot to verify that existing tables and columns match expected types.
3. Confirm that no active transactions or heavy migrations are locking `storage.objects` or `user_roles`.

### Phase 2: Transactional Execution
Execute the migration script wrapped in an explicit transaction block:
```bash
# Using Supabase CLI (Staging Linked Project)
supabase db push --include-all

# Or via direct psql session:
psql "$STAGING_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261030150000_task_002_security_hardening.sql
```

### Phase 3: Post-Execution Verification Checklist
Execute the following verification queries immediately after migration:

#### Check 1: Verify `documents` Bucket is Private (SEC-003)
```sql
SELECT id, name, public, created_at, updated_at 
FROM storage.buckets 
WHERE id = 'documents';
-- Expected: public = false
```

#### Check 2: Verify `user_roles` Privilege Revocation (SEC-001)
```sql
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'user_roles' AND grantee IN ('anon', 'authenticated');
-- Expected: Only SELECT privilege granted to authenticated; zero INSERT/UPDATE/DELETE.
```

#### Check 3: Verify `claim1_process_verified_bid` Privileges (SEC-002)
```sql
SELECT grantee, routine_name, privilege_type 
FROM information_schema.routine_privileges 
WHERE routine_name = 'claim1_process_verified_bid';
-- Expected: Only service_role and postgres have EXECUTE; zero grants to PUBLIC, anon, authenticated.
```

#### Check 4: Verify `edge_rate_limits` Table and RLS (SEC-010)
```sql
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'edge_rate_limits';
-- Expected: relrowsecurity = true
```

#### Check 5: Verify Atomic Rate Limiter Procedure Execution (SEC-010)
```sql
-- Test invocation as service_role
SELECT public.check_rate_limit(
    'test_staging_verification_key',
    'staging-test',
    5,
    60
);
-- Expected: {"allowed": true, "remaining": 4, "reset_seconds": 60, "current_count": 1}
```

---

## 4. ISOLATED STAGING ENVIRONMENT SETUP REQUIREMENTS

To prevent synthetic testing or staging operations from polluting the production database (`dthlgsnakhoftinssokm.supabase.co`), an isolated staging project must be configured prior to initiating Task 003:

### Required Staging Infrastructure:
1. **Dedicated Staging Supabase Project:**
   - Create staging project `talentxcel-staging` (e.g. `xyz...supabase.co`).
   - Clone schema definitions from `supabase/migrations/`.
2. **Dedicated Staging Environment Variables:**
   - `VITE_SUPABASE_URL`: Point to staging Supabase instance.
   - `VITE_SUPABASE_ANON_KEY`: Point to staging anon key.
   - `SUPABASE_SERVICE_ROLE_KEY`: Configured in staging Edge Functions.
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`: Point to Razorpay Test Mode keys (`rzp_test_*`).
   - `ENVIRONMENT`: Set to `"staging"`.
   - `ALLOW_DEMO_PAYMENTS`: Set to `"false"` (to enforce authentic test-gateway verification).
3. **Synthetic User Data Tagging Regime:**
   - For all synthetic candidates and job applications generated during testing:
     - Mark rows with `is_synthetic = true`.
     - Assign session tag `synthetic_run_id = '<UUID>'`.
     - Automated teardown scripts will query and delete records by `synthetic_run_id` upon run completion.

---

## 5. CONCLUSION

The database migration and rollback assets are fully verified, syntactically validated, and ready for execution in the staging environment.

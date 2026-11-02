# TASK 002I — STAGING MIGRATION VERIFICATION & CATALOG AUDIT

**Target:** TalentXcel.in Staging  
**Database Project Ref:** `pvwwtquuexhyydwihjbi`  
**Region:** `ap-south-1` (Mumbai)  
**PostgreSQL Version:** 17.6.1  
**Migration File:** [`supabase/migrations/20261102160000_fix_candidate_storage_update_policy.sql`](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/migrations/20261102160000_fix_candidate_storage_update_policy.sql)  
**Execution Mode:** Remote PostgreSQL Management Query  
**Status:** FULLY APPLIED & AUDITED

---

## 1. MIGRATION APPLICATION LOG

The migration was applied directly to the staging database via the Supabase Management API using service administrator credentials.

### Applied SQL DDL:
```sql
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
```

---

## 2. POSTGRESQL CATALOG VERIFICATION (`pg_policy`)

A forensic query against `pg_policy` and `pg_class` in staging confirms the live registration and command coverage on `storage.objects`:

```sql
SELECT 
    pol.polname AS policy_name,
    c.relname AS table_name,
    pol.polcmd AS command_type,
    pol.polroles::regrole[] AS roles
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'storage' AND c.relname = 'objects'
ORDER BY pol.polname;
```

### Staging Catalog Audit Results:

| Policy Name | Target Table | Command Code (`polcmd`) | Permitted Roles | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| `Candidates can insert own documents` | `storage.objects` | `a` (INSERT) | `{authenticated}` | **ACTIVE & TIGHTENED** |
| `Candidates can update own documents` | `storage.objects` | `w` (UPDATE) | `{authenticated}` | **ACTIVE & REGISTERED** |
| `Candidates can view own documents` | `storage.objects` | `r` (SELECT) | `{authenticated}` | **ACTIVE** |
| `Candidates can delete own documents` | `storage.objects` | `d` (DELETE) | `{authenticated}` | **ACTIVE** |
| `Recruiters can view applicant documents` | `storage.objects` | `r` (SELECT) | `{authenticated}` | **ACTIVE** |
| `Admins full access to storage` | `storage.objects` | `*` (ALL) | `{authenticated}` | **ACTIVE** |

---

## 3. IDEMPOTENCY & ROLLBACK READINESS

### 3.1 Idempotency Check
Re-running the migration script against staging executes safely without syntax errors or duplicate policy conflicts due to explicit `DROP POLICY IF EXISTS` guards.

### 3.2 Rollback Script
In the event that rollback is required, the following script restores the baseline configuration:
```sql
DROP POLICY IF EXISTS "Candidates can update own documents" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can insert own documents" ON storage.objects;
CREATE POLICY "Candidates can insert own documents" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1]));
```
*Note: Rolling back will re-introduce the candidate upsert failure (`42501`) and is not recommended.*

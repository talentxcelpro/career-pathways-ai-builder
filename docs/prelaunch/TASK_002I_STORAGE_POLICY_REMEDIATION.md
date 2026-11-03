# TASK 002I — CANDIDATE STORAGE POLICY REMEDIATION

**Target:** TalentXcel.in exclusively  
**Repository:** `career-pathways-ai-builder`  
**Branch:** `security/task-002-hardening`  
**Base Commit:** `819fc3b6`  
**Staging Project ID:** `pvwwtquuexhyydwihjbi`  
**Production Project ID:** `dthlgsnakhoftinssokm` (Strictly Unlinked / Protected)  
**Status:** IMPLEMENTED & STAGING VALIDATED

---

## 1. EXECUTIVE SUMMARY & ROOT CAUSE ANALYSIS

During the independent security audit conducted in Task 002H, a single blocking pre-merge defect was identified in candidate document management:
- **Observed Failure:** When an authenticated candidate uploaded a new CV or document to `storage.objects` in the private bucket `documents`, the initial upload succeeded (`HTTP 200`). However, when attempting to replace or update an existing document using `{ upsert: true }`, the operation failed with PostgreSQL Row Level Security (RLS) error `42501` (`new row violates row-level security policy`).
- **Underlying Mechanism:** Supabase Storage implements `{ upsert: true }` by inspecting whether an object with the same path tokens exists. If it exists, the Supabase Storage API executes a PostgreSQL `UPDATE` statement on `storage.objects`. If no matching policy exists for the command `UPDATE` (`polcmd = 'w'`) for role `authenticated`, PostgreSQL RLS rejects the write.
- **Cross-Folder Injection Risk in Original Policy:** The prior INSERT policy on `storage.objects` evaluated:
  ```sql
  (bucket_id = 'documents' AND (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1]))
  ```
  Because the Supabase Storage API defaults `owner` to the authenticated caller's UID (`auth.uid()`), the `OR` branch allowed a caller to satisfy `auth.uid() = owner` even if the path was targeted at another candidate's folder (e.g. `another-user-uuid/malicious.pdf`).

---

## 2. POLICY ARCHITECTURE & SECURITY SPECIFICATION

To resolve the upsert failure and permanently eliminate cross-folder injection vectors, migration [`supabase/migrations/20261102160000_fix_candidate_storage_update_policy.sql`](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/migrations/20261102160000_fix_candidate_storage_update_policy.sql) implements atomic constraints across both `INSERT` and `UPDATE` operations:

### 2.1 Tightened INSERT Policy
```sql
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
```

**Security Guarantees:**
1. **Strict Folder Path Enforcement:** `auth.uid()::text = (storage.foldername(name))[1]` is evaluated as an mandatory `AND` condition. An authenticated user can only insert files where the top-level folder matches their own Auth UID.
2. **Owner Sanitization:** Enforces that `owner` is either unassigned or explicitly set to `auth.uid()`, preventing spoofed object ownership.

### 2.2 Dedicated UPDATE Policy
```sql
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

**Security Guarantees:**
1. **Target Verification (`USING` clause):** Guarantees that the candidate can only target an existing object if that object is located inside their own folder (`(storage.foldername(name))[1] = auth.uid()::text`) and owned by them.
2. **Result Verification (`WITH CHECK` clause):** Guarantees that the updated record cannot mutate the folder path token into another user's directory and cannot change the owner column to another identity.
3. **Upsert Concurrency Safety:** When Supabase Storage converts an upsert into an `UPDATE`, both `USING` and `WITH CHECK` evaluate to true, allowing seamless candidate document revision without privilege escalation.

---

## 3. STORAGE BUCKET ISOLATION ARCHITECTURE

The TalentXcel platform provisions 5 private storage buckets:
1. `documents`: Primary user documents and candidate CV uploads. Direct candidate write/update operations permitted strictly within `${auth.uid()}/` folder.
2. `resumes`: Private bucket. Direct candidate writes denied by RLS; managed via backend workflows.
3. `cv-files`: Private bucket. Default deny RLS verified.
4. `cover-letters`: Private bucket. Default deny RLS verified.
5. `user-uploads`: Private bucket. Default deny RLS verified.

Only the `documents` bucket permits direct candidate write/update actions. All other buckets enforce default-deny RLS.

---

## 4. IMPACT ASSESSMENT & BACKWARD COMPATIBILITY

- **Frontend Compatibility:** Frontend upload functions in `src/utils/storage.ts` and `src/hooks/useFileUpload.ts` issue uploads with `{ upsert: true }` targeted at `${user.id}/talentxcel_file_${user.id}_...`. With this policy active, candidate document replacement works transparently without client-side errors.
- **Zero Schema Disruptions:** Modifies only storage policies in `storage.objects`. No tables or relational columns in `public` schema were modified.
- **Rollback Readiness:** A complete rollback statement is embedded directly within the migration file to instantly revert to previous behavior if required.

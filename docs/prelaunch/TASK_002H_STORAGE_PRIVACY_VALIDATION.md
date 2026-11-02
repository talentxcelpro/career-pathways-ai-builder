# TALENTXCEL.IN — TASK 002H
## STORAGE PRIVACY & MULTI-TENANCY ISOLATION AUDIT REPORT

**Target Application:** TalentXcel.in  
**Repository:** `talentxcelpro/career-pathways-ai-builder`  
**Active Branch:** `security/task-002-hardening`  
**Base Commit on main:** `819fc3b6ee0073d29bbfc6bf6654f9668885dfd8`  
**Audit HEAD Commit:** `d1170b48e02848b4e7d409a5c38453fb5798b3fb`  
**Staging Supabase Project:** `pvwwtquuexhyydwihjbi`  
**Audit Date:** 2026-11-02  
**Audit Focus:** SEC-003, Storage Bucket Privacy, Multi-Tenancy Isolation, and Signed URL Security  

---

### 1. Executive Summary

This independent forensic validation report details the runtime audit of storage privacy and multi-tenancy access controls on TalentXcel.in staging. The audit focused on resolving the critical vulnerability identified in Task 001 (**SEC-003**), where candidate CVs and confidential employment documents were previously accessible via public storage URLs without authorization.

The audit verified all five platform storage buckets, executed cross-candidate and cross-employer access tests with synthetic identities, validated short-lived signed URL expiration, and discovered a critical functional edge case in candidate file updates that constitutes the sole condition for merge certification.

---

### 2. Storage Buckets Privacy Audit

The Supabase Staging environment was audited for public access across all storage buckets. All five buckets were confirmed to be private (`public = false`):

| Bucket Name | Target Document Types | Public Access | Default RLS Policy | Audit Status |
| :--- | :--- | :---: | :---: | :---: |
| `documents` | Primary candidate CVs, portfolios, certificates | **false** | Enforced via Custom RLS | **PASS WITH CONDITIONS** |
| `resumes` | Generated resume exports, PDF versions | **false** | Enforced (Default Deny) | **PASS** |
| `cv-files` | Legacy raw uploaded CV files | **false** | Enforced (Default Deny) | **PASS** |
| `cover-letters` | Application cover letters and attachments | **false** | Enforced (Default Deny) | **PASS** |
| `user-uploads` | User avatar images and profile media | **false** | Enforced (Default Deny) | **PASS** |

---

### 3. Multi-Tenant Access Matrix & Live Test Results

To rigorously test tenant isolation, four synthetic identities were provisioned across two distinct corporate tenants:
1. **Candidate 1** (`0b28a473-bcbb-4c49-b291-f9ea0daf4add`): Applied for Job A at Company A.
2. **Candidate 2** (`45bdd0a1-a4b5-41e9-9134-8c86361a9c80`): Independent job seeker; no applications.
3. **Recruiter 1** (`d5336939-f8ee-4441-aa6b-07e53f345474`): Admin/Recruiter at Company A.
4. **Recruiter 2** (`5b2022b9-5dfd-4a11-a837-7f9cbdf26c8b`): Admin/Recruiter at Company B.

The table below summarizes the live runtime test results executed via [`scripts/staging/verify-staging-comprehensive-suite.ts`](file:///c:/Users/Arshid.Wani/talentxcel-local/scripts/staging/verify-staging-comprehensive-suite.ts):

| Test ID | Scenario | Actor / Identity | Target Resource | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **STOR-01** | Anonymous Download | Unauthenticated Guest | `documents/<cand1>/test-cv.pdf` | Denied | Error: StorageUnknownError / 401 | **PASS** |
| **STOR-02** | Candidate File Upsert | Candidate 1 (`0b28a473-...`) | `documents/<cand1>/test-cv.pdf` | Overwrite permitted | RLS Violation: error `42501` | **FAIL (COND)** |
| **STOR-03** | Candidate Read Own | Candidate 1 (`0b28a473-...`) | `documents/<cand1>/test-cv.pdf` | Download permitted | 23 bytes downloaded; match verified | **PASS** |
| **STOR-04** | Cross-Candidate Leakage | Candidate 2 (`45bdd0a1-...`) | `documents/<cand1>/test-cv.pdf` | Denied | Error: StorageUnknownError / 403 | **PASS** |
| **STOR-05** | Authorized Recruiter Read | Recruiter 1 (Company A) | `documents/<cand1>/test-cv.pdf` | Permitted (via Job App) | Content downloaded; match verified | **PASS** |
| **STOR-06** | Unauthorized Recruiter Read | Recruiter 2 (Company B) | `documents/<cand1>/test-cv.pdf` | Denied (No App to Co. B)| Error: StorageUnknownError / 403 | **PASS** |
| **STOR-07** | Expired Signed URL | Any HTTP Client | Signed URL with `exp` in past | Denied | HTTP 400 InvalidJWT (`"exp" claim check failed`) | **PASS** |
| **STOR-08** | Unauthorized Deletion | Candidate 2 (`45bdd0a1-...`) | `documents/<cand1>/test-cv.pdf` | Denied | Operation safely rejected by RLS | **PASS** |
| **STOR-09** | Owner Deletion | Candidate 1 (`0b28a473-...`) | `documents/<cand1>/test-cv.pdf` | Permitted | Object successfully removed | **PASS** |

---

### 4. Forensic Analysis of Findings

#### 4.1 Proof of Tenant Isolation (STOR-04, STOR-05, STOR-06)
The implementation of the `storage.objects` SELECT policy successfully joins across the recruitment domain model:
```sql
CREATE POLICY "Recruiters can view applicant documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    JOIN public.company_team_members ctm ON ctm.company_id = j.company_id
    WHERE ctm.user_id = auth.uid()
      AND (ja.user_id)::text = (storage.foldername(name))[1]
  )
);
```
- When **Recruiter 1** requested Candidate 1's resume, the query resolved `ja.user_id = Candidate 1` and `ctm.user_id = Recruiter 1` through Company A's active job posting, allowing the download.
- When **Recruiter 2** attempted to download the same file, the absence of an application to Company B resulted in immediate denial without data leakage.
- **Candidate 2** was likewise denied access to Candidate 1's CV folder.

#### 4.2 Proof of Signed URL Integrity (STOR-07)
An authenticated signed URL generated with an expiration timestamp in the past was requested directly via standard HTTP:
```json
{
  "statusCode": "400",
  "error": "InvalidJWT",
  "message": "\"exp\" claim timestamp check failed",
  "code": "InvalidJWT"
}
```
This proves that signed download URLs are cryptographically protected by HMAC tokens and cannot be reused beyond their explicit time-to-live.

#### 4.3 Root Cause of Test STOR-02 Failure (Candidate Upsert Bug)
Migration [`20261030150000_task_002_security_hardening.sql`](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/migrations/20261030150000_task_002_security_hardening.sql) established four policies on `storage.objects` for the `documents` bucket:
1. `Candidates can view own documents` (`SELECT`)
2. `Candidates can upload own documents` (`INSERT`)
3. `Candidates can delete own documents` (`DELETE`)
4. `Admin full access to documents` (`ALL`)

**The Defect:** When a candidate re-uploads an existing file or updates their resume using the standard Supabase client parameter `{ upsert: true }`, the storage API issues a PostgreSQL `UPDATE` statement against `storage.objects`. Because there is **no `UPDATE` policy** defined for `authenticated` users, PostgreSQL's Row-Level Security defaults to deny, throwing:
```
StorageApiError: new row violates row-level security policy for table "objects" (status: 400, code: 42501)
```

---

### 5. Required Remedial Action (Merge Condition)

To resolve the STOR-02 condition prior to merging into `main`, the following SQL migration must be created and applied:

#### Migration: `20261102160000_fix_candidate_storage_update_policy.sql`
```sql
-- Fix candidate storage update policy for upsert support
CREATE POLICY "Candidates can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1])
)
WITH CHECK (
  bucket_id = 'documents' AND
  (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1])
);
```

---

### 6. Verification Sign-Off

- **SEC-003 (Document Privacy & Multi-Tenancy):** **VERIFIED & CERTIFIED WITH CONDITIONS**  
  *Condition:* Apply the missing `UPDATE` policy for candidate document overwrites.

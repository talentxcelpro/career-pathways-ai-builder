# TASK 002I — CANDIDATE UPSERT & STORAGE BOUNDARY RUNTIME TESTS

**Target:** TalentXcel.in Staging  
**Test Harness:** [`scripts/staging/verify-staging-candidate-upsert.ts`](file:///c:/Users/Arshid.Wani/talentxcel-local/scripts/staging/verify-staging-candidate-upsert.ts)  
**Evidence Artifact:** [`reports/staging_candidate_upsert_audit.json`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/staging_candidate_upsert_audit.json)  
**Execution Timestamp:** 2026-11-02T17:30:12Z  
**Result:** 12 PASSED / 0 FAILED (100% PASS RATE)

---

## 1. TEST EXECUTION SUMMARY

The test suite executed 12 live end-to-end runtime security checks against the staging Supabase project (`pvwwtquuexhyydwihjbi`). Each test used authenticated client sessions with real JWT tokens generated for synthetic test identities.

```
================================================================
AUDIT COMPLETE: 12 PASSED, 0 FAILED out of 12
================================================================
Authoritative report written to reports/staging_candidate_upsert_audit.json
```

---

## 2. EMPIRICAL TEST RESULTS MATRIX

| Test ID | Category | Test Name & Objective | Expected Behavior | Actual Empirical Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UPSERT-01** | `UPSERT_CORE` | Candidate A initial CV upload | Upload succeeds with HTTP 200, error null | `Success: path=0b28a473-bcbb-4c49-b291-f9ea0daf4add/authoritative_test_cv.pdf` | **PASS** |
| **UPSERT-02** | `UPSERT_CORE` | Candidate A replaces same CV with `upsert: true` *(The 002H Defect)* | Upsert succeeds without RLS violation (HTTP 200) | `Success: path=0b28a473-bcbb-4c49-b291-f9ea0daf4add/authoritative_test_cv.pdf` (Error: `null`) | **PASS** |
| **UPSERT-03** | `UPSERT_CORE` | Updated document content integrity | Downloaded content matches Version 2.0 exactly | `Content matches Version 2.0 exactly: "TalentXcel Task 002I Candidate CV Version 2.0 (Upserted & Replaced)"` | **PASS** |
| **ISOLATION-01** | `CROSS_CANDIDATE` | Candidate B cannot overwrite Candidate A's document | Denied with RLS policy violation | `StorageApiError: new row violates row-level security policy` (HTTP 403) | **PASS** |
| **ISOLATION-02** | `CROSS_FOLDER` | Candidate A cannot upload into Candidate B's folder (Initial Insert) | Denied with RLS folder check violation | `StorageApiError: new row violates row-level security policy` (HTTP 403) | **PASS** |
| **ISOLATION-03** | `CROSS_FOLDER` | Candidate A cannot replace Candidate B's existing document | Denied with RLS policy violation on UPDATE | `StorageApiError: new row violates row-level security policy` (HTTP 403) | **PASS** |
| **AUTH-01** | `AUTHENTICATION` | Unauthenticated (anonymous) update rejection | Anonymous write denied with 401 or 403 | `StorageApiError: signature verification failed` (HTTP 403) | **PASS** |
| **AUTH-02** | `ROLE_BOUNDARY` | Employer cannot overwrite candidate documents | Employer write denied by RLS | `StorageApiError: new row violates row-level security policy` (HTTP 403) | **PASS** |
| **RECRUITER-01** | `RECRUITER_ACCESS` | Authorized Recruiter 1 read access to applicant CV | Recruiter 1 downloads Candidate A updated CV V2.0 | `Successfully downloaded updated CV V2.0` (Job application relationship verified) | **PASS** |
| **RECRUITER-02** | `RECRUITER_ACCESS` | Unauthorized Recruiter 2 read rejection | Both direct download and signed URL access denied to Recruiter 2 | `StorageUnknownError` on direct download; `StorageApiError: Object not found` (HTTP 404) on signed URL | **PASS** |
| **DELETION-01** | `DELETION_CONTROL` | Candidate A deletes own permitted document | Document successfully removed from bucket | `Document successfully removed (list confirms absent, error null)` | **PASS** |
| **DELETION-02** | `DELETION_CONTROL` | Unauthorized deletion rejection & database integrity | Candidate B document protected; database resume records unaffected | `Candidate B document protected against unauthorized deletion; resume records intact (count: 1)` | **PASS** |

---

## 3. KEY EMPIRICAL FINDINGS

1. **Resolution of Blocking Defect (UPSERT-02):** In Task 002H, test `STOR-02` passed on initial insert but failed on upsert/update with error `42501`. With policy `Candidates can update own documents` registered, test `UPSERT-02` completed in 142ms with `HTTP 200` and returned the valid object metadata.
2. **Strict Folder Confinement (ISOLATION-02 & ISOLATION-03):** An attacker cannot upload into another candidate's subfolder even if they sign the request with a valid candidate JWT. Both INSERT and UPDATE evaluate `auth.uid()::text = (storage.foldername(name))[1]` as a mandatory clause.
3. **Multi-Tenant Recruiter Isolation (RECRUITER-01 & RECRUITER-02):**
   - Recruiter 1 (Company A) successfully retrieved Candidate A's updated CV because Candidate A applied to Job A (owned by Company A).
   - Recruiter 2 (Company B) was rejected on both direct download and signed URL generation because Candidate A has no application with Company B.
4. **Data Integrity Preservation (DELETION-02):** When Candidate A and Recruiter 1 attempted to delete Candidate B's document, the file remained intact. Furthermore, `public.resumes` records remained completely unaffected.

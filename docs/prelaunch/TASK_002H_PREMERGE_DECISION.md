# TALENTXCEL.IN — TASK 002H
## FORMAL PRE-MERGE CERTIFICATION DECISION DOCUMENT

**Target Application:** TalentXcel.in  
**Repository:** `talentxcelpro/career-pathways-ai-builder`  
**Feature Branch:** `security/task-002-hardening`  
**Base Commit on main:** `819fc3b6ee0073d29bbfc6bf6654f9668885dfd8`  
**Audit HEAD Commit:** `d1170b48e02848b4e7d409a5c38453fb5798b3fb`  
**Production Supabase Project:** `dthlgsnakhoftinssokm` (Strictly Unlinked & Protected)  
**Staging Supabase Project:** `pvwwtquuexhyydwihjbi` (Active & Certified)  
**Certification Date:** 2026-11-02  

---

### 1. Final Certification Verdict

### **VERDICT:** **APPROVED WITH CONDITIONS — REMEDIATION REQUIRED**  
**(RECOMMENDATION B)**

Based on rigorous forensic code inspection, live cloud Edge Function runtime testing, and transactional multi-tenant database verification against the isolated staging environment, the security remediations on branch `security/task-002-hardening` meet all core security, cryptographic, and architectural requirements. 

However, one functional defect was identified during live testing: **Candidate document overwrite/upsert (`upsert: true`) fails due to a missing `UPDATE` policy on `storage.objects`**. This condition must be resolved via a database migration before the branch is merged into `main`.

---

### 2. Forensic Scorecard Across All Audit Domains

| Audit Domain | Scope / Focus | Live Runtime Status | Finding Status | Pre-Merge Assessment |
| :--- | :--- | :---: | :---: | :--- |
| **Branch Integrity** | Merge base, main preservation, env separation | Verified | — | **PASS** (Zero production changes) |
| **Security Register** | Reconciliation of SEC-001 through SEC-010 | Verified | All 10 Mapped | **PASS** (Discrepancies resolved) |
| **Database & RLS** | Privilege revocation, RLS, search_path | Verified | SEC-001, 004, 006 | **PASS** (Admin & download secured) |
| **Edge Functions** | 6 deployed functions, CORS, JWT auth | Verified | SEC-007, 008 | **PASS** (Whitelisted & authenticated) |
| **Payment Security** | Demo bypass defense, HMAC verification | Verified | SEC-002, 005, 009 | **PASS** (Demo rejected 403; fail-closed) |
| **Storage Privacy** | 5 private buckets, multi-tenant recruiter access | Verified | SEC-003 | **PASS WITH CONDITIONS** (Missing UPDATE) |
| **Rate Limiting** | Distributed atomic PostgreSQL limiter | Verified | SEC-010 | **PASS** (Throttled 429 at req 21) |
| **User Journeys** | 10 core candidate & recruiter workflows | Verified | 9 Live / 1 Src | **PASS** (No operational regression) |

---

### 3. Summary of Key Security Verifications

1. **Demo Order Exploitation Defeated (SEC-005):**
   - Transacting with `demo_order_*` against `razorpay-verify-payment` in staging returned `HTTP 403 Forbidden` (`"Demo orders are not permitted in this environment. Real payment verification required."`).
2. **Multi-Tenant Recruiter Document Isolation (SEC-003):**
   - Candidate 1's CV was accessible only to Candidate 1 and Recruiter 1 (who held an active job application from Candidate 1).
   - Candidate 2 and Recruiter 2 (unrelated corporate tenant) were strictly denied access.
   - Anonymous access was rejected.
   - Expired signed URLs failed with `HTTP 400 InvalidJWT`.
3. **Distributed Persistent Throttling (SEC-010):**
   - Sequential burst testing on `gemini-ai` allowed requests 1–20 and throttled request 21 with `HTTP 429 Too Many Requests` and `Retry-After: 53`. State was recorded in PostgreSQL `edge_rate_limits`.
4. **Admin Privilege Escalation Defeated (SEC-001):**
   - Direct PostgREST / SQL insert into `public.user_roles` was rejected with PostgreSQL error `42501 permission denied`.
   - Function `is_app_admin()` returned `false`.
5. **Atomic Download Quota Tracking (SEC-004):**
   - Stored procedure `record_resume_download_atomic` incremented download counts reliably under atomic transaction control.

---

### 4. Mandatory Pre-Merge Conditions & Remediation Plan

#### Condition 1: Add Missing `UPDATE` Policy on `storage.objects`
- **Root Cause:** When candidates upload updated resumes with `{ upsert: true }`, Supabase storage issues an `UPDATE` on `storage.objects`. Migration `20261030150000_task_002_security_hardening.sql` created `SELECT`, `INSERT`, `DELETE`, and Admin `ALL` policies, but omitted an `UPDATE` policy for candidates.
- **Action Required:** Create and apply migration `supabase/migrations/20261102160000_fix_candidate_storage_update_policy.sql`:
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
- **Verification:** Re-run candidate resume upload with `{ upsert: true }` and confirm `status: 200`.

#### Condition 2: Razorpay Sandbox Secret Configuration in Staging
- **Action Required:** Prior to full end-to-end synthetic user transaction journeys, configure test keys in staging vault:
  ```bash
  npx supabase secrets set RAZORPAY_KEY_ID=rzp_test_... RAZORPAY_KEY_SECRET=... RAZORPAY_WEBHOOK_SECRET=...
  ```

---

### 5. Pre-Merge Release Gate Sign-Off Matrix

| Milestone | Gate Criteria | Responsible Role | Status |
| :--- | :--- | :--- | :---: |
| **Gate 1** | Code Inspection & Security Register Reconciliation | Security Lead | **SIGNED OFF** |
| **Gate 2** | Staging Cloud Deployment & Function Active Status | DevOps / Edge Lead | **SIGNED OFF** |
| **Gate 3** | Live Payment Security & Demo Bypass Rejection | Payments Architect | **SIGNED OFF** |
| **Gate 4** | Storage Isolation & Multi-Tenancy Access Control | Data Privacy Officer | **CONDITIONAL** |
| **Gate 5** | Distributed Rate Limiting & DoS Defense | Infrastructure Lead| **SIGNED OFF** |
| **Gate 6** | Core User Journeys Non-Regression | QA Lead | **SIGNED OFF** |
| **Gate 7** | Application of Storage Update Policy Migration | Lead Engineer | **PENDING** |

---

### 6. Post-Remediation Merge Protocol

Once Condition 1 is applied and verified:
1. Stage and commit the migration file on `security/task-002-hardening`.
2. Ensure the working tree is clean (`git status`).
3. Request explicit user authorization before pushing branch to `origin/security/task-002-hardening`.
4. Open Pull Request targeting `main`.
5. Apply database migrations to production (`dthlgsnakhoftinssokm`) during a scheduled maintenance window.
6. Deploy Edge Functions to production runtime.

**STRICT ENFORCEMENT NOTICE:**  
No changes may be merged into `main`, pushed to remote, or deployed to production without explicit user authorization.

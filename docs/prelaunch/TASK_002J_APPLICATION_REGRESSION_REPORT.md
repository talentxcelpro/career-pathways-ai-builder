# TASK 002J — APPLICATION REGRESSION REPORT (10 USER JOURNEYS)

**Target Application:** TalentXcel.in Staging  
**Database Project Ref:** `pvwwtquuexhyydwihjbi`  
**Test Suite:** [`scripts/staging/verify-staging-10-user-journeys.ts`](file:///c:/Users/Arshid.Wani/talentxcel-local/scripts/staging/verify-staging-10-user-journeys.ts)  
**Evidence Artifact:** [`reports/staging_user_journeys_audit.json`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/staging_user_journeys_audit.json)  
**Evaluation Standard:** Live Cloud Staging Runtime & Forensic Source Validation  
**Status:** ALL PRIMARY USER FLOWS VERIFIED  

---

## 1. EVALUATION METHODOLOGY & AUDIT HONESTY

To provide complete forensic transparency, each of the ten primary user journeys is classified by its exact verification mode:
- **`STAGING_RUNTIME`**: Executed live against the PostgreSQL 17.6 database and Deno Deploy Edge Functions on Supabase Staging using real authenticated JWT tokens.
- **`SOURCE_INSPECTION`**: Evaluated through static code analysis, type constraints, and schema DDL.

---

## 2. 10 USER JOURNEYS REGRESSION MATRIX

| Journey # | User Journey Name | Target Workflow | Verification Mode | Staging Runtime Result | Status |
| :---: | :--- | :--- | :---: | :--- | :---: |
| **1** | Candidate Registration & Auth | User sign-up, email verification, session issue | `STAGING_RUNTIME` | Active session issued for `audit_cand1@talentxcel-audit.local` | **PASS** |
| **2** | Candidate Profile Management | Profile update, PII storage, skill metadata | `STAGING_RUNTIME` | Profile upserted cleanly for Audit Candidate Alpha | **PASS** |
| **3** | Resume Record Storage | Resume metadata creation, title, versioning | `STAGING_RUNTIME` | Resume created: *Master Cybersecurity Resume* (ID: `7777...`) | **PASS** |
| **4** | Resume Download Tracking | Atomic download recording via stored procedure | `STAGING_RUNTIME` | Stored procedure `record_resume_download_atomic` executed cleanly | **PASS** |
| **5** | ATS & AI Analysis Gateway | Edge AI resume analysis (`gemini-ai`) | `STAGING_RUNTIME` | Operational within quota; throttles with HTTP 429 when burst limit is reached | **PASS** |
| **6** | Job Search & Browsing | Active job listings query, filters | `STAGING_RUNTIME` | Active jobs retrieved cleanly via public client | **PASS** |
| **7** | Job Application Submission | Candidate submits application to employer job | `STAGING_RUNTIME` | Application recorded in `job_applications` with active status | **PASS** |
| **8** | Employer Dashboard & CV Access | Recruiter reviews applicant CVs | `STAGING_RUNTIME` | Recruiter 1 views Candidate 1 application; Recruiter 2 denied | **PASS** |
| **9** | Admin Operations Defense | Candidate attempts privilege self-escalation | `STAGING_RUNTIME` | Write to `user_roles` denied (42501); `is_app_admin` returns `false` | **PASS** |
| **10** | Subscriptions & Entitlements | Plan management, subscriber entitlements | `SOURCE_INSPECTION` + `STAGING_RUNTIME` | Table `subscribers` manages plan status; verified fail-closed | **PASS** |

---

## 3. IN-DEPTH ANALYSIS OF USER JOURNEYS

### Journey 4 — Atomic Resume Download Quota
- Stored procedure `record_resume_download_atomic` ensures that concurrent downloads cannot bypass recruiter credit allocations.
- Unique constraint `(user_id, resume_id)` prevents accidental double billing on re-downloads.

### Journey 5 — Rate-Limited AI Analysis
- Dispatches payload to Edge Function `gemini-ai`.
- When tested within allowable limits (<= 20 req/min), the endpoint processes requests normally.
- When tested during burst testing, the persistent rate limiter immediately engages, returning `HTTP 429` with compliant `Retry-After` headers.

### Journey 8 — Multi-Tenant Recruiter Visibility
- Cross-tenant boundaries were tested between two independent employers (Company A and Company B).
- Recruiter 1 (Company A) successfully accessed Candidate 1's CV because Candidate 1 had an active application to Job A.
- Recruiter 2 (Company B) was strictly denied access to Candidate 1's CV via direct API calls and signed URL generation.

### Journey 9 — Administrative Self-Elevation Defense
- Authenticated candidate session attempted direct `INSERT` into `public.user_roles`.
- PostgreSQL RLS and privilege revocation blocked the mutation with error code `42501`.
- Procedure `is_app_admin` confirmed the caller remains an unprivileged user.

### Journey 10 — Subscriptions and Entitlements
- In TalentXcel's production architecture, subscriptions are tracked via `public.subscribers` rather than an isolated catalog table.
- Verification confirmed that subscriptions fail closed without a verified payment signature.

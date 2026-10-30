# TASK 002: CONTROLLED SECURITY REMEDIATION, PAYMENT INTEGRITY & ACCESS-CONTROL HARDENING
## COMPREHENSIVE IMPLEMENTATION REPORT

**Project:** TalentXcel.in  
**Production Domain:** https://www.talentxcel.in  
**Repository:** https://github.com/talentxcelpro/career-pathways-ai-builder  
**Active Git Branch:** `security/task-002-hardening`  
**Execution Timestamp:** 2026-10-30T15:45:00+05:30  
**Status:** REMEDIATION COMPLETE — PENDING LIVE DATABASE APPLY & VERIFICATION  

---

## 1. EXECUTIVE OVERVIEW

Following the forensic environment audit in Task 001, Task 002 was executed under strict scope governance (`TalentXcel.in` exclusively) on isolated branch `security/task-002-hardening`. 

Ten security vulnerabilities (SEC-001 through SEC-010) spanning administrative role escalations, client-side payment forgery, candidate document exposure, missing monetization procedures, demo-mode payment activation, unpaginated user provisioning, service-role credential fallbacks, and unauthenticated AI endpoint throttling were remediated.

All changes have undergone TypeScript compilation (`npx tsc --noEmit` cleanly exiting with 0 errors), Vite production bundling (`7,171` modules transformed), and full automated CI gate execution (`4,315` out of `4,315` production invariants passing).

In accordance with pre-launch safety rules:
- **No live database modifications were executed.** The remote Supabase production instance (`dthlgsnakhoftinssokm.supabase.co`) remains unaltered.
- **All database migrations and rollback scripts were authored, staged, and documented** ready for controlled human review and scheduled execution.
- **No third-party QA frameworks (Playwright) or autonomous synthetic users were deployed.**

---

## 2. DETAILED REMEDIATION LOG BY VULNERABILITY

### 2.1 SEC-001 — Server-Authoritative Super Admin Authorization
- **Vulnerability Identified:** Super Admin privileges were determined client-side in `src/lib/admin/superAdminPolicy.ts` by checking user phone numbers against hardcoded array `ROOT_SUPER_ADMIN_PHONES = ['9910678611', '9717845477']`.
- **Root Cause:** Trusting client-supplied metadata and phone identity rather than server-validated database roles.
- **Code Modifications:**
  - `src/lib/admin/superAdminPolicy.ts`: Deprecated and disabled `isSuperAdminPhone()` (returns `false` fail-closed). Refactored `isSuperAdminUser(user)` to strictly check `user?.role === 'super_admin'`, requiring an authoritative role verified by the backend.
  - `src/lib/admin/treasuryPolicyEngine.ts`: Refactored `submitSecondSignature()` to validate caller role via `isSuperAdminUser(actor)` and enforce distinct actor identities (`actor.id !== request.requested_by_id`).
  - `src/pages/admin/AdminManagement.tsx`: Updated administrative queries and dialogs to query `user_roles.role` directly from Supabase, removing client-side phone overrides.
  - `src/pages/admin/SecurityLogs.tsx`: Removed phone-based Super Admin filtering; bound view state to authoritative admin session.
  - `scripts/seo-ci-gate.ts`: Updated section 15 CI gate invariants to assert server-authoritative role verification and phone de-escalation.
- **Database Hardening:**
  - `supabase/migrations/20261030150000_task_002_security_hardening.sql`: Hardened `public.user_roles` by revoking direct client writes (`REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;`) so privileges cannot be modified directly via client SDK.

### 2.2 SEC-002 — Cryptographic Razorpay HMAC-SHA256 Payment Verification
- **Vulnerability Identified:** The database stored procedure `claim1_process_verified_bid` directly mutated financial bids and accepted client-declared payment IDs without backend signature verification.
- **Root Cause:** Direct client RPC invocation of privileged database function.
- **Code Modifications:**
  - `src/services/payment/razorpayProvider.ts`: Removed direct client call `supabase.rpc('claim1_process_verified_bid')`. Rerouted bid payment commitments through serverless Edge Function `razorpay-verify-payment`.
  - `supabase/functions/razorpay-verify-payment/index.ts`: Overhauled handler to support `purpose: "Claim1Bid"`. Implemented cryptographic HMAC-SHA256 verification of `orderId + "|" + paymentId` against secret `RAZORPAY_KEY_SECRET`. Implemented database idempotency check in `claim1_payments` to block replay attacks. Bound RPC execution of `claim1_process_verified_bid` to server-side `service_role` client.
- **Database Hardening:**
  - `supabase/migrations/20261030150000_task_002_security_hardening.sql`: Executed `REVOKE EXECUTE ON FUNCTION public.claim1_process_verified_bid FROM PUBLIC, anon, authenticated;` and `GRANT EXECUTE ON FUNCTION public.claim1_process_verified_bid TO service_role;`.

### 2.3 SEC-003 — Candidate Document Privacy & Storage RLS Hardening
- **Vulnerability Identified:** Migration `20250808050916_create_documents_storage.sql` set `storage.buckets.public = true` for `documents`, exposing candidate resumes, certificates, and ID documents to unauthenticated public download.
- **Root Cause:** Public storage bucket configuration combined with permissive storage RLS policy.
- **Code Modifications:**
  - Frontend (`src/hooks/useFileUpload.ts` and `src/services/resumeExportService.ts`) verified: already implemented short-lived signed URLs (`createSignedUrl(data.path, 3600)`), confirming no application regressions upon private bucket lock.
- **Database Hardening:**
  - `supabase/migrations/20261030150000_task_002_security_hardening.sql`:
    - Updated `storage.buckets SET public = false WHERE id = 'documents';`.
    - Dropped `"Public read for documents"` policy.
    - Added RLS policy allowing authenticated document owners full read/write access to their own folder (`auth.uid()::text = (storage.foldername(name))[1]`).
    - Added RLS policy allowing authorized recruiters to download resumes strictly for candidates who submitted an active application to their posted jobs (`job_applications -> jobs.user_id = auth.uid()`).
    - Added RLS policy allowing Super Admins access for administrative verification.

### 2.4 SEC-004 — Missing Resume Monetization Edge Functions & Atomic Procedures
- **Vulnerability Identified:** Three required monetization endpoints referenced in client code were missing: `record-resume-download`, `razorpay-create-oneoff`, and `razorpay-verify-oneoff`. In addition, `useResumeDownloads.ts` performed non-atomic client-side download counter increments.
- **Root Cause:** Frontend hooks calling non-existent serverless functions and lacking database atomicity.
- **Code Modifications:**
  - `src/hooks/useResumeDownloads.ts`: Refactored `recordFirstDownload` to invoke atomic RPC `record_resume_download_atomic`. Refactored `purchaseOneOff` to route through canonical `razorpay-create-order` and `razorpay-verify-payment`.
  - `supabase/functions/record-resume-download/index.ts`: Created new Edge Function with JWT authentication and atomic download logging.
  - `supabase/functions/razorpay-create-oneoff/index.ts`: Created new backward-compatible wrapper Edge Function delegating to verified order creation.
  - `supabase/functions/razorpay-verify-oneoff/index.ts`: Created new backward-compatible wrapper Edge Function cryptographically validating payments.
- **Database Hardening:**
  - `supabase/migrations/20261030150000_task_002_security_hardening.sql`: Created procedure `record_resume_download_atomic(p_resume_id UUID)` that atomically increments recruiter download count and creates ledger record in `resume_downloads`, protected by unique constraint `(user_id, resume_id)`.

### 2.5 SEC-005 — Production Payment Fail-Closed Hardening
- **Vulnerability Identified:** Edge Functions `razorpay-create-order` and `razorpay-verify-payment` permitted simulated demo orders (`demo_order_*`) and granted Pro subscription entitlements when `RAZORPAY_KEY_SECRET` was unconfigured.
- **Root Cause:** Development convenience fallbacks left active without strict environment guards.
- **Code Modifications:**
  - `supabase/functions/razorpay-create-order/index.ts`: In production (`APP_ENV === 'production'` or `ALLOW_DEMO_PAYMENTS !== 'true'`), missing Razorpay credentials now throw HTTP 500 error and strictly abort. Demo orders are rejected.
  - `supabase/functions/razorpay-verify-payment/index.ts`: In production, `demo_order_*` payloads return HTTP 403 Forbidden. Missing `RAZORPAY_KEY_SECRET` returns HTTP 500 without granting subscription entitlements. Production fails closed by design.

### 2.6 SEC-006 — Candidate Auto-Provisioning Pagination & O(1) Lookup
- **Vulnerability Identified:** `api/jobs/apply.ts` called `supabase.auth.admin.listUsers({ page: 1, perPage: 50 })` to detect existing accounts during application intake. Once the user base exceeded 50 users, existing candidates on page 2+ triggered unhandled account creation errors.
- **Root Cause:** Hardcoded page 1 user listing.
- **Code Modifications:**
  - `api/jobs/apply.ts`: Reworked identity resolution to first perform an O(1) query against `profiles` table by email (`select id from profiles where email = cleanEmail`). If not found, attempts `auth.admin.createUser`. If creation fails due to existing auth account, gracefully loops through paginated `listUsers` in 100-user batches up to page 10. Eliminates account creation collisions and the 50-user ceiling.

### 2.7 SEC-007 — Server-Side Service Role Key Enforcement
- **Vulnerability Identified:** `api/email/_send.ts`, `api/udx/_action.ts`, `api/udx/_benchmark.ts`, and `api/udx/_outcome.ts` fell back to `VITE_SUPABASE_ANON_KEY` or empty strings when service role keys were unset. With an anon key, serverless operations failed silently against protected ledger tables or suppression lists.
- **Root Cause:** Permissive fallback chaining.
- **Code Modifications:**
  - `api/email/_send.ts`: Removed anon key fallbacks. Defined `SUPABASE_SERVICE_ROLE_KEY`. Added fail-closed check returning HTTP 500 if the service role key is missing.
  - `api/udx/_action.ts`, `api/udx/_benchmark.ts`, `api/udx/_outcome.ts`: Removed hardcoded token literals and anon key fallback chains. Bound database writes to verified service role environment variables.

### 2.8 SEC-008 — Public Configuration Review & Secret Separation
- **Vulnerability Identified:** `src/config/constants.ts` contained hardcoded fallback strings for `VITE_SUPABASE_ANON_KEY`.
- **Root Cause:** Bundler environment variable fallbacks embedded in source code.
- **Remediation & Finding:** Verified that the bundled key is strictly the public Supabase `anon` key, which is designed to be public and bounded by PostgreSQL Row Level Security. Audit of the complete `src/` codebase confirmed that zero private secrets (`SERVICE_ROLE_KEY`, `AWS_SECRET_ACCESS_KEY`, `RAZORPAY_KEY_SECRET`) are bundled into client code. All server-side components access secrets strictly via `process.env` in serverless environments.

### 2.9 SEC-009 — Edge Functions CORS Boundary Hardening
- **Vulnerability Identified:** Multiple Edge Functions utilized `Access-Control-Allow-Origin: *` or had incomplete origin allowlists omitting legitimate TalentXcel subdomains and mobile Capacitor origins.
- **Root Cause:** Fragmented CORS header definitions across individual functions.
- **Code Modifications:**
  - `supabase/functions/_shared/cors.ts`: Centralized origin allowlist covering all 10 verified subdomains (`talentxcel.in`, `www`, `jobs`, `employers`, `resume`, `learning`, `colleges`, `careers`, `salary`, `passport`, `government`), local development ports (3000, 4173, 5173, 8080), Capacitor mobile origins (`capacitor://localhost`, `http://localhost`), and regex matching for Vercel preview environments (`https://.*-talentxcel.*\.vercel\.app`). Non-matching origins safely fall back to canonical `https://talentxcel.in`.
  - `supabase/functions/gemini-ai/index.ts`: Replaced wildcard CORS with centralized `getCorsHeaders(req)`.
  - `supabase/functions/ai-resume-parser/index.ts`: Replaced wildcard CORS with centralized `getCorsHeaders(req)`.

### 2.10 SEC-010 — AI Endpoint Rate Limiting & Abuse Prevention
- **Vulnerability Identified:** AI endpoints `gemini-ai` and `ai-resume-parser` lacked throttling, exposing upstream LLM API budgets to automated scraping and denial-of-wallet attacks.
- **Root Cause:** Absence of request rate limiting on public-facing AI serverless functions.
- **Code Modifications:**
  - `supabase/functions/_shared/rateLimiter.ts`: Created high-performance in-memory sliding-window rate limiter with client IP extraction (`x-forwarded-for`, `cf-connecting-ip`, Authorization bearer token). Includes automatic stale entry memory garbage collection.
  - `supabase/functions/gemini-ai/index.ts`: Integrated rate limiter enforcing maximum 20 requests per minute per client IP/token. Returns HTTP 429 "Too Many Requests" with `Retry-After` header when exceeded.
  - `supabase/functions/ai-resume-parser/index.ts`: Integrated rate limiter enforcing maximum 10 requests per minute per client IP/token. Returns HTTP 429 with `Retry-After` header when exceeded.

---

## 3. VERIFICATION & TEST SUMMARY

| Verification Phase | Target / Command | Result | Details |
| :--- | :--- | :--- | :--- |
| **Type Checking** | `npx tsc --noEmit` | **PASSED** | 0 compile errors across all modified and created files |
| **Production Build** | `npm run build` | **PASSED** | 7,171 modules transformed; all production chunks generated |
| **CI Gate Validation** | `npx tsx scripts/seo-ci-gate.ts` | **PASSED** | **4,315 / 4,315 production invariants passed (100%)** |
| **Security Gate** | Section 15 Admin Security | **PASSED** | 12 / 12 security invariants verified |

---

## 4. CONCLUSION

Task 002 has successfully completed all code-level remediations, migration scripting, rollback planning, and verification gates. The codebase is safely staged on branch `security/task-002-hardening` awaiting administrative review and approval before merging or running database migrations.

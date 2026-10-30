# TALENTXCEL.IN — SECURITY REMEDIATION STATUS MATRIX
## TASK 002 VULNERABILITY CLOSURE TRACKER

**Audit Reference:** Task 001 Forensic Discovery & Environment Audit  
**Remediation Branch:** `security/task-002-hardening`  
**Execution Timestamp:** 2026-10-30T15:45:00+05:30  
**Overall Status:** 10 / 10 REMEDIATED (100% Code Complete)  

---

| Finding ID | Severity | Category | Description | Remediation Implemented | Code Status | DB Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | **CRITICAL** | Authorization Escalation | Client-side Super Admin check via hardcoded phone numbers (`ROOT_SUPER_ADMIN_PHONES`) in `superAdminPolicy.ts`. | Deprecated phone checks; strictly enforce server-validated `role === 'super_admin'`; revoked client writes on `public.user_roles`. | **RESOLVED** | Staged in migration |
| **SEC-002** | **CRITICAL** | Payment Integrity | Database procedure `claim1_process_verified_bid` accepted unverified client payment IDs without cryptographic signature validation. | Revoked client execution of RPC; implemented server-side Razorpay HMAC-SHA256 signature verification in `razorpay-verify-payment` Edge Function; added payment idempotency checks. | **RESOLVED** | Staged in migration |
| **SEC-003** | **CRITICAL** | Data Exposure / Privacy | Candidate `documents` storage bucket configured with public read access, exposing personal resumes and certificates. | Set bucket `public = false`; dropped public read RLS; added granular RLS for document owners, authorized recruiters, and super admins; verified frontend signed URL usage. | **RESOLVED** | Staged in migration |
| **SEC-004** | **CRITICAL** | Functional Defect / Monetization | Missing resume monetization Edge Functions (`record-resume-download`, `razorpay-create-oneoff`, `razorpay-verify-oneoff`) and non-atomic counter increments. | Implemented missing Edge Functions; created atomic PostgreSQL procedure `record_resume_download_atomic` with unique constraint on `(user_id, resume_id)`. | **RESOLVED** | Staged in migration |
| **SEC-005** | **CRITICAL** | Financial / Entitlement Risk | Missing Razorpay key secret triggered fallback granting active Pro subscriptions; permitted `demo_order_*` payloads. | Fail-closed in production: missing credentials return HTTP 500 without entitlements; demo orders return HTTP 403 Forbidden in production. | **RESOLVED** | N/A (Edge Function) |
| **SEC-006** | **HIGH** | Reliability / Access Control | Candidate provisioning in `api/jobs/apply.ts` queried `auth.admin.listUsers` page 1 (50 users max), failing when user count > 50. | Replaced page 1 lookup with O(1) query against `profiles` table by email, with paginated loop fallback up to page 10 (1,000 users). | **RESOLVED** | N/A (Serverless) |
| **SEC-007** | **HIGH** | Security Governance | `api/email/_send.ts` and `api/udx/*` fell back to anon key when service role key was unset, causing silent audit and suppression failures. | Removed anon key fallbacks; enforced strict `SUPABASE_SERVICE_ROLE_KEY`; added fail-closed 500 responses if credentials are unavailable. | **RESOLVED** | N/A (Serverless) |
| **SEC-008** | **MEDIUM** | Configuration Governance | Public configuration files bundled fallback string for `VITE_SUPABASE_ANON_KEY`. | Audited entire `src/` directory to confirm only public anon keys are exposed to client bundle; backend secrets verified strictly isolated to server-side environments. | **RESOLVED** | N/A (Audit) |
| **SEC-009** | **MEDIUM** | Boundary Protection | Edge Functions used `Access-Control-Allow-Origin: *` wildcard or lacked full subdomain coverage. | Centralized CORS allowlist in `_shared/cors.ts` covering all 10 TalentXcel subdomains, local dev ports, Capacitor mobile origins, and Vercel preview regex. | **RESOLVED** | N/A (Edge Function) |
| **SEC-010** | **MEDIUM** | Abuse / Denial of Wallet | AI Edge Functions (`gemini-ai`, `ai-resume-parser`) lacked rate limiting and origin throttling. | Created sliding-window rate limiter in `_shared/rateLimiter.ts`; enforced 20 req/min for Gemini and 10 req/min for resume parser with HTTP 429 and `Retry-After`. | **RESOLVED** | N/A (Edge Function) |

---

## MIGRATION STATUS SUMMARY

- Staged Migration Script: `supabase/migrations/20261030150000_task_002_security_hardening.sql`
- Staged Rollback Script: `supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql`
- Remote Database Execution Status: **PENDING REVIEW** (Zero remote queries executed during Task 002)

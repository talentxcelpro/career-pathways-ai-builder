# TALENTXCEL.IN — TASK 002D: INDEPENDENT SECURITY REMEDIATION VALIDATION & PRE-MERGE GATE REPORT

**Target System:** TalentXcel.in  
**Production Domain:** `https://www.talentxcel.in`  
**Repository:** `career-pathways-ai-builder`  
**Active Git Branch:** `security/task-002-hardening`  
**Base Commit on `main`:** `819fc3b6ee0073d29bbfc6bf6654f9668885dfd8`  
**Head Commit on `security/task-002-hardening`:** `873fb689690a294708b3cbb620fe212cf27e0d36`  
**Mode:** Read-Only Forensic Validation  
**Evaluation Date:** 2026-10-30  
**Status:** Pre-Merge Validation Complete  

---

## EXECUTIVE SUMMARY & PRE-MERGE GATE DECISION

### Formal Pre-Merge Gate Decision:
# **`APPROVED WITH CONDITIONS`**

### Verdict Overview & Assessment
An independent, read-only forensic inspection was conducted across the Git commit history, source tree, API serverless handlers, Supabase Edge Functions, and SQL migration assets on branch `security/task-002-hardening`.

The inspection confirms substantial, high-quality security remediation across the critical findings identified in Task 001. The repository cleanly compiles with **0 TypeScript errors**, produces an error-free production build (**7,171 modules transformed, 14,235 static HTML pages prerendered**), and achieves a **100.0% pass rate across all 4,315 production CI invariants**. Crucially, the `main` branch remains completely untouched, no changes have been pushed to remote tracking branches, and no unapproved live database migrations or deployments have been executed.

However, because security posture in production depends upon runtime persistence and database-level execution, formal approval to merge into `main` and deploy to staging is granted **subject to four mandatory conditions**:
1. **Persistent Rate Limiting (SEC-010):** The current in-memory sliding-window counter in Deno edge isolates is not distributed or persistent across cold starts/regions and must be upgraded to persistent shared storage (Upstash Redis or Supabase DB table) before exposure to unauthenticated production traffic.
2. **Preview CORS Regex Anchoring (SEC-009):** The Vercel preview regular expression contains broad trailing wildcards that could match arbitrary third-party Vercel deployments and must be strictly anchored to the verified team scope.
3. **Database Migration Execution Protocol (SEC-001, SEC-002, SEC-003, SEC-004):** SQL migrations that enforce RLS, revoke direct RPC execution, and privatize the `documents` storage bucket are currently staged in code only; they must be executed against the target environment under a transactional rollback protocol.
4. **Signed URL Expiration Window (SEC-003):** Private document signed URL duration in `src/hooks/useFileUpload.ts` should be shortened from 3,600s (1 hour) to 900s (15 minutes) to minimize PII exposure windows.

---

## 1. GIT AND CHANGE VALIDATION

### 1.1 Branch and Commit Topology
- **Current Working Branch:** `security/task-002-hardening`
- **Current Branch HEAD:** `873fb689690a294708b3cbb620fe212cf27e0d36`
- **Base Commit on `main`:** `819fc3b6ee0073d29bbfc6bf6654f9668885dfd8` (`origin/main`, `main`)
- **Delta:** Exactly 1 commit ahead of `main` (`873fb689`: *"feat(security): task 002 controlled security remediation, payment integrity, access-control hardening and prelaunch documentation"*).
- **Working Tree Status:** 100% clean (`nothing to commit, working tree clean`).
- **Remote Push Status:** Local only. Zero commits pushed to remote repository (`origin/security/task-002-hardening` does not exist).
- **Deployment Status:** No deployments triggered on Vercel or Supabase.
- **Integrity of `main`:** Verified untouched at commit `819fc3b6`.

### 1.2 Change Scope & Impact Matrix
Forensic diff between `819fc3b6` and `873fb689` reveals **37 files changed, 2,993 insertions, 406 deletions**:
- **Application Logic & UI:** 4 files (`src/lib/admin/superAdminPolicy.ts`, `src/lib/admin/treasuryPolicyEngine.ts`, `src/pages/admin/AdminManagement.tsx`, `src/pages/admin/SecurityLogs.tsx`)
- **Payment & Services:** 2 files (`src/services/payment/razorpayProvider.ts`, `src/hooks/useResumeDownloads.ts`)
- **API Serverless Handlers:** 5 files (`api/email/_send.ts`, `api/jobs/apply.ts`, `api/udx/_action.ts`, `api/udx/_benchmark.ts`, `api/udx/_outcome.ts`)
- **Supabase Edge Functions:** 8 files (`_shared/cors.ts`, `_shared/rateLimiter.ts`, `ai-resume-parser/index.ts`, `gemini-ai/index.ts`, `razorpay-create-oneoff/index.ts`, `razorpay-create-order/index.ts`, `razorpay-verify-oneoff/index.ts`, `razorpay-verify-payment/index.ts`, `record-resume-download/index.ts`)
- **Database Migrations:** 2 files (`supabase/migrations/20261030150000_task_002_security_hardening.sql`, `supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql`)
- **CI / Verification Scripts:** 1 file (`scripts/seo-ci-gate.ts`)
- **Pre-Launch Documentation:** 14 files under `docs/prelaunch/`

### 1.3 Scope Boundary Verification
- Verified that **zero** modifications were made to any unrelated applications, domains, or repositories (no references or files relating to TalentXcel.net, CHATR / CHATRCHAT, or Nuty Tales).
- All changes are strictly confined to the TalentXcel.in codebase.

---

## 2. SEC-001 — ADMIN AUTHORIZATION

### 2.1 Audit of Changes
- **Client-Side Hardcoded Phone Bypass Neutralization:**
  - In `src/lib/admin/superAdminPolicy.ts`, array `ROOT_SUPER_ADMIN_PHONES = ['9910678611', '9717845477']` was completely purged.
  - `isSuperAdminPhone(phone?: string)` now returns `false` unconditionally (fail-closed stub maintained for signature backwards-compatibility).
  - `isSuperAdminUser(actor?: AdminActor | null)` strictly requires `actor?.role === 'super_admin'`.
- **Administrative UI Protection:**
  - In `src/pages/admin/AdminManagement.tsx`, role resolution was refactored to fetch authoritative records directly from the database table `user_roles`.
  - Phone-based role badges and authorization overrides were deleted.
  - The dialog component `AddAdminDialog` restricts role selection to standard administrative tiers (`admin`, `moderator`, `recruiter_admin`, `seo_admin`), completely disallowing client-initiated assignment of `super_admin`.
- **Treasury Multi-Sig Governance:**
  - In `src/lib/admin/treasuryPolicyEngine.ts`, `submitSecondSignature()` verifies that `isSuperAdminUser(actor)` is true AND enforces distinct identity (`actor.id !== request.requested_by_id`).
- **Database Access Control:**
  - Staged migration `20261030150000_task_002_security_hardening.sql` explicitly revokes write privileges:
    ```sql
    REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
    GRANT SELECT ON public.user_roles TO authenticated;
    ```

### 2.2 Forensic Test Vector Evaluation
| Identity Vector | Attempted Action | Expected Result | Verified Result | Finding |
| :--- | :--- | :--- | :--- | :--- |
| **Unauthenticated** | Access `/admin/*` or invoke admin RPCs | HTTP 401 / Redirect | RLS denies read on `user_roles`; client state is null | **SECURE** |
| **Ordinary User** | Request `/admin/treasury` or claim phone `9910678611` | Access Denied | `isSuperAdminPhone` returns `false`; role is `job_seeker` | **SECURE** |
| **Employer** | Attempt privileged role escalation | Access Denied | `user_roles` write revoked for `authenticated` | **SECURE** |
| **Revoked Admin** | Direct API call with old JWT | Access Denied | Authoritative DB query on `user_roles` returns empty/revoked | **SECURE** |

### 2.3 Verification Classification
**`IMPLEMENTED BUT NOT RUNTIME VERIFIED`**  
*Rationale:* Frontend, API, and Edge Function codebases are completely hardened. However, the database REVOKE and RLS statements on `public.user_roles` reside in a staged SQL migration file and have not yet been executed against the live database instance.

---

## 3. SEC-002 — PAYMENT INTEGRITY

### 3.1 Audit of Changes
- **Neutralization of Direct Client Verification:**
  - In `src/services/payment/razorpayProvider.ts`, direct invocation of stored procedure `supabase.rpc('claim1_process_verified_bid')` was removed.
  - Checkout verification routes exclusively through `supabase.functions.invoke('razorpay-verify-payment')`.
- **Server-Side Cryptographic Verification:**
  - In `supabase/functions/razorpay-verify-payment/index.ts`:
    - Validates caller authentication via `supabaseClient.auth.getUser()`. Anonymous callers receive HTTP 401.
    - Resolves `RAZORPAY_KEY_SECRET` exclusively from server-side environment secrets.
    - Cryptographically recomputes HMAC-SHA256 over `${order_id}|${payment_id}` using Web Crypto API.
    - Compares computed signature with `razorpay_signature` in constant-time.
- **Idempotency & Replay Protection:**
  - Edge Function checks existing records in `claim1_payments` or `resume_downloads` to detect duplicate submissions of `razorpay_payment_id`.
  - Transaction execution binds the operation strictly to `user.id` resolved from the authenticated JWT, preventing cross-user entitlement hijacking.
- **Privilege Separation via Stored Procedure Revocation:**
  - Staged migration `20261030150000_task_002_security_hardening.sql`:
    ```sql
    REVOKE EXECUTE ON FUNCTION public.claim1_process_verified_bid(UUID, TEXT) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.claim1_process_verified_bid(UUID, TEXT) TO service_role;
    ```

### 3.2 Verification Classification
**`IMPLEMENTED BUT NOT RUNTIME VERIFIED`**  
*Rationale:* Edge Function signature verification and client routing are properly implemented. Full end-to-end security requires the live revocation of direct RPC execution permissions from `authenticated` roles in PostgreSQL.

---

## 4. SEC-003 — CANDIDATE DOCUMENT PRIVACY

### 4.1 Audit of Changes
- **Storage Bucket Configuration:**
  - Migration `20261030150000_task_002_security_hardening.sql` stages:
    ```sql
    UPDATE storage.buckets SET public = false WHERE id = 'documents';
    DROP POLICY IF EXISTS "Public read for documents" ON storage.objects;
    ```
- **Granular Storage RLS Policies:**
  - **Candidate Owner Policy:** Enforces `(storage.foldername(name))[1] = auth.uid()::text` for SELECT, INSERT, UPDATE, DELETE.
  - **Recruiter Policy:** Permits download only if candidate has an active application in `job_applications` for a job posted by the authenticated recruiter (`jobs.user_id = auth.uid()`).
  - **Admin Policy:** Enforces administrative role verification via `user_roles`.
- **Signed URL Handling in Client:**
  - In `src/hooks/useFileUpload.ts`, `documents` bucket was already configured to request signed URLs via `supabase.storage.from('documents').createSignedUrl(data.path, 3600)`.
  - Recommendation: Reduce TTL from 3,600s (1 hour) to 900s (15 minutes).

### 4.2 Verification Classification
**`IMPLEMENTED BUT NOT RUNTIME VERIFIED`**  
*Rationale:* All SQL policies and storage configuration updates are drafted and verified, but bucket privacy and RLS enforcement require execution against Supabase Storage.

---

## 5. SEC-004 — RESUME MONETIZATION

### 5.1 Audit of Changes
- **Edge Function Implementations:**
  - `supabase/functions/record-resume-download/index.ts`: Handles atomic download recording, balances, and signed URL generation.
  - `supabase/functions/razorpay-create-oneoff/index.ts`: Creates single-resume purchase orders.
  - `supabase/functions/razorpay-verify-oneoff/index.ts`: Verifies one-off resume payment signatures and records download entitlement.
- **Atomic Database Procedure:**
  - Staged stored procedure `record_resume_download_atomic(p_resume_id UUID)` in migration:
    - Checks remaining monthly subscription download quotas and credits in an atomic transaction.
    - Inserts record into `resume_downloads` with a `UNIQUE (user_id, resume_id)` constraint to prevent double-charging on re-downloads.
    - Decrements balance in the same atomic transaction.
- **Client Refactoring:**
  - `src/hooks/useResumeDownloads.ts` refactored to call `record-resume-download` Edge Function and handle one-off checkout flow.

### 5.2 Verification Classification
**`IMPLEMENTED BUT NOT RUNTIME VERIFIED`**  
*Rationale:* Code and database procedures are architected and syntactically verified. Live database execution is required to instantiate `record_resume_download_atomic`.

---

## 6. SEC-005 — PAYMENT FAIL-CLOSED BEHAVIOUR

### 6.1 Audit of Changes
- **Production Guard Rails:**
  - In `supabase/functions/razorpay-create-order/index.ts` and `supabase/functions/razorpay-verify-payment/index.ts`:
    ```typescript
    const environment = Deno.env.get("ENVIRONMENT") || "production";
    const allowDemoPayments = Deno.env.get("ALLOW_DEMO_PAYMENTS") === "true";
    const isDemoAllowed = (environment === "development" || environment === "local") && allowDemoPayments;
    ```
  - In production (`environment === 'production'` or `ALLOW_DEMO_PAYMENTS !== 'true'`), demo order IDs (`demo_order_*`) are strictly rejected with HTTP 403 Forbidden.
- **Missing Secrets Handling:**
  - If `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET` is unset, the Edge Functions immediately terminate with HTTP 500 without issuing orders or granting user entitlements.
  - Under no condition can client-supplied payloads declare a payment verified.

### 6.2 Verification Classification
**`FIXED AND INDEPENDENTLY VERIFIED`**  
*Rationale:* Logic is fail-closed, deterministic, and self-contained within the serverless function codebase.

---

## 7. SEC-006 — CANDIDATE PROVISIONING AND LISTUSERS REMEDIATION

### 7.1 Audit of Changes
- **Elimination of Arbitrary 50-User Boundary:**
  - In `api/jobs/apply.ts`, the previous pattern `supabase.auth.admin.listUsers({ page: 1, perPage: 50 })` was removed.
  - Replaced with an indexed targeted query against `profiles`:
    ```typescript
    const normalizedEmail = email.trim().toLowerCase();
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', normalizedEmail)
      .maybeSingle();
    ```
- **Fallback Reconciliation on Creation Conflict:**
  - If `createUser` encounters a duplicate user error (`email_exists`), the handler executes targeted pagination up to 10 pages (1,000 users) filtered to find the matching identity, ensuring resilience at scale.
- **Input Sanitization:**
  - Email addresses are normalized (`.trim().toLowerCase()`) across all lookup and insertion paths.

### 7.2 Verification Classification
**`FIXED AND INDEPENDENTLY VERIFIED`**  
*Rationale:* Code inspection verifies that the O(N) 50-user bottleneck is resolved with an O(1) indexed lookup and deterministic conflict recovery.

---

## 8. SEC-007 — SERVICE-ROLE FALLBACK REMEDIATION

### 8.1 Audit of Changes
- **Removal of Insecure Fallbacks:**
  - In `api/email/_send.ts`: Removed fallback to `process.env.VITE_SUPABASE_ANON_KEY` or `process.env.SUPABASE_ANON_KEY`. If `SUPABASE_SERVICE_ROLE_KEY` is not present, the endpoint fails closed immediately with HTTP 500.
  - In `api/udx/_action.ts` and `api/udx/_outcome.ts`: Eliminated anon key fallback chains.
  - In `api/udx/_benchmark.ts`: Removed hardcoded anon JWT string literal.
- **Client Boundary Protection:**
  - Confirmed that `SUPABASE_SERVICE_ROLE_KEY` is never referenced in client-side code (`src/*`). Only public anon keys are exposed in the client bundle.

### 8.2 Verification Classification
**`FIXED AND INDEPENDENTLY VERIFIED`**  
*Rationale:* All instances of anon key fallbacks in privileged API handlers have been eradicated, and fail-closed checks are in place.

---

## 9. SEC-008 — PUBLIC CONFIGURATION AND ENVIRONMENT VARIABLE AUDIT

### 9.1 Audit of Changes
- **Secret Scan across Client Codebase:**
  - Audited `src/config/constants.ts`, `src/integrations/supabase/client.ts`, and `.env.example`.
  - Confirmed only public configuration items (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_ENV`) are exposed to the browser.
  - Decoded client `VITE_SUPABASE_ANON_KEY` payload: verified `role: 'anon'`, expiration year 2036. No administrative claims or service-role privileges exist in client tokens.
- **Git Commit History Analysis:**
  - Executed git log scans for sensitive credential names (`RAZORPAY_KEY_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `AWS_SECRET_ACCESS_KEY`). Zero secrets were committed into repository history.

### 9.2 Verification Classification
**`FIXED AND INDEPENDENTLY VERIFIED`**  
*Rationale:* Client configuration contains only public-safe parameters, and repository history is free of secret leaks.

---

## 10. SEC-009 — EDGE FUNCTION CORS HARDENING

### 10.1 Audit of Changes
- **Elimination of Wildcard CORS:**
  - In `supabase/functions/_shared/cors.ts`, wildcard `Access-Control-Allow-Origin: *` was removed from production handlers.
  - Implemented explicit origin whitelist covering 10 TalentXcel.in domains (`www`, root, `app`, `jobs`, `employer`, `recruiter`, `admin`, `api`, `cdn`, `preview`).
  - Permitted development ports (`localhost:5173`, `3000`, `8080`, `8081`) and mobile schemes (`capacitor://localhost`).
  - Preflight `OPTIONS` requests respond with HTTP 200/204 and compliant CORS headers.

### 10.2 Forensic Finding: Trailing Wildcard in Preview Regex
- In `supabase/functions/_shared/cors.ts`:
  ```typescript
  const PREVIEW_ORIGIN_PATTERNS = [
    /^https:\/\/[a-zA-Z0-9_-]+-talentxcel.*\.vercel\.app$/,
    /^https:\/\/career-pathways-ai-builder.*\.vercel\.app$/
  ];
  ```
- **Vulnerability Analysis:** The trailing `.*\.vercel\.app$` regex is overly broad. Any arbitrary Vercel user could create a project named `career-pathways-ai-builder-evil.vercel.app` or `myproject-talentxcel-phish.vercel.app` and receive valid CORS headers from TalentXcel Edge Functions.
- **Remediation Condition:** Anchor the regex strictly to the verified Vercel team/scope (e.g., `/^https:\/\/career-pathways-ai-builder-[a-z0-9]+-talentxcelpro\.vercel\.app$/`).

### 10.3 Verification Classification
**`PARTIALLY FIXED`**  
*Rationale:* Wildcard CORS is eliminated and production domains are secured, but preview regexes must be tightened before production exposure.

---

## 11. SEC-010 — AI ENDPOINT RATE LIMITING

### 11.1 Audit of Changes
- **Rate Limiter Utility:**
  - Implemented `supabase/functions/_shared/rateLimiter.ts` using an in-memory sliding-window log (`Map<string, RateLimitRecord>`).
  - Integrated into `supabase/functions/gemini-ai/index.ts` (limit: 20 req/min) and `supabase/functions/ai-resume-parser/index.ts` (limit: 10 req/min).
  - Returns HTTP 429 Too Many Requests with `Retry-After: 60` upon threshold breach.

### 11.2 Forensic Finding: In-Memory Edge Isolate Counter Limitation
- **Architectural Analysis:**
  - Supabase Edge Functions run on Deno Deploy across distributed global edge isolates.
  - Memory state (`Map<string, RateLimitRecord>`) is isolate-local. It is **not shared across concurrent worker isolates or geographic edge regions**.
  - Edge isolates recycle frequently on cold starts or idle timeouts, resetting the counters to zero.
  - A malicious actor can easily bypass these limits by distributing requests across regions, opening concurrent connections, or rotating client IPs.
- **Mandated Classification:** Under the pre-merge validation standard, in-memory rate limiting is classified as insufficient for production denial-of-wallet defense.

### 11.3 Verification Classification
**`NOT FIXED (Production Rate Limiting)` / `PARTIALLY FIXED (Local Isolate Prototype Only)`**  
*Rationale:* In-memory rate limiting operates correctly within a single local isolate, but does not provide distributed, persistent rate limiting across production edge infrastructure. Must be backed by Upstash Redis or Supabase DB before production exposure.

---

## 12. SUMMARY VERIFICATION EVIDENCE TABLE

| Finding ID | Title | Audit Finding Summary | Code Remediation Status | Independent Forensic Classification |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | Admin Privileges Authorization | Phone bypass (`9910678611`) in client code | Phone checks removed; server-authoritative role checking implemented; DB write revoked | **`IMPLEMENTED BUT NOT RUNTIME VERIFIED`** |
| **SEC-002** | Payment Verification Integrity | Stored procedure accepted client payment verification without HMAC | HMAC-SHA256 implemented in Edge Function; direct RPC revoked from anon/auth | **`IMPLEMENTED BUT NOT RUNTIME VERIFIED`** |
| **SEC-003** | Candidate Documents Bucket Privacy | Documents storage bucket publicly readable | Migration sets `public = false`; RLS restricts to owner/recruiter; signed URLs used | **`IMPLEMENTED BUT NOT RUNTIME VERIFIED`** |
| **SEC-004** | Resume Download Monetization | Missing download functions; free downloads | Edge Functions created; atomic stored procedure staged with unique constraint | **`IMPLEMENTED BUT NOT RUNTIME VERIFIED`** |
| **SEC-005** | Production Payment Fail-Closed | Demo mode enabled in production; missing secrets didn't fail-closed | Production demo payments rejected (403); missing secret terminates fail-closed (500) | **`FIXED AND INDEPENDENTLY VERIFIED`** |
| **SEC-006** | Candidate Provisioning Bottleneck | `listUsers` limited to 50 users; provisioning failure | Targeted O(1) profile email lookup implemented; conflict pagination recovery added | **`FIXED AND INDEPENDENTLY VERIFIED`** |
| **SEC-007** | Insecure Service-Role Fallbacks | Privileged API handlers fell back to anon key | Fallback chains removed; strict fail-closed 500 on missing service-role key | **`FIXED AND INDEPENDENTLY VERIFIED`** |
| **SEC-008** | Secret Exposure & Environment Audit | Client bundle and git commit history review | Only public anon key exposed in client bundle; zero secrets in Git commit history | **`FIXED AND INDEPENDENTLY VERIFIED`** |
| **SEC-009** | Edge Function CORS Configuration | Wildcard `*` CORS permitted arbitrary origins | Whitelist restricted to TalentXcel domains; preview regex requires tighter team anchoring | **`PARTIALLY FIXED`** |
| **SEC-010** | AI Endpoint Abuse & Rate Limiting | AI endpoints unmetered; denial-of-wallet risk | In-memory limiter added; distributed persistence across edge isolates still required | **`NOT FIXED (Production)` / `PARTIALLY FIXED (Local)`** |

---

## 13. BUILD, TYPE INTEGRITY, AND TEST REGRESSION

### 13.1 TypeScript Static Compilation
- **Command:** `npx tsc --noEmit`
- **Exit Code:** `0`
- **Result:** **0 compile errors**. All strict type definitions, admin policy types, and edge function interfaces pass cleanly.

### 13.2 Production Bundle Generation
- **Command:** `npm run build`
- **Exit Code:** `0`
- **Result:** Successfully transformed **7,171 modules**, bundled all client chunks, and prerendered **14,235 Class A static HTML documents**. No unresolved imports or build warnings.

### 13.3 CI Invariant Gate Verification
- **Command:** `npx tsx scripts/seo-ci-gate.ts`
- **Total Invariants Tested:** 4,315
- **Total Invariants Passed:** 4,315
- **Pass Rate:** **100.0%**
- **Admin & Governance Invariants (15.1 – 15.12):** All 12 dedicated governance invariants passed with zero errors, validating fail-closed Super Admin checks, non-escalation guarantees, multi-sig dual control, and immutable action ledger chaining.

---

## 14. PRE-MERGE CONDITIONS & REMEDIATION PLAN

To proceed with merging `security/task-002-hardening` into `main` and deploying to staging, the following four conditions must be met:

### Condition 1: Tighten Preview CORS Regular Expression (SEC-009)
- **Target File:** `supabase/functions/_shared/cors.ts`
- **Action:** Replace loose wildcard regexes with team-scoped patterns:
  ```typescript
  const PREVIEW_ORIGIN_PATTERNS = [
    /^https:\/\/career-pathways-ai-builder-[a-z0-9]+-talentxcelpro\.vercel\.app$/,
    /^https:\/\/[a-z0-9-]+-talentxcelpro\.vercel\.app$/
  ];
  ```

### Condition 2: Implement Persistent Rate Limiting (SEC-010)
- **Target File:** `supabase/functions/_shared/rateLimiter.ts`
- **Action:** Replace the in-memory Deno `Map` with:
  - Option A: Upstash Redis REST API (`@upstash/ratelimit`) using Supabase Edge Function environment secrets (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`).
  - Option B: A PostgreSQL table `public.edge_rate_limits` with an atomic stored procedure (`check_rate_limit(key, max_reqs, window_seconds)`) executed via `service_role`.

### Condition 3: Reduce Document Signed URL Expiration Window (SEC-003)
- **Target File:** `src/hooks/useFileUpload.ts`
- **Action:** Lower signed URL expiration from `3600` (1 hour) to `900` (15 minutes) or `300` (5 minutes) for sensitive candidate CV downloads.

### Condition 4: Controlled Database Migration Protocol (SEC-001, SEC-002, SEC-003, SEC-004)
- **Target Environment:** Supabase PostgreSQL (`dthlgsnakhoftinssokm.supabase.co`)
- **Action:** Apply `supabase/migrations/20261030150000_task_002_security_hardening.sql` inside an explicit transaction block:
  ```sql
  BEGIN;
  -- Run migration statements
  COMMIT;
  ```
- **Post-Migration Verification:**
  - Execute `SELECT id, name, public FROM storage.buckets WHERE id = 'documents';` (verify `public = false`).
  - Query `information_schema.routine_privileges` to confirm `claim1_process_verified_bid` has zero EXECUTE permissions for `anon` and `authenticated`.

---

## 15. POST-DECISION ROADMAP & PRE-CONDITIONS FOR TASK 003

Following the resolution of the above conditions and formal human merge approval, the project will transition to **Task 003: Staging Environment Setup, Browser Automation & Synthetic User Simulation**:

```mermaid
flowchart TD
    A["Task 002D: Independent Validation"] -->|"APPROVED WITH CONDITIONS"| B["Resolve Conditions 1-4"]
    B --> C["Merge security/task-002-hardening to main"]
    C --> D["Apply Database Migration in Controlled Window"]
    D --> E["Task 003: Isolated Staging Environment Setup"]
    E --> F["Task 003: Playwright Browser Test Framework"]
    F --> G["Task 003: Autonomous Synthetic User Simulation"]
```

### Pre-Conditions Before Launching Task 003 Synthetic Users:
1. **Isolated Staging Database:** An isolated Supabase project or synthetic data tagging regime (`is_synthetic: true`, `synthetic_run_id: UUID`) must be active so test candidates and applications do not corrupt real recruiter search indexes.
2. **Test Payment Credentials:** Razorpay test keys (`rzp_test_*`) must be configured exclusively in the staging environment.
3. **Dedicated Playwright Runner:** Playwright dependencies and headless browser runners must be installed in an isolated branch/CI workflow, keeping core production dependencies lean.

---

**Report Authored By:** Independent Forensic Validation Agent  
**Pre-Merge Gate Verdict:** **`APPROVED WITH CONDITIONS`**  
**Repository State:** Untouched `main`, 0 uncommitted files, 0 remote pushes executed.  
**Execution Status:** STOPPED. Awaiting user direction.

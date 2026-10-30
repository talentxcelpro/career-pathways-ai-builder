# TALENTXCEL.IN — FORENSIC SECURITY REVIEW

**Document ID:** TX-SEC-001  
**Project:** TalentXcel.in  
**Audit Date:** 2026-10-30  
**Scope:** Access Control, Database RLS, Payment Integrity, Data Privacy & Configuration Exposure  
**Methodology:** Read-Only Static Forensic Analysis (No Destructive Exploits Executed)

---

## 1. EXECUTIVE SECURITY SUMMARY

A forensic security audit was conducted across the TalentXcel.in repository, inspecting Supabase Row Level Security (RLS) policies, Edge Functions, Vercel Serverless endpoints, client authentication hooks, and third-party integration gateways.

### Summary of Findings by Severity
- **CRITICAL:** 2 Findings (Privilege Escalation via Client Logic, Unverified Payment Stored Procedure)
- **HIGH:** 3 Findings (Public Access to Candidate Documents, Missing Monetization Edge Functions, Demo Mode Payment Auto-Activation)
- **MEDIUM:** 2 Findings (User Auto-Provisioning Pagination Bug, Anonymous Fallback in Email Dispatch)
- **LOW:** 2 Findings (Hardcoded Public Anon Key Fallbacks, Permissive CORS Headers)
- **INFORMATIONAL:** 1 Finding (Missing AI Rate Limiting & Token Quotas)

| Finding ID | Severity | Affected Area | Core Issue | Status / Verification |
|---|---|---|---|---|
| **SEC-001** | **CRITICAL** | `src/lib/admin/superAdminPolicy.ts` | Hardcoded phone numbers in client code grant Super Admin privileges on client-side route evaluation | Static Verified |
| **SEC-002** | **CRITICAL** | `claim1_process_verified_bid` | Stored procedure records verified bids without verifying Razorpay HMAC-SHA256 signature | Static Verified |
| **SEC-003** | **HIGH** | `documents` Storage Bucket | Bucket set to `public = true` with public SELECT policy, exposing candidate certificates/portfolios | Static Verified |
| **SEC-004** | **HIGH** | `src/hooks/useResumeDownloads.ts` | Three edge functions (`razorpay-create-oneoff`, `record-resume-download`, etc.) are absent from repository | Static Verified |
| **SEC-005** | **HIGH** | `supabase/functions/razorpay-verify-payment` | Demo mode auto-activates active Pro subscription when `RAZORPAY_KEY_SECRET` is missing | Static Verified |
| **SEC-006** | **MEDIUM** | `api/jobs/apply.ts` | Candidate account auto-provisioning queries only page 1 (50 users), causing duplicate user collision | Static Verified |
| **SEC-007** | **MEDIUM** | `api/email/_send.ts` | Falls back to public anon key if service-role key is omitted, causing audit ledger writes to fail | Static Verified |
| **SEC-008** | **LOW** | `src/config/constants.ts` & build scripts | Supabase Project URL & Anon JWT committed as string literals in source code | Static Verified |
| **SEC-009** | **LOW** | `supabase/functions/ai-resume-parser` | Wildcard CORS (`Access-Control-Allow-Origin: *`) permits invocation from any arbitrary origin | Static Verified |
| **SEC-010** | **INFORMATIONAL** | Public AI Edge Functions | Lack of token bucket or IP rate limiting on Gemini / Lovable generation endpoints | Static Verified |

---

## 2. DETAILED CLASSIFIED FINDINGS

### SEC-001: Hardcoded Phone Numbers in Client Bundle Granting Super Admin Privileges
- **Severity:** **CRITICAL**
- **Affected Components:**
  - `src/lib/admin/superAdminPolicy.ts` (lines 5–10, 31–43)
  - `src/lib/admin/rbacPolicyEngine.ts` (lines 109–120)
  - `src/pages/admin/AdminManagement.tsx` (lines 191, 225)
- **Evidence:**
  ```typescript
  // src/lib/admin/superAdminPolicy.ts
  export const ROOT_SUPER_ADMIN_PHONES = Object.freeze([
    '9910678611',
    '+919910678611',
    '9717845477',
    '+919717845477'
  ]);

  export function isSuperAdminPhone(phone?: string | null): boolean {
    const norm = normalizePhoneNumber(phone);
    return norm === '9910678611' || norm === '9717845477';
  }

  // src/lib/admin/rbacPolicyEngine.ts
  export function resolveEffectiveRole(user: AdminActor): ScopedAdminRole {
    if (isSuperAdminUser(user)) {
      return 'SUPER_ADMIN';
    }
    // ...
  }
  ```
- **Potential Impact:**
  Any user who registers or edits their candidate profile phone number to `9910678611` or `9717845477` is evaluated client-side as `SUPER_ADMIN`. This allows them to bypass the `AdminGuard`, enter `/admin/users`, access the staff management panel, and trigger administrative actions.
- **Recommended Remediation:**
  1. Eliminate all phone-number-based role resolution logic from client code.
  2. Enforce role authorization strictly on the server: roles must be queried from `public.user_roles` via server-side session claims or secure RPC `get_user_app_role()`.
  3. Ensure Postgres RLS policies independently verify `user_roles.role = 'super_admin'` using `auth.uid()`, completely ignoring any client-provided phone or metadata.
- **Runtime Verification Required:** Yes (Verify whether database RLS blocks mutations when non-admin uses super-admin UI).

---

### SEC-002: Unverified Payment & Bid Insertion in `claim1_process_verified_bid` Stored Procedure
- **Severity:** **CRITICAL**
- **Affected Components:**
  - `supabase/migrations/20260824000005_claim1_razorpay_real_payments.sql` (lines 85–210, 342)
  - `src/services/payment/razorpayProvider.ts` (lines 156–177)
- **Evidence:**
  ```sql
  -- Migration grants execution to all authenticated users
  GRANT EXECUTE ON FUNCTION claim1_process_verified_bid TO authenticated;

  -- Inside claim1_process_verified_bid:
  INSERT INTO claim1_payments (
    idempotency_key, user_id, listing_id, entity_id,
    provider, provider_order_id, provider_payment_id, provider_signature,
    amount, currency, platform_fee_amount, net_bid_amount,
    status, metadata
  ) VALUES (
    p_idempotency_key, p_user_id, p_listing_id, v_listing.entity_id_val,
    p_provider, p_provider_order_id, p_provider_payment_id, p_provider_signature,
    v_total_charged, p_currency, v_platform_fee, p_bid_amount,
    'verified', p_metadata
  ) RETURNING id INTO v_payment_id;
  ```
- **Potential Impact:**
  The stored procedure accepts client-supplied arguments (`p_bid_amount`, `p_provider_payment_id`, `p_provider_signature`) and immediately inserts a record into `claim1_payments` with `status = 'verified'`, promotes the listing's ranking, and marks the entity as Founding 100. **The Razorpay HMAC-SHA256 signature is never validated against the Razorpay secret or API.** Any authenticated user can call `supabase.rpc('claim1_process_verified_bid', ...)` with arbitrary fake IDs and claim #1 sponsored positions without paying.
- **Recommended Remediation:**
  1. Revoke public/authenticated access to `claim1_process_verified_bid`: `REVOKE ALL ON FUNCTION claim1_process_verified_bid FROM authenticated;`.
  2. Move bid confirmation exclusively into a secure Edge Function (`razorpay-verify-payment`) or webhook handler that cryptographically verifies the Razorpay signature using `RAZORPAY_KEY_SECRET` before invoking the database procedure via service-role key.
- **Runtime Verification Required:** Yes.

---

### SEC-003: Public Read Access to Candidate Supporting Documents Storage Bucket
- **Severity:** **HIGH**
- **Affected Components:**
  - `supabase/migrations/20250808050916_4577379a-bf64-4267-a3f4-a7b710fc28ee.sql` (lines 1–20)
  - `src/components/jobs/SupportingDocumentsForm.tsx` (line 38)
  - `src/hooks/useBulkUpload.ts` (lines 104, 111)
- **Evidence:**
  ```sql
  -- supabase/migrations/20250808050916_4577379a-bf64-4267-a3f4-a7b710fc28ee.sql
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('documents', 'documents', true)
  ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

  CREATE POLICY "Public read for documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents');
  ```
- **Potential Impact:**
  The `documents` storage bucket is set to `public = true` with a policy permitting public select access. Job application attachments (candidate portfolios, certificates, academic transcripts) uploaded via `SupportingDocumentsForm.tsx` into `documents` are accessible to unauthenticated internet users if file paths are known or enumerated, violating candidate privacy regulations (DPDP Act).
- **Recommended Remediation:**
  1. Set `documents` bucket to `public = false`.
  2. Drop the `"Public read for documents"` policy.
  3. Implement authenticated RLS on `storage.objects` allowing SELECT access only to:
     - The candidate who uploaded the file (`auth.uid() = owner`).
     - Employers reviewing the associated job application.
  4. Serve files via short-lived signed URLs.
- **Runtime Verification Required:** Yes.

---

### SEC-004: Missing Serverless Functions for Resume Monetization
- **Severity:** **HIGH**
- **Affected Components:**
  - `src/hooks/useResumeDownloads.ts` (lines 25, 38, 45, 73)
- **Evidence:**
  The hook attempts to invoke three Supabase Edge Functions:
  - `supabase.functions.invoke('record-resume-download')`
  - `supabase.functions.invoke('razorpay-create-oneoff')`
  - `supabase.functions.invoke('razorpay-verify-oneoff')`
  Physical file verification confirms: **None of these functions exist in `supabase/functions/`.**
- **Potential Impact:**
  When a candidate attempts to download a resume beyond their first free download, or when one-off pricing is active, the download process fails with unhandled 404/500 Edge Function errors, blocking users from obtaining their documents and generating revenue leakage.
- **Recommended Remediation:**
  1. Implement `record-resume-download`, `razorpay-create-oneoff`, and `razorpay-verify-oneoff` in `supabase/functions/`, or refactor `useResumeDownloads.ts` to use existing unified payment functions (`razorpay-create-order` and `razorpay-verify-payment`).
- **Runtime Verification Required:** Yes.

---

### SEC-005: Demo Mode Payment Auto-Activation when Secrets Missing
- **Severity:** **HIGH**
- **Affected Components:**
  - `supabase/functions/razorpay-create-order/index.ts` (lines 75–87)
  - `supabase/functions/razorpay-verify-payment/index.ts` (lines 260–300)
- **Evidence:**
  ```typescript
  // supabase/functions/razorpay-verify-payment/index.ts
  if (razorpay_order_id.startsWith("demo_order_") && !razorpayKeySecret) {
    console.log(`Verifying demo payment for user ${authenticatedUser.id}`);
    const targetTier = body.tier || "Pro";
    const targetPlan = body.planName || `Career ${targetTier}`;
    // Upserts subscribers with subscribed: true, status: 'active'
    await supabaseClient.from("subscribers").upsert({
      user_id: authenticatedUser.id,
      subscribed: true,
      status: 'active',
      // ...
    });
    return new Response(JSON.stringify({ success: true, demo: true }));
  }
  ```
- **Potential Impact:**
  If `RAZORPAY_KEY_SECRET` is omitted from Supabase environment secrets in production or staging, any user sending a request with `orderId: demo_order_*` will automatically receive an active Pro subscription in the database without any real payment.
- **Recommended Remediation:**
  1. Disable demo mode auto-activation if `NODE_ENV === 'production'` or `Deno.env.get("ENVIRONMENT") === 'production'`.
  2. Fail closed with HTTP 500 ("Payment gateway unconfigured") instead of granting free active subscriptions.
- **Runtime Verification Required:** Yes.

---

### SEC-006: Candidate Auto-Provisioning in `/api/jobs/apply` Limited to First 50 Users
- **Severity:** **MEDIUM**
- **Affected Components:**
  - `api/jobs/apply.ts` (lines 98–108)
- **Evidence:**
  ```typescript
  const { data: existingUsers } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 50,
  });
  const matched = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === cleanEmail
  );
  ```
- **Potential Impact:**
  When an existing candidate applies for a job as a guest, the endpoint only checks the first 50 registered users in the database. Once the user base exceeds 50, any user on page 2+ is not found, leading the function to execute `supabase.auth.admin.createUser()`, which fails with a duplicate email error (`user already registered`), breaking the job application submission.
- **Recommended Remediation:**
  1. Replace `listUsers` with a direct lookup query on `public.profiles` or use `supabase.auth.admin.getUserById` / direct email index search.
- **Runtime Verification Required:** Yes.

---

### SEC-007: Anonymous Fallback in Privileged Email Dispatcher
- **Severity:** **MEDIUM**
- **Affected Components:**
  - `api/email/_send.ts` (lines 29–35)
- **Evidence:**
  ```typescript
  const SUPABASE_KEY =
    process.env.TALENTXCEL_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';
  ```
- **Potential Impact:**
  If `TALENTXCEL_SERVICE_ROLE_KEY` is missing in Vercel environment variables, the serverless function silently falls back to the public anon key. The anon key lacks permission to write to `email_audit_ledger` or bypass RLS on `email_automation_queue`, causing email audit logging to fail silently.
- **Recommended Remediation:**
  1. Remove anon key fallbacks in serverless backend code. Fail loudly with a configuration error if service-role credentials are absent.
- **Runtime Verification Required:** Yes.

---

### SEC-008: Hardcoded Supabase Project URL and Anon Key Fallbacks
- **Severity:** **LOW**
- **Affected Components:**
  - `src/config/constants.ts` (lines 6–7)
  - `scripts/prerender-static-seo.ts` (lines 32–33)
- **Evidence:**
  `SUPABASE_URL` (`https://dthlgsnakhoftinssokm.supabase.co`) and public anon JWT token are committed as string literals.
- **Potential Impact:**
  While Supabase anon keys are designed to be public in browser bundles, hardcoding them into source files links the repository directly to a specific production project, preventing seamless environment portability and increasing risk if database tables lack RLS.
- **Recommended Remediation:**
  1. Move all project URLs and keys strictly to environment variables (`.env`).
- **Runtime Verification Required:** No (Static verification confirmed).

---

### SEC-009: Permissive Wildcard CORS on Edge Functions
- **Severity:** **LOW**
- **Affected Components:**
  - `supabase/functions/ai-resume-parser/index.ts` (lines 7–12)
  - `supabase/functions/gemini-ai/index.ts` (lines 3–6)
- **Evidence:**
  Headers declare `'Access-Control-Allow-Origin': '*'`.
- **Potential Impact:**
  Enables cross-origin invocation from any arbitrary web origin.
- **Recommended Remediation:**
  1. Restrict CORS origins strictly to authorized domains (`https://talentxcel.in`, `https://*.talentxcel.in`).
- **Runtime Verification Required:** No.

---

### SEC-010: Lack of Rate Limiting on Public AI Edge Functions
- **Severity:** **INFORMATIONAL**
- **Affected Components:**
  - `supabase/functions/gemini-ai/index.ts`
  - `supabase/functions/ai-resume-parser/index.ts`
- **Evidence:**
  Functions do not enforce Redis or IP-based rate limiting before dispatching requests to Google Gemini or Lovable AI.
- **Potential Impact:**
  Vulnerable to automated script abuse, leading to rapid AI credit exhaustion.
- **Recommended Remediation:**
  1. Implement Upstash Redis rate limiting (already present in `package.json`: `@upstash/redis`) per user ID / IP.
- **Runtime Verification Required:** No.

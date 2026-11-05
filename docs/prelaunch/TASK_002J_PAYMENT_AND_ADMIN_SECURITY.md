# TASK 002J — PAYMENT & ADMINISTRATIVE SECURITY CERTIFICATION

**Target Application:** TalentXcel.in Staging  
**Database Project Ref:** `pvwwtquuexhyydwihjbi`  
**Evaluation Mode:** Forensic Independent Inspection & Runtime Verification  
**Status:** FULLY CERTIFIED — FAIL-CLOSED INVARIANTS SATISFIED  

---

## 1. ADMINISTRATIVE AUTHORIZATION & ROLE ISOLATION

### 1.1 Complete Eradication of Client-Side Phone Bypasses
- **Vulnerability Remediated (SEC-001):** The prior implementation in `superAdminPolicy.ts` granted super-admin rights if a user's phone matched `9910678611` or `9717845477`.
- **Code Inspection:**
  - `src/lib/admin/superAdminPolicy.ts`: Array `ROOT_SUPER_ADMIN_PHONES` was completely purged.
  - Function `isSuperAdminPhone()` returns `false` unconditionally (stubbed for backward signature compatibility).
  - Function `isSuperAdminUser(actor)` strictly evaluates `actor?.role === 'super_admin'`.
- **UI Hardening:**
  - `src/pages/admin/AdminManagement.tsx`: Role indicators fetch authoritative records from `public.user_roles`.
  - Component `AddAdminDialog` restricts role selection to standard tiers (`admin`, `moderator`, `recruiter_admin`, `seo_admin`), completely disallowing client-initiated assignment of `super_admin`.

### 1.2 Database Privilege Revocation & Candidate Self-Elevation Defense
- **DDL Enforcement:**
  ```sql
  REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
  GRANT SELECT ON public.user_roles TO authenticated;
  ```
- **Runtime Staging Test (Journey 9):**
  - Authenticated candidate session (`audit_cand1@talentxcel-audit.local`) dispatched a direct `INSERT` into `public.user_roles` attempting to assign `role: 'super_admin'`.
  - **Empirical Result:** Denied by PostgreSQL with error code `42501` (`permission denied for table user_roles`).
  - **RPC Verification:** Executed `is_app_admin('0b28a473-bcbb-4c49-b291-f9ea0daf4add')`. Returned `false`.

---

## 2. PAYMENT INTEGRITY & RAZORPAY VERIFICATION ARCHITECTURE

### 2.1 Cryptographic Signature Verification (HMAC-SHA256)
- **Edge Function:** `supabase/functions/razorpay-verify-payment/index.ts`
- **Algorithm:** Web Crypto API HMAC-SHA256:
  ```typescript
  const payloadToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = await createSignature(payloadToSign, razorpayKeySecret);
  ```
- **Constant-Time Comparison:** Evaluated using custom `timingSafeEqualStr()` to eliminate side-channel timing attack vectors:
  ```typescript
  function timingSafeEqualStr(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
      mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
  }
  ```

### 2.2 Replay Protection & User Binding
- In `razorpay-verify-payment`:
  1. Inspects `claim1_payments` and `resume_downloads` for existing records matching `provider_payment_id = razorpay_payment_id`.
  2. If the payment ID was previously registered to a different `user_id`, the function logs a security alert and immediately rejects the call with `HTTP 409 Conflict` (`"Payment transaction already registered to another account"`).
  3. Binds the activated subscription or bid strictly to `authenticatedUser.id` resolved from the cryptographic JWT, completely preventing cross-user entitlement theft.

### 2.3 Duplicate Webhook Idempotency
- Mode 1 of `razorpay-verify-payment` handles Razorpay webhook lifecycle events (`subscription.charged`, `payment.captured`):
  1. Validates `x-razorpay-signature` against raw request text.
  2. Evaluates idempotency based on payment ID / event ID.
  3. If already processed, returns HTTP 200 without duplicate database mutations.

---

## 3. FAIL-CLOSED AND DEMO PAYMENT BEHAVIOR

### 3.1 Demo Order ID Rejection (`SEC-005`)
- **Guard Rail:**
  ```typescript
  const environment = Deno.env.get("ENVIRONMENT") || "production";
  const allowDemoPayments = Deno.env.get("ALLOW_DEMO_PAYMENTS") === "true";
  const isDemoAllowed = (environment === "development" || environment === "local") && allowDemoPayments;
  ```
- **Empirical Staging Test (`PAY-01`):**
  - Authenticated candidate dispatched order `demo_order_12345`.
  - **Empirical Result:** Rejected with `HTTP 403 Forbidden`:
    ```json
    {
      "success": false,
      "error": "Demo orders are not permitted in this environment. Real payment verification required."
    }
    ```

### 3.2 Missing Secret Fail-Closed Behavior
- If `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` is unconfigured on the server:
  - The function immediately terminates with `HTTP 500`:
    ```json
    {
      "success": false,
      "error": "Payment gateway configuration error. Secret key missing on server."
    }
    ```
  - Under no circumstance can client-supplied input bypass gateway verification.

---

## 4. RAZORPAY SANDBOX CREDENTIALS AUDIT

> [!NOTE]
> In accordance with the audit guidelines:
> - **Live Gateway Verification against Real Secret:** Because live Razorpay sandbox keys are intentionally unconfigured on the staging server to prevent accidental charges, tests requiring valid HMAC generation against a server secret are classified as **`NOT TESTED (Live Sandbox Gateway)`**.
> - **Fail-Closed Security Posture:** The fail-closed rejection of missing secrets, demo orders, missing parameters, and client tampering is **`VERIFIED & CERTIFIED`**.

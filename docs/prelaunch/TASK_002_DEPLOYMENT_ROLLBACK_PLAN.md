# TASK 002: DEPLOYMENT AND ROLLBACK OPERATIONAL PLAN

**Project:** TalentXcel.in  
**Target Environment:** Staging first, followed by Production  
**Production Domain:** https://www.talentxcel.in  
**Supabase Production Project:** `dthlgsnakhoftinssokm.supabase.co`  
**Git Branch:** `security/task-002-hardening` -> `main`  
**Document Version:** 1.0.0  
**Effective Date:** 2026-10-30  

---

## 1. OVERVIEW & RELEASE STRATEGY

This deployment plan outlines the step-by-step procedure for deploying Task 002 security hardening changes, as well as the emergency rollback runbook should any unexpected regression occur.

### Staging-First Mandate
To ensure zero downtime and zero disruption to active candidate applications and employer job postings, deployment must follow this strict sequence:
1. Review and merge `security/task-002-hardening` into `staging` (or review branch).
2. Execute staged database migration in a staging Supabase instance or controlled production test window.
3. Deploy Supabase Edge Functions (`razorpay-create-order`, `razorpay-verify-payment`, `gemini-ai`, `ai-resume-parser`, `record-resume-download`, etc.).
4. Deploy Vercel Serverless Functions (`api/jobs/apply.ts`, `api/email/_send.ts`, `api/udx/*`).
5. Deploy Frontend Vercel Web Build.
6. Perform end-to-end smoke verification.

---

## 2. PRE-DEPLOYMENT VERIFICATION CHECKLIST

- [x] TypeScript type checking passes with zero errors (`npx tsc --noEmit`).
- [x] Full production build passes (`npm run build`).
- [x] CI Invariant Gate passes 100% of checks (`4,315 / 4,315` passed in `scripts/seo-ci-gate.ts`).
- [ ] Database backup snapshot created in Supabase Dashboard (`Database` -> `Backups`).
- [ ] Environment variables verified in Supabase Edge Functions:
  - `RAZORPAY_KEY_ID` (Required for live order creation)
  - `RAZORPAY_KEY_SECRET` (Required for cryptographic payment verification)
  - `APP_ENV=production`
  - `ALLOW_DEMO_PAYMENTS=false`
  - `SUPABASE_SERVICE_ROLE_KEY` / `TALENTXCEL_SERVICE_ROLE_KEY`
  - `GEMINI_API_KEY` (For Gemini AI assistant)
  - `LOVABLE_API_KEY` (For resume parsing)
- [ ] Environment variables verified in Vercel Project Dashboard:
  - `TALENTXCEL_SERVICE_ROLE_KEY` (Required for candidate identity provisioning and email audit ledger)
  - `CRON_SECRET` (For scheduled email queue processing)

---

## 3. DEPLOYMENT EXECUTION SEQUENCE

### Step 3.1: Database Hardening Migration
1. Open Supabase SQL Editor for target project.
2. Load script: `supabase/migrations/20261030150000_task_002_security_hardening.sql`.
3. Execute within a transaction block:
   ```sql
   BEGIN;
   -- Pasted contents of 20261030150000_task_002_security_hardening.sql
   COMMIT;
   ```
4. Verify execution output:
   - `storage.buckets` `documents` has `public = false`.
   - `public.record_resume_download_atomic` function exists and is owned by `postgres`.
   - `claim1_process_verified_bid` execute permission is restricted to `service_role`.

### Step 3.2: Edge Functions Deployment
Using Supabase CLI:
```bash
supabase functions deploy razorpay-create-order
supabase functions deploy razorpay-verify-payment
supabase functions deploy record-resume-download
supabase functions deploy razorpay-create-oneoff
supabase functions deploy razorpay-verify-oneoff
supabase functions deploy gemini-ai
supabase functions deploy ai-resume-parser
```

### Step 3.3: Vercel Web & Serverless Deployment
1. Merge branch `security/task-002-hardening` into `main`.
2. Push to GitHub remote `talentxcelpro/career-pathways-ai-builder`.
3. Vercel automated CI/CD triggers:
   - Prebuild runs sitemap generation.
   - Vite builds React bundle.
   - Postbuild runs link syndication, static SEO prerendering (14,235 documents), and SEO CI gate.
4. Verify deployment state is `Ready` (HTTP 200).

---

## 4. POST-DEPLOYMENT SMOKE TESTS

Execute the following 5 smoke tests immediately upon deployment:

1. **Candidate Document Security:**
   - Attempt unauthenticated `GET` on a candidate document in `storage/v1/object/public/documents/...`.
   - *Expected:* HTTP 400/403/404 (Access Denied).
   - Log in as the candidate owner and request resume.
   - *Expected:* HTTP 200 via short-lived signed URL.
2. **Payment Fail-Closed Verification:**
   - Submit a test order with `order_id: "demo_order_test"`.
   - *Expected:* Rejected with HTTP 403 Forbidden.
3. **Candidate Application Submission:**
   - Submit job application via `api/jobs/apply.ts` with new email.
   - *Expected:* HTTP 200; profile created cleanly without 50-user pagination collision.
4. **AI Endpoint Rate Limiting:**
   - Send 25 consecutive requests to `gemini-ai`.
   - *Expected:* First 20 succeed; subsequent requests return HTTP 429 with `Retry-After`.
5. **Super Admin Dashboard:**
   - Log in with verified super admin credentials.
   - *Expected:* Dashboard and user roles display correctly without phone-number bypass.

---

## 5. EMERGENCY ROLLBACK PROCEDURE

If any critical regression occurs that prevents legitimate candidate applications or paid transactions:

### Step 5.1: Database Rollback
1. Open Supabase SQL Editor.
2. Execute `supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql`.
3. Note: Candidate storage remains safely private; only stored procedure interfaces and permissions are reverted.

### Step 5.2: Edge Functions Rollback
If Edge Function errors occur, re-deploy previous versions using Supabase CLI or toggle `ALLOW_DEMO_PAYMENTS=true` temporarily if Razorpay gateway webhooks are unresponsive.

### Step 5.3: Vercel Instant Rollback
1. Open Vercel Project Dashboard (`talentxcel`).
2. Navigate to `Deployments`.
3. Locate the previous production deployment.
4. Click `Instant Rollback` (reverts live traffic to previous production SHA in < 15 seconds).

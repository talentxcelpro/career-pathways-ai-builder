# TALENTXCEL.IN — TASK 002F: STAGING ENVIRONMENT DISCOVERY & READINESS REPORT

**Target System:** TalentXcel.in  
**Repository:** `career-pathways-ai-builder`  
**Feature Branch:** `security/task-002-hardening`  
**Current Commit:** `467f8e62`  
**Discovery Execution Timestamp:** 2026-11-02T11:55:00+05:30  
**Audit Scope:** Cloud Infrastructure, Staging Availability, Environment Variables & Credential Isolation  

---

## 1. EXECUTIVE SUMMARY & CRITICAL SAFETY FINDING

An exhaustive forensic inspection was conducted across local configurations, Git tracking, Supabase CLI management infrastructure, and cloud project inventories to determine the existence and isolation status of a dedicated staging environment for TalentXcel.in.

### Critical Safety Finding:
**NO SEPARATE OR ISOLATED STAGING INFRASTRUCTURE CURRENTLY EXISTS.**
- **Supabase Cloud Projects:** Only a single project exists under the authenticated organization: `dthlgsnakhoftinssokm` (`Talentxcel.in`). This is the **LIVE PRODUCTION INSTANCE** hosted at `db.dthlgsnakhoftinssokm.supabase.co`.
- **Vercel Deployments:** No isolated staging Vercel project exists. The repository's remote branch `security/task-002-hardening` has never been pushed to GitHub; consequently, zero Vercel preview environments have been provisioned for the security remediation code.
- **Environment Variables:** All local environment files (`.env`, `.env.local`) point directly to the production project ID `dthlgsnakhoftinssokm`.
- **Payment Credentials:** Only production live credentials (`rzp_live_TtEFSPjrXgDeoB`) exist in Supabase secrets. No Razorpay sandbox keys (`rzp_test_*`) or secrets are configured.
- **Third-Party Integrations:** AWS SES email dispatch and Gemini/OpenAI credentials configured on the server are tied directly to live production production quotas.

### Enforced Safety Directive:
Under Section 10 of the Task 002F mandate ("*Stop if: Production and staging cannot be reliably distinguished; Credentials are unavailable; A migration could damage data*") and Section 1 ("*Do not apply production database migrations; Do not use production customer records for testing*"), **database migrations, edge function deployments, and synthetic user generation are STRICTLY BLOCKED from running against `dthlgsnakhoftinssokm.supabase.co`**. 

This report provides a complete forensic inventory of the environment discovery and establishes the exact, step-by-step setup plan required to provision an isolated staging environment safely.

---

## 2. DETAILED INFRASTRUCTURE DISCOVERY

### 2.1 Supabase Project Inventory
Execution of `npx supabase projects list` against the authenticated Supabase CLI management session yielded the following authoritative cloud infrastructure record:

```json
{
  "projects": [
    {
      "id": "dthlgsnakhoftinssokm",
      "ref": "dthlgsnakhoftinssokm",
      "organization_id": "xaauthlhhymlvvxrkuzu",
      "organization_slug": "xaauthlhhymlvvxrkuzu",
      "name": "Talentxcel.in",
      "region": "ap-southeast-1",
      "created_at": "2025-06-25T12:08:09.998674Z",
      "status": "ACTIVE_HEALTHY",
      "database": {
        "host": "db.dthlgsnakhoftinssokm.supabase.co",
        "version": "17.4.1.45",
        "postgres_engine": "17",
        "release_channel": "ga"
      },
      "linked": true
    }
  ]
}
```

- **Total Projects in Organization:** 1
- **Target Project:** `dthlgsnakhoftinssokm`
- **Project Role:** Active Production System
- **Staging Project Identified:** **NONE** (0 separate projects)

### 2.2 Vercel Preview & Deployment Status
- **Vercel CLI Session:** Unauthenticated locally (`No existing credentials found`).
- **Remote Git Status:** Branch `security/task-002-hardening` exists exclusively on the local development workstation.
- **Upstream Tracking Branch:** None (`origin/security/task-002-hardening` does not exist).
- **Vercel Automated CI Trigger:** Because no commits have been pushed to GitHub, Vercel has not triggered any preview build or deployment for Task 002.
- **Staging URL Status:** No active staging URL (`https://staging.talentxcel.in` or `https://career-pathways-ai-builder-git-*.vercel.app`) is running the Task 002 security codebase.

### 2.3 Environment Configuration & Secrets Audit
Local configuration files were audited without logging secret values:

| File | Parameter | Discovered Value / Target | Assessment |
| :--- | :--- | :--- | :--- |
| `.env` | `VITE_SUPABASE_PROJECT_ID` | `"dthlgsnakhoftinssokm"` | Points to Production |
| `.env` | `VITE_SUPABASE_URL` | `https://dthlgsnakhoftinssokm.supabase.co` | Points to Production |
| `.env.local` | `VITE_SUPABASE_PROJECT_ID` | `"dthlgsnakhoftinssokm"` | Points to Production |
| `.env.local` | `TX_SUPABASE_URL` | `https://dthlgsnakhoftinssokm.supabase.co` | Points to Production |
| `supabase/config.toml` | `project_id` | `"dthlgsnakhoftinssokm"` | Points to Production |
| `supabase/config.toml` | `site_url` | `"https://talentxcel.in"` | Production Domain |

### 2.4 Razorpay Payment Gateway Credentials Audit
An audit of Edge Function environment secrets via `npx supabase secrets list` revealed:
- **Live Key Present:** `rzp_live_TtEFSPjrXgDeoB` (Active Production Gateway).
- **Webhook Secret Present:** `RAZORPAY_WEBHOOK_SECRET` (Updated 2026-10-28).
- **Sandbox Test Key:** **ABSENT** (`rzp_test_*` is not configured in secrets or `.env`).
- **Sandbox Key Secret:** **ABSENT** (`RAZORPAY_KEY_SECRET` in test mode is not configured).
- **Assessment:** Executing live payment routines without sandbox keys would risk charging real payment methods on production Razorpay rails or triggering unhandled error cascades.

### 2.5 Third-Party Service Quota Isolation
- **Amazon SES (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`):** Tied to production domain `talentxcel.in`. Unisolated synthetic email dispatch would send real test emails to actual candidate addresses or consume production bounce allowances.
- **AI Credentials (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `LOVABLE_API_KEY`):** Shared production keys. Unmetered synthetic user generation risks depleting production API credits.

---

## 3. EXACT SETUP PLAN FOR ISOLATED STAGING ENVIRONMENT

To enable safe, non-destructive validation of Task 002 and future synthetic candidate simulations (Task 003), the following staging infrastructure must be established:

```mermaid
flowchart TD
    subgraph Production Cloud [PROD: dthlgsnakhoftinssokm.supabase.co]
        A1[Live Customers & Applications]
        A2[rzp_live Payment Gateway]
        A3[Production Storage Buckets]
    end

    subgraph Staging Cloud [STAGING: talentxcel-staging.supabase.co]
        B1[Synthetic Candidates Only]
        B2[rzp_test Sandbox Gateway]
        B3[Private Staging Storage Buckets]
        B4[Staged Task 002 Hardening Migration]
    end

    subgraph Vercel Preview
        C1[career-pathways-ai-builder-git-staging.vercel.app]
    end

    C1 -->|Connects to| Staging Cloud
    A1 -.->|ISOLATION BOUNDARY: Zero Access| Staging Cloud
```

### Step 1: Provision Staging Supabase Project
1. Log in to the Supabase Cloud Management Console (`xaauthlhhymlvvxrkuzu` organization).
2. Create a new project:
   - **Project Name:** `TalentXcel Staging`
   - **Target Slug / Reference:** `talentxcel-staging` (e.g., `<staging-id>.supabase.co`)
   - **Region:** `ap-southeast-1` (matching production latency profile)
   - **PostgreSQL Version:** 17 (matching production 17.4.1.45)
   - **Pricing Tier:** Free / Staging tier (no unapproved cost impact)

### Step 2: Configure Staging Environment Secrets
In the newly created staging project, configure the following secrets via Supabase Dashboard or CLI:
```bash
npx supabase secrets set \
  ENVIRONMENT="staging" \
  ALLOW_DEMO_PAYMENTS="false" \
  RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXXXXXX" \
  RAZORPAY_KEY_SECRET="test_secret_XXXXXXXXXXXX" \
  SUPABASE_URL="https://<staging-id>.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="<staging-service-role-key>" \
  GEMINI_API_KEY="<isolated-staging-gemini-key>" \
  --project-ref "<staging-id>"
```

### Step 3: Base Schema Replication & Migration Execution
1. Export base schema structure (DDL only, zero customer data) from production:
   ```bash
   npx supabase db dump --project-ref dthlgsnakhoftinssokm --schema-only -f staging_base_schema.sql
   ```
2. Apply base schema to staging project:
   ```bash
   psql "$STAGING_DATABASE_URL" -f staging_base_schema.sql
   ```
3. Apply the Task 002 Hardening Migration to staging:
   ```bash
   psql "$STAGING_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261030150000_task_002_security_hardening.sql
   ```

### Step 4: Staging Vercel Preview Deployment
1. Link branch `security/task-002-hardening` to Vercel preview deployment.
2. Set Environment Variables for Preview scope in Vercel:
   - `VITE_SUPABASE_URL`: `https://<staging-id>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<staging-anon-key>`
   - `VITE_SUPABASE_PROJECT_ID`: `"<staging-id>"`
   - `VITE_APP_ENV`: `"staging"`
3. Confirm that preview URL matches CORS allowlist regex:
   `https://career-pathways-ai-builder-git-security-task-002-hardening-talentxcelpro.vercel.app`

---

## 4. ENVIRONMENT DISCOVERY CLASSIFICATION SUMMARY

| Environment Requirement | Discovery Finding | Task 002F Status | Remediation Required |
| :--- | :--- | :--- | :--- |
| **Dedicated Supabase Staging** | Only 1 project (`dthlgsnakhoftinssokm` Prod) exists | **`BLOCKED`** | Provision `talentxcel-staging` |
| **Vercel Preview Deployment** | Unauthenticated CLI; local branch unpushed | **`BLOCKED`** | Push branch & link preview |
| **Staging Environment Variables** | Local `.env` files point strictly to Prod | **`BLOCKED`** | Create `.env.staging` |
| **Razorpay Sandbox Credentials** | Only `rzp_live_*` configured | **`BLOCKED`** | Obtain & set `rzp_test_*` |
| **Isolated AI / Email Quotas** | Shared production credentials | **`BLOCKED`** | Set staging sandbox keys |
| **Task 002 Migration Compatibility** | SQL syntax and structure 100% verified | **`READY FOR STAGING`** | Apply post-provisioning |

---

## 5. CONCLUSION & STOP PROTOCOL COMPLIANCE

Because production and staging cannot be physically distinguished on the live Supabase account, and because applying database mutations to `dthlgsnakhoftinssokm` would violate the strict safety rules of this project, **live database execution is halted**.

The security changes remain cleanly committed on `security/task-002-hardening` at commit `467f8e62`. Local simulation and static validation are reported in accompanying documents.

# TALENTXCEL.IN — FORENSIC DISCOVERY AND ENVIRONMENT AUDIT

**Document ID:** TX-AUDIT-001  
**Project:** TalentXcel.in  
**Audit Date:** 2026-10-30  
**Verification Target:** https://www.talentxcel.in / https://talentxcel.in  
**Status:** FORENSIC INSPECTION COMPLETE (READ-ONLY)

---

## 1. EXECUTIVE SUMMARY & STRICT PROJECT IDENTITY

### 1.1 Scope & Domain Verification
A comprehensive forensic codebase discovery was executed exclusively on the local repository for **TalentXcel.in**.

- **Git Remote:** `https://github.com/talentxcelpro/career-pathways-ai-builder.git` (Branch: `main`)
- **Primary Canonical Origin:** `https://talentxcel.in` (configured as apex domain)
- **Secondary Host:** `https://www.talentxcel.in` (enforced with 301 permanent redirect to `https://talentxcel.in` in `vercel.json`)
- **Discovered Product Universes:** 10 synchronized subdomains driven from a single codebase and database (`src/config/domainArchitecture.ts`):
  1. `talentxcel.in` / `www.talentxcel.in` (CORE Career Ecosystem)
  2. `jobs.talentxcel.in` (Jobs Search Universe)
  3. `learning.talentxcel.in` (Learning Intelligence & Upskilling)
  4. `passport.talentxcel.in` (Career Passport & Verifiable Credentials)
  5. `government.talentxcel.in` (Government Jobs & Examinations)
  6. `employers.talentxcel.in` (Recruiter OS & Employer Management; legacy alias `employer.talentxcel.in` 301-redirected)
  7. `colleges.talentxcel.in` (Higher Education & Campus Recruitment)
  8. `careers.talentxcel.in` (Career Pathways & Industry Role Mapping)
  9. `salary.talentxcel.in` (Compensation Benchmarks & CTC Analytics)
  10. `resume.talentxcel.in` (AI Resume Builder & ATS Diagnostic Intelligence)
- **Scope Exclusion Confirmation:** No references, submodules, dependencies, or databases belonging to *TalentXcel.net*, *CHATR / CHATRCHAT*, or *Nuty Tales* exist within this repository. The codebase is exclusively dedicated to TalentXcel.in.

---

## 2. APPLICATION ARCHITECTURE AUDIT

```
+---------------------------------------------------------------------------------------+
|                                    TALENTXCEL CLIENT                                   |
|   React 18.3.1 | Vite 5.4.1 | TypeScript 5.5.3 | Tailwind CSS 3.4.11 | shadcn/ui      |
|   Cross-Subdomain Session Storage (.talentxcel.in) | Zustand 5.0 | TanStack Query 5.5 |
+-------------------------------------------+-------------------------------------------+
                                            |
                     +----------------------+----------------------+
                     |                                             |
                     v                                             v
+---------------------------------------+     +-----------------------------------------+
|      VERCEL SERVERLESS FUNCTIONS      |     |           SUPABASE PLATFORM             |
|  23 Endpoints (api/**/*.ts)           |     |  Project: dthlgsnakhoftinssokm          |
|  - /api/jobs/apply                    |     |  - 60 Deno Edge Functions               |
|  - /api/email/* (AWS SES + Ledger)    |     |  - 465 PostgreSQL Tables                |
|  - /api/claim/* (Leaderboard Bids)    |     |  - 225 Stored Procedures (RPCs)         |
|  - /api/udx/* (Telemetry & Benchmarks)|     |  - 11 Storage Buckets                   |
+---------------------------------------+     +-----------------------------------------+
```

### 2.1 Core Technology Stack & Versions
- **Frontend Framework:** React `18.3.1` with `react-dom` `18.3.1`
- **Build Tool:** Vite `5.4.1` powered by `@vitejs/plugin-react-swc` `3.5.0`
- **Language & Compiler:** TypeScript `5.5.3` (ES2020 target, ESNext module, strict type checking via `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`)
- **Routing Engine:** React Router DOM `6.26.2` using browser history and modular route tree assemblies (`src/navigation/*.tsx`, `src/nav-items.tsx`, and `src/App.tsx`)
- **State Management:**
  - Client state: Zustand `5.0.6`
  - Server state / Cache: TanStack React Query `5.56.2`
  - Session state: React Context (`AuthContext.tsx`) backed by `crossSubdomainStorage.ts`
- **UI Component System:**
  - Base library: `shadcn/ui` built on `@radix-ui/react-*` primitive suite (Dialog, Dropdown, Accordion, Select, Tabs, Popover, etc.)
  - CSS Architecture: Tailwind CSS `3.4.11` with `@tailwindcss/typography` and `tailwindcss-animate`
  - Utility styling: `clsx` `2.1.1` and `tailwind-merge` `2.5.2`
  - Icons: `lucide-react` `0.462.0`
  - Motion & Animations: `framer-motion` `12.23.6` and `canvas-confetti` `1.9.3`
  - Visualizations: `recharts` `2.12.7`, `@xyflow/react` `12.8.3`, Three.js `0.160.0`, `@react-three/fiber` `8.17.0`, `@react-three/drei` `9.122.0`
- **Mobile Runtime Architecture:**
  - Capacitor `7.4.3` (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`)
  - Plugins: Camera, SQLite, Push Notifications, Filesystem
  - Live Over-The-Air (OTA) Updates: `@capgo/capacitor-updater` `7.53.0` with scripts `scripts/ota-push.ts`

### 2.2 Routing & Navigation Architecture
- **Multi-Universe Domain Routing:** Handled dynamically via `src/config/domainArchitecture.ts` and `vercel.json` rewrites. A single deployed single-page application (SPA) serves all 10 product universes by matching hostname and path.
- **Route Inventory Scale:**
  - 489 active `<Route>` elements declared in code.
  - 404 distinct route paths registered in modular route files (`src/navigation/`).
  - 769 unique entry points cataloged when including dynamic parameters and priority JSX overrides.
- **Root Routing Order:**
  1. Priority explicit routes in `src/App.tsx` (lines 594–885), e.g. `/recruiters`, `/jobs`, `/colleges`, `/salary`.
  2. Dynamic mapped routes from `navItems` in `src/nav-items.tsx` (lines 886–900).
  3. Dynamic entity catch-alls (`/:companySlug`, `*` 404 handler).

### 2.3 API & Serverless Architecture
The backend is split into two distinct execution tiers:
1. **Vercel Serverless Functions (`api/`):**
   - Node.js runtime executing in Vercel Edge/Serverless environments.
   - Core endpoints:
     - `POST /api/jobs/apply`: Server-side candidate application handler, auto-provisioning candidate accounts, uploading resumes, and creating applications.
     - `POST /api/email/_send`: Centralized SES email dispatching with suppression check and audit ledger.
     - `POST /api/email/_ses-webhook`: Ingestion of AWS SES delivery/bounce/complaint events.
     - `POST /api/email/_process-queue`: Cron-triggered batch queue processor.
     - `POST /api/claim/_confirm`, `_verify`, `_opt-out`: Bidding and claim verification.
     - `GET /api/udx/*`: Telemetry, benchmarks, and health metrics.
     - `GET /api/seo-render`, `og-bot`, `sitemaps`, `indexnow`: Automated search discovery.
2. **Supabase Edge Functions (`supabase/functions/`):**
   - 60 Deno-based serverless functions managed via Supabase CLI.
   - Key functional groups:
     - Payments: `razorpay-create-order`, `razorpay-verify-payment`, `razorpay-webhook`.
     - AI & Career: `ai-resume-parser`, `ats-analyzer`, `comprehensive-ats-analyzer`, `gemini-ai`, `job-specific-optimizer`, `passport-ai-coach`.
     - Email & Communications: `unified-email-service`, `zoho-mail-service`, `process-email-queue`, `send-campaign`.
     - Autonomous C-Suite: `ai-cfo-analyze`, `ai-cfo-execute`, `ai-cmo-plan`, `ai-cmo-execute`, `ai-cto-plan`, `ai-cto-execute`, `ai-hr-screen`.
     - Maintenance: `database-cleanup`, `job-expiry-cleanup`, `system-optimizer`.

### 2.4 Build and Deployment Pipeline
- **Build Scripts:**
  - `prebuild`: Cleans `dist/assets` and triggers `npx tsx scripts/generate-sitemap.ts`.
  - `build`: Runs `node --max-old-space-size=8192 ./node_modules/vite/bin/vite.js build`.
  - `postbuild`: Executes `node scripts/syndicate-external-backlinks.cjs`, `npx tsx scripts/prerender-static-seo.ts`, `npx tsx scripts/seo-ci-gate.ts`, and `npx tsx scripts/finalize-subdomain-routing.ts`.
- **CI/CD Workflows:**
  - `.github/workflows/autonomous-publishing-cycle.yml`: Daily automated cron at 05:00 UTC (10:30 AM IST) running `tsc --noEmit`, `seo-ci-gate.ts`, adaptive publishing cycles, and automated git push of regenerated sitemaps.
  - `.github/workflows/ota-deploy.yml`: Pushes Capacitor OTA updates to Capgo.
- **Automated Test Infrastructure Deficit & Manual Testing Context:**
  - **Automated CI/CD Test Runner:** **Zero automated test coverage configured.** No test runner framework (`vitest`, `jest`, `playwright`, `cypress`, `puppeteer`) is installed in `package.json`, and no automated functional or regression tests execute in CI/CD.
  - **Existing Developer Manual Testing Surfaces:** While automated regression test suites are absent, developer manual testing surfaces and diagnostic scripts exist in the repository:
    - Internal Testing Dashboard: `src/pages/TestingDashboard.tsx` (`/testing`) allowing manual testing of notifications and automation triggers.
    - Ad-hoc Node/TS verification scripts in `scratch/`: `scratch/test-live-production-urls.ts`, `scratch/phase2-quality-audit.ts`, `scratch/audit-db-and-seo.ts`, and `test-email-debug.js`.
    - These tools demonstrate that developer-led manual and ad-hoc verification has occurred, but there is no automated regression harness to validate code changes before release.

---

## 3. INFRASTRUCTURE AUDIT

### 3.1 Vercel Deployment Configuration (`vercel.json`)
- **Hosting Tier:** Vercel Web Hosting + Serverless Functions.
- **Canonical Enforcements:**
  - Permanent 301 redirect from `www.talentxcel.in` to `https://talentxcel.in`.
  - Permanent 301 redirect from `employer.talentxcel.in` to `https://employers.talentxcel.in`.
- **Subdomain Routing Rewrites:** Host-header conditioned rewrites mapping `jobs.talentxcel.in`, `salary.talentxcel.in`, `learning.talentxcel.in`, `colleges.talentxcel.in`, `employers.talentxcel.in`, etc., to their respective static index assets and partitioned sitemaps.
- **Content Security Policy (CSP):**
  - Configured in `vercel.json` headers.
  - Permitted script sources: `'self'`, `'unsafe-inline'`, `'unsafe-eval'`, `https://checkout.razorpay.com`, `https://cdn.jsdelivr.net`, `https://www.googletagmanager.com`, `https://www.google-analytics.com`, `https://accounts.google.com`, `https://vercel.live`.
  - Permitted connect sources: Supabase URL and WebSocket (`wss://*.supabase.co`), Razorpay API (`https://api.razorpay.com`), OpenAI API (`https://api.openai.com`), Google APIs.

### 3.2 Supabase Database, Migrations & Project Identity
- **Supabase Project Reference:** `dthlgsnakhoftinssokm`
- **Host Endpoint:** `https://dthlgsnakhoftinssokm.supabase.co`
- **Database Schema Scale:**
  - 465 PostgreSQL Tables in `public` schema (verified directly from the generated TypeScript schema definitions in `src/integrations/supabase/types.ts`).
  - 4 Views: `assessment_questions_public`, `employer_cv_database`, `employer_cv_database_secure`, `job_applications_with_candidate_details`.
  - 225 Database Stored Procedures (RPCs).
  - 11 Custom Enums (`app_role`, `application_status`, `article_category`, `user_role`, `team_role`, etc.).
- **Migration Discrepancy Reconciliation (1,054 Migrations vs. 465 Tables):**
  - **Total Migration Files:** 1,054 SQL migration files exist in `supabase/migrations/`, spanning from May 2024 (`20240504_create_push_tokens_table.sql`) through October 2026 (`20261028150000_professional_activation_data_layer.sql`).
  - **Why Migrations Exceed Table Count:** The project underwent rapid, continuous iterative generation using automated tools (Lovable) and Supabase CLI migrations. Rather than creating new tables in every file, the majority of migration files represent cumulative schema modifications:
    1. Alterations to existing tables (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`).
    2. Policy iterations (creating, dropping, and rewriting RLS policies on tables like `profiles`, `resumes`, and `jobs`).
    3. Stored procedure rewrites (`CREATE OR REPLACE FUNCTION ...`).
    4. Index additions, trigger updates, and storage bucket definitions.
    5. Rollback and corrective scripts (e.g. `20261028150000_professional_activation_data_layer_rollback.sql`).
  - **Live Database Status Requirement:** The 465 tables in `types.ts` represent the active state generated from the Supabase instance. However, establishing with 100% certainty whether all 1,054 migrations are marked applied in `supabase_migrations.schema_migrations` or if some were executed manually or rolled back requires a live read query against the internal migration ledger during staging setup.
- **Storage Buckets:**
  - `resumes`: Private (originally public, migrated to private).
  - `documents`: **PUBLIC** (Risk identified in migration `20250808050916`).
  - `post-media`: Public.
  - `avatars`: Public.
  - `companies` / `company-logos`: Public.
  - `profile-assets` / `profile-pictures`: Public.
  - `article-images`: Public.
  - `bot-profiles`: Public.
  - `tool-uploads`: Private.
  - `raw_videos` / `videos`: Private.
- **Authentication Setup:**
  - Flow: PKCE (`flowType: 'pkce'`) with automatic token refresh.
  - Cross-Subdomain Session Storage: Implemented via cookie scoped to `.talentxcel.in`.
  - Identity Providers: Email/Password, Phone OTP, Google OAuth 2.0 (authorized origins explicitly registered in `domainArchitecture.ts`).

---

## 4. SECURITY-SENSITIVE CONFIGURATION AUDIT

*(Conducted in accordance with read-only security disclosure rules: secret values are never printed)*

| Configuration Variable | Location Checked | Observed State | Risk / Status |
|---|---|---|---|
| `VITE_SUPABASE_PROJECT_ID` | `.env`, `.env.local` | Present | Expected public Vite client configuration |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env`, `.env.local`, `constants.ts` | Present (Hardcoded fallback) | Public Anon JWT key; fallback ensures offline resilience |
| `VITE_SUPABASE_URL` | `.env`, `.env.local`, `constants.ts` | Present (Hardcoded fallback) | Standard public backend URL |
| `TALENTXCEL_SERVICE_ROLE_KEY` | `.env.local`, Serverless Functions | Present in `.env.local`, missing in `.env` | Required for admin serverless functions (`api/`); must never leak to Vite bundle |
| `TX_SUPABASE_URL` | `.env.local`, Serverless Functions | Present in `.env.local` | Internal URL alias |
| `GOOGLE_OAUTH_CLIENT_ID` | `.env.local` | Present in `.env.local` | Server-side OAuth client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | `.env.local` | Present in `.env.local` | Server-side OAuth secret; protected |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `.env.local` | Present in `.env.local` | Required for Google Indexing & GSC API |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`| `.env.local` | Present in `.env.local` | Required for Google Indexing & GSC API |
| `RAZORPAY_KEY_ID` | Supabase Secrets / Vite fallback | Referenced in Edge Functions & Client | Fallbacks to `'rzp_live_default'` / `'rzp_demo_key'` |
| `RAZORPAY_KEY_SECRET` | Supabase Secrets | Referenced in Edge Functions | Missing secrets cause automatic demo mode activation |
| `RAZORPAY_WEBHOOK_SECRET` | Supabase Secrets | Referenced in `razorpay-verify-payment` | Falls back to `RAZORPAY_KEY_SECRET` |
| `LOVABLE_API_KEY` | Supabase Secrets | Referenced in 6 Edge Functions | Required for Lovable Gemini AI Gateway |
| `OPENAI_API_KEY` | Supabase Secrets | Referenced in `ai-chat` Edge Function | Optional / model-dependent |
| `GEMINI_API_KEY` | Supabase Secrets | Referenced in `gemini-ai` Edge Function | Has heuristic fallback if missing |
| `AWS_SES_ACCESS_KEY_ID` / Secret | Serverless Environment | Referenced in `api/email/_send.ts` | Dispatches outgoing email |

### Exposure & Build Verification
1. **No Service-Role Key in Client Bundle:** Static analysis confirms `TALENTXCEL_SERVICE_ROLE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are not prefixed with `VITE_` and are not bundled into the Vite browser output.
2. **Hardcoded Fallbacks:** `src/config/constants.ts` contains hardcoded fallbacks for `SUPABASE_URL` and `SUPABASE_ANON_KEY`. While standard for Supabase single-page applications using anon keys with Row-Level Security, database protection depends entirely on Postgres RLS policies.
3. **Emergency Phone Super Admin Escalation:** Hardcoded phone numbers in `src/lib/admin/superAdminPolicy.ts` are embedded in the client bundle. Any user presenting those phone numbers is evaluated client-side as `SUPER_ADMIN`. (See Security Review for details).

### Summary of Reconciled Security Findings (SEC-001 through SEC-010)

| Finding ID | Severity | Affected Area | Core Issue |
|---|---|---|---|
| **SEC-001** | **CRITICAL** | `src/lib/admin/superAdminPolicy.ts` | Hardcoded phone numbers in client code grant Super Admin privileges on client-side route evaluation |
| **SEC-002** | **CRITICAL** | `claim1_process_verified_bid` | Stored procedure records verified bids without verifying Razorpay HMAC-SHA256 signature |
| **SEC-003** | **HIGH** | `documents` Storage Bucket | Bucket set to `public = true` with public SELECT policy, exposing candidate certificates/portfolios |
| **SEC-004** | **HIGH** | `src/hooks/useResumeDownloads.ts` | Three edge functions (`razorpay-create-oneoff`, `record-resume-download`, etc.) are absent from repository |
| **SEC-005** | **HIGH** | `supabase/functions/razorpay-verify-payment` | Demo mode auto-activates active Pro subscription when `RAZORPAY_KEY_SECRET` is missing |
| **SEC-006** | **MEDIUM** | `api/jobs/apply.ts` | Candidate account auto-provisioning queries only page 1 (50 users), causing duplicate user collision |
| **SEC-007** | **MEDIUM** | `api/email/_send.ts` | Falls back to public anon key if service-role key is omitted, causing audit ledger writes to fail |
| **SEC-008** | **LOW** | `src/config/constants.ts` & build scripts | Supabase Project URL & Anon JWT committed as string literals in source code |
| **SEC-009** | **LOW** | `supabase/functions/ai-resume-parser` | Wildcard CORS (`Access-Control-Allow-Origin: *`) permits invocation from any arbitrary origin |
| **SEC-010** | **INFORMATIONAL** | Public AI Edge Functions | Lack of token bucket or IP rate limiting on Gemini / Lovable generation endpoints |

---

## 5. REPOSITORY HEALTH & ARTIFACT RECONCILIATION

- **Working Directory:** `c:\Users\Arshid.Wani\talentxcel-local`
- **Git Tree State:** Clean, up-to-date with `origin/main`.
- **Node Modules:** Present (`node_modules`), package manager lockfile `bun.lock` / `bun.lockb` present alongside npm dependencies.
- **Prelaunch Documentation Target:** Created under `docs/prelaunch/`.

# TALENTXCEL.IN — PLAYWRIGHT & BROWSER QA ARCHITECTURE

**Document ID:** TX-QA-001  
**Project:** TalentXcel.in  
**Audit Date:** 2026-10-30  
**Scope:** Automated End-to-End Browser Testing, Test Fixtures, & Quality Gate Architecture  
**Status:** SPECIFICATION COMPLETE (NO TEST FRAMEWORKS INSTALLED PER AUDIT RULES)

---

## 1. QA READINESS ASSESSMENT & CURRENT STATE

### 1.1 Automated vs. Manual Testing Coverage Reality
- **Automated CI/CD Test Suite Deficit:** **0% automated test coverage in repository CI.** No test runner framework (`vitest`, `jest`, `playwright`, `cypress`, `puppeteer`) is installed in `package.json`, and no automated test scripts exist in `package.json` or `.github/workflows/`.
- **Existing Manual Testing Infrastructure:** The application has undergone developer-led manual and ad-hoc verification:
  - An internal Testing Dashboard is built into the frontend: `src/pages/TestingDashboard.tsx` (`/testing`), designed for interactive validation of notifications and automation tasks.
  - Several diagnostic and validation scripts exist in `scratch/`: `test-live-production-urls.ts`, `phase2-quality-audit.ts`, `audit-db-and-seo.ts`, and `test-email-debug.js`.
- **Pre-Launch QA Imperative:** While ad-hoc manual testing has validated initial components, an autonomous, reproducible browser-based Playwright harness is mandatory to prevent regressions across the 404 routes and 769 endpoints.

---

## 2. TARGET TESTING ENVIRONMENTS & ISOLATION

Testing must be executed across strictly segregated environments to prevent pollution of production data, analytics, or search index queues.

```
+---------------------------------------------------------------------------------------------------+
|                                     ENVIRONMENT TAXONOMY                                         |
+----------------------+-----------------------------+-----------------------+----------------------+
|     ENVIRONMENT      |             URL             |       DATABASE        |     PAYMENT MODE     |
+----------------------+-----------------------------+-----------------------+----------------------+
| Local Development    | http://localhost:5173       | Supabase Local / Dev  | Mock / Demo Mode     |
| Vercel Preview (PR)  | *.vercel.app                | Supabase Branching    | Razorpay Test Mode   |
| Dedicated Staging    | https://staging.talentxcel.in| Staging Supabase Proj | Razorpay Test Mode   |
| Production (Read-only| https://talentxcel.in       | dthlgsnakhoftinssokm  | Razorpay Live Mode   |
| canary verification) |                             | (STRICTLY READ-ONLY)  | (NO LIVE CHARGES)    |
+----------------------+-----------------------------+-----------------------+----------------------+
```

### Staging Environment Requirement
- **Critical Prerequisite:** A dedicated staging environment (`staging.talentxcel.in`) backed by an isolated Supabase project must be provisioned.
- **Pollution Prevention:** E2E automated test runs generate synthetic candidates, test resumes, mock applications, and simulated payments. Running synthetic tests directly against production (`dthlgsnakhoftinssokm`) would corrupt real recruiter dashboards, skew company analytics, and trigger unintended AWS SES email deliveries.

---

## 3. AUTHENTICATION & SESSION HANDLING FOR PLAYWRIGHT

### 3.1 PKCE & Cross-Subdomain Session Strategy
TalentXcel uses Supabase Auth with PKCE and a cross-subdomain cookie (`.talentxcel.in` via `src/lib/auth/crossSubdomainStorage.ts`).

- **Playwright Storage State (`storageState.json`):**
  - Instead of logging in via the UI before every test, Playwright must authenticate once per persona in a setup project (`global-setup.ts`).
  - The resulting cookies and `localStorage` keys are saved to disk and injected into test workers:
    - `tests/.auth/jobseeker-tier1.json`
    - `tests/.auth/jobseeker-fresher.json`
    - `tests/.auth/employer-verified.json`
    - `tests/.auth/admin-super.json`
- **Email Verification Bypass for Test Fixtures:**
  - In staging, synthetic test accounts must be pre-confirmed via the Supabase Admin API (`supabase.auth.admin.createUser({ email_confirm: true })`) to prevent dependency on third-party inbox polling.

---

## 4. TEST DATA FIXTURES & TEARDOWN LIFECYCLE

All automated browser tests must be idempotent and repeatable.

### 4.1 Required Test Fixtures
1. **Resume Documents:**
   - Valid standard PDF resume (`fixtures/resumes/valid_fullstack_2026.pdf`)
   - Scanned image PDF with low ATS score (`fixtures/resumes/low_ats_scanned.pdf`)
   - Word document (`fixtures/resumes/candidate_cv.docx`)
   - Malformed/oversized file (>10MB) for validation boundary testing.
2. **Job Listings:**
   - Pre-seeded active job in staging (`job_id: e0000000-0000-0000-0000-000000000001`)
   - Expired job listing (`is_active: false`)
   - Remote opening with specific salary bounds.
3. **Company Profiles:**
   - Pre-seeded verified employer company (`company_id: c0000000-0000-0000-0000-000000000001`)
   - Unverified pending employer request.

### 4.2 Automated Teardown & Idempotency
- Every synthetic entity created during dynamic browser testing must carry a deterministic tag:
  - Email: `synthetic.candidate+test_<runId>@test.talentxcel.in`
  - Job Title: `[SYNTHETIC TEST] Senior React Engineer <runId>`
- A post-test cleanup script executes via Supabase Service-Role key in staging to purge all entities tagged with `<runId>`.

---

## 5. CORE PLAYWRIGHT TEST SUITE COVERAGE (18 DOMAINS)

| Suite # | Target Area | Primary Test Assertions | Key Selectors / API Endpoints | Expected Execution Time |
|---|---|---|---|---|
| **01** | **Homepage & Landing** | Hero CTA renders, featured job cards display, search bar navigates | `header`, `input[placeholder*="Search"]`, `button:has-text("Find Jobs")` | 3.5s |
| **02** | **Registration Flow** | Multi-field validation, password strength meter, successful account creation | `/auth/register`, `input[type="email"]`, `button:has-text("Create Account")` | 5.2s |
| **03** | **Authentication** | Password login, error toast on bad credentials, logout clears session | `/auth/login`, `button:has-text("Sign In")`, `button:has-text("Sign Out")` | 4.8s |
| **04** | **Profile Setup** | Onboarding wizard steps 1–4, skill tag additions, profile completion score | `/onboarding`, `input[name="full_name"]`, `button:has-text("Save & Continue")` | 7.1s |
| **05** | **Resume Builder** | Section additions (Experience, Education), template selection, live preview | `/resume/builder`, `[data-testid="add-experience"]`, `iframe#preview` | 6.5s |
| **06** | **Resume Upload** | Drag-and-drop PDF upload, progress bar, file size validation (>10MB rejection) | `/resume`, `input[type="file"]`, `.dropzone-container` | 4.9s |
| **07** | **ATS Analysis** | Score card render, missing keywords highlight, actionable tips panel | `/resume/ats-analyzer`, `[data-testid="ats-score"]`, `.keyword-gap-list` | 8.2s (AI Edge Fn) |
| **08** | **AI Resume Rewrite** | Bullet point optimization trigger, AI diff viewer, accept suggestions | `/resume/ai-optimizer`, `button:has-text("Enhance with AI")` | 9.0s (AI Edge Fn) |
| **09** | **Job Search & Filters**| Keyword search, remote checkbox filter, salary slider updates job count | `/jobs`, `input[type="search"]`, `button[role="checkbox"]` | 4.2s |
| **10** | **Job Detail Page** | Full specification, company details card, Schema.org JSON-LD tag | `/job/:id`, `script[type="application/ld+json"]`, `h1.job-title` | 2.8s |
| **11** | **Job Application** | Apply modal popup, resume attachment, submission toast, database insertion | `button:has-text("Apply Now")`, `/api/jobs/apply` response 200 | 6.1s |
| **12** | **Employer Registration**| Business registration form, GSTIN/CIN validation, submission confirmation | `/recruiters`, `input[name="company_name"]`, `button:has-text("Register")` | 5.0s |
| **13** | **Job Posting** | Recruiter post form, required fields, preview mode, published job appears live | `/employer/jobs/post`, `textarea[name="description"]`, `button:has-text("Publish")` | 6.8s |
| **14** | **Candidate Discovery**| Candidate card rendering, skill filters, candidate profile modal inspection | `/employer/candidates`, `[data-testid="candidate-card"]` | 5.1s |
| **15** | **Subscription Sandbox**| Pro plan checkout launch, Razorpay modal options validation, test callback | `/pro`, `button:has-text("Upgrade to Pro")`, `iframe.razorpay-checkout-frame` | 7.5s |
| **16** | **Admin Permissions** | Non-admin redirected to 403 / Access Denied; Super admin views security logs | `/admin/logs`, `text="Access Denied"`, `text="Security Audit Log"` | 4.0s |
| **17** | **Notifications** | In-app notification bell count, mark as read, real-time alert toast | `button[aria-label="Notifications"]`, `.notification-dropdown-item` | 3.6s |
| **18** | **Mobile Responsiveness**| Viewport 375x812 (iPhone 13), hamburger navigation, responsive tables | `viewport: { width: 375, height: 812 }`, `button[aria-label="Toggle Menu"]` | 4.5s |

---

## 6. EVIDENCE COLLECTION & FAILURE TRIAGE

Playwright must be configured to capture rich diagnostic evidence on every execution:

```typescript
// Proposed Playwright Configuration (playwright.config.ts)
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-results.json' }],
    ['list']
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Desktop Safari', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Safari (iPhone 14)', use: { ...devices['iPhone 14'] } },
  ],
});
```

### Artifact Storage Policy
- **Playwright Traces (`.zip`):** Recorded on all failed test cases for frame-by-frame DOM and network inspection.
- **Console Error Logs:** Stored with timestamps to catch uncaught React rendering crashes and failed network requests.
- **HAR Network Archives:** Captures API payloads for `/api/jobs/apply` and Edge Functions to diagnose backend contract mismatches.

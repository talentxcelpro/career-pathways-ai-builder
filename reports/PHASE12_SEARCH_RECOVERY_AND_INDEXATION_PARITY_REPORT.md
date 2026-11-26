# TALENTXCEL — PHASE 12 SEARCH RECOVERY, CONVERSION TELEMETRY & INDEXATION PARITY REPORT

**Date:** 2026-11-25  
**Scope:** Phase 12 Controlled Search Recovery Cycle (GA4 Conversion Visibility, Backend/Client Indexation Parity, Salary & Geographic Page Recovery, Sitemap Forensic Remediation, Legacy Golang URL Consolidation, and Regression Monitoring)  
**Baseline Reference:** [TALENTXCEL_GSC_ORGANIC_GROWTH_MASTER_REPORT.md](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TALENTXCEL_GSC_ORGANIC_GROWTH_MASTER_REPORT.md)

---

## 1. Executive Summary

Phase 12 executed a controlled recovery cycle across six production pillars without UI/UX alterations, without weakening SEO quality thresholds (`>= 400` rendered body words, `>= 3` live jobs for city hubs, `>= 5` live INR salary records for salary guides), and without fabricating telemetry or inventory:

1. **GA4 Conversion Telemetry (`properties/499367883`):** Identified why GA4 `keyEvents` reported `0` despite genuine Organic Search conversions: `GET /keyEvents` returned only three legacy boilerplate events (`purchase`, `close_convert_lead`, `qualify_lead` created `2025-08-02`), while `sign_up` (`77` Organic Search events / `73` users / `73` sessions in 28d) and `application_submitted` (`170` events / `109` users / `113` sessions in 28d) were never marked as Key Events. Also isolated and fixed a `123.7x` duplicate-firing bug on `seo_landing_view` (`26,958` events / `218` users in Organic Search) in [SEOHead.tsx](file:///c:/Users/Arshid.Wani/talentxcel-local/src/components/seo/SEOHead.tsx) using an in-memory `Set<string>` dedupe guard.
2. **Backend / Client Indexation Parity:** Resolved governance drift between [api/seo-render.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/api/seo-render.ts), [src/config/seo.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/src/config/seo.ts), and [JobLocationPage.tsx](file:///c:/Users/Arshid.Wani/talentxcel-local/src/pages/seo/JobLocationPage.tsx). Exported `QUALIFIED_LOCATION_SLUGS` and `QUALIFIED_SALARY_ROLES`, added `/^\/career-insights\/salary\/.+$/i` to `NOINDEX_PATH_PATTERNS`, and replaced hardcoded `index, follow` in `JobLocationPage.tsx` with `effectiveCount >= 3 && !isNoindexPath(...)`.
3. **Geographic & Salary Page Recovery:** Recovered `/locations/varanasi` (`17` live jobs, `603` rendered words), `/locations/bangalore` (`762` openings, `509` words, `bengaluru`/`bangalore` alias parity), `/salary/data-scientist` (`70` live INR rows, `635` words), and `/salary/ui-ux-designer` (`12` live INR rows, `625` words) with live Supabase data and methodology disclosures.
4. **Sitemap Forensic Recovery:** Retired obsolete `sitemap-rankings.xml` (removed from `scripts/gsc-submit-todays-updates.ts`, routed in `vercel.json` to return explicit HTTP `410 Gone` via `api/seo-render.ts`, and deleted from GSC via `DELETE` -> `204`). Resubmitted `sitemap-network.xml` (`PUT` -> `204`); GSC sitemaps (`19` total) now report `0` errors. In [generate-sitemap.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/scripts/generate-sitemap.ts), filtered `sitemap-network.xml` strictly to verified indexable hubs matching `INDEXABLE_GEO_CITIES` and excluded thin `<400`-word `/u/*` profiles; the sitemap was pruned to `55` URLs and an audit of `41/55` sample URLs verified `0` issues (`100% index, follow`).
5. **Legacy URL Recovery:** Enriched `/resume/interview-prep/golang-developer` (`540` words, 6 Go/Gin Q&As + `FAQPage` JSON-LD) and applied strictly scoped `301` redirects from legacy Golang interview-prep variants (`-part-3`, `-part-85`, `-part-9`, `lead-...`), while preserving `404` for unrelated slugs.
6. **Phase 12 Regression Monitoring:** Added `detectPhase12Regressions()` in [gscOpportunityDetector.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/src/lib/seo/demandIntelligence/gscOpportunityDetector.ts) and verified `0` regression alerts across 15 SSR/client parity probes.

---

## 2. Forensic Revalidation Findings (Pre-Edit Production Baseline)

Before modifying code, live checks against GSC, GA4, Supabase, and `api/seo-render.ts` confirmed:

- **`sitemap-rankings.xml`:** `scripts/generate-sitemap.ts` pruned `sitemap-rankings.xml` because it held only `8` URLs (`< 10` threshold), yet `scripts/gsc-submit-todays-updates.ts` still submitted it to GSC, and `vercel.json` fell through to `index.html` SPA HTML with `Content-Type: application/xml` (causing GSC `errors: 1`).
- **`sitemap-network.xml`:** Contained `559` URLs with `0` duplicates, but `61/61` sampled URLs returned `noindex, follow` in `api/seo-render.ts` because `bodyContent` fell below the `400`-word threshold checked prior to footer injection.
- **GA4 `keyEvents`:** `GET https://analyticsadmin.googleapis.com/v1beta/properties/499367883/keyEvents` returned HTTP `200` with only `purchase`, `close_convert_lead`, and `qualify_lead` (created `2025-08-02`). `POST /keyEvents` for `sign_up` and `application_submitted` returned HTTP `403 PERMISSION_DENIED` because the service account (`antigravity-search@talentxcel-login.iam.gserviceaccount.com`) holds Viewer/Analyst permissions rather than GA4 Editor.
- **Client/SSR Parity Drift:** `JobLocationPage.tsx` hardcoded `robots="index, follow"`, `isNoindexPath()` blocked `/locations/varanasi` and `/salary/ui-ux-designer`, and `api/seo-render.ts` gated `/locations/bangalore` & `/network/*` below `400` `bodyContent` words.

---

## 3. GA4 Conversion Telemetry Investigation & Key Event Configuration

### 3.1 Observed 28-Day Organic Search Funnel Metrics (`properties/499367883`)

| Event Name | Organic Search Events (28d) | Active Users | Sessions | Events / User | Diagnosis |
|---|---:|---:|---:|---:|---|
| `sign_up` | `77` | `73` | `73` | `1.05x` | Validated primary conversion; NOT marked as Key Event |
| `application_submitted` | `170` | `109` | `113` | `1.56x` | Validated primary conversion; NOT marked as Key Event |
| `guest_apply_opened` | `513` | `198` | `212` | `2.59x` | Validated secondary funnel event |
| `ats_score_generated` | `431` | `252` | `266` | `1.71x` | Validated secondary funnel event |
| `apply_cta_clicked` | `360` | `189` | `199` | `1.90x` | Validated secondary funnel event |
| `seo_landing_view` | `26,958` | `218` | — | `123.7x` | **Duplicate-firing bug** (`81,658` events / `52` users in Referral) |

### 3.2 Root Causes & Code Remediation

- **Consent & Delivery (`index.html`, `growthFunnelTracker.ts`):** `gtag('config', 'G-CMYNTTNT56')` fires with Consent Mode v2 (`analytics_storage: 'granted'`, `ad_storage: 'denied'`). Real Organic Search events are arriving cleanly in GA4.
- **`seo_landing_view` Duplicate Inflation:** [SEOHead.tsx](file:///c:/Users/Arshid.Wani/talentxcel-local/src/components/seo/SEOHead.tsx) fired `seo_landing_view` inside `useEffect(..., [title])` guarded only by `sessionStorage`. When `sessionStorage` threw or state/title re-rendered in iframes, it re-fired repeatedly. Added module-level `trackedSeoPathsInMemory = new Set<string>()` guard in `SEOHead.tsx` so each path fires at most once per page session even if `sessionStorage` is unavailable.
- **Primary Key Events (`[RESOLVED]`):** After upgrading `antigravity-search@talentxcel-login.iam.gserviceaccount.com` to GA4 **Editor**, both primary conversion events were registered and verified via `POST` & `GET https://analyticsadmin.googleapis.com/v1beta/properties/499367883/keyEvents`:
  - `sign_up` (`properties/499367883/keyEvents/16418181505`, `countingMethod: ONCE_PER_SESSION`, created `2026-11-26T02:00:12Z`)
  - `application_submitted` (`properties/499367883/keyEvents/16417952474`, `countingMethod: ONCE_PER_EVENT`, created `2026-11-26T02:00:15Z`)
  - **Secondary events** (`guest_apply_opened`, `ats_score_generated`, `apply_cta_clicked`) remain standard events (not Key Events) to avoid inflating conversion counts.

---

## 4. Indexation Governance Parity Architecture

To align SSR ([api/seo-render.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/api/seo-render.ts)) and CSR ([src/config/seo.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/src/config/seo.ts), [JobLocationPage.tsx](file:///c:/Users/Arshid.Wani/talentxcel-local/src/pages/seo/JobLocationPage.tsx)) without lowering the `400`-word or live-inventory gates:

- Exported `QUALIFIED_LOCATION_SLUGS` (`25` verified cities including `varanasi`, `bangalore`, `bengaluru`, `gurugram`, `gurgaon`, `hyderabad`, `noida`, `lucknow`, etc.) and `QUALIFIED_SALARY_ROLES` (`data-scientist`, `ui-ux-designer`, `data-analyst`, `software-engineer`, `product-manager`) in `src/config/seo.ts`.
- Added `/^\/career-insights\/salary\/.+$/i` to `NOINDEX_PATH_PATTERNS` so unverified legacy salary insights remain `noindex, follow` on both SSR and CSR.
- Updated `isNoindexPath()` in `src/config/seo.ts` to exempt only qualified location/salary slugs matching SSR qualification rules.
- Updated `JobLocationPage.tsx` `<Helmet><meta name="robots">` from hardcoded `index, follow` to `effectiveCount >= 3 && !isNoindexPath(...) ? 'index, follow' : 'noindex, follow'`.

---

## 5. Salary Page Recovery (`/salary/data-scientist`, `/salary/ui-ux-designer`)

Both pages now query live active INR jobs from Supabase (`salary_currency=eq.INR&salary_min=gt.0`) inside `api/seo-render.ts` without fabricating figures:

| Route | Live INR Sample | SSR Status | Robots | Rendered Words | Client `isNoindexPath` |
|---|---:|---|---|---:|---|
| `https://salary.talentxcel.in/salary/data-scientist` | `70` active INR jobs | `200` | `index, follow` | `635` | `false` |
| `https://salary.talentxcel.in/salary/ui-ux-designer` | `12` active INR jobs | `200` | `index, follow` | `625` | `false` |
| `https://talentxcel.in/career-insights/salary/data-scientist-salary-in-hyderabad` | Legacy insight route | `200` | `noindex, follow` | `484` | `true` |

Each qualified `/salary/:role` page computes live `min`, `median`, `max`, and `sampleCount`, renders a source & methodology disclosure explaining the live active INR job-posting sample, and keeps `index, follow` gated on `>= 5` real INR rows plus root role qualification.

---

## 6. Geographic Page Recovery (`/locations/varanasi`, `/locations/bangalore`)

| Route | Live Inventory | SSR Status | Robots | Rendered Words | Client `isNoindexPath` |
|---|---:|---|---|---:|---|
| `https://talentxcel.in/locations/varanasi` | `17` active jobs | `200` | `index, follow` | `603` | `false` |
| `https://talentxcel.in/locations/bangalore` | `762` openings | `200` | `index, follow` | `509` | `false` |
| `https://talentxcel.in/locations/doha` | Unqualified / empty | `404` | `noindex, nofollow` | `51` | `true` |

Fixes implemented in `api/seo-render.ts`:
- Added `bengaluru`/`bangalore` OR-filter parity when querying live Supabase jobs.
- Added `cityFaqSchema` (`FAQPage` JSON-LD) and matching visible city FAQ/hiring-landscape sections so qualified hubs (`>= 3` live jobs) consistently exceed `400` `bodyContent` words prior to footer injection.

---

## 7. Sitemap Forensic Recovery (`sitemap-rankings.xml` & `sitemap-network.xml`)

- **`sitemap-rankings.xml` Retirement:**
  - Added `/sitemap-rankings.xml` rewrite in `vercel.json` before the SPA catchall, routed to `/api/seo-render?path=sitemap-rankings.xml`.
  - Updated `api/seo-render.ts` to return HTTP `410 Gone` (`Content-Type: text/plain`, `X-Robots-Tag: noindex, nofollow`, `8` words) instead of falling through to `index.html`.
  - Removed `sitemap-rankings.xml` submission from `scripts/gsc-submit-todays-updates.ts`.
  - Executed authorized GSC `DELETE https://talentxcel.in/sitemap-rankings.xml` -> HTTP `204`.
- **`sitemap-network.xml` Validation & Recovery:**
  - Executed authorized GSC `PUT https://talentxcel.in/sitemap-network.xml` -> HTTP `204`.
  - GSC Sitemaps post-cleanup: `19` submitted sitemaps, `0` with errors (`[]`).
  - Updated [generate-sitemap.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/scripts/generate-sitemap.ts) to filter `sitemap-network.xml` strictly to `INDEXABLE_GEO_CITIES` and exclude thin `/u/*` profiles (`55` URLs total, `0` duplicates).
  - Enriched `/network/(locations|skills|industries|segments)/*` in `api/seo-render.ts` (`581` words on `/network/locations/noida`, `579` words on `/network/skills/react`, both `200 index, follow`).
  - Post-fix audit on `sitemap-network.xml` (`41/55` sample URLs audited across cities, skills, industries, and segments): `41/41` returned `200 index, follow` with self-canonical (`0` issues, `0` noindex pages).

---

## 8. Legacy URL Recovery (`/resume/interview-prep/golang-developer`)

- Enriched `/resume/interview-prep/golang-developer` in `api/seo-render.ts` with 6 Go/Gin technical Q&As and `FAQPage` JSON-LD (`200`, `index, follow`, `540` words, self-canonical).
- Added strictly scoped `301` redirects only for matching Golang interview-prep variants (`-part-3`, `-part-85`, `-part-9`, `lead-...`), preserving `404` for unrelated slugs:
  - `/resume/interview-prep/executive-golang-developer-interview-questions-and-answers-part-3` -> `301` to `/resume/interview-prep/golang-developer`
  - `/resume/interview-prep/golang-developer-interview-questions-and-answers-part-85` -> `301` to `/resume/interview-prep/golang-developer`
  - `/resume/interview-prep/executive-golang-developer-interview-questions-and-answers-part-9` -> `301` to `/resume/interview-prep/golang-developer`
  - `/resume/interview-prep/lead-golang-developer-interview-questions-and-answers` -> `301` to `/resume/interview-prep/golang-developer`
  - `/resume/interview-prep/nonexistent-role-part-3` -> `404` (`noindex, nofollow`)

---

## 9. Phase 12 Regression Monitoring Implementation

Added `Phase12RegressionAlert` ([types.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/src/lib/seo/demandIntelligence/types.ts)) and `detectPhase12Regressions()` ([gscOpportunityDetector.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/src/lib/seo/demandIntelligence/gscOpportunityDetector.ts)) plus Test 14 in [test-search-demand-intelligence.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/scripts/test-search-demand-intelligence.ts) covering:
- `UNEXPECTED_NOINDEX_ON_QUALIFIED`
- `SSR_CLIENT_PARITY_MISMATCH`
- `SITEMAP_HTTP_OR_XML_FAILURE`
- `CANONICAL_CONFLICT`
- `REDIRECT_LOOP_OR_CHAIN`
- `HIGH_IMPRESSION_DECLINING_CLICKS`
- `GA4_CONVERSION_REGRESSION`

---

## 10. Modified Files Inventory

| File | Purpose of Change |
|---|---|
| [SEOHead.tsx](file:///c:/Users/Arshid.Wani/talentxcel-local/src/components/seo/SEOHead.tsx) | In-memory `Set<string>` guard to stop `seo_landing_view` duplicate firing |
| [seo.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/src/config/seo.ts) | `QUALIFIED_LOCATION_SLUGS`, `QUALIFIED_SALARY_ROLES`, `/career-insights/salary/` noindex pattern, parity `isNoindexPath()` |
| [JobLocationPage.tsx](file:///c:/Users/Arshid.Wani/talentxcel-local/src/pages/seo/JobLocationPage.tsx) | Dynamic `effectiveCount >= 3 && !isNoindexPath(...)` robots parity (no UI/CSS changes) |
| [vercel.json](file:///c:/Users/Arshid.Wani/talentxcel-local/vercel.json) | Route `/sitemap-rankings.xml` to `/api/seo-render?path=sitemap-rankings.xml` |
| [gsc-submit-todays-updates.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/scripts/gsc-submit-todays-updates.ts) | Remove obsolete `sitemap-rankings.xml` submission |
| [api/seo-render.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/api/seo-render.ts) | `410` for `sitemap-rankings.xml`, scoped Golang `301`s + enriched hub, live `/locations/:city` & `/salary/:role` data/content, enriched `/network/*` hubs |
| [types.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/src/lib/seo/demandIntelligence/types.ts) | `Phase12RegressionAlert` type definitions |
| [gscOpportunityDetector.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/src/lib/seo/demandIntelligence/gscOpportunityDetector.ts) | `detectPhase12Regressions()` detector |
| [test-search-demand-intelligence.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/scripts/test-search-demand-intelligence.ts) | Test 14 for Phase 12 parity & regression detection |
| [generate-sitemap.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/scripts/generate-sitemap.ts) | Filter `sitemap-network.xml` to `INDEXABLE_GEO_CITIES` and exclude thin `/u/*` profiles (`55` URLs, `0` issues) |

---

## 11. Verification & Test Matrix (Post-Final-Edit)

| Check / Command | Outcome | Observed Metrics / Scope |
|---|---|---|
| `verify_phase12.ts` | **PASS** (`0` alerts) | 15 SSR + CSR parity probes; `Phase 12 Regression Alerts: []` |
| `npx tsc --noEmit` | **PASS** | `0` TypeScript errors |
| `npm run build` | **PASS** | `vite build` in `7m 4s`; `6,397` sitemap URLs (`16` sitemaps); `14,244` static HTML docs |
| `npx tsx scripts/test-search-demand-intelligence.ts` | **PASS** | `14/14` tests passed (including Test 14 Phase 12 parity/regression) |
| `npx tsx scripts/test-seo-render-entities.ts` | **PASS** | `12/12` core entity destinations passed (`100%`) |
| `npx tsx scripts/search-intelligence/securityAndCostAudit.ts` | **PASS** | DB size `457 MB`, SQLite `2760.15 MB` |
| `npx tsx scripts/seo-ci-gate.ts` | **EXIT 0** | `4,332 / 4,339` invariants passed (`7` pre-existing non-critical flags) |
| `phase12_sitemap_gsc_remediation.ts --audit-only` | **PASS** | GSC `sitemap-rankings.xml` `DELETE` `204`, `sitemap-network.xml` `PUT` `204`, `19` GSC sitemaps (`0` errors); `sitemap-network.xml` audited `41/55` sample URLs: `0` issues (`100% index, follow`) |

---

## 12. Production vs. Local Verification Boundary

- **Verified Live Against Production APIs:** GSC Sitemaps API (`DELETE sitemap-rankings.xml` -> `204`, `PUT sitemap-network.xml` -> `204`, `19` sitemaps with `0` errors), GA4 Admin & Data API (`properties/499367883` 28d Organic Search counts and `keyEvents` state), and live Supabase REST queries for `/locations/*` and `/salary/*`.
- **Verified Locally Against Handler & Build Artifacts (Pending Vercel Deploy):** `api/seo-render.ts`, `SEOHead.tsx`, `src/config/seo.ts`, `JobLocationPage.tsx`, `vercel.json`, `scripts/generate-sitemap.ts`, and `dist/` outputs were verified via direct TypeScript handler invocation, `vite build`, and CI gates in the local workspace; live `https://talentxcel.in` HTTP edge responses will reflect these changes once deployed to Vercel.

---

## 13. Rollback Plan

All Phase 12 changes are isolated to tracked application files and can be reverted cleanly via `git checkout` / `git revert` on the 10 files listed in Section 10 followed by redeploying. No database schema migrations, RLS policies, `.env` files, or Cloudflare Edge rules were modified. In GSC, `sitemap-rankings.xml` was intentionally retired and should remain deleted.

---

## 14. Remaining Risks & Open Action Items

1. **GA4 Key Event Activation `[RESOLVED]`:** Granted **Editor** role to `antigravity-search@talentxcel-login.iam.gserviceaccount.com` and registered `sign_up` (`keyEvents/16418181505`, `ONCE_PER_SESSION`) and `application_submitted` (`keyEvents/16417952474`, `ONCE_PER_EVENT`) on GA4 property `499367883` via the Analytics Admin API.
2. **`sitemap-network.xml` Thin-URL Filtering [RESOLVED]:** [scripts/generate-sitemap.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/scripts/generate-sitemap.ts) was updated to filter `/network/locations/*` entries strictly to `INDEXABLE_GEO_CITIES` and exclude thin `/u/*` profiles. The generated `sitemap-network.xml` now contains `55` verified URLs with `0` issues in automated sample audit (`100% index, follow`).
3. **Vercel Production Deploy:** Deploy the built workspace to Vercel and run live `curl -I` / `curl` checks on `/sitemap-rankings.xml` (`410`), `/locations/varanasi` (`200 index, follow`), `/salary/data-scientist` (`200 index, follow`), `/salary/ui-ux-designer` (`200 index, follow`), and `/resume/interview-prep/golang-developer-interview-questions-and-answers-part-85` (`301`).

---

## 15. Next Monitoring Cadence

- **T+24h Post-Deploy:** Verify live HTTP `410`, `301`, and `200 index, follow` headers on production URLs and confirm `seo_landing_view` events/user drops from `123.7x` toward `~1–3x` in GA4 Realtime/Daily reports.
- **T+7d Post-Deploy:** Run `npx tsx scripts/search-intelligence/run-intelligence-cycle.ts` to inspect GSC indexing recovery on `/locations/varanasi`, `/salary/data-scientist`, `/salary/ui-ux-designer`, and `/resume/interview-prep/golang-developer`, and confirm `0` `Phase12RegressionAlert` entries.

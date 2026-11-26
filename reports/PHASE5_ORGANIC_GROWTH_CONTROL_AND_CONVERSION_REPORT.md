# TalentXcel Phase 5 — Organic Growth Control, Conversion Telemetry & Action Execution Report

**Generated:** 2026-11-25  
**Primary Domain:** https://talentxcel.in  
**UI Change Policy:** ZERO UI CHANGES (Backend-first telemetry repair, cannibalization refinement, P0–P4 prioritization, and governed batch planning)  
**Machine-Readable Artifacts:**
- `reports/PHASE5_FORENSIC_BASELINE.json`
- `reports/PHASE5_GA4_EVENT_MAP.json`
- `reports/PHASE5_BATCH_EXECUTION_PLAN.json`
- `reports/PHASE5_CONTROL_SUMMARY.json`

---

## 1. Verified Baseline

Revalidated directly against `search_demand_intelligence.db` before Phase 5 mutations:
- **Execution Queue**: `370` consolidated items (`2` `TIER_A_AUTO` `VERIFIED`, `189` `TIER_B_APPROVAL` `RECOMMENDATION`, `178` `TIER_B_APPROVAL` `EVIDENCE_REVIEW`, `1` `TIER_C_RESTRICTED` `EVIDENCE_REVIEW`).
- **Cannibalization Audits**: `800` clusters (`400` `TRUE_CANNIBALIZATION`, `264` `NO_ACTION`, `86` `NEEDS_REVIEW`, `37` `INTENT_OVERLAP`, `8` `PAGE_DIFFERENTIATION_REQUIRED`, `4` `LEGITIMATE_MULTIPLE_RANKING`, `1` `CONSOLIDATION_CANDIDATE`).
- **Technical SEO Findings**: `12` records.
- **Growth Scorecard Snapshots**: `25` segmented rows.

---

## 2. Telemetry Audit (Why `talentscore_completed` & `career_passport_created` Reported 0)

Live GA4 query (`properties/499367883`, 28d) across **all channels** and **Organic Search**:
1. **TalentScore**:
   - Actual GA4 event names observed across all channels: `talent_score_page_view` (`6`) and `talent_score_assessment_start` (`1`), both `0` in Organic Search.
   - Phase 4 queried the wrong event name (`talentscore_completed` did not exist), and a dedicated completion GA4 event (`talent_score_completed`) is not yet emitted.
2. **Career Passport**:
   - `career_passport_created` and `career_passport_completed` were defined in `src/utils/conversionTelemetry.ts` (`localStorage` + Supabase `user_behavior_events`), **never forwarded to `window.gtag`**.
   - **Verified Repair Applied**: Added non-PII `window.gtag('event', event, { funnel_type, hostname })` forwarding inside `conversionTelemetry.track()` in [conversionTelemetry.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/src/utils/conversionTelemetry.ts) (preserving its existing 1,500ms deduplication cache and zero-PII sanitization).
3. **Additional Telemetry Findings**:
   - `seo_landing_view` fired `26,963` times across `1,121` Organic Search sessions (~24x/session), indicating a **high duplicate/re-render risk** compared to `page_view` (`4,871`).
   - `AnalyticsContext.tsx` (`trackEvent` / `trackPageView`) is a `DEV`-only console stub and should remain isolated from GA4 conversion counting.

---

## 3. Validated GA4 Event Map (28d Observed)

| User Journey | Event Name | Implementation / Destination | 28d All Channels | 28d Organic | Status / Duplicate Risk |
| --- | --- | --- | ---: | ---: | --- |
| Registration | `sign_up` | GA4 Auth / OneTap (`properties/499367883`) | 81 | 78 | `VERIFIED_ACTIVE` (Low dup risk) |
| Auth / Login | `auth_completed` | GA4 Auth (`google_onetap_accepted = 175`) | 238 | 175 | `VERIFIED_ACTIVE` |
| Resume Upload | `resume_uploaded` | Resume parser (`resume_upload_started = 203`) | 224 | 203 | `VERIFIED_ACTIVE` |
| ATS-Check | `ats_score_generated` | ATS / Match Score (`match_score_started = 261`) | 462 | 431 | `VERIFIED_ACTIVE` |
| Job Discovery | `job_view` | Job detail view | 1,793 | 1,395 | `VERIFIED_ACTIVE` |
| Job Application | `application_submitted` | Apply submit (`guest_apply_opened = 513`, `apply_cta_clicked = 360`) | 185 | 170 | `VERIFIED_ACTIVE` |
| TalentScore | `talent_score_page_view`, `talent_score_assessment_start` | TalentScore flow | 7 | 0 | `PARTIAL_GAP` (completion event missing) |
| Career Passport | `career_passport_created` | `src/utils/conversionTelemetry.ts` -> **now wired to `gtag`** | 0 | 0 | `REPAIRED_IN_CODE` (awaiting release) |
| Network / Sharing | `social_share_initiated`, `discovery_page_view` | `src/utils/growthTelemetry.ts` | 101 | 84 | `VERIFIED_ACTIVE` |
| SEO Shell View | `seo_landing_view` | SEO landing tracker | 78,077 | 26,963 | `HIGH_DUPLICATE_RISK` (~24x/session) |

---

## 4. Organic Activation Funnel (28d Real GA4 Data)

Non-sequential multi-entry organic funnel (users frequently enter directly into ATS-Check or Guest Apply without registering first):
- `session_start`: **1,121** (`mobile: 642`, `desktop: 500`, `tablet: 2`; top country: `India: 1,077`, `United States: 18`)
- `job_view`: **1,395**
- `guest_apply_opened`: **513** → `apply_cta_clicked`: **360** → `application_started`: **171** → `application_submitted`: **170** (`99.4%` start-to-submit completion!)
- `ats_score_generated`: **431** (`resume_uploaded`: **203**)
- `auth_completed`: **175** (`sign_up`: **78**, `login`: **29**)
- TalentScore & Career Passport remain excluded from sequential funnel conversion totals until live post-release GA4 events accumulate.

---

## 5. Technical SEO Defects Revalidated

1. **`https://jobs.talentxcel.in/jobs/devops-cloud-infrastructure-engineer-ntpc-sipat-bilaspur-chhattisgarh-india` (`HTTP 308`)**:
   - **Verified Intentional**: Redirects cleanly in 1 hop (`308`) to canonical `https://talentxcel.in/jobs/devops-cloud-infrastructure-engineer-ntpc-sipat-bilaspur-chhattisgarh-india`, which returns **`HTTP 200`** (`"NTPC Careers: DevOps & Vacancies (14 Live) | TalentXcel"`).
   - **Sitemap Integrity**: `public/sitemap-jobs.xml` contains **only** the canonical `https://talentxcel.in/jobs/...` URL (`ntpcCanonicalInSitemap: true`, `ntpcSubdomainInSitemap: false`). Zero redirect chain.
2. **`https://talentxcel.in/resume/interview-prep/executive-golang-developer-interview-questions-and-answers-part-3` (`Googlebot 404` vs `Standard UA 200`)**:
   - **Verified Defect**: Googlebot UA receives `HTTP 404` (`"Page Not Found (404) | TalentXcel"`), while normal browser UA receives `HTTP 200` SPA shell (`"TalentXcel — Global Career Platform, Jobs & Passport"`) — a classic retired-slug soft-200 mismatch for browsers vs hard-404 for crawlers. Staged as **`P0`** in `BATCH_1_CRITICAL_AND_CTR` for governed slug restoration or clean canonical/410 handling.

---

## 6. Verified Remediation Applied (Safe, Zero-UI)

1. Wired zero-PII `career_passport_created` / `career_passport_completed` GA4 `window.gtag` forwarding in [conversionTelemetry.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/src/utils/conversionTelemetry.ts).
2. Refined `classifyCannibalizationCluster` in [autonomousGrowth.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/src/lib/seo/demandIntelligence/autonomousGrowth.ts) to eliminate false-positive `TRUE_CANNIBALIZATION` on same-path subdomain aliases and distinct employer job postings.
3. Implemented `P0`–`P4` evidence-based priority scoring (`assignExecutionPriorityTier`) and controlled Batch 1/2/3 planning (`planExecutionBatches`).

---

## 7. 367-Action Prioritization (`P0`–`P4`)

All `370` consolidated queue items (including the `367` Tier B + `1` Tier C + `2` Tier A actions) prioritized via `assignExecutionPriorityTier` (strictly blocking low-confidence items from `P0`/`P1`):

| Priority Tier | Count | Criteria |
| --- | ---: | --- |
| **P0** | 3 | Critical production SEO/rendering/404 defects (`conf >= 0.80`, `priorityScore >= 85`) |
| **P1** | 70 | High-confidence (`>= 0.78`), high-impression (`>= 100`) CTR & pos `4–10` strike-zone recovery |
| **P2** | 285 | Meaningful growth opportunities (`conf >= 0.65`, `>= 25` imp or `>= 2` clicks or Tier A) |
| **P3** | 0 | Long-term optimization |
| **P4** | 12 | Low-confidence (`< 0.65`) or `< 15` impressions (research/monitoring only) |

---

## 8. Controlled Batch Execution Status

| Batch | Count | Scope & Governance Status |
| --- | ---: | --- |
| **Batch 1 (`BATCH_1_CRITICAL_AND_CTR`)** | 39 | P0 technical 404/metadata defects + CTR recovery + high-value internal links (`TIER_B_APPROVAL` awaiting approval) |
| **Batch 2 (`BATCH_2_RANKING_AND_INVENTORY`)** | 152 | Position 4–20 ranking & inventory-backed page improvements + Tier A control action (`VERIFIED`) |
| **Batch 3 (`BATCH_3_CANNIBALIZATION_AND_CANONICAL`)** | 179 | Cannibalization remediation & `TIER_C_RESTRICTED` consolidation (`EVIDENCE_REVIEW`) |

- Safe `TIER_A_AUTO` action `exec-p5-control-2026-11-25` executed and `VERIFIED` with before/after snapshots. Zero `TIER_B_APPROVAL` / `TIER_C_RESTRICTED` production mutations were bulk-executed.

---

## 9. Cannibalization Classifier Validation (800 Clusters)

Validating the top Phase 4 `TRUE_CANNIBALIZATION` clusters exposed two systematic false-positive patterns:
1. Same-path subdomain canonical aliases (e.g., `jobs.talentxcel.in/jobs/X` + `talentxcel.in/jobs/X`, which already `308`-redirect).
2. Distinct individual job postings (e.g., 7 different Tata Steel roles ranking for `"tata steel career"`).

After applying Phase 5 precision rules across all **800** clusters:

| Classification | Phase 4 | Phase 5 Refined | Delta |
| --- | ---: | ---: | ---: |
| `TRUE_CANNIBALIZATION` | 400 | **350** | **-50** (false positives removed) |
| `LEGITIMATE_MULTIPLE_RANKING` | 4 | **73** | **+69** (employer job sets preserved) |
| `NO_ACTION` | 264 | **268** | **+4** (308 subdomain aliases) |
| `NEEDS_REVIEW` | 86 | **63** | **-23** |
| `INTENT_OVERLAP` | 37 | **37** | 0 |
| `PAGE_DIFFERENTIATION_REQUIRED` | 8 | **8** | 0 |
| `CONSOLIDATION_CANDIDATE` | 1 | **1** | 0 |

---

## 10. Growth Scorecard (28d Control Baseline)

- **GSC (28d)**: `61,328` impressions, `1,272` clicks, `2.07%` CTR, avg position `25.23`
- **GA4 Organic (28d)**: `1,121` `session_start`, `1,395` `job_view`, `431` `ats_score_generated`, `78` `sign_up`, `170` `application_submitted`, `513` `guest_apply_opened`
- **Sitemaps**: `17` segmented sitemaps, `7,229` published URLs
- **Execution**: `3` `TIER_A_AUTO` `VERIFIED`, `367` `TIER_B_APPROVAL` pending, `1` `TIER_C_RESTRICTED` in review, `0` reverted.

---

## 11. Measured Impact

- **Classifier Precision Improvement**: Eliminated `50` false-positive `TRUE_CANNIBALIZATION` flags and properly classified `69` additional multi-job employer clusters as `LEGITIMATE_MULTIPLE_RANKING`.
- **Telemetry Repair**: `career_passport_created` / `career_passport_completed` now forward safely to `window.gtag`; zero fabricated metrics.
- **Closed-Loop Readiness**: Subsequent 7d/28d/90d GSC+GA4 cycles will compare post-approval Batch 1 CTR/click deltas against saved `beforeStateSnapshot`s without claiming causality on low-impression noise.

---

## 12. Security

- Zero changes to RLS, Cloudflare gateway, or service-role boundaries.
- `scripts/search-intelligence/securityAndCostAudit.ts` — **PASS** (`DB size: 459 MB`, well under `500 MB` quota, zero client/VITE secret leaks, zero Realtime/pg_cron polling).

---

## 13. Performance

- `run-phase5-control-engine.ts` completed full GA4 multi-dimension query, HTTP dual-UA/308/404 probes, 800-cluster reclassification, P0–P4 batching, and Supabase sync in **`9.68s`**.

---

## 14. Test Results

| Check | Result |
| --- | --- |
| `npx tsc -p tsconfig.search-intel.json --noEmit` | **PASS** (exit 0) |
| `scripts/test-search-demand-intelligence.ts` (Tests 1–19 incl. Phase 5 Cannibalization & P0–P4 Batching) | **19 / 19 PASS** |
| `scripts/test-seo-graph-governor.ts` | **31 / 31 PASS** |
| `scripts/test-seo-intelligence.ts` | **26 / 26 PASS** |
| `scripts/search-intelligence/securityAndCostAudit.ts` | **PASS** |
| `npm run build` (`vite build` + `generate-sitemap.ts` + `prerender-static-seo.ts` + `seo-ci-gate.ts` + `finalize-subdomain-routing.ts`) | **PASS** (`7,364` modules, `17` sitemaps / `7,229` URLs, `9` subdomain HTML shells) |

---

## 15. Remaining Gaps

1. **`seo_landing_view` Duplicate Firing**: Fires `26,963` times across `1,121` organic sessions (~24x/session); needs component/hook mount deduplication in a future cycle.
2. **`talent_score_completed` Event Missing**: `talent_score_assessment_start` exists (`1` total), but completion is not yet emitted to GA4.
3. **Batch 1 Approvals**: `39` `BATCH_1_CRITICAL_AND_CTR` items (including `3` `P0` technical findings and top CTR title/meta updates) await governed approval.

---

## 16. Next Priorities

1. Approve and execute **Batch 1** (`39` items: P0 bot-404 fix on `/resume/interview-prep/executive-golang-developer-interview-questions-and-answers-part-3` + top P1 CTR metadata updates).
2. Add `talent_score_completed` GA4 emission and deduplicate `seo_landing_view` triggers.
3. Run `npm run search-intel:phase5` after release to verify live `career_passport_created` GA4 events and 14d/28d Batch 1 CTR recovery.

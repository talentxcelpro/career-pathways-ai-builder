# TalentXcel Phase 6 — Organic Growth Execution & Recovery Report

**Generated:** 2026-11-25  
**Primary Domain:** https://talentxcel.in  
**UI Change Policy:** ZERO UI CHANGES  
**Machine-Readable Scorecard:** `reports/PHASE6_SCORECARD.json`

---

## 1. Executive Summary

Phase 6 executed forensic verification, P0 crawler defect root-cause resolution, Batch 1 CTR & Position 4–20 filtering, GA4 conversion telemetry validation, internal link graph verification, live job inventory quality auditing, cannibalization sample validation, and Supabase FinOps bloat diagnostics—without creating duplicate engines, mass pages, or unapproved production mutations.

---

## 2. Phase 5 Baseline

- **Execution Queue**: `370` consolidated items (`P0: 3`, `P1: 70`, `P2: 285`, `P4: 12`), organized into `BATCH_1_CRITICAL_AND_CTR` (`39`), `BATCH_2_RANKING_AND_INVENTORY` (`152`), `BATCH_3_CANNIBALIZATION_AND_CANONICAL` (`179`).
- **Cannibalization Audits**: `800` clusters (`TRUE_CANNIBALIZATION: 350`, `NO_ACTION: 268`, `LEGITIMATE_MULTIPLE_RANKING: 73`, `NEEDS_REVIEW: 63`, `INTENT_OVERLAP: 37`, `PAGE_DIFFERENTIATION_REQUIRED: 8`, `CONSOLIDATION_CANDIDATE: 1`).
- **GSC (28d)**: `61,328` impressions, `1,272` clicks, `2.07%` CTR, avg position `25.23`.

---

## 3. P0 Defect Investigation (`executive-golang-developer-interview-questions-and-answers-part-3`)

Live probes confirmed:
- `https://talentxcel.in/resume/interview-prep/executive-golang-developer-interview-questions-and-answers-part-3`:
  - **Googlebot UA**: `HTTP 404` (`"Page Not Found (404) | TalentXcel"`)
  - **Standard UA**: `HTTP 200` SPA shell (`"TalentXcel — Global Career Platform, Jobs & Passport"`)
- `https://talentxcel.in/resume/interview-prep/golang-developer`:
  - **Googlebot UA**: `HTTP 200` (`"Golang Developer Interview Questions & Answers (2026 Technical Prep) | TalentXcel"`)

**Root Cause**: Local repository [api/seo-render.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/api/seo-render.ts#L1016-L1025) **already implements** the exact scoped `301` redirect:
`/^resume\/interview-prep\/(?:executive-|senior-|junior-|lead-)?golang-developer-interview-questions-and-answers(?:-part-\d+)?$/i` → `https://talentxcel.in/resume/interview-prep/golang-developer`, which has **not yet been deployed** to live production.

---

## 4. P0 Remediation Evidence

- Verified `api/seo-render.ts` regex & canonical target in automated Test 20 (`test-search-demand-intelligence.ts` — PASS).
- **Honest Governance Status**: `p0LocalCodeResolved = 1`, `p0ProductionVerifiedAfterDeploy = 0`. Per governance rules, this P0 item is **not** marked `VERIFIED` in production until the approved release deploys `api/seo-render.ts` and live Googlebot returns `301` → `200 OK`.

---

## 5. CTR Recovery Execution

- **Candidates Evaluated**: `29`
- **Excluded Subdomain Aliases (`jobs.talentxcel.in/jobs/*`) & Legacy Redirected Interview-Prep Slugs**: `16`
- **Eligible Canonical Batch 1 Targets**: `13` (staged for governed approval; `executedInProd = 0`, `measurementStartDate = 2026-11-25`)
- **Top Staged Targets**:
  1. `https://talentxcel.in/locations/varanasi` (`job in varanasi`, pos `2.44`, `3,671` imp, `118` clicks, `3.21%` vs `12.00%` cohort)
  2. `https://salary.talentxcel.in/salary/data-scientist` (`salary for data scientist`, pos `10.02`, `1,685` imp, `0` clicks)
  3. `https://salary.talentxcel.in/salary/ui-ux-designer` (`salary for ux designer`, pos `6.58`, `1,509` imp, `0` clicks)
  4. `https://talentxcel.in/career-insights/salary/data-scientist-salary-in-hyderabad` (pos `7.61`, `765` imp, `0` clicks)
  5. `https://talentxcel.in/hire` (`talentxcel`, pos `1.03`, `200` imp, `9` clicks)

---

## 6. Position 4–20 Execution

- **Total `POS_4_10` & `POS_11_20` Targets**: `146` (`27` non-alias canonical targets eligible for direct content/internal-link execution).
- Top targets (`salary.talentxcel.in/salary/data-scientist`, `salary.talentxcel.in/salary/ui-ux-designer`, `/career-insights/salary/data-scientist-salary-in-hyderabad`) carry `internal_linking_gap = 3` and verified inventory (`8` and `175` respectively).

---

## 7. Telemetry Validation (28d Live GA4)

- **Validated Organic Search Events**: `session_start` (`1,121`), `job_view` (`1,395`), `guest_apply_opened` (`513`), `ats_score_generated` (`431`), `apply_cta_clicked` (`360`), `resume_uploaded` (`203`), `auth_completed` (`175`), `application_submitted` (`170`), `sign_up` (`78`).
- **Repaired in Code (Phase 5/6)**: `career_passport_created` and `career_passport_completed` now forward zero-PII milestones to `window.gtag` inside [conversionTelemetry.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/src/utils/conversionTelemetry.ts).
- **All-Channel TalentScore**: `talent_score_page_view` + `talent_score_assessment_start` = `7` total (`0` Organic Search).
- **Duplicate Risk Documented**: `seo_landing_view` = `26,963` Organic Search events across `1,121` sessions (~24x/session).

---

## 8. Internal Link Execution

- **Total Recommendations Audited**: `77`
- **Validated Clean Links**: `77` (all non-self-referential, excluding retired `interview-prep` slugs, linking `/jobs` and `/salary` hubs to `POS_4_10` targets with varied natural anchors such as `"Explore freshers jobs in bangalore"`, `"bhel careers trichy guide & openings"`).

---

## 9. Inventory Quality Analysis (Live Supabase `jobs`)

- **Total / Active Jobs**: `4,470` / `4,470` (`100%` active)
- **Distinct Employers**: `417`
- **Newest Job Timestamp**: `2026-11-25T07:21:07.709172+00:00` (fresh today)
- **Quality Completeness**: Only `1` missing salary and `1` missing location across all `4,470` active listings (`99.98%` complete).

---

## 10. Cannibalization Validation

- Reviewed the top `25` of `350` `TRUE_CANNIBALIZATION` clusters (`PHASE6_SCORECARD.json` Section G).
- **Top Confirmed Cases**:
  - `gin interview questions` (`931` imp across `part-3`, `part-9`, `part-85`, `lead-golang-...`) → resolved in `api/seo-render.ts` via `301` consolidation to `/resume/interview-prep/golang-developer`.
  - Programmatic bareilly/nagpur seniority-permutation pages (`seo jobs in nagpur it software` `392` imp, `ios app development bareilly` `345` imp, `front-end developer jobs in bareilly` `325` imp).
- Zero automatic page merges were executed; `1` `CONSOLIDATION_CANDIDATE` remains in governed `EVIDENCE_REVIEW`.

---

## 11. Security & FinOps Findings

- **Supabase Storage**: `459 MB` / `500 MB` (`41 MB` headroom).
- **Top 5 Largest Tables**:
  1. `job_ingestion_queue`: `146 MB` (`27,925` live tuples)
  2. `notifications`: `59 MB` (`106,494` live tuples)
  3. `jobs`: `54 MB` (`4,470` live tuples)
  4. `seo_generated_content`: **`45 MB` with `0` live tuples** (pure dead-tuple bloat awaiting safe `VACUUM FULL` during maintenance)
  5. `seo_job_pages`: `20 MB` (`17,889` live tuples)
- **Audit Status**: `securityAndCostAudit.ts` — **PASS**. Zero destructive operations performed.

---

## 12. Before/After Measurement Baseline (Comparable GSC Windows)

| Window | Impressions | Clicks | CTR | Avg Position |
| --- | ---: | ---: | ---: | ---: |
| **7d** | 20,880 | 460 | 2.20% | 16.81 |
| **28d** | 61,328 | 1,272 | 2.07% | 25.23 |
| **90d** | 80,949 | 1,513 | 1.87% | 28.55 |

---

## 13. Actions Completed

1. Verified `api/seo-render.ts` P0 `301` redirect rule for legacy Golang interview-prep URLs (Test 20).
2. Filtered `29` CTR candidates down to `13` clean canonical Batch 1 targets (excluding `16` `308` aliases / retired URLs).
3. Validated `77` clean internal link recommendations and `27` eligible canonical `POS_4_10`/`POS_11_20` targets.
4. Audited `4,470` live jobs, `800` cannibalization clusters, GA4 organic funnel, and `459 MB` Supabase table bloat.
5. Generated `reports/PHASE6_SCORECARD.json` and passed all `77` automated verification checks + `npm run build`.

---

## 14. Actions Not Completed (Governed Hold)

- Live production deploy of `api/seo-render.ts` & `conversionTelemetry.ts` (awaiting release approval).
- `13` Batch 1 CTR metadata updates and `27` Position 4–20 content updates (`TIER_B_APPROVAL` awaiting approval).
- Non-destructive `VACUUM` on `seo_generated_content` (`45 MB` dead tuples) and retention cleanup on `job_ingestion_queue` (`146 MB`) / `notifications` (`59 MB`).

---

## 15. Risks

1. **Supabase Free-Tier Headroom (`41 MB`)**: `459 MB / 500 MB` leaves narrow margin until `seo_generated_content` bloat (`45 MB`) is vacuumed.
2. **Production Deploy Lag**: Live Googlebot still sees `404` on `/resume/interview-prep/executive-golang-developer-interview-questions-and-answers-part-3` until `api/seo-render.ts` is deployed.
3. **`seo_landing_view` Duplication**: `26,963` events across `1,121` sessions inflates raw GA4 event volume.

---

## 16. Rollback Information

- Every queued `TIER_B_APPROVAL` action in `seo_growth_execution_queue` stores `before_state_snapshot` and `rollback_instructions`.
- `conversionTelemetry.ts` GA4 forwarding is isolated to a single conditional `if ((event === 'career_passport_created' || event === 'career_passport_completed') && typeof window.gtag === 'function')` block and is trivially reversible.

---

## 17. Next 7-Day Execution Queue

1. **Release Approval**: Deploy current `api/seo-render.ts` + `conversionTelemetry.ts` build and re-verify live Googlebot `301` → `200 OK` on `executive-golang-developer-interview-questions-and-answers-part-3`.
2. **FinOps Maintenance**: Run safe `VACUUM` on `seo_generated_content` (`0` live rows, `45 MB` bloat) to immediately reclaim ~`45 MB` headroom.
3. **Approve Batch 1 CTR Updates**: Execute top `5` canonical Batch 1 metadata updates (`/locations/varanasi`, `/salary/data-scientist`, `/salary/ui-ux-designer`, `/career-insights/salary/data-scientist-salary-in-hyderabad`, `/hire`) and track 14d/28d GSC CTR deltas.

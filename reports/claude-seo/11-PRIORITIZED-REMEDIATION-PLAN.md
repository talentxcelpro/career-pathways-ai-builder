# TALENTXCEL × CLAUDE SEO — PHASE 10: PRIORITIZED REMEDIATION PLAN

**Audit Execution Date:** 2 November 2026  
**Auditor Engine:** Antigravity AI Engine & Executive SEO Prioritization Committee  
**Scoring Formula:** `Priority Score = Business Impact × Confidence × Reach × Urgency` (Each factor scored 1–5; Max Score = 625)  
**Implementation Risk Score:** Scored 1 (Lowest) to 5 (Highest)  
**Governance Standard:** Section 15 — All changes remain gated in Stage C (Recommendations) until explicit human sign-off in `13-APPROVAL-REGISTER.md`.

---

## 1. Prioritization Master Matrix

| Plan ID | Remediation Item | Target Surface | Impact (1–5) | Confidence (1–5) | Reach (1–5) | Urgency (1–5) | Priority Score | Implementation Risk | Tier |
|---|---|---|---|---|---|---|---|---|---|
| **SEO-001** | Subdomain Sitemap URL Origin Alignment | `scripts/generate-sitemap.ts` & public sitemaps | 4 | 5 | 5 | 5 | **500** | Low (2) | **P1 (High)** |
| **SEO-002** | Soft 404 Elimination on Empty Dynamic Slugs | `api/seo-render.ts` (Edge SSR Hydrator) | 4 | 5 | 5 | 4 | **400** | Medium (3) | **P1 (High)** |
| **SEO-003** | Organic Landing to Candidate Conversion Hook | Job detail templates & Career Passport CTA | 5 | 4 | 4 | 4 | **320** | Low (2) | **P1 (High)** |
| **SEO-004** | Subdomain vs Apex Canonical Policy Alignment | `src/config/domainArchitecture.ts` | 5 | 4 | 5 | 3 | **300** | High (4) | **P1 (High)** |
| **SEO-005** | Consolidate `talentxcel.co.in` via 301 Permanent Redirect | DNS / Vercel Edge routing on `.co.in` | 3 | 5 | 3 | 4 | **180** | Low (1) | **P2 (Medium)** |
| **SEO-006** | Enforce `validThrough` Dates on `JobPosting` Schema | `api/seo-render.ts` & `src/pages/JobDetail.tsx` | 3 | 5 | 4 | 3 | **180** | Low (1) | **P2 (Medium)** |
| **SEO-007** | Job Search CTR Snippet & Salary Tag Optimization | `api/seo-render.ts` meta generator | 3 | 4 | 4 | 3 | **144** | Low (1) | **P2 (Medium)** |
| **SEO-008** | Implement Curated `/llms.txt` Agent Specification | `public/llms.txt` & `public/llms-full.txt` | 3 | 5 | 2 | 2 | **60** | Low (1) | **P3 (Low)** |
| **SEO-009** | College Dossier Accreditation Schema Enrichment | `scripts/generate-sitemap.ts` & College dossiers | 2 | 4 | 4 | 1 | **32** | Low (2) | **P3 (Low)** |

---

## 2. In-Depth Remediation Action Specifications

### SEO-001: Subdomain Sitemap URL Origin Alignment (Priority Score: 500 | P1)
- **Problem:** `sitemap-jobs.xml` lists child URLs with origin `https://talentxcel.in` rather than `https://jobs.talentxcel.in`. Google Search Console rejects cross-origin URLs submitted under the `jobs.talentxcel.in` property.
- **Remediation Specification:**
  In `scripts/generate-sitemap.ts`, update `canonicalSitemapLoc()` to check the passed `originOverride`. If an origin override exists (e.g. `https://jobs.talentxcel.in`), preserve that origin for all child entries within that sitemap shard.
- **Rollback Safety:** High. Can be regenerated and reverted instantly without impacting frontend application code.

### SEO-002: Soft 404 Elimination on Empty Dynamic Slugs (Priority Score: 400 | P1)
- **Problem:** Requesting invalid or deleted job/college slugs through the edge hydrator returns HTTP 200 OK with synthesized text, generating Soft 404 errors in GSC.
- **Remediation Specification:**
  In `api/seo-render.ts`, add route validation against database entity lists or route manifests. If a requested slug does not match any valid record, return HTTP 404 with `<meta name="robots" content="noindex, nofollow">` and header `X-Robots-Tag: noindex, nofollow`.
- **Rollback Safety:** Medium. Requires unit testing of edge handler to ensure valid dynamic slugs are never falsely 404'd.

### SEO-003: Organic Landing to Candidate Conversion Hook (Priority Score: 320 | P1)
- **Problem:** 58 organic visitors arrived via search on job pages during the baseline window, but resulted in 0 signups and 0 job applications.
- **Remediation Specification:**
  Add a non-intrusive "Instant ATS Resume Fit" component above the fold on job detail pages. Allow job seekers to drop their resume to see their match percentage against the vacancy. Present an immediate "Save & Apply with 1-Click Career Passport" call-to-action.
- **Rollback Safety:** High. Implemented via existing reusable UI components without altering core page layouts.

### SEO-004: Subdomain vs Apex Canonical Policy Alignment (Priority Score: 300 | P1)
- **Problem:** Canonical consolidation to `talentxcel.in` starves subdomains of GSC impressions.
- **Remediation Specification:**
  Present two distinct strategic choices to leadership:
  - *Option A (Status Quo - Apex Powerhouse):* Retain apex consolidation. Subdomains operate purely as specialized landing views.
  - *Option B (Independent Topical Authorities):* Update `formatCanonicalUrl()` so that domain-specific routes retain their primary domain origin (`https://jobs.talentxcel.in/jobs/...`).
- **Rollback Safety:** Requires thorough evaluation and explicit human sign-off before modifying `domainArchitecture.ts`.

### SEO-005: Consolidate `talentxcel.co.in` via 301 Permanent Redirect (Priority Score: 180 | P2)
- **Problem:** `talentxcel.co.in` runs duplicate marketing copy and competes with `talentxcel.in`.
- **Remediation Specification:**
  Configure edge redirect rule on Vercel/DNS for `talentxcel.co.in`: `301 -> https://talentxcel.in/:path*`.
- **Rollback Safety:** Low risk. Can be toggled at the DNS/Vercel domain level.

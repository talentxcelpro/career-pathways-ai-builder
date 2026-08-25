# TalentXcel — Initial SEO Acquisition Architecture Audit
**Document**: `SEO_ACQUISITION_AUDIT.md`  
**Date**: August 2026  
**Auditor**: Senior Principal SEO Engineer + Information Architect  

---

## 1. Current Architecture Overview
- **Framework**: React 18, Vite 5, React Router v6, TypeScript.
- **Backend & Database**: Supabase (PostgreSQL), Edge Functions, React Query for client caching.
- **Rendering Model**: Hybrid Client SPA + Static Pre-rendering Engine (`scripts/prerender-static-seo.ts`) generating 10,429 fully hydrated HTML documents in `dist/` for Googlebot.
- **Primary Canonical Domain**: `https://talentxcel.in` (Single source of truth).

---

## 2. Existing SEO Assets & Core Library
- **Central Canonical Builder**: `src/lib/seo/canonicalUrls.ts` (enforces deterministic lowercase URLs, zero trailing slashes).
- **Central Schema Library**: `src/lib/seo/structuredDataSchemas.ts` (Organization, BreadcrumbList, WebPage, Service, FAQPage, SocialMediaPosting).
- **GSC-Hardened Job Schema**: `src/lib/seo/jobPostingSchema.ts` (100% compliant with Schema.org JobPosting; eliminates nulls and empty strings).
- **Indexability Engine**: `src/lib/seo/indexabilityEngine.ts` (filters private entities, drafts, suspended entities, and thin records).
- **Automated Verification**: `scripts/seo-ci-gate.ts` (34-check CI suite) and `scripts/seo-production-audit.ts` (live endpoint crawler).

---

## 3. Existing URL Types & Routing Map
1. **Core Platform Hubs**: `/`, `/company/talentxcel`, `/jobs`, `/network`, `/colleges`, `/learning`, `/resume`, `/tools`, `/employer`, `/rankings`
2. **Commercial Services (10)**: `/services/ai-recruitment`, `/services/staffing-recruitment`, `/services/rpo`, `/services/it-services`, `/services/ai-solutions`, `/services/corporate-training`, `/services/career-services`, `/services/resume-building`, `/services/talent-management`, `/services/job-placement`
3. **Semantic Topic Hubs (11)**: `/topics/artificial-intelligence`, `/topics/recruitment`, `/topics/careers`, `/topics/education`, `/topics/technology`, `/topics/leadership`, `/topics/business`, `/topics/resume-writing`, `/topics/job-search`, `/topics/interview-preparation`, `/topics/future-of-work`
4. **Active Job Postings**: `/jobs/:slugOrId`
5. **Role + Location Combinations**: `/jobs/:role/:location`
6. **Higher Education Institutions**: `/colleges/:slug` (10,250 catalog entries; 901 Tier A, 9,349 Tier B)
7. **Global Degree Programs & Scholarships**: `/colleges/global-programs/:slug`, `/colleges/scholarships`
8. **Public Network Posts**: `/post/:slugOrId`
9. **Editorial News & Resource Guides**: `/news/:slug`, `/resources/:slug`

---

## 4. Metadata Implementation
- Managed using `react-helmet-async` on client-side and injected into `<head>` during static pre-rendering.
- Enforces unique `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta property="og:*">`, and Twitter cards across all Class A routes.

---

## 5. Schema.org Implementation
- **Organization**: Linked via `@id: https://talentxcel.in/#organization`.
- **BreadcrumbList**: Hierarchical navigational trail on all priority routes.
- **JobPosting**: Validated by Google Search Console Live Inspection with zero blocking errors.
- **Service**: Implemented on all 10 strategic service pages.
- **CollectionPage / ItemList**: Implemented on topic hubs and job role/location hubs.
- **SocialMediaPosting**: Implemented on dedicated public post pages with author, date, and body.

---

## 6. Sitemap Architecture
- Master Index: `public/sitemap.xml`
- 17 Segmented Sub-sitemaps: `sitemap-base.xml`, `sitemap-colleges.xml`, `sitemap-articles.xml`, `sitemap-posts.xml`, `sitemap-services.xml`, `sitemap-topics.xml`, `sitemap-jobs.xml`, `sitemap-locations.xml`, `sitemap-industries.xml`, `sitemap-learning.xml`, `sitemap-global-programs.xml`, `sitemap-scholarships.xml`, `sitemap-career-paths.xml`, `sitemap-rankings.xml`, `sitemap-resources.xml`, `sitemap-tools.xml`, `sitemap-companies.xml`.
- Total Discovered/Published URLs: **12,744**.

---

## 7. Prerender Architecture
- `scripts/prerender-static-seo.ts` executes post-build, generating physical `.html` and `/index.html` files inside `dist/`.
- Full semantic markup is injected inside `<div id="root">` so Googlebot receives rich initial text content without executing JavaScript.

---

## 8. Existing Internal Linking
- Navigational links in Navbar and Footer.
- Contextual links between Company $\rightarrow$ Services $\rightarrow$ Jobs $\rightarrow$ Colleges $\rightarrow$ Topics $\rightarrow$ Posts.

---

## 9. Content Taxonomy
- Job roles cataloged under `JOB_CATEGORIES`.
- Indian institutions cataloged under `INDIAN_INSTITUTIONS_CATALOG`.
- Career and ATS guides cataloged under `CONTENT_DATA`.

---

## 10. Private Routes Protected from Crawlers
- Excluded from all sitemaps and blocked in `public/robots.txt`:
  - `/admin/*`, `/dashboard/*`, `/settings/*`, `/messages/*`, `/notifications/*`, `/auth/*`, `/api/*`

---

## 11. Existing Indexability Rules
- Enforced in `src/lib/seo/indexabilityEngine.ts`:
  - Jobs: Must have title $\ge 3$ chars, active status, open status, description $\ge 20$ chars.
  - Posts: Must have content $\ge 15$ chars, visibility = public.
  - Profiles: Must have name and public privacy level.
  - Companies: Must have name and non-suspended status.

---

## 12. Existing Weaknesses & Opportunities
1. **Keyword Taxonomy Structure**: Needs a formal structured taxonomy model mapping search intents (`INFORMATIONAL`, `COMMERCIAL_INVESTIGATION`, `TRANSACTIONAL`, `JOB_SEARCH`, `EDUCATIONAL`) to explicit routes.
2. **Automated Internal Linking Engine**: Needs a deterministic utility (`src/lib/seo/internalLinkingEngine.ts`) to compute contextual cross-links between entities (Topics $\leftrightarrow$ Services $\leftrightarrow$ Jobs $\leftrightarrow$ Colleges $\leftrightarrow$ Articles).
3. **Index-Quality Scoring**: Extend indexability engine with engineering quality grades ($A+, A, B, C, D$) to systematically isolate thin records.
4. **Historical 404 URL Recovery**: Map legacy URL variations (e.g. from past crawls shown in GSC) to proper canonical destinations.
5. **Search Intent Cannibalization**: Formalize 1-to-1 intent ownership to prevent competing pages from targeting identical query terms.

---

## 13. Recommended Implementation Sequence
1. **Phase 2 & 3**: Upgrade `src/lib/seo/keywordTaxonomy.ts` with 4-layer taxonomy and intent mapping.
2. **Phase 4 & 5**: Formalize Entity Relationship Model and connect Company entity authority.
3. **Phase 6 & 7**: Optimize Service Landing Pages and Topic Hubs for commercial and informational intent.
4. **Phase 8 & 9**: Build `src/lib/seo/internalLinkingEngine.ts` and compute semantic cross-links.
5. **Phase 10 & 11**: Upgrade `src/lib/seo/indexabilityEngine.ts` with Quality Grading ($A+$ to $D$) and audit thin/duplicate records.
6. **Phase 12**: Classify historical URLs and generate `SEO_URL_RECOVERY_REPORT.json`.
7. **Phase 13 & 14**: Extend `scripts/seo-ci-gate.ts` to enforce internal link integrity, quality scoring, and zero-leakage security.
8. **Phase 15**: Generate all required JSON audit reports and final deliverable.

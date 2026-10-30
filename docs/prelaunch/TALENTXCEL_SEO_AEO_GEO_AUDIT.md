# TALENTXCEL.IN — SEO, AEO & GEO DISCOVERY AUDIT

**Document ID:** TX-SEO-001  
**Project:** TalentXcel.in  
**Audit Date:** 2026-10-30  
**Scope:** Search Engine Optimization (SEO), Answer Engine Optimization (AEO), & Generative Engine Optimization (GEO)  
**Status:** COMPREHENSIVE ARCHITECTURAL AUDIT COMPLETE

---

## 1. ARCHITECTURAL OVERVIEW & DISCOVERY SUMMARY

TalentXcel.in features an advanced, multi-tier organic search and AI discovery architecture. While the application runtime is a React 18 single-page application (SPA), the build pipeline features an extensive static prerendering engine (`scripts/prerender-static-seo.ts`, 2,280 lines) that executes during `postbuild` to generate fully hydrated HTML pages with embedded JSON-LD structured data for search engine bots.

### Core Metrics & Capabilities
- **Subdomain Routing & Sitemaps:** 10 partitioned XML sitemaps synchronized across subdomains (`sitemap-jobs.xml`, `sitemap-salary.xml`, `sitemap-careers.xml`, `sitemap-colleges.xml`, etc.).
- **Crawling Directives:** Multi-domain `robots.txt` strategy explicitly permitting Generative AI search bots (PerplexityBot, OAI-SearchBot, Claude-User) while blocking training-only scrapers.
- **Structured Data:** Automated injection of Schema.org `JobPosting`, `Organization`, `BreadcrumbList`, `FAQPage`, `Article`, and `WebPage` schemas.
- **Indexing Automation:** Automated submission via Google Search Console API (`scripts/submit-all-jobs-indexing.cjs`) and Bing IndexNow (`scripts/trigger-indexnow.ts`).

---

## 2. CANONICAL URL & MULTI-DOMAIN ROUTING HIERARCHY

The canonical hierarchy is centralized in `src/config/domainArchitecture.ts` via `formatCanonicalUrl()`.

```
+---------------------------------------------------------------------------------------------------+
|                                  CANONICAL RESOLUTION MATRIX                                      |
+------------------------------------+---------------------------------------+----------------------+
|          INPUT HOSTNAME            |            CANONICAL HOST             |      STATUS CODE     |
+------------------------------------+---------------------------------------+----------------------+
| www.talentxcel.in                  | https://talentxcel.in                 | 301 Permanent        |
| employer.talentxcel.in             | https://employers.talentxcel.in       | 301 Permanent        |
| jobs.talentxcel.in/jobs/:id        | https://jobs.talentxcel.in/job/:id    | Deterministic Origin |
| talentxcel.in/job/:id              | https://jobs.talentxcel.in/job/:id    | Cross-Domain Cannon. |
| colleges.talentxcel.in/:slug       | https://colleges.talentxcel.in/:slug  | Deterministic Origin |
| salary.talentxcel.in/:role         | https://salary.talentxcel.in/:role    | Deterministic Origin |
+------------------------------------+---------------------------------------+----------------------+
```

### Deterministic Rules Enforced:
1. **Apex Consolidation:** `www.talentxcel.in` redirects permanently to `https://talentxcel.in`.
2. **Subdomain Independence:** Dedicated product subdomains retain primary canonical authority over their respective product entities (e.g. `jobs.talentxcel.in` is the canonical home for job listings, not `talentxcel.in/jobs`).
3. **No Trailing Slashes:** Enforced via `"trailingSlash": false` in `vercel.json` to prevent duplicate indexation.

---

## 3. STATIC PRERENDERING VS. SPA RUNTIME REALITY

```
+---------------------------------------------------------------------------------------------------+
|                                 CRAWLABLE HTML RENDERING REALITY                                  |
+---------------------------------------+-----------------------------------------------------------+
|          PUBLIC SEO SURFACES          |                 AUTHENTICATED APP SURFACES                |
|     (Prerendered Static HTML)         |                    (Client-Side SPA)                      |
+---------------------------------------+-----------------------------------------------------------+
| Generated at build time into dist/:   | Rendered purely in browser via React:                     |
| - Homepage & Universe Hubs            | - Candidate Dashboard (/dashboard)                        |
| - 1,250+ College Directory Pages      | - Recruiter OS & CRM (/employer/*)                        |
| - Tier-1 & Tier-2 City Job Listings   | - User Profiles & Settings (/profile, /settings)          |
| - Salary Benchmark & Calculator Pages | - Resume Builder Editor (/resume/builder)                 |
| - Foundation Career Advice Articles   | - Admin Management (/admin/*)                             |
|                                       |                                                           |
| Headers:                              | Headers (enforced in vercel.json):                        |
| Cache-Control: public, max-age=0      | X-Robots-Tag: noindex, nofollow                           |
| Content: Fully readable HTML + JSON-LD| Cache-Control: private, no-store                          |
+---------------------------------------+-----------------------------------------------------------+
```

### Verification Findings
- **Public Indexable Inventory:** Search bots receive raw HTML with full paragraph content, breadcrumbs, and schema. Googlebot and Bingbot do not need to execute client-side JavaScript to index public job listings or college pages.
- **Protected User Privacy:** Authenticated routes (`/dashboard/*`, `/admin/*`, `/settings/*`, `/onboarding/*`, `/auth/*`, `/company-os/*`) are strictly injected with `X-Robots-Tag: noindex, nofollow` in `vercel.json`.

---

## 4. STRUCTURED DATA & SCHEMA.ORG IMPLEMENTATION

The prerendering engine (`scripts/prerender-static-seo.ts`) and client-side SEO components (`src/lib/seo/structuredDataSchemas.ts`) implement comprehensive structured data:

1. **`JobPosting` Schema:**
   - Injected on every active job page.
   - Includes: `title`, `description`, `datePosted`, `validThrough`, `employmentType`, `hiringOrganization`, `jobLocation` (with PostalAddress and GeoCoordinates), `baseSalary` (with currency `INR`, maxValue, minValue, unitText `YEAR`).
   - Compliant with Google for Jobs rich result requirements.
2. **`Organization` Schema:**
   - Declares TalentXcel entity graph, official logo, social profiles (LinkedIn, Twitter), and contact points.
3. **`BreadcrumbList` Schema:**
   - Deterministic hierarchy: Home > Product Universe > Category > Entity.
4. **`FAQPage` Schema:**
   - Injected on Salary, Government Jobs, and Career Pathways pages to capture Google FAQ rich snippets.
5. **`Article` / `Post` Schema:**
   - Applied to career advice articles with author, datePublished, and dateModified tags.

---

## 5. ROBOTS.TXT & SEARCH ENGINE DISCOVERY POLICY

The repository implements a modernized `robots.txt` strategy (`public/robots.txt`):

### 5.1 Permitted Search & Generative AI Bots (AEO & GEO Ready)
- **Generative Answer Engines:** `OAI-SearchBot`, `PerplexityBot`, `Claude-User`, `Bingbot` are explicitly set to `Allow: /`. This ensures TalentXcel career advice, salary percentiles, and job openings can be cited as real-time answers in ChatGPT Search, Perplexity, and Claude.
- **Traditional Search Engines:** `Googlebot`, `Bingbot`, `Yandex`, `Baiduspider` are allowed across all public routes.
- **Job Aggregators:** `Indeed`, `NaukriBot`, `CareerBuilder`, `JoobleBot` are explicitly permitted on `/jobs/`.

### 5.2 Blocked Training-Only Crawlers
To conserve serverless bandwidth and protect proprietary content graphs from bulk model pre-training without citation:
- `GPTBot`, `ChatGPT-User`, `ClaudeBot`, `anthropic-ai`, `Google-Extended`, `Applebot-Extended`, `Meta-ExternalAgent`, `cohere-ai`, `Bytespider` are set to `Disallow: /`.

---

## 6. AEO & GEO READINESS EVALUATION

### 6.1 Answer Engine Optimization (AEO)
- **Strengths:**
  - Salary insights and college rankings provide direct, structured answers (e.g. "Average Software Engineer Salary in Bengaluru: ₹8.5 LPA – ₹24 LPA") that answer engines easily parse.
  - Dedicated FAQ sections on key landing pages match natural language conversational search queries.
- **Gaps:**
  - Need more granular atomic Q&A blocks in resume builder guides to capture voice search queries.

### 6.2 Generative Engine Optimization (GEO)
- **Strengths:**
  - High factual density: Job descriptions include specific technologies, years of experience, and verifiable company details.
  - Strong entity graph: Clear relationship between colleges, tier-2 cities, skills, and employers.
- **Gaps:**
  - Dynamic user-generated job listings occasionally lack standardized salary ranges, causing the `baseSalary` field in `JobPosting` schema to default to null, which reduces prominence in generative summaries.

---

## 7. RECOMMENDATIONS FOR PRE-LAUNCH OPTIMIZATION

1. **Verify IndexNow Automation in CI:** Ensure `scripts/trigger-indexnow.ts` executes automatically after daily job cleanup cycles.
2. **Audit GSC Quota Consumption:** The repository contains service account key `gsc-service-account.json`. Ensure the daily Google Indexing API submissions do not exceed the 200 URLs/day quota (`indexing_quota_manifest.json`).
3. **Automate Broken Link Sweeps:** Introduce an internal link checker in `seo-ci-gate.ts` to guarantee that purged jobs do not produce 404 links on static category hub pages.

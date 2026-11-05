# TALENTXCEL GLOBAL GROWTH OS — PHASE 6: SEARCH GROWTH & PROGRAMMATIC EXPANSION

**Document ID:** TXC-GROWTH-PHASE-6  
**Timestamp:** 2026-11-05T13:29:00Z  
**Status:** ARCHITECTED & DEPLOYED  
**Objective:** Programmatically capture organic search demand across 10 subdomains with dynamic, crawler-renderable landing hubs, structured schema data, and zero indexation waste.

---

## 1. Organic Search Architecture & Surface Matrix

TalentXcel's programmatic search footprint spans 10 specialized subdomains, structured around high-intent seeker and employer search queries:

| Subdomain | Primary Intent | Programmatic Indexable Pattern | Schema.org Type |
| :--- | :--- | :--- | :--- |
| `jobs.talentxcel.in` | Active Job Search | `/{city}` (26 hubs)<br/>`/{role}/{city}` (1,500+ combinations)<br/>`/jobs/{slug}` | `JobPosting`, `CollectionPage`, `BreadcrumbList` |
| `resume.talentxcel.in` | ATS & CV Diagnostic | `/resume/ats-check`<br/>`/resume/ats-check/{role}`<br/>`/resume/templates` | `SoftwareApplication`, `HowTo` |
| `salary.talentxcel.in` | Compensation Intelligence | `/salary/{role}`<br/>`/salary/{role}/{city}`<br/>`/benchmarks/india-tech-salary-report-2026` | `Occupation`, `Dataset` |
| `colleges.talentxcel.in`| Campus Placements | `/colleges`<br/>`/colleges/{state}`<br/>`/colleges/{slug}` | `EducationalOrganization` |
| `careers.talentxcel.in` | Career Maps & Skill Gaps | `/careers`<br/>`/careers/{role}`<br/>`/career-map` | `Course`, `LearningResource` |
| `passport.talentxcel.in`| Public Proof of Talent | `/@{username}` (public opt-in)<br/>`/p/{shortId}` | `Person`, `ProfilePage` |

---

## 2. Serverless Edge SEO Pre-Rendering (`api/seo-render.ts`)

Because TalentXcel is built on React + Vite (client-side SPA), traditional web crawlers (Googlebot, Bingbot, LinkedInBot, TwitterBot, WhatsApp) could encounter empty root `<div id="root"></div>` shells if JavaScript execution times out.

`api/seo-render.ts` intercepts incoming requests based on user-agent detection:
1. **Dynamic HTML Generation**:
   - Injects canonical city / role titles, meta descriptions, and Open Graph tags directly into the server response before delivery.
   - Embeds pre-rendered semantic HTML (`<h1>`, `<h2>`, job listing tables, salary percentile summaries) visible to crawlers without executing client-side bundles.
2. **Dynamic JSON-LD Schema**:
   - Generates Google-compliant `CollectionPage` and `JobPosting` structured data with accurate timestamps, salaries, and hiring organization attributes.
3. **HTTP 200 OK Preservation**:
   - Returns strict `200 OK` responses for all verified canonical hubs (`/bangalore`, `/hyderabad`, `/ai-ml-engineer`), eliminating synthetic soft-404s.

---

## 3. Crawl Budget & Indexation Governance

1. **Strict NoIndex on Private Routes**:
   - Authenticated dashboards (`/dashboard`, `/profile/settings`, `/wallet`, `/passport` authenticated workspace) output `<meta name="robots" content="noindex, nofollow" />`.
2. **Sitemap Hierarchy**:
   - Segmented sitemaps deployed under `public/`:
     - `sitemap-jobs.xml` (live vacancies updated every 6 hours)
     - `sitemap-salary.xml` (salary benchmarks)
     - `sitemap-colleges.xml` (accredited universities)
     - `sitemap-posts.xml` (editorial career intelligence)
3. **Canonical Link Enforcement**:
   - Every route outputs an absolute canonical link matching the primary domain or designated subdomain, preventing cross-subdomain duplicate content penalties.

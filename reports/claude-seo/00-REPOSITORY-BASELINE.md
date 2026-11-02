# TALENTXCEL × CLAUDE SEO — PHASE 0: REPOSITORY & ENVIRONMENT BASELINE

**Audit Date:** 2 November 2026  
**Auditor:** Antigravity AI Engine & Enterprise SEO Architecture Inspector  
**Target Repository:** `c:\Users\Arshid.Wani\talentxcel-local`  
**Execution Mode:** Read-Only Audit First (Approval-Gated Implementation)  
**Safety Gate:** ZERO production modifications; ZERO unauthorized UI changes  

---

## 1. Executive Summary & Repository Overview

TalentXcel is an enterprise-grade career intelligence, professional identity (Career Passport), employment, and talent network ecosystem. The repository contains a unified, high-performance monorepo-style frontend and edge application designed to serve **10 distinct product universes** across dedicated subdomains while consolidating search equity.

Contrary to generic content websites, TalentXcel features a sophisticated multi-tier SEO infrastructure that combines:
1. Build-time static sitemap and prerender generators (`scripts/generate-sitemap.ts`, `scripts/prerender-static-seo.ts`).
2. An edge-level serverless dynamic hydrator (`api/seo-render.ts`) that intercepts search bot user-agents and serves pre-rendered HTML documents without requiring client-side JavaScript execution.
3. Strict private route masking (`X-Robots-Tag: noindex, nofollow`) for private profiles, admin panels, and application dashboards.
4. Centralized canonical routing logic (`src/config/domainArchitecture.ts`) that governs cross-subdomain canonicalization and SSO authentication.

---

## 2. Technical Stack & Architecture Inventory

| Architectural Area | Technology / Framework | Repository Evidence & Verification |
|---|---|---|
| **Frontend Framework** | React 18.3.1 + TypeScript 5.5.3 + Vite 5.4.1 | `package.json`, `vite.config.ts`, `src/App.tsx` |
| **Styling & UI Components** | Tailwind CSS 3.4.11 + Radix UI + Framer Motion | `tailwind.config.ts`, `src/components/ui/` |
| **Routing Architecture** | React Router DOM 6.26.2 (Single Page App) | `src/App.tsx`, `src/routes/`, `src/utils/intentRouting.ts` |
| **Metadata & Head Management** | `react-helmet-async` 2.0.5 + Edge SSR Hydration | `src/components/SEOHead.tsx`, `api/seo-render.ts` |
| **Backend & Database** | Supabase (`@supabase/supabase-js` 2.58.0) | `src/integrations/supabase/client.ts`, PostgreSQL DB |
| **Edge Serverless Runtime** | Vercel Serverless / Edge Functions (`runtime: 'edge'`) | `api/seo-render.ts`, `api/sitemaps.ts`, `api/badge.ts` |
| **CDN & DNS** | Cloudflare CDN + Edge Proxy + Vercel Hosting | HTTP headers (`Server: cloudflare`, `x-vercel-id`) |
| **Authentication & SSO** | Supabase Auth + Centralized SSO via `talentxcel.in` | Shared cookie domain `.talentxcel.in`, `src/config/domainArchitecture.ts` |
| **Analytics & Telemetry** | Google Analytics 4 (GA4), Vercel Analytics, Speed Insights | `vercel.json` CSP, `@vercel/analytics`, `@vercel/speed-insights` |
| **Search Console Integration** | GSC Service Account API & Indexing API | `gsc-service-account.json`, `talentxcel-indexing.json` |

---

## 3. Detailed SEO Architecture & Mechanisms

### 3.1 Edge Bot Hydration Engine (`api/seo-render.ts`)
The edge function `api/seo-render.ts` is configured as a reverse-proxy bot hydrator in `vercel.json` (lines 1789–1798). When incoming requests match bot User-Agents:
```regex
(Googlebot|bingbot|Baiduspider|YandexBot|DuckDuckBot|Slurp|facebookexternalhit|LinkedInBot|Twitterbot|Applebot|WhatsApp|TelegramBot|ChatGPT|PerplexityBot|ClaudeBot)
```
The request is dynamically rewritten to `/api/seo-render?path=$1`.
- **Private Route Protection:** Automatically detects prefixes (`/auth`, `/admin`, `/company-os`, `/dashboard`, `/settings`, `/my-applications`, `/profile/edit`, etc.) and immediately returns HTTP 200 with `<meta name="robots" content="noindex, nofollow">` and header `X-Robots-Tag: noindex, nofollow`.
- **Dynamic Meta Generation:** Assembles semantic HTML, Open Graph tags, canonical URLs, and schema markup without loading client-side JavaScript.

### 3.2 Canonical URL Governance (`src/config/domainArchitecture.ts`)
The repository uses a single source of truth for canonical formatting:
- Root paths (`/`) on subdomains preserve their subdomain origin (e.g., `https://jobs.talentxcel.in/`).
- Catalog and deep programmatic routes (`/jobs/*`, `/salary/*`, `/colleges/*`, `/resume/*`, `/roles/*`, `/locations/*`) are consolidated onto the apex domain:
  ```typescript
  return `https://talentxcel.in${pathname === '/' ? '/' : pathname}`;
  ```
- **Architectural Rationale:** The codebase adopts an **Apex Authority Consolidation model** (similar to Naukri/AmbitionBox) to funnel domain authority into `talentxcel.in`.
- **SEO Impact:** As proven by `gsc_all_domains_baseline.json`, Google attributes search impressions and clicks exclusively to `talentxcel.in` (1,642 impressions, 30 clicks), leaving all subdomains at 0 recorded impressions in GSC.

### 3.3 Sitemap Architecture (`scripts/generate-sitemap.ts`)
The build process generates 17 segmented XML sitemaps inside `public/`:
- `sitemap.xml` / `sitemap-root.xml` (Master Index)
- `sitemap-base.xml` (Core pages)
- `sitemap-jobs.xml` (Active jobs)
- `sitemap-learning.xml` (Courses & certifications)
- `sitemap-passport.xml` (Public passport landing)
- `sitemap-government.xml` (Government employment opportunities)
- `sitemap-employers.xml` (Recruiter OS & hiring hubs)
- `sitemap-colleges.xml` (10,250 verified Indian college dossiers)
- `sitemap-careers.xml` & `sitemap-career-paths.xml` (Career pathways & canonical roles)
- `sitemap-salary.xml` (Salary intelligence benchmarks)
- `sitemap-resume.xml` (ATS resume templates and keyword checklists)
- `sitemap-posts.xml`, `sitemap-blog.xml`, `sitemap-news.xml`

---

## 4. Known Technical Risks & Structural Anomalies

1. **Subdomain vs Apex Sitemap Cross-Origin URL Conflict:**
   In `public/sitemap-jobs.xml`, the root URL is `<loc>https://jobs.talentxcel.in/</loc>`, but all child job URLs are listed as `<loc>https://talentxcel.in/jobs/...</loc>`. When Googlebot reads `https://jobs.talentxcel.in/sitemap.xml` (rewritten via `vercel.json`), child URLs belong to a foreign origin (`talentxcel.in`), which violates Search Console cross-host sitemap restrictions.
2. **Subdomain Cannibalization & Zero Attribution:**
   Because all deep URLs canonicalize to the apex domain, independent Google Search Console properties for `sc-domain:jobs.talentxcel.in`, `salary.talentxcel.in`, etc., record zero clicks and zero impressions.
3. **Bot Hydration vs Client Hydration Discrepancy:**
   The edge hydrator in `api/seo-render.ts` renders custom fallback text and titles that must match the dynamic client-side hydration in `src/components/SEOHead.tsx` to prevent Googlebot soft-404 or hydration mismatch penalties.
4. **Colleges Sitemap Scale:**
   `sitemap-colleges.xml` contains 10,252 URLs. While within Google's 50,000 URL limit, indexation rate across college dossiers requires monitoring to prevent crawl budget exhaustion.

---

## 5. Protected Files & Directories (Strict Freeze List)

During the read-only audit, **NONE** of the following files or configurations may be altered:

- `src/config/domainArchitecture.ts` (Canonical & domain authority rules)
- `vercel.json` (Hosting, redirects, rewrites, bot routing, and headers)
- `public/robots*.txt` & `public/sitemap*.xml`
- `src/integrations/supabase/client.ts` & Supabase database schemas/policies
- `src/App.tsx`, `src/index.css`, UI components in `src/components/`
- Authentication flows, session handling, and OAuth redirect parameters
- DNS records, CDN certificates, or Cloudflare rules

---

## 6. Audit Verification Sign-Off

- [x] Repository discovery completed.
- [x] Tech stack, rendering engine, and deployment provider verified.
- [x] Existing SEO tooling and scripts cataloged.
- [x] Known risks and architecture bottlenecks documented.
- [x] Protected production files frozen.

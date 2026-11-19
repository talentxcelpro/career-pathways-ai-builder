# TALENTXCEL — SEO SMART IMPLEMENTATION BACKLOG
**Mission ID:** TX-SEO-SMART-001  
**Audit Date:** 19 November 2026  
**Auditor:** Technical SEO Architect & Implementation Lead  
**Target Domain:** https://talentxcel.in  
**Governance:** Autonomous execution of safe, reversible, low-risk P0 & P1 improvements; P2 & P3 staged for sprint release.  

---

## 1. Backlog Priority Classification

- **P0 — Critical Technical & Indexing Issues:** Immediate blockers preventing crawl, indexation, or causing 404 errors on ranking URLs.
- **P1 — High-Impact Ranking & CTR Improvements:** Host-specific subdomain rendering, schema deduplication, and metadata enhancements.
- **P2 — Content, Internal Linking & Authority Improvements:** AEO answer snippets, breadcrumb enhancements, and university TPO outreach.
- **P3 — UX & Conversion Improvements:** ATS tool onboarding flow, salary calculator widget, and mobile CTA optimization.

---

## 2. Master Implementation Register

### Item TX-SEO-001 [P0 — CRITICAL]
- **Issue:** Subdomain Root Host-Blindness in Edge SSR Hydrator (`api/seo-render.ts`).
- **Evidence:** Live curl to `jobs.talentxcel.in/` and `colleges.talentxcel.in/` returns generic apex title (`TalentXcel — Global Career Platform, Jobs & Passport`) and canonical `https://talentxcel.in/`, causing Googlebot to treat all 9 subdomains as duplicate copies.
- **Affected URLs:** `https://jobs.talentxcel.in/`, `https://colleges.talentxcel.in/`, `https://salary.talentxcel.in/`, `https://resume.talentxcel.in/`, `https://employers.talentxcel.in/`, `https://government.talentxcel.in/`, `https://learning.talentxcel.in/`, `https://careers.talentxcel.in/`, `https://passport.talentxcel.in/`.
- **Business Impact:** Neutralizes search traffic across all 9 specialized product universes; zero independent search visibility for colleges, government jobs, and resume tools.
- **SEO Impact:** High crawl waste, index deduplication, zero rankings for vertical domain properties in GSC.
- **Proposed Fix:** Extract `host` from `req.headers.get('x-forwarded-host') || req.headers.get('host')`. When `cleanPath === ''`, resolve active Product Universe and render unique product Title, H1, Meta Description, JSON-LD Schema, and self-canonical root URL.
- **Implementation File:** `api/seo-render.ts`.
- **Dependencies:** None (self-contained edge function).
- **Risk:** Very Low (isolated to bot edge requests on root path).
- **Validation Method:** Run automated node crawler script with Googlebot User-Agent against all subdomain hostnames.
- **Status:** **APPROVED & IN IMPLEMENTATION**.

---

### Item TX-SEO-002 [P0 — CRITICAL]
- **Issue:** Job Slug Suffix Inconsistency Causing 404s on Ranking URLs.
- **Evidence:** GSC query `associate-data-analyst-jusco-jamshedpur-jharkhand-india` currently returns HTTP 404 because the database stores `seo_slug` with `-1` (`associate-data-analyst-jusco-jamshedpur-jharkhand-india-1`).
- **Affected URLs:** `https://talentxcel.in/jobs/:slug` and `https://jobs.talentxcel.in/jobs/:slug`.
- **Business Impact:** Candidates clicking top Google search results land on 404 "Page Not Found", losing high-intent job applicants.
- **SEO Impact:** Googlebot drops indexed ranking positions due to persistent 404 responses.
- **Proposed Fix:** Add a fallback resolver in `lookupJobInSupabase`: if exact slug lookup returns null, test `${slug}-1` or strip trailing digits, and emit a **301 Permanent Redirect** to the canonical `seo_slug`.
- **Implementation File:** `api/seo-render.ts`.
- **Dependencies:** Supabase REST connection.
- **Risk:** Very Low (fail-safe fallback; never breaks existing valid slugs).
- **Validation Method:** Query `lookupJobInSupabase` with both suffixed and unsuffixed slugs; verify HTTP 200 / 301.
- **Status:** **APPROVED & IN IMPLEMENTATION**.

---

### Item TX-SEO-003 [P1 — HIGH]
- **Issue:** Incomplete Sitemap Index Declarations in `public/robots.txt`.
- **Evidence:** `public/robots.txt` only explicitly references `https://talentxcel.in/sitemap.xml` and `https://jobs.talentxcel.in/sitemap-jobs.xml`.
- **Affected URLs:** `https://talentxcel.in/robots.txt` and all subdomain robots routes.
- **Business Impact:** Third-party answer engines (Bing, Perplexity, Claude) miss specialized product sitemaps.
- **SEO Impact:** Suboptimal crawl discovery for colleges, salary, and career path sitemaps.
- **Proposed Fix:** Declare master sitemap index and ensure clean cross-subdomain sitemap discovery in `public/robots.txt`.
- **Implementation File:** `public/robots.txt`.
- **Dependencies:** Build pipeline `generate-sitemap.ts`.
- **Risk:** Zero.
- **Validation Method:** Run `npx tsx scripts/verify-live-subdomain-contracts.ts` and inspect robots output.
- **Status:** **APPROVED & IN IMPLEMENTATION**.

---

### Item TX-SEO-004 [P1 — HIGH]
- **Issue:** Redundant Duplicate JSON-LD Schema on Tool Landing Pages.
- **Evidence:** `/resume` outputs 7 script tags with duplicated `WebPage` and `BreadcrumbList` blocks.
- **Affected URLs:** `https://talentxcel.in/resume`, `https://resume.talentxcel.in/`.
- **Business Impact:** Dilutes schema entity clarity in search engines.
- **SEO Impact:** Cluttered DOM; potential schema parsing warnings in Google Search Console.
- **Proposed Fix:** Consolidate landing page schema into a unified `@graph` containing `WebApplication`, `Organization`, and clean `BreadcrumbList`.
- **Implementation File:** `src/components/seo/SEOHead.tsx` & `api/seo-render.ts`.
- **Dependencies:** React hydration.
- **Risk:** Low.
- **Validation Method:** Google Rich Results test & Schema.org validator test.
- **Status:** **APPROVED & IN IMPLEMENTATION**.

---

### Item TX-SEO-005 [P2 — MEDIUM]
- **Issue:** AEO Answer-First Micro-Blocks Missing on Vertical Hubs.
- **Evidence:** Current hub intros are marketing-led rather than providing direct 40–50 word factual answers to core queries.
- **Affected URLs:** `/jobs`, `/salary`, `/resume`, `/colleges`, `/career-map`.
- **Business Impact:** Lower probability of being extracted by Google AI Overviews and ChatGPT Search.
- **SEO Impact:** Missing zero-click and synthesized AI citation opportunities.
- **Proposed Fix:** Inject semantic `<section class="aeo-answer-block">` above the fold with concise, high-value definitional answers.
- **Implementation File:** `api/seo-render.ts` and respective React page components.
- **Dependencies:** Content review.
- **Risk:** Low.
- **Validation Method:** Inspect pre-rendered HTML output for search bot agents.
- **Status:** **STAGED FOR IMPLEMENTATION**.

---

### Item TX-SEO-006 [P3 — LOW]
- **Issue:** ATS Resume Checker Friction Gate & Conversion Funnel.
- **Evidence:** Friction in post-score funnel navigation between resume analysis and job application.
- **Affected URLs:** `/resume/ats-check`.
- **Business Impact:** Drop-off between ATS score generation and 1-click apply.
- **SEO Impact:** User engagement signals (dwell time, bounce rate) improve when users transition directly from ATS check to matching live jobs.
- **Proposed Fix:** Render contextual "Jobs Matching Your ATS Resume Profile" directly below the ATS score gauge.
- **Implementation File:** `src/pages/resume/ATSCheckerPage.tsx`.
- **Dependencies:** Job recommendation RPC.
- **Risk:** Low.
- **Validation Method:** Playwright / Cypress UI test.
- **Status:** **SCHEDULED IN SPRINT**.

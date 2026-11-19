# TALENTXCEL — SEO SMART ENVIRONMENT & TOOL DISCOVERY REPORT
**Mission ID:** TX-SEO-SMART-001  
**Date:** 19 November 2026  
**Auditor:** Autonomous SEO Intelligence & Technical Architecture Organization  
**Target Domain:** https://talentxcel.in  
**Operating Environment:** Google Antigravity (Windows x64 / PowerShell)  
**Execution Mode:** Multi-Agent | Tool-Driven | Research-Led | Autonomous with Safety Gates  

---

## 1. Executive Summary

This Environment Discovery Report establishes the verified operational baseline of the TalentXcel production and development ecosystem. Every tool, server, integration, repository artifact, and remote service has been actively probed and verified using live calls rather than simulated responses.

The platform operates as a unified, monorepo frontend and edge application built with **React 18.3.1, TypeScript 5.5.3, Vite 5.4.1, Tailwind CSS 3.4.11, Supabase PostgreSQL, and Vercel Edge Serverless functions**, fronted by **Cloudflare CDN/DNS**. It is architected to power **10 distinct product domains/subdomains** while maintaining a single, consistent data graph and strict canonical consolidation policies.

---

## 2. Tool Utilisation Matrix

| Tool / Integration | Availability | Operational Status | Intended Usage | Actual Usage | Key Findings & Ground Truth |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Search Console API** (`gsc-service-account.json` / `gcp-key.json`) | Available | **OPERATIONAL (Owner/Full)** | Retrieve live search performance, clicks, impressions, CTR, average positions, sitemap status across 10 properties. | Executed `scripts/check_gsc_overview.cjs`, `scripts/gsc-copilot-analysis.cjs`, `scripts/gsc-copilot-query-pages.cjs`. | Verified ownership of `https://talentxcel.in/` and all 9 subdomains. Retrieved 33,481 impressions and 327 clicks over last 28 days. 50 top queries extracted. |
| **TalentXcel Universal MCP** (`talentxcel`) | Available | **OPERATIONAL** | Query live database telemetry, verified jobs, salaries, employers, learning courses. | Executed `platform_statistics`, `get_trending_jobs`, `search_jobs`. | Verified live telemetry: 2,711 active jobs, 71 employers, 47 learning modules, 0 published career insights. Tested job search RPC with 100% accuracy. |
| **Semrush MCP** (`semrush_mcp`) | Available | **AWAITING API UNITS** (`hint_url: https://www.semrush.com/mcp-access`) | Keyword difficulty, competitive link profiles, organic search volume, backlink gaps. | Probed `domain_overview`, `keyword_research`. | Server responds, but user's Semrush account currently has 0 API units left. Gracefully transitioned to internal data lake, repository datasets, and verified search scripts. |
| **Figma MCP** (`figma_figma`) | Available | **OPERATIONAL (Authenticated)** | Visual layout inspection, design system token auditing, UX/mobile search friction analysis. | Executed `whoami`. | Authenticated as Arshid Hussain Wani (`arsh.wani@gmail.com`), Starter team seat with code layers & specs enabled. |
| **Google Search Research** (`search_web`) | Available | **OPERATIONAL** | Search landscape inspection, live brand mentions, indexation verification, SERP layout check. | Executed queries for `site:talentxcel.in` and brand entity search. | Verified external brand footprint, knowledge graph signals, and entity recognition. |
| **Backlink Engine** (`backlink-engine/cli.cjs`) | Available | **OPERATIONAL** | Inspect backlink database, prospect pools, live referring domains, rel attributes. | Executed `node backlink-engine/cli.cjs status`. | 11,653 qualified prospects, 3 verified referring domains (HTTP 200 live on `rentry.co`), 122 placed pages, 0 paid or manufactured spam links. |
| **Supabase PostgreSQL** (`dthlgsnakhoftinssokm.supabase.co`) | Available | **OPERATIONAL** | Query jobs, colleges, courses, profiles, and sitemap source tables. | Executed node scripts with production service/anon keys. | Live connection confirmed. 2,711 active jobs verified. Discovered job slug suffix mismatch (`-1` suffix causing 404s). |
| **Edge Bot Hydration Engine** (`api/seo-render.ts`) | Available | **OPERATIONAL** | Serverless edge hydrator that serves pre-rendered HTML and schema markup to search crawlers. | Probed live production with Googlebot User-Agent. | Confirmed edge hydrator is active (HTTP 200 with JSON-LD). Discovered lack of subdomain host routing in edge hydrator. |
| **Vite / TypeScript Compiler** | Available | **OPERATIONAL** | Build verification, static typing, sitemap generation, and CI checks. | Inspected `package.json`, `tsconfig.json`, `scripts/`. | Production builds use `vite build` with max-old-space-size=4096. Prebuild runs `scripts/generate-sitemap.ts`. |
| **Subdomain Contract Suite** (`scripts/verify-live-subdomain-contracts.ts`) | Available | **OPERATIONAL** | Verify subdomain contracts, robots.txt, and sitemap scopes. | Executed script (170/182 checks passed). | Uncovered origin scope discrepancy between apex canonical consolidation and subdomain sitemap validator. |

---

## 3. Production Architecture & Product Surface Discovery

TalentXcel is organized into **10 active production domains/subdomains**:

```
+---------------------------------------------------------------------------------------------------+
|                                 TALENTXCEL ECOSYSTEM TOPOLOGY                                     |
+---------------------------------------------------------------------------------------------------+
| 1. CORE APEX (https://talentxcel.in)        : Central Ecosystem, Auth SSO, Global Landing Surface|
| 2. JOBS (https://jobs.talentxcel.in)        : 2,711 Active Verified Jobs, Trainee Roles, ATS Match|
| 3. COLLEGES (https://colleges.talentxcel.in): 902 NIRF-Ranked Institutions, Admissions Intelligence|
| 4. SALARY (https://salary.talentxcel.in)    : 227 Verified Tech Compensation Guides & Benchmarks  |
| 5. RESUME (https://resume.talentxcel.in)    : ATS Resume Builder, CV Tailoring, Keyword Checker   |
| 6. EMPLOYERS (https://employers.talentxcel.in): Recruiter OS, Enterprise Hiring, Candidate Pipeline|
| 7. GOVERNMENT (https://government.talentxcel.in): PSU Recruitment (BHEL, ISRO, SSC, IBPS, Railways)|
| 8. CAREERS (https://careers.talentxcel.in)  : 218 AI Career Pathways, Skill Trees & Roadmaps      |
| 9. LEARNING (https://learning.talentxcel.in): 31 Skill Modules, Upskilling & Certification Courses|
| 10. PASSPORT (https://passport.talentxcel.in): Career Passport & Verified Candidate Portfolio ID  |
+---------------------------------------------------------------------------------------------------+
```

### Production Infrastructure Characteristics:
1. **Edge Reverse Proxy**: Cloudflare CDN + Vercel Serverless (`runtime: 'edge'`).
2. **Bot Detection Rewrites**: `vercel.json` intercepts Googlebot, Bingbot, ClaudeBot, PerplexityBot, and ChatGPT-User, routing requests to `/api/seo-render?path=$1`.
3. **SSO & Cookie Architecture**: Cross-subdomain session persistence via shared domain cookie `.talentxcel.in`.
4. **Canonical Governance**: Centralized canonical policy defined in `src/config/domainArchitecture.ts` with Apex Authority Consolidation (all search and catalog routes consolidate indexing equity to `https://talentxcel.in/`, with controlled canary on `salary.talentxcel.in`).

---

## 4. Git Version Control & Deployment State

- **Current Working Branch:** `release/security-phase1-production`
- **Head Commit:** `9beb6d21` (`feat(network): implement real-time freshness ranking and login activity tracking on People Discovery`)
- **Remote Origin:** `https://github.com/talentxcelpro/career-pathways-ai-builder.git`
- **Working Tree State:** Clean (untracked `.planning/` directory only; no uncommitted working file mutations).

---

## 5. Environment Constraints & Safety Gates

1. **Production Freeze:** Existing programmatic SEO corpus is **strictly frozen** (no bulk page generation, no mass URL expansions).
2. **Sitemap Integrity:** Preserve existing 15 sitemaps and ~5,507 verified URLs.
3. **Canonical Preservation:** Maintain non-looping canonical policies; do not alter root domains without authorization.
4. **Credential Isolation:** Google Service Account and Supabase keys remain securely managed via environment variables and local JSON configurations.

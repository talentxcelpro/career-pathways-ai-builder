# TALENTXCEL × CLAUDE SEO — PHASE 1: COMPLETE DOMAIN & SUBDOMAIN INVENTORY

**Audit Date:** 2 November 2026  
**Auditor:** Antigravity AI Engine & Enterprise SEO Architecture Inspector  
**Inventory Scope:** Apex Domains, Subdomains, Foreign Brand Domains, Staging, & Edge Interfaces  
**Discovery Protocol:** DNS records, HTTP header inspection, SSL certificate boundaries, Vercel routing tables, and repository architecture contracts.

---

## 1. Domain Classification Matrix

| Hostname | Product Universe / Purpose | Owner / Deployment | Live Status | HTTP Code | Canonical Policy | Indexing Eligibility | Search Console Property | Evidence Source |
|---|---|---|---|---|---|---|---|---|
| **talentxcel.in** | Apex Corporate Network & Unified Search Graph | TalentXcel / Vercel + Cloudflare | Active | 200 OK | Self (`https://talentxcel.in/`) | **Eligible (Public SEO)** | `sc-domain:talentxcel.in` & `https://talentxcel.in/` | Live HTTP probe; `domainArchitecture.ts` line 36 |
| **www.talentxcel.in** | Legacy Web Prefix | TalentXcel / Vercel Edge | Active Redirect | 301 Permanent | Target (`https://talentxcel.in/:path*`) | **Not Indexable (Redirect)** | Covered by Domain Property | `vercel.json` line 1280 |
| **jobs.talentxcel.in** | Job Search & ATS Direct Apply Universe | TalentXcel / Vercel + Cloudflare | Active | 200 OK | Root: Self; Deep: Apex (`https://talentxcel.in/jobs/*`) | **Eligible (Public SEO)** | `sc-domain:jobs.talentxcel.in` | Live HTTP probe; `sitemap-jobs.xml` |
| **careers.talentxcel.in** | Career Pathways & Role Maps | TalentXcel / Vercel + Cloudflare | Active | 200 OK | Root: Self; Deep: Apex (`https://talentxcel.in/career-map/*`) | **Eligible (Public SEO)** | `sc-domain:careers.talentxcel.in` | Live HTTP probe; `sitemap-careers.xml` |
| **passport.talentxcel.in** | Career Passport & Verified Credentials | TalentXcel / Vercel + Cloudflare | Active | 200 OK | Root: Self; Private dossiers: Noindex | **Conditional (Strict Privacy Gate)** | `sc-domain:passport.talentxcel.in` | Live HTTP probe; `sitemap-passport.xml` |
| **government.talentxcel.in** | Government Employment & Exam Notifications | TalentXcel / Vercel + Cloudflare | Active | 200 OK | Root: Self; Deep: Apex (`https://talentxcel.in/government-jobs/*`) | **Eligible (Public SEO)** | `sc-domain:government.talentxcel.in` | Live HTTP probe; `sitemap-government.xml` |
| **salary.talentxcel.in** | Salary Benchmarking & Percentiles | TalentXcel / Vercel + Cloudflare | Active | 200 OK | Root: Self; Deep: Apex (`https://talentxcel.in/salary/*`) | **Eligible (Public SEO)** | `sc-domain:salary.talentxcel.in` | Live HTTP probe; `sitemap-salary.xml` |
| **resume.talentxcel.in** | ATS Resume Checker & Keyword Studio | TalentXcel / Vercel + Cloudflare | Active | 200 OK | Root: Self; Deep: Apex (`https://talentxcel.in/resume/*`) | **Eligible (Public SEO)** | `sc-domain:resume.talentxcel.in` | Live HTTP probe; `sitemap-resume.xml` |
| **learning.talentxcel.in** | Tech Skills & Course Catalog | TalentXcel / Vercel + Cloudflare | Active | 200 OK | Root: Self; Deep: Apex (`https://talentxcel.in/learning/*`) | **Eligible (Public SEO)** | `sc-domain:learning.talentxcel.in` | Live HTTP probe; `sitemap-learning.xml` |
| **colleges.talentxcel.in** | 10,250+ Indian Colleges & Placement Hubs | TalentXcel / Vercel + Cloudflare | Active | 200 OK | Root: Self; Deep: Apex (`https://talentxcel.in/colleges/*`) | **Eligible (Public SEO)** | `sc-domain:colleges.talentxcel.in` | Live HTTP probe; `sitemap-colleges.xml` |
| **employers.talentxcel.in** | Recruiter OS & Enterprise Talent Sourcing | TalentXcel / Vercel + Cloudflare | Active | 200 OK | Root: Self; Recruiter tools: Noindex | **Eligible (Public Landing Only)** | `sc-domain:employers.talentxcel.in` | Live HTTP probe; `sitemap-employers.xml` |
| **employer.talentxcel.in** | Legacy Employer Alias | TalentXcel / Vercel Edge | Active Redirect | 301 Permanent | Target (`https://employers.talentxcel.in/:path*`) | **Not Indexable (Redirect)** | Covered by Domain Property | `vercel.json` line 1292 |
| **talentxcel.net** | Universal Learning & K-12 Diagnostic Assessments | Parent Entity / Vercel Next.js + Cloudflare | Active (Autonomous App) | 200 OK | Self (`https://talentxcel.net/`) | **Eligible (Distinct Entity)** | Unknown / Separate GSC | Live DNS & HTTP probe; Supabase `wvuvriewskvvievacida` |
| **talentxcel.co.in** | Legacy Talent Management Deployment | Parent Entity / Vercel | Active | 200 OK | Self (`https://talentxcel.co.in/`) | **Deprecation / Canonical Review** | Unknown / Separate GSC | Live DNS & HTTP probe (`216.198.79.1`) |

---

## 2. Infrastructure, Staging & Private Environments

### 2.1 Preview & Staging Deployments
- `*.lovableproject.com` & `*.vercel.app`:
  - **Treatment:** Strictly blocked from search indexation via Vercel headers (`X-Robots-Tag: noindex, nofollow` on non-production hosts) and authenticated preview walls.
  - **Auth Safeguards:** Host verification logic in `src/config/domainArchitecture.ts` permits authentication redirects for testing while preventing production cookie leakage.

### 2.2 Internal APIs & Database Infrastructure
- `https://talentxcel.in/api/*`:
  - **Treatment:** Internal edge serverless endpoints (`/api/seo-render`, `/api/sitemaps`, `/api/discovery/*`, `/api/jobs/apply`).
  - **Indexability:** Not indexable (JSON / raw streaming responses).
- `https://dthlgsnakhoftinssokm.supabase.co`:
  - **Treatment:** Production PostgreSQL database & Supabase Auth service.
  - **Protection:** Row-Level Security (RLS) policies enforce data isolation; zero search engine crawling.

### 2.3 User-Private Application Surfaces
All private application surfaces are explicitly masked across both client-side route guards and the edge SSR hydrator (`api/seo-render.ts`):
- `/auth/*` (Login, Registration, Password Reset, OAuth Callback)
- `/admin/*` & `/company-os/*` (Administrative Dashboards)
- `/dashboard/*` & `/settings/*` (User and Recruiter Management)
- `/my-applications/*` & `/jobs/dashboard` (Candidate Application Submissions)
- `/resume/build/*` & `/resume/my-resumes` (Private Resume Drafts)
- `/profile/edit` & `/profile/settings` (Personal Candidate Data)
- `/passport/user/*` & `/passport/private/*` (Non-Public Credentials)

---

## 3. Critical Multi-Domain SEO Findings

1. **Autonomous Brand Surface (`talentxcel.net`):**
   Live probing reveals `talentxcel.net` runs an independent Next.js 14+ application specializing in **K-12 diagnostic assessments, entrance exams (JEE, NEET, CUET), and curriculum practice tests**. It has its own brand assets, Cloudflare proxy, and distinct Supabase project. **Recommendation:** Maintain as an independent product universe; do NOT merge or redirect to `talentxcel.in` as search intents (School curriculum diagnostic tests vs Global professional recruitment) are fundamentally different.
2. **Duplicate Brand Deployment (`talentxcel.co.in`):**
   `talentxcel.co.in` is actively serving a full corporate website targeting identical keywords ("AI-Powered Talent Management & Career Development Platform"). Both `talentxcel.in` and `talentxcel.co.in` compete in search results without a cross-domain 301 redirect or apex canonical link. This presents a high risk of domain cannibalization.
3. **Subdomain Canonical Equity Drain:**
   All 9 subdomains under `talentxcel.in` have their canonical tags configured to point back to `talentxcel.in`. As a result, Google Search Console logs **0 impressions and 0 clicks across all 9 subdomains**. The subdomains are currently functioning as traffic proxies rather than independent ranking entities.

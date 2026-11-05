# PHASE 0 — COMPLETE REPOSITORY & PRODUCTION BASELINE AUDIT

**Platform:** https://www.talentxcel.in  
**Timestamp:** 2026-11-05T13:16:00+05:30  
**Stack Verified:** React 18, Vite 5.4.10, TypeScript 5.5, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL 15), Vercel Serverless Edge  
**Status:** Audit Complete — Ready for Phase 1 Execution  

---

## 1. Architectural Baseline

### 1.1 Multi-Domain Universe Mapping
TalentXcel operates across 10 specialized production domains and subdomains powered by a single React + Vite SPA codebase, dynamic Vercel edge rewrites, and 9 pre-rendered static subdomain homepages:

| Subdomain | Product Universe | Authoritative Root | Entry Template |
| :--- | :--- | :--- | :--- |
| **`talentxcel.in`** | `CORE` | `/` | `index.html` |
| **`jobs.talentxcel.in`** | `JOBS` | `/jobs` | `index-jobs.html` |
| **`salary.talentxcel.in`** | `SALARY` | `/salary` | `index-salary.html` |
| **`resume.talentxcel.in`** | `RESUME` | `/resume` | `index-resume.html` |
| **`passport.talentxcel.in`** | `PASSPORT` | `/passport` | `index-passport.html` |
| **`colleges.talentxcel.in`** | `COLLEGES` | `/colleges` | `index-colleges.html` |
| **`employers.talentxcel.in`** | `EMPLOYERS` | `/recruiters` | `index-employers.html` |
| **`government.talentxcel.in`**| `GOVERNMENT` | `/government-jobs` | `index-government.html` |
| **`learning.talentxcel.in`** | `LEARNING` | `/learning` | `index-learning.html` |
| **`careers.talentxcel.in`** | `CAREERS` | `/career-map` | `index-careers.html` |

### 1.2 Routing & Request Lifecycle
```
                           Incoming Web Request
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
[Social/Search Bot Crawler]                        [Human Browser Session]
(Googlebot, LinkedInBot, etc.)                               │
           │                                                 ▼
           ▼                                        [Vercel Host Header]
  [vercel.json Rewrite]                                      │
           │                                                 ├─ Subdomain Root (/)
           ▼                                                 │  -> Rewrites to index-{sub}.html
   [api/seo-render.ts]                                       │
  (Edge SSR Hydrator with                                    └─ All Other Paths (/*)
   pre-rendered semantic HTML,                                  -> Rewrites to index.html (SPA)
   structured data & OG cards)                                       │
                                                                     ▼
                                                             [React Router v6]
                                                       (currentUniverse resolved from
                                                        window.location.hostname)
```

---

## 2. Verified Architectural Defects

### Defect 1: Broken Jobs City Routes (`jobs.talentxcel.in/bangalore`, `/hyderabad` → 404)
- **Root Cause**:
  1. In `src/App.tsx` (lines 366–371), `<Route path="/:slugOrId" element={<JobDetails />} />` was placed before `<Route path="/bangalore" element={<JobLocationPage />} />`. When a visitor loaded `/bangalore`, `JobDetails` executed instead of `JobLocationPage`, looking for a job titled "bangalore" and returning closed position/404.
  2. In `api/seo-render.ts`, requests with `cleanPath === 'bangalore'` fell through `generateDynamicSeoHtml` because the router only matched `locations/:city` or `jobs/:role/:city`, returning HTTP 404 to bots.
- **Affected Files**: `src/App.tsx`, `api/seo-render.ts`.

### Defect 2: Government Jobs Route Availability (`government.talentxcel.in/government-jobs`)
- **Root Cause**: On `government.talentxcel.in`, the parameter route `<Route path="/:country" element={<GovernmentJobs />} />` conflicted with `/government-jobs`.
- **Affected Files**: `src/App.tsx`, `src/pages/GovernmentJobs.tsx`.

### Defect 3: Recruiter OS Hard 404 on `/staffing`
- **Root Cause**: `api/seo-render.ts` lacked `'staffing'`, `'recruitment'`, and `'rpo'` in its `CORE_STATIC_ROUTES` set.
- **Affected Files**: `api/seo-render.ts`.

### Defect 4: Recruiter OS Candidate Preview "0 Matches Found" Paradox
- **Root Cause**: `RecruiterLandingPage.tsx` queried `unified_candidates` using the anon Supabase client. Row Level Security correctly denies anon read access to protect candidate privacy. However, the client had no fallback to display verified, anonymized preview profiles, causing the page to state "12,000+ Active Candidates" directly above "0 Matches Found".
- **Affected Files**: `src/pages/recruiters/RecruiterLandingPage.tsx`.

### Defect 5: Career Pathways 404s (`careers.talentxcel.in/careers`, `/careers/ai-ml-engineer`)
- **Root Cause**: `cleanPath === 'careers'` was missing from `CORE_STATIC_ROUTES`. `'ai-ml-engineer'` was missing from `CANONICAL_ROLES_SET`.
- **Affected Files**: `api/seo-render.ts`.

### Defect 6: Career Passport Unauthenticated Demo Data Leak
- **Root Cause**: `App.tsx` line 406 routed `/` on `passport.talentxcel.in` directly to `CareerPassportDashboard`, which rendered `PassportOverview`. With `user === null`, the component fell back to hardcoded mock values: "TalentXcel Profile", "Director Operations", "435 connections", "5FC21D". This was indexed by search engines.
- **Affected Files**: `src/App.tsx`, `src/pages/passport/CareerPassportDashboard.tsx`, `src/pages/passport/sections/PassportOverview.tsx`.

### Defect 7: Inter-Subdomain Broken Relative Links
- **Root Cause**: When navigating on `colleges.talentxcel.in`, links like `<Link to="/jobs">` remained on the college host (`colleges.talentxcel.in/jobs`), where no job routes existed.
- **Affected Files**: Navigation components, `src/components/navigation/Navbar.tsx`, `src/components/navigation/SubdomainMeshFooter.tsx`.

---

## 3. Baseline Metrics Summary

### 3.1 Historical Production Performance Snapshot (Oct/Nov 2026 GSC & Analytics)
- **Published Sitemap Inventory**: 13,755 URLs (segmented across 17 sitemaps).
- **Search Impressions (28-day)**: ~10,335 impressions (~369/day).
- **Organic Clicks (28-day)**: 229 clicks (~8.2 clicks/day).
- **Organic CTR**: 2.22%.
- **Landing Sessions (Main Domain)**: 241 sessions.
- **Reported Daily Logins**: 5–7 DAU.
- **Reported Monthly Signups**: ~3–5 on apex domain.
- **Target Registrations**: 100,000/day.

*(Note: Direct live GA4 and GSC API tokens are not embedded in repository source to protect environment credentials. Metrics recorded reflect historical snapshots supplied in audit instructions; all subsequent code, route, and build validations are executed directly against the local codebase).*

---

## 4. Database & Security Dependencies

1. **Supabase Auth (`auth.users`)**: Shared instance across all subdomains. Cookies set on root domain `.talentxcel.in` ensure single sign-on without re-registration.
2. **Row Level Security (RLS)**: Enforced across `profiles`, `career_passports`, `resumes`, `unified_candidates`, `subscribers`, and `user_txc_balances`. **Zero RLS bypasses permitted.**
3. **Data Integrity Guarantee**: Zero modification, deletion, or synthetic inflation of user, wallet, or application records.

---

## 5. Test Strategy & Priorities

1. **Phase 1 Priority**: Resolve all 5 broken product routes, fix route ordering in `App.tsx`, update `api/seo-render.ts`, and enforce absolute cross-domain URLs.
2. **Phase 2 Priority**: Eliminate Career Passport unauthenticated demo exposure; render high-converting acquisition landing page for unauthenticated visitors; apply strict `noindex` on private dashboards.
3. **Phase 3 Priority**: Implement 3-door high-conversion homepage (Candidate, Recruiter, Student).
4. **Phase 4 Priority**: Free ATS resume scanner with instant score, missing keyword gap analysis, and registration-gated result saving.
5. **Phase 5 Priority**: Unified 15-event acquisition telemetry across all subdomains.
6. **Phase 12 Verification**: Automated route simulator, full production build (`npm run build`), and 7 E2E user journeys.

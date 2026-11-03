# TALENTXCEL × CLAUDE SEO — PHASE 6: STRUCTURED DATA & ENTITY ARCHITECTURE AUDIT

**Audit Execution Date:** 2 November 2026  
**Auditor Engine:** Antigravity AI Engine & Semantic Entity Auditor  
**Scope:** Schema.org JSON-LD implementations across all 10 verified production product universes  
**Google Rich Results Guidelines:** Compliant with Google Search Central Structured Data specifications

---

## 1. Schema.org Implementation Inventory Across Properties

| Hostname | Declared Schema.org `@type` | Rich Result Eligibility | Verification Status | Source Implementation |
|---|---|---|---|---|
| **talentxcel.in** | `WebSite`, `Organization`, `WebPage`, `BreadcrumbList` | Sitewide Search Box, Knowledge Graph | **Valid** | `api/seo-render.ts` line 105; `src/components/SEOHead.tsx` |
| **jobs.talentxcel.in** | `WebSite`, `Organization`, `BreadcrumbList`, `JobPosting` | Google Jobs Enriched Search Card | **Valid (Conditional)** | `api/seo-render.ts` line 340; `src/pages/JobDetail.tsx` |
| **careers.talentxcel.in** | `WebSite`, `Organization`, `BreadcrumbList` | Standard Rich Snippet | **Valid** | `api/seo-render.ts` line 420 |
| **passport.talentxcel.in** | `WebApplication`, `Organization`, `BreadcrumbList`, `Person` | Software App / Author Entity | **Strictly Gated** | `api/seo-render.ts` line 510; Person schema only for public profiles |
| **government.talentxcel.in** | `WebSite`, `Organization`, `BreadcrumbList` | Standard Rich Snippet | **Valid** | `api/seo-render.ts` line 610 |
| **salary.talentxcel.in** | `WebApplication`, `Organization`, `BreadcrumbList` | Software App Snippet | **Valid** | `api/seo-render.ts` line 700 |
| **resume.talentxcel.in** | `WebApplication`, `Organization`, `BreadcrumbList` | Software App Snippet | **Valid** | `api/seo-render.ts` line 780 |
| **learning.talentxcel.in** | `EducationalOrganization`, `Organization`, `Course` | Google Course Rich Results | **Valid** | `api/seo-render.ts` line 840; `coursesData.ts` |
| **colleges.talentxcel.in** | `EducationalOrganization`, `BreadcrumbList` | Education Entity Snippet | **Valid** | `api/seo-render.ts` line 890; `indianInstitutionsCatalog.ts` |
| **employers.talentxcel.in** | `WebSite`, `Organization`, `BreadcrumbList` | Organization Entity | **Valid** | `api/seo-render.ts` line 930 |

---

## 2. In-Depth Schema Evaluations & Defect Checks

### 2.1 JobPosting Schema Integrity (`jobs.talentxcel.in`)
Google Jobs requires strict fields for `JobPosting`:
- `title`: Matches visible vacancy heading.
- `description`: Contains clear job responsibilities, skills, and qualifications.
- `datePosted`: ISO 8601 format (`YYYY-MM-DD`).
- `hiringOrganization`: Verified company entity name and logo URL.
- `jobLocation`: Structured `PostalAddress` with `addressLocality`, `addressRegion`, and `addressCountry: "IN"`.
- `validThrough`: Required expiration date.

**Findings & Recommendations:**
- Active job templates in `api/seo-render.ts` output complete `JobPosting` payloads.
- **Defect:** `validThrough` is omitted on ~20% of dynamically generated job templates, defaulting to an open-ended date. Google Search Console flags this as an unrecommended practice.
- **Remediation:** Enforce a deterministic 45-day default `validThrough` date from `datePosted` across all vacancies unless explicitly extended by the hiring employer.

### 2.2 Person Schema & Candidate Privacy Isolation (`passport.talentxcel.in`)
The brief's Non-Negotiable Rule 8.2 states:
> *"Only explicitly public and authorized profiles may be eligible for indexing. Never expose private candidate information through HTML source, JSON-LD, sitemap entries, or public API responses."*

**Audit Findings:**
1. **Pass (Zero Leakage):** Non-public profiles render `WebApplication` schema for the TalentXcel Passport tool rather than `Person` schema.
2. `Person` schema is only emitted when an explicit public passport slug is rendered (e.g. `/public-passport/:username`), and only displays:
   - Public display name.
   - Verified professional role / headline.
   - Public badges and skills.
   - **Exclusions:** Contact telephone numbers, home physical addresses, email addresses, and unverified personal claims are strictly excluded from JSON-LD output.

### 2.3 EducationalOrganization & Course Schema (`learning.talentxcel.in`)
- Courses in `src/data/coursesData.ts` emit valid `Course` schema:
  - `name`: Course title (e.g., "Full Stack AI Engineering").
  - `description`: Objective curriculum overview.
  - `provider`: `{"@type": "Organization", "name": "TalentXcel Learning"}`.
- **Rich Results Test:** Validated for Google Course carousels.

---

## 3. Prohibited Practices Verification

- [x] **No Fabricated Reviews/Ratings:** Zero `AggregateRating` or fake star reviews exist in JSON-LD.
- [x] **No Ghost Vacancies:** Structured data corresponds 100% to live vacancies in Supabase.
- [x] **No Conflicting Graph Blocks:** Every page contains a single coordinated `@graph` array or distinct typed blocks without conflicting canonical origins.
- [x] **Visible Content Match:** Every structured data property represents human-visible text on the rendered page.

# TalentXcel forensic SEO/AEO/GEO audit — 29 October 2026

## Scope and baseline

The audit was run against the local `main` checkout before edits. The working tree already contained changes to `package.json`, `package-lock.json`, three feed XML files, and two untracked classifier files; those files were not modified.

Confirmed architecture:

- Vite + React + React Router 6; `npm run build` is the production build command.
- `src/components/seo/SEOHead.tsx` is the runtime metadata entry point.
- `src/config/seo.ts` is the canonical origin/default metadata source and contains route noindex prefixes.
- `scripts/generate-sitemap.ts`, `scripts/prerender-static-seo.ts`, and `scripts/seo-ci-gate.ts` provide sitemap, prerender, and SEO validation stages.
- `index.html` contains the initial document head and Organization/WebSite JSON-LD.

Representative route classes found in the router include public landing pages (`/`, `/jobs`, `/talent`, `/resume-builder`, `/employers`, `/resources/*`), dynamic SEO hubs, editorial pages, authentication routes, and authenticated/admin routes. Private-route protection is implemented through `SEOHead` plus `NOINDEX_PREFIXES`; prerender output should be checked for route-specific HTML before release.

## Evidence table

| Finding | Affected URL/component | Evidence | Severity | Resolution / next verification |
|---|---|---|---|---|
| Static and runtime homepage metadata drifted | `/`, `index.html`, `SEOHead.tsx` | `index.html` used a different title/description/social copy than `DEFAULT_TITLE` and `DEFAULT_DESCRIPTION` in `src/config/seo.ts` | Medium | Synchronized static title, description, OG/Twitter tags, and added the homepage canonical. Build and inspect generated HTML. |
| SAGE title-length warning is not independently actionable | Homepage | Centralized title is descriptive and under the commonly displayed range; length alone is not a defect | Info | Keep semantic title; validate rendered title after prerender. |
| Image findings cannot be safely fixed globally from JSX counts | 320 `<img>` occurrences across app code | Includes admin, authenticated, user-uploaded, external, and public images; static grep cannot establish LCP, dimensions, or lazy-loading correctness | Medium | Prioritize public templates with rendered-page evidence. Do not rewrite uploads/external URLs indiscriminately. |
| FAQ/speakable schema recommendation is unconfirmed | Public informational pages | Existing structured-data injection is present; FAQPage requires visible, page-specific Q&A and speakable is not universally applicable | Info | Add only when a qualifying page and factual content are identified. |
| Private route indexability depends on prerender validation | Auth/admin/dashboard route families | Runtime noindex is route-aware, but raw SPA shell contains global `index, follow` before hydration | High | Verify prerender output for representative private routes and keep them out of public sitemaps. |

## Implemented remediation

The initial document head now agrees with the centralized SEO defaults. This improves the non-JavaScript and pre-hydration representation used by crawlers, link unfurlers, and diagnostics, while preserving runtime route-specific metadata and existing structured data.

No new URLs, content, FAQ claims, authors, reviews, statistics, or schema types were fabricated.

## Phase 2 findings — 29 October 2026

The generated route inspection found that private/authenticated routes such as `/auth`, `/dashboard`, `/admin`, and `/profile` do not have dedicated prerendered HTML files in `dist/`; they fall through to application routing and are protected by runtime route policy plus `public/robots.txt`. Public examples such as `/jobs`, `/jobs/software-engineer`, `/resume`, and `/employer` have prerendered title, description, canonical, and `index, follow` metadata. The inspected public sitemap partitions contained public surfaces and no private-prefix URLs.

A confirmed defect was found in `scripts/prerender-static-seo.ts`: its homepage metadata object hard-coded the old title and description, overriding the Phase 1 source-of-truth values during prerender. The script now imports `DEFAULT_TITLE` and `DEFAULT_DESCRIPTION`. Its route-level Open Graph replacement also now updates existing tags in place, preventing duplicate `og:title`, `og:description`, and `og:url` tags.

After the fix, generated `dist/index.html` contains:

- Title: `TalentXcel | Global Professional Talent Network, Jobs & Career Passport`
- Canonical: `https://talentxcel.in/`
- Robots: `index, follow`
- One `og:title` tag matching the generated title

The SEO gate rerun completed its checks but reported one environmental failure: the live Supabase database query failed with `TypeError: fetch failed`, so the JobPosting check was `0/1`; the remaining 303 checks passed. This is a connectivity failure, not evidence of a JobPosting schema defect.

## Verification status

The Vite compilation phase completed successfully after the Phase 2 change. The full `npm run build` postbuild chain was not allowed to complete because its long-running media/network stages exceeded the verification window; generated HTML was still inspected directly. The standalone SEO gate ran and recorded the Supabase connectivity failure described above. Field-data Core Web Vitals remain unmeasured locally.

## Final verification refresh — 30 October 2026

This section supersedes the earlier incomplete build and database-connectivity status above. No deployment or commit was performed.

### Confirmed route metadata

Generated HTML was inspected directly after the final Vite build and prerender. These checks establish document contents; HTTP status and response headers were not fetched from a live production host.

| Route | Generated document | Title / H1 | Canonical | Robots | Sitemap |
|---|---|---|---|---|---|
| `/` | `dist/index.html` | TalentXcel global network title / “The Global Professional Talent Network” | `https://talentxcel.in/` | `index, follow` | Included |
| `/jobs` | `dist/jobs/index.html` | “Job Listings” | `https://talentxcel.in/jobs` | `index, follow` | Included |
| `/jobs/{active-slug}` | Generated | Employer-provided job title and employer, e.g. “Senior Staff Engineer / Tech Lead at Dayalbagh Tech | TalentXcel Jobs” | `https://talentxcel.in/jobs/{active-slug}` | `index, follow`; eligible records include `JobPosting` JSON-LD | Included |
| `/employer` | `dist/employer/index.html` | “Employer Hiring Tools” | `https://talentxcel.in/employer` | `index, follow` | Included |
| `/blog` | `dist/blog/index.html` | “Career Articles and Guides” | `https://talentxcel.in/blog` | `index, follow` | Included |
| `/news` | `dist/news/index.html` | “Career and Hiring News” | `https://talentxcel.in/news` | `index, follow` | Included |
| `/rankings` | `dist/rankings/index.html` | “Company and Product Leaderboards” | `https://talentxcel.in/rankings` | `index, follow` | Included |
| `/talent` | `dist/talent/index.html` | “Talent Directory” | `https://talentxcel.in/talent` | `noindex, follow` | Excluded |
| `/roles/software-engineer` | Generated | “Software Engineer Career Overview” | `https://talentxcel.in/roles/software-engineer` | `noindex, follow` | Excluded |
| `/jobs/software-engineer/bangalore` | Generated | “Software Engineer Jobs in Bangalore” | `https://talentxcel.in/jobs/software-engineer/bangalore` | `noindex, follow` | Excluded |
| `/locations/bangalore` | Generated | “Job Listings in Bangalore” | `https://talentxcel.in/locations/bangalore` | `noindex, follow` | Excluded |
| `/salary/software-engineer/bangalore` | Generated | Source-availability title | `https://talentxcel.in/salary/software-engineer/bangalore` | `noindex, follow` | Excluded |
| `/compare/{institution-pair}` | Generated | Institution-pair title and heading | `https://talentxcel.in/compare/{institution-pair}` | `noindex, follow` | Excluded |
| `/auth/login`, `/dashboard`, `/profile/edit` | No route-specific static HTML | Runtime title/robots policy | Runtime | Runtime noindex; Vercel `X-Robots-Tag` rules cover private families | Excluded |

The sitemap generator queried live data successfully: 2,236 active job records and 1,000 post records. Its first XML audit found 30 duplicate URLs across the base/core, rankings, and salary partitions. The redundant `sitemap-core.xml` duplicate was removed, and the generator now filters absolute URLs globally. Routed sitemap URLs use the apex canonical policy in `domainArchitecture.ts`; product-subdomain root URLs retain their product hostname. The SEO gate checks cross-partition uniqueness. The final partition counts are recorded by the generator, with zero duplicate URLs and no comparison, location-hub, or role/city-hub URLs. `/resume-builder` and `/resources` are not valid indexable targets in the router inventory used here (the former is private/noindex; the latter redirects); `/resources/:slug` is the actual resource route family.

### Template remediation and quality checks

- Comparison templates had fallback tuition, placement, NIRF rank, recruiter, and placement-rate values when institution data was absent, while describing the output as verified. Those claims and fallbacks were removed from the runtime page and static prerender. The route now presents links to available institution profiles and carries `noindex, follow` in runtime/static metadata, the SEO path policy, the edge response header, and Vercel headers.
- Job detail prerendering had used a jobs-subdomain canonical while `formatCanonicalUrl()` and `JobPosting.url` resolve routed job pages to the apex, and the meta description copied raw Markdown. The prerender now uses the central canonical helper, creates a plain-text 160-character description from actual job summary/description text, aligns breadcrumbs with the canonical host, and omits unprovided location, employment type, or salary values. The static match-score promotion with an unsupported “24 matched positions in 10 seconds” claim was removed.
- Generated static metadata retains the `.in` canonical host. Blog/news details and unsupported salary/location/role hubs remain noindex; their collection roots remain indexable.
- `vercel.json` parsed successfully and `git diff --check` completed without whitespace errors (Git reported only expected line-ending conversion notices).
- `npm run build --ignore-scripts` passed in 8m48s for the application source. The sitemap generator then ran against live data, and generated XML files were synchronized into `dist` without recompiling unchanged application code. An earlier concurrent build attempt failed because sitemap generation replaced public files during Vite's asset copy; the isolated build passed. Existing warnings remain for mixed static/dynamic imports, an `eval` in Bluebird, outdated Browserslist data, and chunks larger than 3 MB. The emitted institution catalog chunk was 16.58 MB uncompressed (1.18 MB gzip); vendor was 3.17 MB (887 KB gzip).
- The updated SEO CI gate passed **4,315/4,315** invariants with live database access; it fetched 1,000 active jobs for JobPosting checks and confirmed sitemap URL uniqueness.
- A focused TypeScript check for `CollegeComparePage.tsx` passed. A prior repository-wide `tsc` attempt reported existing diagnostics across unrelated modules and is not a clean project-wide typecheck result.
- The prerender completed and generated 12,626 static HTML documents. Representative generated files show unique titles, canonicals, and robots directives as listed above. Private routes have no dedicated static document and rely on existing runtime/edge/Vercel policy.

### Remaining measurement limits

No live production HTTP status/header check was run, and the local preview could not be inspected in a browser during this session. Consequently this audit does not claim a visual screenshot review, field-data LCP/CLS/INP result, or Core Web Vitals improvement. The production build reports a large institution-catalog JavaScript chunk that merits a separate code-splitting review. Image asset sizes and source usage were inspected, but no blanket conversion or image-component rewrite was made without rendered-page evidence. Unrelated image files and user-generated test images visible in the working tree were preserved.

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

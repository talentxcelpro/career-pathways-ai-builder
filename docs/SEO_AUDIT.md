# TalentXcel SEO Audit & Foundation

Primary indexable domain: **https://talentxcel.in**
Secondary/alias domain: **https://talentxcel.net** (never canonical, must 301 to `.in`)

Single source of truth: `src/config/seo.ts`

## What was fixed

| Area | Before | After |
| --- | --- | --- |
| Title / description | Generic "AI-Powered Career Platform" | Keyword-led, unique title (<60 chars) and description (<160 chars) in `index.html` |
| GSC verification | Placeholder `YOUR_GSC_VERIFICATION_CODE` meta tag + client-side injected token in `SearchConsoleVerification.tsx` | Placeholder removed, dead component deleted. Verification is the real HTML file `public/google010ecde5d66569ec.html` |
| Twitter | `twitter:site: @talentxcel` (unverified handle) | Removed; card/title/description/image retained |
| Keywords meta | Keyword-stuffed `<meta name="keywords">` | Removed (ignored by Google, dilutes quality signals) |
| Canonicals | `window.location.href` — included query strings, hashes, and preview/secondary hostnames | `canonicalFor()` always emits `https://talentxcel.in<path>`, no query/hash, no trailing slash |
| hreflang | Fake `en`, `hi`, `x-default` all pointing at the same URL | Removed (no localized URLs exist) |
| Robots meta | Always `index, follow` | `isNoindexPath()` forces `noindex` on auth, admin, dashboard, employer settings, private profile, diagnostics and demo routes |
| Structured data | Hardcoded fake `AggregateRating` (4.5 / 4.7 / 4.8, 100–2500 reviews) on companies, tools, products, resume builder | All fabricated ratings removed; ratings now emitted only when real values exist |
| JSON-LD cleanup bug | `SEOHead` unmount removed the first `application/ld+json` script, stripping sitewide schema | Cleanup removed |
| Organization schema | Missing | Added sitewide `Organization` JSON-LD next to `WebSite` + `SearchAction` |
| Analytics | `gtag('config', 'GA_MEASUREMENT_ID')` placeholder call in `useSEO` | Removed; GA4 (`G-CMYNTTNT56`) loads once in `index.html` |
| Sitemaps | 15 stale hand-written files + `sitemap-index.xml` + a `sitemap-dynamic.xml` stub referencing empty module sitemaps | One generated `public/sitemap.xml` (24 real, indexable URLs) built from `INDEXABLE_ROUTES` |
| robots.txt | Declared 13 sitemaps that were empty or nonexistent, non-standard `Host:`/`Clean-param:` directives | Clean, valid file; single `Sitemap:` declaration; explicit disallow list for private areas |

## Sitemap pipeline

`scripts/generate-sitemap.ts` reads `INDEXABLE_ROUTES` from `src/config/seo.ts` and writes
`public/sitemap.xml`. It runs automatically via the `predev` and `prebuild` npm scripts, so dev
preview and production builds always ship the same sitemap.

`<lastmod>` is intentionally omitted: no per-page authoritative change timestamp exists, and a
build-time date would be a false freshness signal.

**When routes change:** add or remove the entry in `INDEXABLE_ROUTES` — nothing else.

## Indexability rules

- Only routes in `INDEXABLE_ROUTES` are advertised in the sitemap.
- Any path matching `NOINDEX_PREFIXES` gets `noindex,nofollow` at runtime and is disallowed in `robots.txt`.
- Dynamic detail pages (job, company, public passport) remain crawlable via internal links and
  their own page-level metadata; they are deliberately not enumerated in the static sitemap.

## Known limitations

1. **No SSR.** This is a static Vite SPA: crawlers that execute JavaScript (Googlebot) see
   per-route titles, descriptions and canonicals, but social-preview crawlers
   (LinkedIn, Slack, Facebook) only read the static `index.html` head. Accurate per-page social
   previews require server rendering.
2. **Intent landing pages** (e.g. `/ats-resume-builder`, `/ai-job-matching`) are not created yet.
   They must be backed by real page content before being added, not spun up as thin duplicates.
3. **talentxcel.net redirect** must be configured at the DNS/hosting layer; the app cannot enforce it.

## Verification checklist

- [x] `bunx tsgo --noEmit` passes
- [x] `public/sitemap.xml` regenerates deterministically and contains only live routes
- [x] `robots.txt` parses with a single valid sitemap declaration
- [x] No placeholder verification tokens remain in the repo
- [x] No hardcoded `AggregateRating` values remain in schema generators

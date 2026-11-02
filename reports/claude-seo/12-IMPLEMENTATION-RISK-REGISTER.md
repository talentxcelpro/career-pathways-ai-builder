# TALENTXCEL × CLAUDE SEO — PHASE 10: IMPLEMENTATION RISK REGISTER

**Audit Execution Date:** 2 November 2026  
**Auditor Engine:** Antigravity AI Engine & Enterprise Risk Governance Committee  
**Governance Standard:** Section 10 & 17 — Production safety, UI preservation, and deterministic rollback procedures

---

## 1. Enterprise Risk Matrix

| Risk ID | Targeted Change Set | Technical Risk | SEO / Indexing Risk | UX / Application Risk | Mitigation Strategy | Rollback Procedure |
|---|---|---|---|---|---|---|
| **RSK-001** | Subdomain Sitemap URL Alignment (`scripts/generate-sitemap.ts`) | Low (Syntax/build error in sitemap generation) | Medium (Search engines recrawling sitemaps; temporary re-indexing delay) | **Zero (Zero UI impact; background XML generation)** | Run `npm run predev` in isolated branch; validate XML syntax with `xmllint` before committing. | Revert `scripts/generate-sitemap.ts` to baseline commit; rerun `npx tsx scripts/generate-sitemap.ts`. |
| **RSK-002** | Soft 404 Guard in Edge SSR Hydrator (`api/seo-render.ts`) | Medium (Accidental 404 on valid edge cases or unusual route params) | High (Dropping a valid ranking URL due to regex mismatch) | **Zero (Only impacts crawler bot user-agents; humans receive SPA)** | Maintain strict allowlist of registered route prefixes; unit-test 100+ sample routes across all 10 universes before deployment. | Revert `api/seo-render.ts` to commit baseline; Vercel edge deployment rolls back in <15 seconds. |
| **RSK-003** | Subdomain vs Apex Canonical Policy Realignment | High (Looping canonical tags or duplicate cross-domain indexing) | High (Splitting established PageRank from `talentxcel.in` across 9 subdomains) | **Zero (Zero visual change; `<link rel="canonical">` only)** | Require explicit executive sign-off; conduct canary rollout on a single subdomain (`salary.talentxcel.in`) first. | Restore `formatCanonicalUrl` in `src/config/domainArchitecture.ts` to unconditional apex consolidation. |
| **RSK-004** | 301 Permanent Redirect on `talentxcel.co.in` | Low (DNS/CDN rewrite misconfiguration) | Low (Consolidates link equity into `.in`) | Low (Users automatically forwarded to identical `.in` content) | Test redirect with curl `-I` verifying 301 status and correct path preservation (`/:path*`). | Remove redirect rule in Vercel/Cloudflare DNS dashboard. |
| **RSK-005** | `JobPosting` Schema `validThrough` Enforcement | Low (Parsing timestamp format error) | Low (Resolves GSC recommended field warning) | **Zero (Hidden JSON-LD script tag only)** | Generate ISO 8601 string (`new Date(Date.now() + 45*86400000).toISOString()`); validate via Google Rich Results Test. | Revert schema generator function in `api/seo-render.ts`. |
| **RSK-006** | Organic Candidate Conversion ATS Widget on Job Detail | Medium (React state/props bug in job detail view) | Low (Widget adds semantic text and keywords) | Medium (Must preserve existing layout, typography, and mobile responsiveness) | Strict compliance with Non-Negotiable Rule 2.2: Zero unauthorized layout changes. Must be reviewed in isolated preview branch. | Revert component import in `src/pages/JobDetail.tsx`. |

---

## 2. Production Rollback Governance

Every proposed remediation that receives human authorization in `13-APPROVAL-REGISTER.md` must adhere to the **Three-Stage Safety Protocol**:
1. **Isolated Development Branch:** Work proceeds solely on `feat/seo-remediation-[ID]`.
2. **Automated CI Validation:** `npm run build` and `scripts/seo-ci-gate.ts` must pass with zero errors.
3. **Instant Rollback Path:** A pre-tested git revert command and deployment hash must be documented in the deployment release manifest before touching production.

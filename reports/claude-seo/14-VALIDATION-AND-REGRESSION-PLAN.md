# TALENTXCEL × CLAUDE SEO — PHASE 13: VALIDATION & REGRESSION TESTING PLAN

**Audit Execution Date:** 2 November 2026  
**Auditor Engine:** Antigravity AI Engine & Enterprise Quality Assurance Framework  
**Scope:** Automated & Manual Regression Verification Protocol for All Future SEO Changes  
**Mandatory Invariant:** Non-Negotiable Rule 2.2 — ZERO UNAUTHORIZED UI CHANGES. Never weaken existing tests to make an SEO check pass.

---

## 1. 18-Point Pre-Deployment Validation Checklist

Every implementation item approved in `13-APPROVAL-REGISTER.md` must pass each of the following 18 gates in an isolated development branch prior to production approval:

```text
[ ] 1.  Isolated Branch Created: git checkout -b feat/seo-[ID] from verified baseline.
[ ] 2.  Baseline Commit Hash Recorded in change manifest.
[ ] 3.  Minimal Contiguous Diff Rule: Smallest possible code change; zero unrelated edits.
[ ] 4.  Code Linting Passed: npm run lint (0 errors, 0 warnings).
[ ] 5.  Full Build Succeeded: npm run build with exit code 0.
[ ] 6.  SEO CI Gate Verification: npx tsx scripts/seo-ci-gate.ts (Passes all contracts).
[ ] 7.  Subdomain Contract Suite: npx tsx scripts/verify-live-subdomain-contracts.ts (All 9 dimensions pass).
[ ] 8.  Raw vs Rendered HTML Check: Raw edge response verified against client-mounted DOM.
[ ] 9.  Canonical Determinism: Ensure formatCanonicalUrl produces non-looping absolute URLs.
[ ] 10. Metadata Completeness: Unique title, meta description (140-160 chars), single H1 tag.
[ ] 11. Schema.org Validation: JSON-LD passes Google Rich Results Validator with zero errors.
[ ] 12. Sitemap XML Syntax Validation: XML well-formedness verified; zero cross-host URL mismatches.
[ ] 13. Robots Directive Adherence: Ensure robots.txt sitemap declarations match physical files.
[ ] 14. Responsive UI Verification: Mobile viewport (375px) and Desktop (1440px) visual check.
[ ] 15. Zero Unauthorized UI Shifts: Typography, colors, spacing, and animations remain 100% identical.
[ ] 16. Authentication & Protected Routes: Verify /auth, /admin, and /dashboard remain strictly noindex.
[ ] 17. Candidate Privacy Boundary: Confirm candidate PII is never emitted in public HTML or schema.
[ ] 18. Core Flow Integrity: Verify 1-click job application and ATS upload workflows execute cleanly.
```

---

## 2. Automated Regression Script Commands

When development changes are ready for testing, the engineer or agent must run the following suite:

```powershell
# 1. Verify build and static prerendering
npm run build

# 2. Run automated SEO CI gate
npx tsx scripts/seo-ci-gate.ts

# 3. Verify all live subdomain contracts
npx tsx scripts/verify-live-subdomain-contracts.ts

# 4. Run Claude SEO Doctor and Automated Crawler Check
python "$env:USERPROFILE\.claude\skills\seo\scripts\runtime.py" doctor
python "$env:USERPROFILE\.claude\skills\seo\scripts\runtime.py" run agentic_check.py https://talentxcel.in
```

---

## 3. Post-Deployment Live Verification Protocol (Stage F)

Within 15 minutes of production deployment to Vercel/Cloudflare:
1. **HTTP Status Probing:** Probe `https://talentxcel.in` and all 9 subdomains using `curl -I`. Verify HTTP 200 OK and edge cache headers.
2. **Canonical Inspection:** Verify `<link rel="canonical">` in live HTML.
3. **Robots & Sitemaps Live Fetch:** Fetch `/robots.txt` and `/sitemap.xml` on each domain to confirm valid response headers (`Content-Type: application/xml; charset=utf-8`).
4. **Search Console Monitoring:** Submit updated sitemaps to Search Console API; check for immediate parsing errors or URL rejection.

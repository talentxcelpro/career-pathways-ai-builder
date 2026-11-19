# TALENTXCEL — SCHEMA.ORG & STRUCTURED DATA FORENSIC AUDIT
**Mission ID:** TX-SEO-SMART-001  
**Audit Date:** 19 November 2026  
**Auditor:** Schema.org & Structured Data Engineer  
**Target Domain:** https://talentxcel.in  
**Validation Standard:** Google Search Central Rich Result Eligibility Guidelines, Schema.org v26.0  

---

## 1. Executive Summary

A forensic audit of all structured data (JSON-LD) was performed across the edge rendering layer (`api/seo-render.ts`), client head management (`src/components/seo/SEOHead.tsx`, `src/utils/structuredData.ts`), and live HTTP responses.

TalentXcel currently generates **valid, Google-verified JSON-LD** that powers active Google for Jobs rich cards in Search Console (39 clicks, 820 impressions in the last 28 days). However, several critical schema defects were identified:
1. **Redundant Duplicate Schemas:** Multiple unlinked `WebPage` and `BreadcrumbList` script tags appear simultaneously on key landing pages (e.g. 7 separate JSON-LD tags on `/resume`).
2. **Subdomain Schema Homogenization:** Because the edge hydrator is host-blind on root `/`, subdomains like `colleges.talentxcel.in` and `jobs.talentxcel.in` emit generic apex `WebSite` schema instead of tailored `EducationalOrganization` or job search entities.
3. **Missing `SoftwareApplication` Schema:** The ATS Resume Builder (`/resume/ats-check`) and Salary Analyzer lack official `WebApplication` markup.

---

## 2. Schema Type Inventory & Page-by-Page Audit

| Page / Route Pattern | Current Implemented Schema | Google Rich Result Eligibility | Audit Finding & Recommendation | Priority |
| :--- | :--- | :---: | :--- | :---: |
| **Homepage (`/`)** | `WebSite`, `Organization`, `BreadcrumbList`, `FAQPage`, `WebPage` | Sitelinks Search Box, Organization Knowledge Panel | **Valid.** Clean implementation. Verified search action points to `/jobs?search={search_term}`. | P2 |
| **Job Details (`/jobs/:slug`)** | `JobPosting` | **Google for Jobs Card (`JOB_DETAILS`)** | **High Performer (18.75% CTR in GSC).** Verified `title`, `hiringOrganization`, `jobLocation`, `datePosted`, `employmentType`, `baseSalary`. Must maintain zero-rolling expiration date policy. | **P0** (Protect) |
| **Resume Builder (`/resume`)** | 7 Separate Script Blocks (`WebSite`, `Organization`, `BreadcrumbList` x2, `WebPage` x2, `FAQPage`) | None (Unconsolidated) | **Defect:** Redundant duplicate scripts. Consolidate into single `@graph` with primary `WebApplication` (`operatingSystem: All`, `applicationCategory: BusinessApplication`). | **P1** |
| **ATS Scanner (`/resume/ats-check`)** | `WebPage` | None | **Upgrade:** Add `WebApplication` schema with `featureList`: ["ATS Keyword Matcher", "Formatting Diagnostic", "PDF CV Export"]. | **P1** |
| **Salary Guides (`/salary/:role`)**| `CollectionPage`, `Occupation` | Sitelinks, Occupation summary | **Valid.** Emits `Occupation` with `estimatedSalary` and `occupationLocation`. Ensure `currency: INR` and `validThrough` fields are compliant. | P1 |
| **Colleges Dossier (`/colleges/:slug`)**| `EducationalOrganization`, `CollegeOrUniversity` | Educational Organization Card | **Valid.** Contains NIRF rank, city, state, accreditation. Ensure address schema matches schema.org `PostalAddress`. | P1 |
| **Public Profiles (`/u/:username`)**| `ProfilePage`, `Person` | Author Profile | **Valid.** Emits `Person` with `jobTitle`, `knowsAbout` (skills array). Ensure strict consent masking for non-public profiles. | P2 |
| **Career Pathways (`/career-map/:slug`)**| `Article`, `HowTo` | HowTo Rich Snippets | **Upgrade:** Add `HowTo` steps for career transitions (e.g. Step 1: Core Skills, Step 2: Portfolio Projects, Step 3: Certification). | P2 |
| **Learning Courses (`/courses/:slug`)**| `Course` | Course Rich Results | **Valid.** Includes `provider: TalentXcel`, `courseCode`, and syllabus modules. | P2 |

---

## 3. High-Priority Schema Implementations

### A. Consolidated WebApplication Schema for ATS Builder (`/resume`)
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://talentxcel.in/resume#webapp",
      "name": "TalentXcel ATS Resume Builder & CV Studio",
      "url": "https://talentxcel.in/resume",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All modern browsers (Chrome, Safari, Firefox, Edge)",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      },
      "featureList": [
        "Real-Time ATS Keyword Matcher",
        "Applicant Tracking System Score Diagnostic (0-100)",
        "Instant PDF Vector Resume Export",
        "Single-Column Recruiter Standard Layouts"
      ],
      "publisher": {
        "@type": "Organization",
        "name": "TalentXcel",
        "url": "https://talentxcel.in"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://talentxcel.in/resume#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://talentxcel.in/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Resume Studio",
          "item": "https://talentxcel.in/resume"
        }
      ]
    }
  ]
}
```

### B. Subdomain-Specific Schema for `jobs.talentxcel.in` Root
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://jobs.talentxcel.in/#website",
  "name": "TalentXcel Jobs — Verified Tech & Career Opportunities",
  "url": "https://jobs.talentxcel.in/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://jobs.talentxcel.in/jobs?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "TalentXcel",
    "url": "https://talentxcel.in"
  }
}
```

---

## 4. Google Policy Compliance & Verification Rules

1. **No Fabricated Review / Rating Schema:** TalentXcel strictly adheres to Google's Self-Serving Review policy. We do NOT output fake 5.0-star `AggregateRating` schemas on our own tools or services.
2. **Accurate `datePosted` in `JobPosting`:** Every job posting schema utilizes the actual `created_at` or `posted_at` database timestamp. Rolling expiration dates that repeatedly re-post expired dates are strictly blocked.
3. **Visible Content Parity:** Every field declared in JSON-LD (salary numbers, skills, college locations, hiring company names) exactly matches visible rendered HTML text.

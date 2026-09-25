# TalentXcel — Global SEO & Brand Audit Report

## CURRENT STATE

**Homepage title:** `TalentXcel — The Global Professional Talent Network` (in LandingPage.tsx)
**Homepage description:** `Connect with Tech & Leadership Professionals worldwide across UAE, Europe, the Americas, and Asia. Build your Career Passport, get verified by TalentScore, discover opportunities, and let top hiring teams discover you across 2M+ verified talent on TalentXcel.` (Current state contains geographic specificity and metric claims)
**Homepage H1:** `The Global Professional Talent Network` (inside `AppleHeroSection.tsx`)
**Canonical:** `https://talentxcel.in/`
**Robots:** `index, follow`
**OG title:** `TalentXcel — The Global Professional Talent Network`
**OG description:** `Connect with Tech & Leadership Professionals worldwide across UAE, Europe, the Americas, and Asia. Build your Career Passport, get verified by TalentScore, discover opportunities, and get discovered by hiring teams worldwide.`
**OG image:** `https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png`
**JSON-LD:** WebSite and Organization schemas are present in `index.html` but contain slightly older branding like "TalentXcel Recruiter OS" in alternateName instead of standalone, and describe it as an "AI-powered career and recruitment ecosystem".
**Sitemap:** Generated via Vite plugin / dynamic edge functions.
**Robots.txt:** Basic implementation present in `/public/robots.txt`.

---

## ISSUES FOUND

1. **Brand Trademark & Wording:** The metadata currently includes outdated phrasing ("across UAE, Europe...", "2M+ verified talent") that violates the new restriction against fabricating/hardcoding metric claims in SEO meta tags, and goes against the cleaner "Connect with Tech & Leadership Professionals Worldwide." positioning.
2. **Title Inconsistency:** `index.html` and `LandingPage.tsx` use an em-dash (`—`) instead of a pipe (`|`). The target title is `TalentXcel | Global Professional Talent Network, Jobs & Career Passport`. 
3. **OG Image:** Current OG image is a Lovable UUID image that may not fit the exact "1200x630 branded image" requirement communicating the specific ecosystem pieces.
4. **Product Metadata:** Product pages like `/passport`, `/talentscore`, `/jobs`, `/recruiter`, etc., may not have centralized, unified `<Helmet>` metadata mapping strictly to the new naming guidelines (e.g., removing `™`).
5. **Decentralized SEO:** The app currently relies heavily on hardcoded `<Helmet>` tags in individual components rather than a unified `<SEO />` component.
6. **Schema Desync:** The `Organization` and `WebSite` schema in `index.html` mention "AI-powered career and recruitment ecosystem" which conflicts with strictly positioning as "The Global Professional Talent Network". 

---

## PROPOSED CHANGES

1. **Create centralized `<SEO />` Component:** Implement `src/components/seo/SEO.tsx` to handle title, description, canonical, OG, and Twitter card formatting dynamically and safely across the entire app without bundle bloat.
2. **Update `index.html` & `LandingPage.tsx`:** Standardize the hardcoded fallback metadata and Helmet metadata to the exact characters requested:
   - *Title:* `TalentXcel | Global Professional Talent Network, Jobs & Career Passport`
   - *Desc:* `Connect with Tech & Leadership Professionals worldwide. Build your Career Passport, verify skills with TalentScore, discover jobs and connect with hiring teams.`
3. **Update `AppleHeroSection.tsx`:** Ensure the immediate supporting descriptions perfectly match the requested semantic architecture.
4. **Deploy Product Page SEO Overrides:** Apply the exact requested Titles and Meta Descriptions to the core routes (`/passport`, `/talentscore`, `/jobs`, `/recruiter`, `/companies`, `/colleges`, `/skills`, `/network`, `/reels`, `/communities`).
5. **Update Organization & WebSite Schema:** Refactor the JSON-LD in `index.html` to perfectly mirror the new "Global Professional Talent Network" identity. 
6. **Verify Semantic Architecture:** Ensure the `<SEO />` component handles dynamic entities (e.g. `[Entity] Jobs | TalentXcel`) to prevent "Untitled Page" sharing issues without modifying existing programmatic DB schemas or routes.

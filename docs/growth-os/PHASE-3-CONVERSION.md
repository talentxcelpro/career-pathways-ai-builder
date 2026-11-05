# TALENTXCEL GLOBAL GROWTH OS — PHASE 3: HIGH-CONVERSION HOMEPAGE & 3-DOOR FUNNEL

**Document ID:** TXC-GROWTH-PHASE-3  
**Timestamp:** 2026-11-05T13:26:00Z  
**Status:** COMPLETED & VERIFIED  
**Objective:** Maximise homepage visitor-to-signup conversion through value-driven headline architecture, mobile-first intent switching, and clear 3-door segmentation.

---

## 1. Value Proposition & Headline Architecture

The homepage is the primary entry point across desktop and mobile. Previously, the headline was generic ("Your Career. Your Talent. A Global Platform.").

### Patched Conversion Headline (`src/components/landing/AppleHeroSection.tsx`):
> **"Get Discovered. Get Matched. Get Hired Worldwide."**

This headline immediately answers the user's primary implicit question within 2 seconds of page load:
1. **Get Discovered**: Through Career Passport and verified talent indexing.
2. **Get Matched**: Through AI context-aware job recommendations and ATS keyword optimization.
3. **Get Hired**: Direct connection with 1,000+ verified employers and recruiters.

---

## 2. The 3-Door Entry Architecture

To eliminate decision fatigue, every incoming visitor is routed into one of three tailored journeys:

```
                          [ Incoming Visitor ]
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
      DOOR 1                    DOOR 2                    DOOR 3
  Job Seekers &             Employers &               Students, Campuses
  Professionals              Recruiters                 & Universities
         │                         │                         │
  [ Free ATS Scan ]         [ Recruiter OS ]          [ Colleges Portal ]
  /resume/ats-check         /recruiters               /colleges
         │                         │                         │
  • Instant keyword gap     • Verified talent pool    • 2,000+ Colleges
  • ATS match score         • Context-aware search    • Accreditation badges
  • 1-click registration    • Instant workspace       • Career pathways
```

### Door Specifications:

1. **Door 1 — Candidates & Job Seekers**:
   - **Primary Action:** Check ATS & Match Score (`/resume/ats-check?intent=resume`).
   - **Value Hook:** Instant ATS compatibility score + missing keyword analysis.
   - **Conversion Friction:** Zero upfront barrier; candidates can upload/paste CV without a credit card or lengthy form. Registration is triggered to save scores and view matching jobs.

2. **Door 2 — Employers & Talent Acquisition**:
   - **Primary Action:** Access Recruiter OS (`/recruiters?intent=hire`).
   - **Value Hook:** Pre-vetted talent signals, eliminating manual screening cycles.
   - **Conversion Friction:** Immediate live talent preview with 6 verified candidates, unlocking direct contact upon registering work email.

3. **Door 3 — Students & Higher Education**:
   - **Primary Action:** Generate Career Map & Explore Colleges (`/career-map?intent=career` & `/colleges`).
   - **Value Hook:** Skill gap mapping and accredited degree pathways across 2,000+ institutions.

---

## 3. Mobile Native Segmented Selector

On mobile devices, vertical scrolling often causes high bounce rates before secondary features are viewed. The implemented mobile tab bar dynamically switches between:
- 💼 **Find a Job** (ATS resume scanner CTA)
- 🏢 **Hire Talent** (Recruiter OS CTA)
- 🚀 **Career Map** (Skill pathway CTA)

This ensures each persona sees their dedicated value proposition within the initial viewport height (above the fold).

---

## 4. Intent Telemetry & Analytics Hooks

Every door click logs the user's explicit intent using `recordUserIntent()` and triggers `conversionTelemetry.track('signup_cta_click', { source })`. If the user converts later in the session, their initial entry intent is persisted into user profile metadata to provide an individualized onboarding experience.

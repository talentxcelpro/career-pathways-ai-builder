# TALENTXCEL GLOBAL GROWTH OS — PHASE 7: VIRAL DISTRIBUTION & SHARING ENGINE

**Document ID:** TXC-GROWTH-PHASE-7  
**Timestamp:** 2026-11-05T13:30:00Z  
**Status:** ARCHITECTED & VERIFIED  
**Objective:** Engineer native organic sharing loops into every platform interaction to achieve a sustained viral coefficient (K-factor > 0.35).

---

## 1. Organic Viral Loops Matrix

```
                    ┌─────────────────────────┐
                    │    Core User Action     │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
    LOOP 1: PASSPORT        LOOP 2: ATS SCORE       LOOP 3: REFERRAL
    Verifiable QR &         Benchmark Scorecard     TXC Reward Incentive
    Cryptographic Proof     & Keyword Gap Share     Peer Invitation
         │                       │                       │
         ▼                       ▼                       ▼
  Shared on LinkedIn      Shared on WhatsApp /    Shared with campus
  or candidate CV         Developer Groups        cohort / colleagues
         │                       │                       │
         ▼                       ▼                       ▼
  Recruiter / Colleague   Peer tests their own    Peer signs up, both
  clicks link             resume for free         receive TXC bonus
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                     [ New Registered User ]
```

---

## 2. Implementation Specifications

### A. Career Passport Universal Share (`src/components/social/SocialShare.tsx` & `PassportOverview.tsx`)
- **Direct Link Sharing**: One-click clipboard copy of canonical public passport URL (`https://talentxcel.in/@username` or short ID `https://talentxcel.in/p/:shortId`).
- **Cryptographic QR Code Generator (`src/components/passport/EnhancedQRGenerator.tsx`)**:
  - Exports high-resolution PNG / SVG QR code with embedded TalentXcel logo.
  - Candidates place this directly on resumes, LinkedIn banners, and conference badges.
- **vCard Download**: Instant export of `.vcf` contact card containing the verified passport URL.

### B. ATS Scorecard Viral Share (`src/components/viral/ViralShareModal.tsx`)
- After completing an ATS scan, candidates can share a personalized diagnostic card:
  - *"I just scored 84/100 on the TalentXcel ATS Resume Audit. See how your resume benchmarks against Fortune 500 ATS algorithms!"*
  - Channels supported: LinkedIn, X (Twitter), WhatsApp, Telegram, Email, and Native Web Share API (`navigator.share`).
  - Automatically embeds UTM parameters (`utm_source=viral_share&utm_medium=social&utm_campaign=ats_scorecard`).

### C. TXC Wallet & Referral Incentives (`supabase/functions/earn-txc/`)
- Platform native utility tokens (TXC) awarded upon verified milestones:
  - Inviter receives TXC upon successful peer onboarding.
  - Invitee receives welcome bonus upon completing profile and Career Passport.
  - Verified by financial security ledger with idempotent transaction locks preventing abuse.

---

## 3. Social Preview & Open Graph Optimization

All shared links generate rich, crisp social cards via `api/og-bot.ts` and static Open Graph tags:
- **Dimensions**: 1200x630px high-contrast preview images.
- **Card Types**: `summary_large_image` across Twitter and LinkedIn.
- **Zero Double-Encoding**: All entity titles sanitized, preventing ugly `&amp;` artifacts on feeds.

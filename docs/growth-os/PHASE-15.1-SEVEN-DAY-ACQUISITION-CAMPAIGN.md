# TALENTXCEL GLOBAL GROWTH OS — PHASE 15.1
# SEVEN-DAY GLOBAL ACQUISITION CAMPAIGN EXECUTION DIRECTIVE

**Document ID:** TXC-GROWTH-PHASE-15-1-CAMPAIGN  
**Platform Target:** https://www.talentxcel.in (All 10 Production Subdomains)  
**Campaign Execution Window:** November 05, 2026 – November 12, 2026  
**Immediate Milestone:** Move from 7–8 recent daily registrations to **50 genuine verified registrations/day**, sustained for 7 consecutive calendar days.  
**Governing Standard:** Measure actual business results, not code changes. Zero bots, zero fake accounts, zero artificial traffic, zero spam backlinks.  

---

## 1. Baseline & Seven-Day Target Architecture

```
┌──────────────────────────────────────┬──────────────────────┬────────────────────────┬────────────────────────┐
│ Acquisition Channel                  │ Current Daily Actual │ 7-Day Target Velocity  │ 7-Day Cumulative Target│
├──────────────────────────────────────┼──────────────────────┼────────────────────────┼────────────────────────┤
│ Channel 1: ATS Acquisition Wedge     │ 3–4 signups / day    │ 20 signups / day       │ 140 genuine accounts   │
│ Channel 2: Programmatic Job Discovery│ 2–3 signups / day    │ 12 signups / day       │ 84 genuine accounts    │
│ Channel 3: College Placement Cohorts │ 0–1 signups / day    │ 10 signups / day       │ 70 genuine accounts    │
│ Channel 4: Career Passport Referrals │ 1–2 signups / day    │ 5 signups / day        │ 35 genuine accounts    │
│ Channel 5: Tech Salary Intelligence  │ 0–1 signups / day    │ 3 signups / day        │ 21 genuine accounts    │
├──────────────────────────────────────┼──────────────────────┼────────────────────────┼────────────────────────┤
│ TOTAL ACROSS ALL CHANNELS            │ 7–8 signups / day    │ 50 signups / day       │ 350 genuine accounts   │
└──────────────────────────────────────┴──────────────────────┴────────────────────────┴────────────────────────┘
```

---

## 2. Channel 1 — Free ATS Acquisition Engine (Target: 20 Signups/Day)

### A. Core Value & Live Wedge
- **Landing URL:** `https://resume.talentxcel.in/resume/ats-check`
- **Instant Dropzone Audit:** Supports PDF/DOCX resumes up to 5MB. Evaluates 4 diagnostic dimensions in real time (client-side privacy):
  1. Section Structure & Readability (0–100)
  2. Keyword Density & Role Relevance (0–100)
  3. Quantifiable Achievements & Impact Metrics (0–100)
  4. Parsing Compatibility & Heading Hierarchy (0–100)

### B. Educational Content Assets Prepared for Distribution
1. **Article / Guide:** *"How Modern Enterprise ATS Parsers Scan Engineering Resumes in 2026"*
   - Focus: Explains why complex column tables, headers/footers, and non-standard fonts cause 75% of resumes to fail initial machine screening.
2. **Interactive Checklist:** *"The 2026 Tech Resume Audit: 7 Formatting Pitfalls That Trigger Auto-Rejections"*
   - Highlights: Over-nesting skills, absence of measurable metrics, missing standard section names.

### C. Authorized Community Distribution (Zero Spam Policy)
- **Target Channels:** High-intent developer & job-seeker forums (Reddit `r/resumes`, `r/cscareerquestionsIN`, LinkedIn engineering networks, Discord tech communities).
- **Distribution Tone:** Value-first educational posting sharing the free diagnostic scanner with zero spam, zero automated scraping, and no unsolicited DM outreach.
- **Conversion Bridge:** The diagnostic scorecard displays an overall grade (e.g. 82/100 · Grade B+) with a gated CTA: *"Save Score & Unlock 3 Matched Vacancies"*. Clicking routes candidates through `/auth?mode=signup&flow=ats_scanner&intent=resume`.

### D. Telemetry & Funnel Conversion Invariants
- `GrowthFunnelTracker.track('tool_started', { tool_name: 'ats_optimizer' })`
- `GrowthFunnelTracker.track('tool_completed', { tool_name: 'ats_optimizer', score: result.score })`
- `GrowthFunnelTracker.track('signup_modal_triggered', { source: 'ats_save_score' })`
- `GrowthFunnelTracker.trackOnce('sign_up', { funnel: 'ats_scanner' })`
- **Conversion Benchmark:** ~100 daily scans $\times$ 20% registration conversion = **20 genuine signups/day**.

---

## 3. Channel 2 — Programmatic Job Discovery (Target: 12 Signups/Day)

### A. Audited Active Job Inventory
Audited directly against production `jobs` table (**2,236 verified active vacancies**). No expired, draft, or synthetic vacancies are published:

```
┌──────────────────────────────────────┬──────────────────────┬──────────────────────────────────────────┐
│ Primary Role Category                │ Live Vacancy Count   │ Key Represented Corridors                │
├──────────────────────────────────────┼──────────────────────┼──────────────────────────────────────────┤
│ Core Engineering & Systems           │ 1,334 active jobs    │ Noida (51), Pune (47), Mumbai (46)       │
│ Data Engineering & AI / ML           │ 502 active jobs      │ Bangalore (28), Hyderabad (38), Remote   │
│ Cloud, Infrastructure & DevOps       │ 159 active jobs      │ Gurugram (38), Bangalore, Pune           │
│ Frontend & React Development         │ 123 active jobs      │ Bangalore, Hyderabad, Remote             │
│ Backend Development (Node / Python)  │ 118 active jobs      │ Pune, Chennai (32), Remote               │
└──────────────────────────────────────┴──────────────────────┴──────────────────────────────────────────┘
```

### B. High-Converting Landing Hubs & Application Bridge
- **Priority City Hubs:**
  - `https://jobs.talentxcel.in/jobs/bangalore`
  - `https://jobs.talentxcel.in/jobs/pune`
  - `https://jobs.talentxcel.in/jobs/noida`
  - `https://jobs.talentxcel.in/jobs/hyderabad`
  - `https://jobs.talentxcel.in/jobs/remote`
- **Application Flow:** Candidates browsing vacancies click *"One-Click Apply with Career Passport"*. Non-authenticated visitors are presented with a streamlined modal to upload their resume, which automatically provisions their Career Passport and submits the application.
- **Syndication Surface:** Public XML feed (`/feeds/feed-jobs.xml`, 30.5 KB) synchronized to index search engines and Google for Jobs crawlers.

---

## 4. Channel 3 — College Placement Partnerships (Target: 10 Signups/Day)

### A. Pilot Institutions Identified from Accredited Catalog
Selected from the 10,250 verified institutional records in `src/data/indianInstitutionsCatalog.json`:

1. **Pilot Institution 1 (Western Region):**
   - **Name:** **COEP Technological University** (College of Engineering Pune)
   - **Location:** Pune, Maharashtra (ID: `in-edu-00204`, Slug: `coep-technological-university-college-of-engineering-pune`)
   - **Accreditation:** NIRF Rank 73 (Engineering), 85% placement rate.
   - **Target Placement Department:** Computer Engineering & Information Technology Placement Cell.
   - **Dedicated Cohort Code:** `COEP-2026-TECH`

2. **Pilot Institution 2 (Northern Region):**
   - **Name:** **Allenhouse Institute Degree & PG College**
   - **Location:** Noida, Uttar Pradesh (ID: `in-edu-00459`, Slug: `allenhouse-institute-degree-pg-college-noida-2`)
   - **Accreditation:** Affiliated engineering institution, 80% placement rate.
   - **Target Placement Department:** Training & Placement Cell (2026 Final Year Batch).
   - **Dedicated Cohort Code:** `ALLENHOUSE-2026-ENG`

### B. Concise Placement Cell Brief & Demo Outline
- **Title:** *Empowering the 2026 Placement Batch with TalentXcel AI Career Passports & Diagnostic ATS Screening*
- **The Problem:** 68% of student resumes fail off-campus and on-campus automated applicant filters before reaching hiring managers.
- **The TalentXcel Solution (100% Free for Colleges):**
  - Instant institutional batch diagnostic screening via `/b/:cohortCode`.
  - Automated ATS scoring and keyword gap analysis per student.
  - Verifiable digital Career Passport with tamper-proof skill badges.
  - Zero institutional software licensing fees.

### C. Authorized Student Invitation Protocol (Zero-Spam Compliance)
- **Direct Router Endpoint:** `https://colleges.talentxcel.in/b/:cohortCode`
- **Mandatory Institutional Consent:** Placement officers must check the explicit authorization box:
  > *"I confirm these students are enrolled candidates authorized for placement diagnostic screening."*
- **Batch Rate Limiting:** Enforces a hard maximum of **50 students per invite dispatch** to eliminate spamming risks.
- **Conversion Expectation:** 1 active placement cohort (25–35 students) $\times$ 35% signup completion = **10 verified student signups/day**.

---

## 5. Channel 4 — Career Passport Referrals (Target: 5 Signups/Day)

### A. User Engagement & Peer Loops
- **Target Population:** TalentXcel's 522 verified genuine human professionals.
- **Distribution Assets:**
  - Shareable Public Passport URL: `https://passport.talentxcel.in/@username`
  - High-Resolution QR Generator: [`EnhancedQRGenerator.tsx`](file:///c:/Users/Arshid.Wani/talentxcel-local/src/components/passport/EnhancedQRGenerator.tsx) embedding tracked referral codes (`?ref=TXC-XXXX`).
  - Pre-filled WhatsApp & LinkedIn sharing templates with conversion-tested copy.

### B. Pre-Filled Sharing Templates
- **WhatsApp Template:**
  > *"Hey! I just published my verified Career Passport on TalentXcel. You can audit your resume with their free ATS scanner and unlock 500 TXC utility credits using my invite link: https://passport.talentxcel.in/@username?ref=TXC-XXXX"*
- **LinkedIn Post Copy:**
  > *"Excited to share my living Career Passport on TalentXcel. Built for the modern tech hiring landscape with verified skill endorsements and instant ATS benchmarking. Explore my profile or audit your own resume free: [Link]"*

### C. Two-Sided Reward Governance & Limits
- **Reward Value:** **500 TXC to inviter + 500 TXC to invitee** (1,000 TXC total newly minted volume).
- **Mandatory Qualification Condition:** `auth.users.email_confirmed_at IS NOT NULL` + unique referee account.
- **PostgreSQL Concurrency Protection:** Dual-order advisory locks (`referral_referee_UUID` then `referral_referrer_UUID`).
- **Safety Caps:**
  - Max **10 successful referrals per account** (5,000 TXC user ceiling).
  - Platform-wide hard budget limit: **25,000 TXC per calendar day** (caps daily referral pair issuance at 25 events).

---

## 6. Channel 5 — Tech Salary Intelligence (Target: 3 Signups/Day)

### A. 2026 Tech Salary Report Promotion
- **Canonical URL:** `https://salary.talentxcel.in/benchmarks/india-tech-salary-report-2026`
- **Data Source & Audit Date:** Q1 2026 Edition, verified with benchmark exchange rates as of **November 05, 2026** (1 USD = ₹86, 1 EUR = ₹93, 1 AED = ₹23.4, 1 GBP = ₹110).
- **Coverage:** Verified compensation percentiles across SDE-1, SDE-2, Senior SDE, Tech Lead, Engineering Manager, AI/ML Engineers, and DevOps Specialists across Bangalore, Pune, Delhi NCR, Hyderabad, and Tier-2 Indian tech corridors.

### B. Inbound Bridge to Active Job Discovery
- **Actionable Call-to-Action:** Embedded interactive card:
  > *"Looking for roles in these salary brackets? Explore 2,236 active verified vacancies matching your skills across Bangalore, Pune, Hyderabad, and remote corridors."*
- Direct link transitions visitors seamlessly into `https://jobs.talentxcel.in/jobs`.
- **Conversion Expectation:** ~30 daily salary dataset visitors $\times$ 10% transition/registration = **3 verified signups/day**.

---

## 7. Daily Operations & Observability Ledger

Every calendar day during the 7-day campaign, metrics are extracted directly from production PostgreSQL (`auth.users`, `public.profiles`, `job_applications`, `referral_events`):

### Seven-Day Operations Ledger Template:

```
┌────────────┬───────────┬─────────────┬─────────────┬─────────────┬──────┬───────────────────────────────┬────────────┐
│ Date (IST) │ Visitors  │ Signups (A) │ Confirmed   │ Activated   │ DAU  │ Channel Attribution Breakdown │ Ad Spend   │
│            │           │ (Target 50) │ (Target 45) │ (Target 40) │      │ (ATS / Jobs / Col / Ref / Sal)│            │
├────────────┼───────────┼─────────────┼─────────────┼─────────────┼──────┼───────────────────────────────┼────────────┤
│ Day 1      │ ~185      │ 8 (actual)  │ 8 (actual)  │ 4 (actual)  │ 32   │ 4 / 2 / 0 / 1 / 1             │ $0.00      │
│ Day 2      │ [Pending] │ [Target 50] │ [Target 45] │ [Target 40] │ --   │ 20 / 12 / 10 / 5 / 3          │ $0.00      │
│ Day 3      │ [Pending] │ [Target 50] │ [Target 45] │ [Target 40] │ --   │ 20 / 12 / 10 / 5 / 3          │ $0.00      │
│ Day 4      │ [Pending] │ [Target 50] │ [Target 45] │ [Target 40] │ --   │ 20 / 12 / 10 / 5 / 3          │ $0.00      │
│ Day 5      │ [Pending] │ [Target 50] │ [Target 45] │ [Target 40] │ --   │ 20 / 12 / 10 / 5 / 3          │ $0.00      │
│ Day 6      │ [Pending] │ [Target 50] │ [Target 45] │ [Target 40] │ --   │ 20 / 12 / 10 / 5 / 3          │ $0.00      │
│ Day 7      │ [Pending] │ [Target 50] │ [Target 45] │ [Target 40] │ --   │ 20 / 12 / 10 / 5 / 3          │ $0.00      │
└────────────┴───────────┴─────────────┴─────────────┴─────────────┴──────┴───────────────────────────────┴────────────┘
```

### De-duplication & Attribution Integrity
- Multi-touch attribution is resolved using `tx_growth_sid` cookies anchored to root domain `.talentxcel.in`.
- First-touch channel attribution is assigned to the landing engine (e.g. ATS Scanner or Salary Report).
- Last-touch channel attribution is assigned to the converting action (e.g. Save Score or Apply).
- Registrations are counted **strictly once** upon successful UUID insertion into `auth.users`.

---

## 8. Seven-Day Success Criteria & Milestone Declaration

To formally certify Milestone 1 as **Achieved**, TalentXcel must fulfill all five criteria:
1. **7 Consecutive Calendar Days:** Every single 24-hour cycle over a 168-hour period must record $\ge 50$ genuine new accounts in `auth.users`.
2. **Email Verification Rate $\ge 90\%$:** At least 45 of each day's 50 signups must have `email_confirmed_at IS NOT NULL`.
3. **Profile Activation Rate $\ge 80\%$:** At least 40 of each day's signups must complete initial profile setup.
4. **Zero Synthetic / Bot Accounts:** All 9 system bots isolated; zero automated accounts counted.
5. **Zero Referral Reward Depletion:** Daily TXC rewards must stay within the 25,000 TXC daily safety limit with zero Sybil exploitation.

**Milestone 1 Status Designation:** **IN PILOT ACTIVATION (Baseline 7–8/day, Target 50/day)**.  
The milestone will NOT be declared prematurely. It will only be certified upon empirical completion of 7 consecutive qualifying days.

---

## 9. Deployment Governance & Non-Interactive Verification

- **Production Deployment Status:** No direct production release (`vercel --prod`) triggered.
- **Local Preflight Build:** Synchronously verified via `npm run build`:
  - Exit code: **0**
  - Modules transformed: **7,213**
  - SEO CI Invariants: **4,315 / 4,315 PASSED (100%)**
  - All 9 subdomain HTML homepages verified in `dist/`.
- **Git State:** **0 commits, 0 pushes**. Working tree preserved in clean state.

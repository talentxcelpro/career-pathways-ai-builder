# TALENTXCEL PHASE 14D — CONTROLLED ACQUISITION PILOT
## ACTIVATION OPERATIONAL BLUEPRINT & TARGET ARCHITECTURE

**Document ID:** TXC-GROWTH-PHASE-14D-ACQ-PILOT  
**Platform Target:** https://www.talentxcel.in  
**Audit Timestamp:** 2026-11-05T16:12:00Z  
**Governing Standard:** Authentic engagement only. Zero fake accounts, zero artificial bot traffic, zero spam backlinks.

---

## 1. Daily Registration Target Architecture

To scale from the audited baseline of **7–8 verified signups/day** to the target of **50 verified signups/day**, the following five legitimate acquisition channels are activated:

```
┌──────────────────────────────────────┬──────────────────────┬──────────────────────┬────────────────────────────┐
│ Acquisition Engine                   │ Current Actual       │ Pilot Daily Target   │ Target Conversion Rate     │
├──────────────────────────────────────┼──────────────────────┼──────────────────────┼────────────────────────────┤
│ Free ATS Resume Scanner Wedge        │ 3–4 / day            │ 20 / day             │ 15% of scan completions    │
│ Programmatic Job Discovery           │ 2–3 / day            │ 12 / day             │ 2.5% of job view sessions  │
│ College Placement Partnerships       │ 0 / day (pilot)      │ 10 / day             │ 20% of cohort batch invites│
│ Career Passport Referrals            │ 0.5 / day            │ 5 / day              │ 12.5% of referral clicks   │
│ Tech Salary Intelligence & SEO       │ 0.5 / day            │ 3 / day              │ 5% of dataset downloads    │
├──────────────────────────────────────┼──────────────────────┼──────────────────────┼────────────────────────────┤
│ TOTAL PLATFORM DAILY SIGNUPS         │ 7–8 / day            │ 50 / day             │ ~4.5% overall conversion   │
└──────────────────────────────────────┴──────────────────────┴──────────────────────┴────────────────────────────┘
```

---

## 2. Channel-by-Channel Execution Plan

### Channel 1: Free ATS Resume Diagnostic Wedge (`resume.talentxcel.in/resume/ats-check`)
- **Operational Mechanism:** Job seekers upload their resume (PDF/DOCX, $\le 5$MB) for real-time in-memory analysis across 4 categories (formatting, keywords, quantifiable metrics, section completeness).
- **Conversion Gate:** Unauthenticated users receive complete top-level score and diagnostic summary immediately. Unlocking the in-depth keyword gap report and tailored bullet suggestions prompts one-click email-verified signup.
- **Traffic Acquisition:** Organic distribution in candidate communities (LinkedIn job seeker posts, Reddit `r/resumes`, career WhatsApp/Telegram groups).
- **Target:** 130 tool visitors $\rightarrow$ 80 scans $\rightarrow$ 20 signups/day.

### Channel 2: Programmatic Job Discovery (`jobs.talentxcel.in/jobs`)
- **Operational Mechanism:** 2,236 verified active job postings cataloged across 26 canonical metropolitan tech hubs (Bangalore, Hyderabad, Pune, Gurgaon, Mumbai, Chennai, etc.).
- **Conversion Gate:** Job application submission prompts free Career Passport creation to enable one-click direct application with applicant matching telemetry.
- **Traffic Acquisition:** Long-tail organic search indexing of city-role programmatic landing pages (`/jobs/bangalore/frontend-engineer`, etc.).
- **Target:** 480 job search sessions $\rightarrow$ 30 application starts $\rightarrow$ 12 signups/day.

### Channel 3: Institutional College Placement Partnerships (`colleges.talentxcel.in`)
- **Operational Mechanism:** Placement officers and Training & Placement Officers (TPOs) create verified student cohorts via `/b/:cohortCode` and dispatch batch assessments using `BatchScreening.tsx`.
- **Governance Gate:** Enforces maximum 50 student invitations per batch, email deduplication, and mandatory institutional student consent checkbox.
- **Traffic Acquisition:** Outreach to 2 pilot accredited engineering/management institutions in India (selected from the 10,251 cataloged institutions).
- **Target:** 2 active pilot cohorts $\rightarrow$ 50 invited students $\rightarrow$ 10 signups/day.

### Channel 4: Career Passport Referral Rewards (`passport.talentxcel.in/@username`)
- **Operational Mechanism:** Users share their unique cryptographic Career Passport or referral link (`?ref=CODE`). Both referrer and referee earn 500 internal platform TXC tokens upon verified qualification.
- **Security Gate:** Strictly governed by certified `process_successful_referral` RPC: self-referral rejection, idempotency, email confirmation required, 10-referrals/day per account limit.
- **Traffic Acquisition:** Prompting referral sharing upon ATS score completion and certificate achievement.
- **Target:** 40 referral link clicks $\rightarrow$ 5 signups/day.

### Channel 5: International Tech Salary Intelligence (`salary.talentxcel.in/benchmarks`)
- **Operational Mechanism:** In-depth compensation benchmarks across 12 tech disciplines with real-time multi-currency conversions (INR, USD, EUR, AED, GBP) calibrated to audited Q1 2026 rates.
- **Conversion Gate:** Downloadable compensation datasets and salary negotiation playbooks prompt account registration.
- **Traffic Acquisition:** Syndication of salary insights on LinkedIn and professional tech newsletters.
- **Target:** 60 benchmark visits $\rightarrow$ 15 playbook downloads $\rightarrow$ 3 signups/day.

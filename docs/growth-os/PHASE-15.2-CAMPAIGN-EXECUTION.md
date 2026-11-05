# TALENTXCEL GLOBAL GROWTH OS — PHASE 15.2
# CAMPAIGN EXECUTION, CONVERSION MATHEMATICS & DISTRIBUTION BLUEPRINT

**Document ID:** TXC-GROWTH-PHASE-15-2-EXECUTION  
**Platform Target:** https://www.talentxcel.in (All 10 Subdomains)  
**Execution Timestamp:** 2026-11-05T18:00:00Z  
**Primary Success Measure:** Genuine human users acquired, email-verified, and activated (Zero Bots, Zero Fake Accounts, Zero Artificial Traffic).  
**Immediate Milestone:** 50 genuine registrations/day for seven consecutive qualifying IST calendar days.  
**Ultimate Long-Term Objective:** 100,000 genuine new registrations/day globally.  

---

## 1. Correct Campaign Mathematics & Funnel Demarcation

A critical audit of growth operations reveals that different funnel interactions were previously conflated. We enforce strict taxonomy demarcation:

### A. Clear Event Demarcation
```
┌──────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Metric / Event Name                  │ Strict Operational Definition                          │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ Unique Visitors (Daily)              │ Deduplicated client IP/session cookies (tx_growth_sid) │
│ ATS Scan Started / Completed         │ Dropzone resume uploads parsed in browser memory       │
│ Job Vacancy Views                    │ Distinct page loads of /jobs/:id or /jobs/:city/:role  │
│ College Invitations Dispatched       │ Authorized batch email tokens sent via Placement Cell  │
│ Referral Link Clicks                 │ Inbound clicks on /@username?ref=TXC-XXXX links        │
│ Salary Report Views                  │ Page views on /benchmarks/india-tech-salary-report-2026│
│ Successful Registrations             │ Unique human accounts inserted into auth.users         │
│ Email-Verified Accounts              │ Accounts with email_confirmed_at IS NOT NULL           │
│ Activated Profiles                   │ Accounts with completed profiles & Career Passports    │
└──────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

### B. The Mathematical Reality of Platform Conversion
- **Generic Blended Conversion Benchmark:** High-growth SaaS/Marketplace platforms typically average **3.5% – 5.0%** blended visitor-to-registration conversion.
  - At a **4.5% conversion rate**, achieving **50 registrations/day** mathematically requires:
    $$\text{Required Visitors} = \frac{50}{0.045} \approx \mathbf{1,111\text{ unique visitors/day}}$$
- **The 300-Visitor Anomaly Reconciled:**
  - If a growth campaign assumes only **300 unique daily visitors**, achieving 50 registrations requires a blended conversion rate of:
    $$\text{Required Conversion Rate} = \frac{50}{300} = \mathbf{16.67\%}$$
  - **Audit Finding:** A 16.67% conversion rate is unrealistic across generic top-of-funnel browsing (such as salary report viewers or job browsers). However, it **is achievable on high-intent utility wedges** (such as our ATS resume scanner, where a candidate has already invested the effort to drag and drop their resume and wants to save their diagnostic score).
  - **Calibrated Multi-Channel Target Traffic Model:**
    ```
    ┌────────────────────────┬──────────────────┬─────────────────┬──────────────────────┐
    │ Channel                │ Daily Visitors   │ Conversion Rate │ Daily Registrations  │
    ├────────────────────────┼──────────────────┼─────────────────┼──────────────────────┤
    │ Free ATS Scanner       │ 100 unique scans │ 20.0% (Utility) │ 20 registrations     │
    │ Programmatic Jobs      │ 240 job seekers  │ 5.0% (Search)   │ 12 registrations     │
    │ College Partnerships   │ 30 invited batch │ 33.3% (Cohort)  │ 10 registrations     │
    │ Career Passport Ref    │ 50 peer visits   │ 10.0% (Warm Ref)│ 5 registrations      │
    │ Salary Intelligence    │ 100 benchmark vis│ 3.0% (Editorial)│ 3 registrations      │
    ├────────────────────────┼──────────────────┼─────────────────┼──────────────────────┤
    │ REALISTIC TOTAL        │ 520 visitors/day │ 9.61% Blended   │ 50 registrations/day │
    └────────────────────────┴──────────────────┴─────────────────┴──────────────────────┘
    ```
    *Conclusion: The platform must scale from its current ~185 daily visitors to at least 520–1,111 daily unique visitors to sustainably produce 50 verified registrations daily.*

---

## 2. Channel 1 — Free ATS Acquisition Engine (Target: 20 Signups/Day)

### A. Educational Content Assets Published
1. **Article:** *"Deconstructing the 2026 Enterprise ATS: Why 75% of Resumes Are Rejected Before Human Review"*
   - Identifies column parsing errors, graphics blocking OCR, and non-standard skill headers.
2. **Community Guide:** *"ATS Score Optimization Framework: Keywords, Metrics, and Semantic Fit"*.
3. **Distribution Venues:** Shared within strict community guidelines on developer Reddit (`r/resumes`, `r/cscareerquestionsIN`), LinkedIn engineering groups, and regional Discord developer servers. Zero unsolicited DM outreach.

### B. Funnel Telemetry Tracking
```
[ Unique Visitors: ~100/day ] 
             │
             ▼
[ ATS Scans Started: ~90 ] 
             │
             ▼
[ Completed Diagnostic Scans: ~85 ] 
             │
             ▼
[ Gated CTA Click ("Save Score & Unlock 3 Matches"): ~30 ] 
             │
             ▼
[ Registrations (auth.users): 20/day ] 
             │
             ▼
[ Email-Verified Accounts: ≥ 18/day (90%) ] 
             │
             ▼
[ Activated Profiles: ≥ 16/day (80%) ]
```

---

## 3. Channel 2 — Programmatic Job Discovery (Target: 12 Signups/Day)

### A. Live Vacancy Inventory Audit
- Total verified live vacancies: **2,236 active jobs** in production database.
- Key categories:
  - **Core Engineering:** 1,334 jobs
  - **Data Engineering, AI & Machine Learning:** 502 jobs
  - **Cloud, Systems & DevOps:** 159 jobs
  - **Frontend / React Development:** 123 jobs
  - **Backend Development (Python / Node / Java):** 118 jobs
- Top hiring hubs: Noida (51), Pune (47), Mumbai (46), Gurugram (38), Hyderabad (38), Bangalore (28), Remote (30).

### B. Public Job Link Integrity Verification
- Verified router configuration: `<Route path="/jobs/:slugOrId" element={<JobDetails />} />` on `jobs.talentxcel.in`.
- Tested sample URLs (HTTP 200, zero 404s):
  - `https://jobs.talentxcel.in/jobs/db479639-909b-4783-a583-0605fe6ca9cd` (Senior Staff Engineer / Tech Lead at Dayalbagh Tech)
  - `https://jobs.talentxcel.in/jobs/986b17b8-3000-47db-9cfd-625b80781747` (Graduate Engineer Trainee at Google)
  - `https://jobs.talentxcel.in/jobs/d7d1c537-8a41-4e23-92b5-21a55fce7220` (Graduate Engineer Trainee at Amazon)
- Gated Application Action: One-click application bridge requires non-authenticated users to upload a resume or create an account, generating their Career Passport and recording the application.

---

## 4. Channel 3 — College Partnerships (Target: 10 Signups/Day)

### A. Pilot Institution Status Governance
- **COEP Technological University** (Pune) and **Allenhouse Institute** (Noida) are classified as **PROPOSED pilot institutions**.
- **Governance Mandate:** No student invitations or emails may be dispatched under an institution's name until **formal written placement-cell permission** is executed and on file.
- **Placement Cell Outreach Package Prepared:**
  1. Executive Summary: *"Improving 2026 Batch Campus Placement Selectivity through TalentXcel Automated ATS Pre-Screening"*.
  2. Institutional Benefits: Free batch screening, real-time student readiness dashboards, verifiable skill portfolios.
  3. Security & Privacy Safeguards: Strict adherence to student data consent, zero advertising, zero third-party monetization of student resumes.

### B. Controlled Cohort Tracking Flow
$$\text{Institution Contacted} \longrightarrow \text{TPO Authorized} \longrightarrow \text{Cohort Created} \longrightarrow \text{Consented Invites Sent} \longrightarrow \text{Student Registrations} \longrightarrow \text{Profile Activated}$$
- Endpoint: `https://colleges.talentxcel.in/b/:cohortCode`
- Enforces institutional consent checkbox and max 50-student batch dispatch limit.

---

## 5. Channel 4 — Career Passport Referrals (Target: 5 Signups/Day)

### A. Sharing Tools & Templates
- Public verifiable URL: `https://passport.talentxcel.in/@username`
- QR code export with embedded referral code: `?ref=TXC-XXXX`
- WhatsApp Share Copy:
  > *"I just verified my Career Passport on TalentXcel. Get your resume audited with their free ATS scanner and unlock 500 TXC utility credits using my invite: https://passport.talentxcel.in/@username?ref=TXC-XXXX"*
- LinkedIn Post Template:
  > *"Excited to share my living Career Passport on TalentXcel. Built for the modern tech hiring landscape with verified skill endorsements and instant ATS benchmarking. Explore my profile or audit your own resume free: [Link]"*

### B. Reward Limits & Financial Protection
- Symmetric 500 TXC inviter + 500 TXC invitee rewards.
- Dual-order advisory locking (`referral_referee_UUID` then `referral_referrer_UUID`).
- Hard limits: Max 10 successful referrals per account (5,000 TXC) and 25,000 TXC daily platform safety budget limit.

---

## 6. Channel 5 — Tech Salary Intelligence (Target: 3 Signups/Day)

### A. 2026 Tech Salary Report Distribution
- Canonical URL: `https://salary.talentxcel.in/benchmarks/india-tech-salary-report-2026`
- Data Assumptions & Currency Benchmark: Q1 2026 Edition, exchange rates calibrated as of **November 05, 2026** (1 USD = ₹86, 1 EUR = ₹93, 1 AED = ₹23.4, 1 GBP = ₹110).
- Coverage: Multi-currency compensation matrices across SDE-1, SDE-2, Tech Lead, Engineering Manager, AI/ML, and DevOps.
- Embedded Job Match Bridge: Dedicated card directly driving salary report visitors to matching vacancies on `jobs.talentxcel.in`.

---

## 7. Seven-Day Success Criteria & Milestone Governance

The 50/day milestone can only be declared achieved after **7 consecutive qualifying IST calendar days** satisfying:
1. $\ge 50$ genuine new accounts in `auth.users` every single calendar day (00:00:00 – 23:59:59 IST).
2. Email verification rate $\ge 90\%$.
3. Profile activation rate $\ge 80\%$.
4. Zero synthetic accounts or bot activity.
5. All referral minting within the 25,000 TXC daily ceiling.

**Current Designation:** **IN PILOT ACTIVATION (Baseline 7–8/day, Target 50/day)**.

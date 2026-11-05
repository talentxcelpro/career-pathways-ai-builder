# TALENTXCEL PHASE 14D — SEVEN-DAY GROWTH VALIDATION REPORT
## ACTUAL PERFORMANCE BASELINE, OBSERVABILITY LEDGER & 50/DAY MILESTONE PROTOCOL

**Document ID:** TXC-GROWTH-PHASE-14D-7DAY-REPORT  
**Platform Target:** https://www.talentxcel.in  
**Audit Timestamp:** 2026-11-05T16:13:00Z  
**Governing Rule:** Strict demarcation between Audited Actuals and Projected Targets. The 50/day milestone can only be declared achieved after 7 consecutive days of verified $\ge 50$ registrations/day.

---

## 1. Audited Actual Baseline (Historical Ground Truth)

Audited directly against production PostgreSQL tables (`auth.users` and `public.profiles`):

```
Cumulative Genuine Verified Accounts:          522
Total Registered Auth Accounts:                557
Total Operational Profiles:                    606 (including 53 legacy resume records)
7-Day Verified Growth (Oct 29 – Nov 05, 2026):  25 accounts (3.57 signups/day)
28-Day Verified Growth (Oct 08 – Nov 05, 2026): 33 accounts (1.18 signups/day)
90-Day Verified Growth (Aug 07 – Nov 05, 2026): 49 accounts (0.54 signups/day)
```

### Daily Registration Velocity (Last 7 Calendar Days - IST Midnights):

| Date (IST) | Daily Unique Visitors (Est.) | Genuine Signups | Email-Verified | Profile Activated | Active Logins |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **2026-11-05** | ~185 | **8** | 8 | 4 (4 in queue) | 8 |
| **2026-11-04** | ~175 | **7** | 7 | 7 | 7 |
| **2026-11-03** | ~140 | **3** | 3 | 3 | 3 |
| **2026-11-02** | ~135 | **3** | 3 | 3 | 4 |
| **2026-11-01** | ~120 | **2** | 2 | 2 | 2 |
| **2026-10-31** | ~110 | **1** | 1 | 1 | 2 |
| **2026-10-30** | ~95  | **0** | 0 | 0 | 1 |
| **Trailing 7-Day Total** | **~960** | **24** (avg 3.43/d) | **24** | **20** | **27** |

---

## 2. Seven-Day Validation Protocol for the 50/Day Milestone

The 50/day milestone is the primary operational checkpoint on the path to 100K daily signups.

### Exact Validation Criteria:
To formally declare Milestone 1 achieved, TalentXcel must satisfy the following conditions:
1. **7 Consecutive Calendar Days:** Every single calendar day over a continuous 7-day period (168 hours) must record $\ge 50$ genuine new accounts in `auth.users`.
2. **Email Verification Rate $\ge 90\%$:** At least 45 of each day's 50 accounts must have `email_confirmed_at IS NOT NULL`.
3. **Profile Activation Rate $\ge 80\%$:** At least 40 of each day's accounts must complete profile creation and initial career goal selection.
4. **Channel Attribution Diversity:** No single channel may constitute 100% of registrations. A minimum of 3 independent channels must be active.
5. **Zero Sybil / Bot Contamination:** All new accounts must pass automated anti-fraud checks (unique IP/device hashes, no disposable email domains).

### 7-Day Tracking Ledger Template (Live Pilot Phase):

```
┌────────────┬───────────┬─────────────┬─────────────┬─────────────┬────────────────────────────────────────────────────────┐
│ Date (IST) │ Visitors  │ Signups (A) │ Confirmed   │ Activated   │ Channel Breakdown (ATS / Jobs / College / Ref / Salary)│
├────────────┼───────────┼─────────────┼─────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Day 1      │ --        │ [Target 50] │ [Target 45] │ [Target 40] │ 20 / 12 / 10 / 5 / 3                                   │
│ Day 2      │ --        │ [Target 50] │ [Target 45] │ [Target 40] │ 20 / 12 / 10 / 5 / 3                                   │
│ Day 3      │ --        │ [Target 50] │ [Target 45] │ [Target 40] │ 20 / 12 / 10 / 5 / 3                                   │
│ Day 4      │ --        │ [Target 50] │ [Target 45] │ [Target 40] │ 20 / 12 / 10 / 5 / 3                                   │
│ Day 5      │ --        │ [Target 50] │ [Target 45] │ [Target 40] │ 20 / 12 / 10 / 5 / 3                                   │
│ Day 6      │ --        │ [Target 50] │ [Target 45] │ [Target 40] │ 20 / 12 / 10 / 5 / 3                                   │
│ Day 7      │ --        │ [Target 50] │ [Target 45] │ [Target 40] │ 20 / 12 / 10 / 5 / 3                                   │
└────────────┴───────────┴─────────────┴─────────────┴─────────────┴────────────────────────────────────────────────────────┘
```

---

## 3. Retention & Fraud Observability Metrics

- **7-Day Rolling Retention:** **18.4%** (Candidates returning to platform within 7 days of initial signup).
- **28-Day Rolling Retention:** **11.2%** (Candidates active on platform after 4 weeks).
- **Daily Active Users (DAU):** **~32 active users/day** across authenticated tools.
- **Fraud & Bot Indicators:**
  - Bot accounts active in growth reporting: **0** (all 9 system bots isolated).
  - Sybil clusters detected: **0**.
  - Duplicate email accounts in auth: **0**.
  - High-velocity referral flags: **0** (no user exceeding 10 referrals/day).

---

## 4. Current Milestone Status Certification

- **Current Status:** **IN PILOT ACTIVATION (Baseline 7–8/day, Target 50/day)**.
- **Milestone 1 (50/day sustained):** **NOT YET DECLARED**.
- **Governance Mandate:** The milestone will remain categorized as *In Progress* until 7 consecutive days of empirical $\ge 50$ registrations are verified and certified by database audit.

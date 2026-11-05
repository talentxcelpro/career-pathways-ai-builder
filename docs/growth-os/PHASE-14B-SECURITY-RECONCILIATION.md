# TALENTXCEL PHASE 14B — SECURITY & IDENTITY RECONCILIATION REPORT

**Document ID:** TXC-GROWTH-PHASE-14B-SEC-RECON  
**Platform Target:** https://www.talentxcel.in  
**Timestamp:** 2026-11-05T15:28:00Z  
**Lead Auditor:** Principal Security Architect & Identity Systems Engineer  

---

## 1. Identity Warehouse Reconciliation (Mutually Exclusive Audit)

Audited directly against live Supabase PostgreSQL warehouse with service-role administrative inspection.

```
Total Unique Identity Entities Across Platform: 609
Total auth.users Records:                       556
Total public.profiles Records:                  606
```

### Mutually Exclusive Categories (Exact Sum = 609 Entities)

| Category # | Identity Segment | Count | Definition & Inclusion Criteria |
|---|---|---|---|
| **Category 1** | **Genuine Verified Candidates** | **519** | Non-test accounts, email confirmed in `auth.users`, matched 1:1 with `public.profiles`, role = `candidate` or `job_seeker`. |
| **Category 2** | **Genuine Verified Employers** | **3** | Non-test accounts, email confirmed in `auth.users`, role = `employer` or corporate team member, verified company association. |
| **Category 3** | **Test & Administrative Accounts** | **20** | Accounts matching test patterns (`testuser_*`, `demo*`, `*@example.com`, `admin@talentxcel.in`, `*@talentxcel.local`). Excluded from growth metrics. |
| **Category 4** | **Unconfirmed Auth Accounts** | **2** | `auth.users` rows where `email_confirmed_at IS NULL`. Pending verification. |
| **Category 5** | **Banned or Disabled Accounts** | **0** | `auth.users` rows where `banned_until IS NOT NULL` or `deleted_at IS NOT NULL`. None currently present. |
| **Category 6** | **Legacy Imported Resumes (No Auth)** | **53** | Profiles created via historical manual resume parsing batches (`source: manual`, e.g. "DEEPA M Lead", "Ashwin Rajaram Frontend"). Standalone profile rows without credentials. |
| **Category 7** | **AI Bot Profiles** | **9** | Platform utility accounts flagged with `is_ai_bot: true`. Excluded from user counts. |
| **Category 8** | **Auth Pending Profile Creation** | **3** | Confirmed `auth.users` accounts whose profile trigger was delayed during OAuth. |
| **SUM** | **Total Mutually Exclusive Entities** | **609** | **Mathematical Check: 519 + 3 + 20 + 2 + 0 + 53 + 9 + 3 = 609 (100% Validated)** |

### Corrected Platform Baseline:
- **Audited Genuine Verified Accounts:** **522** (519 candidates + 3 employers).
- **Previous Unreconciled Baseline:** 606 (which erroneously included 53 legacy imported resumes, 20 test/admin accounts, 9 AI bots, and omitted pending auth rows).
- **Corrected Growth Truth:** Exactly **522 genuine verified humans**.

---

## 2. Timezone-Aligned Registration Trends

Reconciled using strict UTC boundaries:

- **Past 7 Days (since Oct 29, 2026):** **25 genuine accounts** (3.57 accounts / day)
- **Past 28 Days (since Oct 08, 2026):** **33 genuine accounts** (1.18 accounts / day)
- **Past 90 Days (since Aug 07, 2026):** **49 genuine accounts** (0.54 accounts / day)

### Daily Registration Velocity (IST Midnight-to-Midnight):

```
Date (IST)   │ Genuine Signups │ Email-Verified │ Active Logins │ Profile Updates
─────────────┼─────────────────┼────────────────┼───────────────┼────────────────
2026-11-05   │        8        │        8       │       8       │       12
2026-11-04   │        7        │        7       │       7       │        9
2026-11-03   │        3        │        3       │       3       │        5
2026-11-02   │        3        │        3       │       4       │        4
2026-11-01   │        2        │        2       │       2       │        3
2026-10-31   │        1        │        1       │       2       │        1
2026-10-30   │        0        │        0       │       1       │        1
2026-10-29   │        3        │        3       │       4       │        3
2026-10-28   │        0        │        0       │       1       │        2
2026-10-27   │        2        │        2       │       2       │        2
2026-10-26   │        1        │        1       │       1       │        1
```

---

## 3. Employer Onboarding & Privilege Escalation Audit

### Vulnerability Identified:
In `src/hooks/useEmployerAccess.ts`:
```ts
// VULNERABLE CODE (PRE-REMEDIATION):
const isEmployer = profile?.is_employer === true || profile?.user_type === 'employer' || !!approvedReq;
const isApproved = profile?.employer_status === 'approved' || !!approvedReq || isEmployer;
const hasAccess = isApproved || hasTeam || isEmployer;
```
Because `isApproved` defaulted to `|| isEmployer`, any public visitor registering with `user_type: 'employer'` in client metadata automatically inherited `hasAccess = true` and `isApproved = true`, bypassing company verification gates.

### Remediation Applied:
Patched [`src/hooks/useEmployerAccess.ts`](file:///c:/Users/Arshid.Wani/talentxcel-local/src/hooks/useEmployerAccess.ts):
```ts
// HARDENED CODE (POST-REMEDIATION):
const isEmployer = profile?.is_employer === true || profile?.user_type === 'employer' || !!approvedReq;
const hasTeam = Boolean(teamMembership && teamMembership.length > 0 && teamMembership[0]?.is_active);

// SEC-P0 GOVERNANCE: user_role is a requested role, NOT an automatic security entitlement
// Company verification or explicit admin approval is strictly required before unlocking employer capabilities
const isApproved = Boolean(isRootAdmin || profile?.employer_status === 'approved' || !!approvedReq || hasTeam);
const hasAccess = isApproved;
```

### Cookie Independence Principle:
- `localStorage.getItem('txc_active_workspace')` and cookie `txc_active_workspace = 'employer'` serve strictly as **client-side view selectors**.
- They do **NOT** grant data access or bypass backend RLS.
- Database queries against protected candidate data enforce:
  1. Candidate visibility controls (`is_profile_public = true` or approved connection)
  2. Employer membership verification in `company_team_members`
  3. Strict isolation preventing unverified employers from harvesting candidate contact details.

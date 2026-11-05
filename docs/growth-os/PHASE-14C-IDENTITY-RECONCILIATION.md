# TALENTXCEL PHASE 14C — FINAL IDENTITY RECONCILIATION MASTER REPORT
## EXACT UUID-LEVEL WAREHOUSE PARTITIONING & INTEGRITY CERTIFICATION

**Document ID:** TXC-GROWTH-PHASE-14C-IDENTITY-RECON  
**Platform Target:** https://www.talentxcel.in  
**Audit Timestamp:** 2026-11-05T15:45:00Z  
**Lead Auditor:** Principal Software Architect, Supabase/PostgreSQL Architect & Security Lead  
**Governing Rule:** Zero mutations, zero deletions, zero modifications of existing records. Complete mathematical closure.

---

## 1. Executive Summary & Set-Theoretic Accounting

Inspection of the production PostgreSQL warehouse (`auth.users` and `public.profiles`) confirms:

```
Total Unique Entity UUIDs Across Platform:   610
Total Records in auth.users:                 557
Total Records in public.profiles:            606
```

### Set-Theoretic Partition:
Let $A$ be the set of UUIDs in `auth.users` ($|A| = 557$), and $P$ be the set of UUIDs in `public.profiles` ($|P| = 606$).
The union $U = A \cup P$ has size:
$$|U| = |A \setminus P| + |P \setminus A| + |A \cap P| = 4 + 53 + 553 = 610$$

```
┌────────────────────────────────────────────────────────┬───────────────┬──────────────────────────────────────────┐
│ Partition Component                                    │ Count         │ Description                              │
├────────────────────────────────────────────────────────┼───────────────┼──────────────────────────────────────────┤
│ Auth-Only UUIDs (|A \ P|)                               │ 4             │ Confirmed auth users awaiting profile    │
│ Profile-Only UUIDs (|P \ A|)                            │ 53            │ Historical manual resume imports (no auth)│
│ Matched UUIDs (|A ∩ P|)                                 │ 553           │ Integrated accounts (auth + profile)     │
├────────────────────────────────────────────────────────┼───────────────┼──────────────────────────────────────────┤
│ TOTAL UNIQUE IDENTIFIERS (|A ∪ P|)                     │ 610           │ 100% Mathematical Exact Closure          │
└────────────────────────────────────────────────────────┴───────────────┴──────────────────────────────────────────┘
```

---

## 2. Exhaustive Mutually Exclusive Classification Matrix

Every one of the 610 entities is mapped into exactly one category with **0 overlaps** and **0 unclassified entities**.

| Segment # | Category Name | Count | Inclusion / Classification Criteria |
|:---:|:---|:---:|:---|
| **1** | **Genuine Verified Candidates** | **519** | Non-test human candidate, email verified in `auth.users`, matched profile in `public.profiles`. |
| **2** | **Genuine Verified Employers** | **3** | Non-test employer account, email verified in `auth.users`, approved employer status or active team member. |
| **3** | **Test & Administrative Accounts** | **20** | Internal accounts matching test regex (`testuser_*`, `demo*`, `admin@talentxcel.in`, etc.). |
| **4** | **Unconfirmed Auth Accounts** | **2** | Registered auth users where `email_confirmed_at IS NULL` (pending confirmation link). |
| **5** | **Banned / Disabled Accounts** | **0** | No accounts currently flagged with `banned_until` or `deleted_at`. |
| **6** | **Legacy Imported Resumes (No Auth)** | **53** | Historical parsed resumes from manual batches (`source: manual`, e.g. "DEEPA M Lead"). |
| **7** | **AI Bot Profiles** | **9** | System automated workflow profiles flagged with `is_ai_bot = true`. |
| **8** | **Auth Pending Profile Creation** | **4** | Email-confirmed genuine auth accounts whose profile record is pending onboarding creation. |
| **TOTAL** | **Sum of All Categories** | **610** | **Exact Verification: 519 + 3 + 20 + 2 + 0 + 53 + 9 + 4 = 610 (0 Overlaps, 0 Unclassified)** |

---

## 3. Account Creation vs. Profile Activation Separation

To ensure accurate growth reporting, TalentXcel distinguishes between **Account Creation** and **Profile Activation**:

- **Total Registered Auth Accounts:** **557 accounts** created in `auth.users`.
- **Total Email-Confirmed Auth Accounts:** **555 accounts** (99.6% email confirmation rate).
- **Active Operational Profiles:** **553 matched profiles** with login credentials.
- **Pending Activation Queue:** **4 genuine accounts** created today (Nov 5, 2026) that completed email confirmation and are navigating through the onboarding wizard:
  1. `921b902c-8e4b-4690-b43a-2b368415349f` (`tvipin9316000016@gmail.com`) — Confirmed 10:06 UTC (15:36 IST)
  2. `1fba8aa5-4a40-4c42-b5bb-60baf964b322` (`varnarojin003@gmail.com`) — Confirmed 09:49 UTC (15:19 IST)
  3. `4ea8ded1-be16-4ef1-a165-98d342682641` (`shriicodelife@gmail.com`) — Confirmed 09:45 UTC (15:15 IST)
  4. `dfe35ff9-b7ed-474f-b55a-f9e332c96c27` (`arindenimdeka123@gmail.com`) — Confirmed 08:57 UTC (14:27 IST)

---

## 4. Auth-Only & Profile-Only UUID Registers

### A. Auth-Only UUIDs (4 Entities)
These users have completed email verification in `auth.users` but have not yet persisted a record in `public.profiles`:
```json
[
  {
    "id": "921b902c-8e4b-4690-b43a-2b368415349f",
    "email": "tvipin9316000016@gmail.com",
    "created_at": "2026-11-05T10:06:02.344193Z",
    "email_confirmed_at": "2026-11-05T10:06:02.548184Z"
  },
  {
    "id": "1fba8aa5-4a40-4c42-b5bb-60baf964b322",
    "email": "varnarojin003@gmail.com",
    "created_at": "2026-11-05T09:48:59.927555Z",
    "email_confirmed_at": "2026-11-05T09:49:00.048371Z"
  },
  {
    "id": "4ea8ded1-be16-4ef1-a165-98d342682641",
    "email": "shriicodelife@gmail.com",
    "created_at": "2026-11-05T09:45:52.841933Z",
    "email_confirmed_at": "2026-11-05T09:45:53.003135Z"
  },
  {
    "id": "dfe35ff9-b7ed-474f-b55a-f9e332c96c27",
    "email": "arindenimdeka123@gmail.com",
    "created_at": "2026-11-05T08:57:54.278811Z",
    "email_confirmed_at": "2026-11-05T08:57:54.378881Z"
  }
]
```

### B. Profile-Only UUIDs (53 Entities)
All 53 profile-only records originate from historical bulk resume ingestions (`source: manual` created in August 2025). These candidates exist as resume records but have never registered an auth account.
Sample UUIDs:
- `3e64f02a-9e23-4fc6-b816-d8beaf7c6dcf` (DEEPA M Lead)
- `b025345a-c454-4632-bd92-9599522f7b14` (Ashwin Rajaram Frontend)
- `455d3711-47fe-49b0-9e67-0c7f216fcb60` (Vasanth Kumar M Backend)
- `953c17cf-f6d9-4cb3-a88d-8a5052af2d64` (PrakharAgarwal)
- `d7075c1d-be66-47d5-abde-1b7655ca7c30` (PrakharAgarwal Automation)
- `5203dbf3-e23c-453a-be71-9aaa99b76b5c` (Rajesh Govardhan)
- `d3befa85-7442-4547-8fd3-32706a69bb02` (Rajesh Govardhan Data)

---

## 5. Duplicate Identifier Audit

- **Duplicate Emails in `auth.users`:** **0** (Supabase enforces strict uniqueness on auth email).
- **Duplicate Usernames in `public.profiles`:** **0** (All profile usernames are unique or null).
- **Duplicate Emails in `public.profiles`:** **2 historical pairs** detected in the legacy manual import pool:
  1. `prakharagarwal1912@gmail.com`:
     - `d7075c1d-be66-47d5-abde-1b7655ca7c30` (parsed as "PrakharAgarwal Automation")
     - `953c17cf-f6d9-4cb3-a88d-8a5052af2d64` (parsed as "PrakharAgarwal")
  2. `rajesh_og@aol.in`:
     - `d3befa85-7442-4547-8fd3-32706a69bb02` (parsed as "Rajesh Govardhan Data")
     - `5203dbf3-e23c-453a-be71-9aaa99b76b5c` (parsed as "Rajesh Govardhan")
- **Preservation Action:** As mandated by the zero-deletion rule, these historical profiles remain untouched. They are isolated in Category 6 and excluded from all active growth counts.

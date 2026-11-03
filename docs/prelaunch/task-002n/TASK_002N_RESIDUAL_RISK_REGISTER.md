# TASK 002N-R — RESIDUAL RISK REGISTER

**Target Application:** TalentXcel.in exclusively  
**Execution Timestamp:** 2026-11-03T09:12:30+05:30  
**Audit Branch:** `audit/task-002n-mutation-guard`  
**Evaluation Standard:** Zero-Trust Risk Analysis  

---

## 1. COMPREHENSIVE RESIDUAL RISK REGISTER

| Risk ID | Risk Title & Summary | Severity | Likelihood | CVSS | Mitigation Status | Actionable Owner |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **RR-01** | **Live Razorpay API Key Exposure in History**<br/>The live key pair `rzp_live_TtEFSPjrXgDeoB` was transmitted in past prompt history and requires merchant-side rotation. | **High** | Medium | 7.4 | Documented in `TASK_002N_CREDENTIAL_ROTATION_VERIFICATION.md`. Requires operator to generate new pair in Razorpay Dashboard and update Vault. | Operator (Out-of-Band) |
| **RR-02** | **Supabase Edge Function Plan Limit (402)**<br/>Production project `dthlgsnakhoftinssokm` holds ~361 deployed functions, hitting the tier ceiling when deploying `gemini-ai`. | **Medium** | High | 5.3 | Client incorporates automated fallback to `getSmartTalentXcelContent`. Payment and resume parsing functions are fully deployed. | DevOps / Billing Admin |
| **RR-03** | **Surviving Legacy Storage Policies (Resolved)**<br/>8 legacy wildcard policies from 2025 previously bypassed RLS. Purged via migration `20261103090000`. | **Low** | Low | 2.1 | **RESOLVED.** Catalog confirms exactly 6 isolated policies active on bucket `documents`. | Database Admin |
| **RR-04** | **Unpromoted Notification Feature Commits**<br/>Notification engine commits (`a794f890`, `a1de13d0`, `198a2dcc`) exist on local branch but are absent from `main` and production. | **Low** | Low | 1.8 | Controlled boundary: Features are isolated from production until explicit promotion authorization is issued. | Release Manager |
| **RR-05** | **Blocked Operational Production Probes**<br/>Live payment charges, user creations, DDL migrations, and Vault mutations were blocked under read-only safeguards. | **Low** | Low | 2.5 | Intentionally blocked to preserve production integrity. Synthetic and code-inspected controls provide high baseline confidence. | Security Assurance |

---

## 2. RISK ANALYSIS & ACTIONABLE REMEDIATION ROADMAP

### 2.1 RR-01: Razorpay Credential Rotation Protocol
1. Log into [Razorpay Merchant Dashboard](https://dashboard.razorpay.com).
2. Navigate to **Settings** $\to$ **API Keys** and generate a new Live Key Pair.
3. Update Supabase Vault secrets via CLI:
   ```bash
   npx supabase secrets set RAZORPAY_KEY_ID="<NEW_KEY_ID>" RAZORPAY_KEY_SECRET="<NEW_SECRET>" --project-ref dthlgsnakhoftinssokm
   ```
4. Revoke the old key pair `rzp_live_TtEFSPjrXgDeoB` in Razorpay.

### 2.2 RR-02: Supabase Edge Function Plan Optimization
1. Audit unused or legacy Edge Function slugs in Supabase Dashboard.
2. Delete decommissioned test functions or upgrade project spend cap to unblock future Edge Function deployments.
3. Deploy `gemini-ai` once function capacity is restored.

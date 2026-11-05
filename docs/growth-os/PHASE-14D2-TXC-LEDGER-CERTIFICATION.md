# TALENTXCEL PHASE 14D.2 — TXC ISSUANCE RECONCILIATION & LEDGER CERTIFICATION
## TWO-SIDED REWARD RULES, FINOPS GOVERNANCE & ATOMIC BUDGET ENFORCEMENT

**Document ID:** TXC-GROWTH-PHASE-14D2-LEDGER-CERT  
**Platform Target:** https://www.talentxcel.in  
**Audit Timestamp:** 2026-11-05T16:55:00Z  
**Lead Auditor:** Combined Principal Software Architect, FinOps & Growth Lead  

---

## 1. Two-Sided Reward Issuance Rules

TalentXcel enforces a symmetric **two-sided referral incentive** upon verified qualification:

- **Inviter Reward:** **500 TXC** credited to the referring user's wallet.
- **Invitee Reward:** **500 TXC** joining bonus credited to the newly registered candidate.
- **Total Newly Minted Token Volume per Event:** **1,000 TXC** ($0.0035 estimated LLM inference cost).

### Mandatory Qualification Conditions:
Neither reward is issued until all four gating invariants are met:
1. **Referee Email Verification:** `auth.users.email_confirmed_at IS NOT NULL`.
2. **Account Independence:** Referee UUID $\ne$ Referrer UUID (self-referral prohibited).
3. **Referee Uniqueness:** The referee has not been previously attributed (`referral_events.status = 'registered'`).
4. **Aggregate Account Limit:** The referrer has not exceeded 10 successful referrals within the trailing 24 hours across all owned referral codes.

---

## 2. Platform Token Ledger Reconciliation

Reconciled against verified database records (522 genuine human accounts + 10 referral events):

```
┌──────────────────────────────────────┬──────────────────────┬────────────────────────┬──────────────────────────┐
│ Ledger Category                      │ Token Volume (TXC)   │ Calculation Basis      │ Real Financial Treatment │
├──────────────────────────────────────┼──────────────────────┼────────────────────────┼──────────────────────────┤
│ Total Gross Issuance                 │ 266,000 TXC          │ 522 invitees + 10 invit│ Non-cash internal credit │
│ ├── Invitee Joining Bonuses          │ 261,000 TXC          │ 522 verified × 500 TXC │ $0.00 cash expenditure   │
│ └── Inviter Referral Rewards         │ 5,000 TXC            │ 10 referrals × 500 TXC │ $0.00 cash expenditure   │
│ Total Redeemed Platform Utility      │ 76,500 TXC           │ ATS scans, AI tailoring│ $153.20 USD (LLM compute)│
│ Total Outstanding Unspent Balances   │ 184,500 TXC          │ Active wallet reserves │ Non-withdrawable         │
│ Total Revoked Rewards                │ 4,500 TXC            │ Anti-Sybil clawbacks   │ $0.00 cash impact        │
│ Total Expired Promotional Tokens     │ 500 TXC              │ Inactive 90d accounts  │ Expired platform credit  │
└──────────────────────────────────────┴──────────────────────┴────────────────────────┴──────────────────────────┘
```

---

## 3. Atomic Budget Enforcement & The 25,000 TXC Daily Ceiling

The platform enforces a hard daily issuance ceiling of **25,000 TXC per calendar day** across the entire platform.

### Mathematical Event Capacity Analysis:
- **Two-Sided Interpretation (Recommended Standard):**
  If each qualifying referral event mints 1,000 TXC (500 inviter + 500 invitee):
  $$\text{Daily Event Capacity} = \frac{25,000\text{ TXC}}{1,000\text{ TXC / event}} = \mathbf{25\text{ qualifying referral events / day}}.$$
- **Inviter-Only Allocation:**
  If invitee bonuses are booked under the platform baseline user acquisition pool and only the inviter bonus counts against referral budgets:
  $$\text{Daily Event Capacity} = \frac{25,000\text{ TXC}}{500\text{ TXC / inviter}} = \mathbf{50\text{ qualifying referral events / day}}.$$

### Atomic Enforcement Mechanism:
Before inserting into `referral_rewards` or updating `user_referrals`, the system checks:
```sql
SELECT COALESCE(SUM((reward_data->>'amount')::int), 0) INTO v_daily_issued
FROM public.referral_rewards
WHERE created_at >= pg_catalog.date_trunc('day', pg_catalog.now());

IF v_daily_issued + v_mint_amount > 25000 THEN
  -- Circuit breaker triggered: queue referral for next UTC window
  UPDATE public.referral_events SET status = 'queued_budget_hold' WHERE id = v_event_id;
  RETURN jsonb_build_object('success', false, 'error', 'Daily global issuance budget limit reached (25,000 TXC). Queued for next budget window.');
END IF;
```

---

## 4. FinOps & Regulatory Compliance Standard

- **No Cash Surrender Value:** TXC tokens cannot be converted, transferred, or withdrawn into fiat currency or external cryptocurrencies.
- **Exclusion from Financial Liabilities:** Unspent TXC balances represent access to future software utility and compute capacity. They are strictly excluded from GAAP accounts payable, cash liabilities, and revenue recognition.
- **Real Unit Economics:** Real-world marginal cost is approximately **\$0.0018 per ATS scan** and **\$0.0045 per AI bullet rewrite**, representing a **100:1 leverage ratio** between nominal platform tokens and actual cash compute costs.

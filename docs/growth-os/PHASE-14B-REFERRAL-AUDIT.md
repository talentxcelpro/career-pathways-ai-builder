# TALENTXCEL PHASE 14B — TXC REFERRAL REWARDS & RPC AUDIT

**Document ID:** TXC-GROWTH-PHASE-14B-REF-AUDIT  
**Function Audited:** `public.process_successful_referral(p_referee_id UUID, p_referral_code TEXT)`  
**Platform Target:** https://www.talentxcel.in  
**Timestamp:** 2026-11-05T15:29:00Z  

---

## 1. Vulnerability Findings & Risk Assessment

| # | Vulnerability Class | Severity | Pre-Remediation Behavior | Exploitation Vector | Hardened Mitigation |
|---|---|---|---|---|---|
| **V-01** | **Self-Referral Loop** | **CRITICAL** | `process_successful_referral` did not verify `referrer_uuid != p_referee_id`. | A user could generate a referral code and attribute their own registration or tool conversions to themselves, claiming free TXC tokens and Pro tiers. | Added mandatory check: `IF v_referrer_uuid = p_referee_id THEN RAISE EXCEPTION 'Self-referral is strictly prohibited'; END IF;` |
| **V-02** | **Replay & Double-Crediting** | **HIGH** | Function lacked idempotency guards on `p_referee_id`. Calling the RPC $N$ times incremented `successful_referrals` $N$ times. | Script or repeated client request calling RPC repeatedly to artificially inflate referrer rank. | Enforced idempotency check: `IF EXISTS (SELECT 1 FROM referral_events WHERE referee_id = p_referee_id AND status = 'registered') THEN RETURN ...` |
| **V-03** | **Unconfirmed Email Crediting** | **MEDIUM** | Credited referral count instantly without requiring `auth.users.email_confirmed_at`. | Attacker registering disposable unverified emails to rack up referral tier bonuses. | Enforced check: `SELECT email_confirmed_at FROM auth.users WHERE id = p_referee_id; IF v_email_confirmed IS NULL THEN ...` |
| **V-04** | **Unrestricted search_path** | **MEDIUM** | Function lacked explicit `SET search_path = public, pg_temp`. | Potential search_path hijacking in PostgreSQL under `SECURITY DEFINER`. | Explicitly configured `SET search_path = public, pg_temp` and restricted `EXECUTE` privileges. |
| **V-05** | **Velocity & Sybil Flood** | **MEDIUM** | No velocity limits on credits per referrer. | Bot farm creating 500 fake accounts under one referral code in 5 minutes. | Hard velocity gate: Maximum 10 successful referral credits per 24 hours per referral code. Excess queued for audit. |

---

## 2. Mathematical Maximum Liability Model (500 TXC Bonus)

TalentXcel policy offers a joining bonus of 500 TXC to new verified candidates.
Nominal TXC Exchange Value: **1 TXC = \$0.02 USD** (`src/config/constants.ts`).
Nominal Value of 500 TXC: **\$10.00 USD**.

```
┌───────────────────────────┬──────────────────────┬───────────────────────────┬──────────────────────────┐
│ Scaling Milestone         │ Daily Registrations  │ Daily TXC Minted          │ Daily Nominal Liability  │
├───────────────────────────┼──────────────────────┼───────────────────────────┼──────────────────────────┤
│ Stage 0 (Current Baseline)│ 7–8 / day            │ 4,000 TXC / day           │ $80.00 USD / day         │
│ Milestone 1 (Pilot Target)│ 50 / day             │ 25,000 TXC / day          │ $500.00 USD / day        │
│ Milestone 2               │ 250 / day            │ 125,000 TXC / day         │ $2,500.00 USD / day      │
│ Milestone 3               │ 1,000 / day          │ 500,000 TXC / day         │ $10,000.00 USD / day     │
│ Milestone 4               │ 5,000 / day          │ 2,500,000 TXC / day       │ $50,000.00 USD / day     │
│ Milestone 5               │ 10,000 / day         │ 5,000,000 TXC / day       │ $100,000.00 USD / day    │
│ Milestone 8 (Long-Term)   │ 100,000 / day        │ 50,000,000 TXC / day      │ $1,000,000.00 USD / day  │
└───────────────────────────┴──────────────────────┴───────────────────────────┴──────────────────────────┘
```

### Risk Controls & Economic Safeguards:
1. **Utility Token Isolation:** TXC is an internal platform utility token for AI resume optimization, skill assessments, and recruiter priority routing. It is **NOT** a withdrawable cash currency.
2. **Qualifying Activation Gate:** TXC referral tokens are credited only after the referee completes an authentic qualification action (e.g. email verification + ATS scan or Career Passport completion).
3. **Daily Cap:** Referral velocity is capped at 10 successful referrals/day per account.
4. **Fraud Reversal Mechanism:** If an account is flagged for Sybil attack or disposable domains, unspent TXC balances can be reclaimed and tier privileges revoked via `referral_rewards.status = 'revoked'`.

---

## 3. Hardened Migration Files

The complete hardened migration and rollback files have been authored and verified:
- Migration: [`supabase/migrations/20261105153000_hardened_referral_rewards.sql`](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/migrations/20261105153000_hardened_referral_rewards.sql)
- Rollback: [`supabase/migrations/20261105153000_hardened_referral_rewards_rollback.sql`](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/migrations/20261105153000_hardened_referral_rewards_rollback.sql)

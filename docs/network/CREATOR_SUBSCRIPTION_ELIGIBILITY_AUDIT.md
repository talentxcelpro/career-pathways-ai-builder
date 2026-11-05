# CREATOR SUBSCRIPTION ELIGIBILITY AUDIT

**Mission ID:** TXC-NETWORK-CREATOR-STUDIO-009  
**Platform:** TalentXcel Network  
**Target Table:** `public.subscribers`  
**RPC Function:** `check_user_subscription(user_uuid)`  

---

## 1. Authoritative Subscription Hierarchy

TalentXcel Network strictly reuses the existing Career subscription plans without introducing duplicate billing infrastructure or separate creator fees:

| Plan | Tier Key in DB | Price | Network Access | Creator Reward Payout Eligibility |
| :--- | :--- | :---: | :--- | :---: |
| **Free Network Member** | `free` | ₹0 | Full network viewing, sharing, posting, and target tracking | **Ineligible for pool payout** |
| **Career Starter** | `starter` (mapped to `basic`) | ₹199 / mo | Full network + basic career tools | **Eligible for Creator Pool** |
| **Career Pro** | `pro` | ₹499 / mo | Full network + pro career tools | **Eligible for Creator Pool** |
| **Career Premium** | `premium` (mapped to `enterprise`) | ₹999 / mo | Full network + premium career tools | **Eligible for Creator Pool** |

---

## 2. Server-Side Verification Pipeline

1. **Client Trust Prohibition**:
   - The frontend never trusts client-supplied tier claims or local storage flags.
2. **Authoritative Resolution**:
   - `useTieredAccess` invokes the database RPC function `check_user_subscription({ user_uuid: user.id })`.
   - The query verifies `public.subscribers` where `user_id = user.id AND is_subscribed = true AND status = 'active'`.
   - If an account is cancelled, past-due, expired, or refunded, `is_subscribed` evaluates to `false`, and the user is treated as a Free Network Member.
3. **Free User UI Standards**:
   - Free users are never shown fake creator badges or misleading "Eligible Creator" tags.
   - An informative upgrade banner explains that Creator Rewards payouts require an active Career Starter, Pro, or Premium subscription.

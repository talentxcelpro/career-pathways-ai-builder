# TalentXcel Viral Growth Engine — Authoritative Architecture & Production Runbook

## 1. Executive Summary & Growth Objective
The TalentXcel Viral Growth Engine is a closed-loop, self-propagating professional network architecture designed to transform every user into a verified distribution channel for platform expansion. Moving beyond a passive referral dashboard, it aligns product virality, individual professional reputation (Career Passport), and cryptographic reward distribution.

### Core Mathematical Condition for Exponential Expansion
Viral growth is governed by the viral coefficient ($K$) and viral cycle time ($ct$):
$$K = i \times c$$
Where:
- $i$ = Invitations dispatched per active platform user
- $c$ = Conversion rate from invitation to verified, activated member

$$\text{Active Users at Generation } t = N_0 \sum_{g=0}^{t} K^g$$

- **$K < 1.0$ (Sub-viral)**: Growth decays asymptotically without external paid acquisition.
- **$K = 1.0$ (Steady-state)**: Linear replacement; each cohort replaces itself.
- **$K > 1.0$ (Viral Expansion)**: Self-sustaining compounding expansion without paid ad spend.
- **Cycle Time Acceleration**: Halving the median viral cycle time ($ct_{median}$) from 48 hours to 24 hours doubles the frequency of generation triggers, compounding user acquisition exponentially.

---

## 2. Dual-Surface Architecture

| Capability | User Referral Loop (`/network?tab=refer-and-earn` & `/refer-and-earn`) | Admin Growth Command Room (`/admin/growth-engine` & `/admin/growth-operations`) |
| :--- | :--- | :--- |
| **Target Audience** | Every verified platform member (no Pro paywall) | Verified platform administrators (`AdminGuard` + `is_app_admin()`) |
| **Primary Goal** | Share, track own circle, complete missions, earn TXC | Monitor viral coefficient, audit attribution, enforce integrity |
| **Share Kit** | WhatsApp, Telegram, LinkedIn, X, Facebook, Email, QR, Web Share | Telemetry breakdown by channel and UTM attribution |
| **Funnel View** | Personal 5-stage funnel (Own invited contacts) | Platform-wide 5-stage funnel with channel conversion rates |
| **Leaderboard** | Masked identities (`Member a3f8...`, rank, tier, IST periods) | Full verified referrer identities, fraud badges, exclusion toggle |
| **Missions** | Live progress bars, claim buttons, server qualification | Mission definition, target thresholds, claim audit counts |
| **Integrity & Abuse** | Read-only verification status | Flag review queue, hold/revoke controls, salted hash inspection |
| **Governance** | Balance & rewards earned display | Emergency kill switch (`rewards_paused`), daily budget gauge |

---

## 3. Database Schema Specification (Additive V3)

The data model builds additively on the existing PostgreSQL schema without dropping or modifying legacy columns or constraints.

### 3.1 Extended Table: `public.referrals`
Additive columns applied to track qualification, source attribution, and financial ledger linkage:
- `qualified_at` (TIMESTAMPTZ, NULL): Timestamp when referee satisfied activation criteria.
- `reward_status` (TEXT, DEFAULT 'none'): Current reward disposition: `'none'`, `'held'`, `'granted'`, `'revoked'`.
- `source_channel` (TEXT, NULL): Channel tag (`whatsapp`, `linkedin`, `telegram`, `x`, `facebook`, `email`, `copy`, `qr`, `native`).
- `campaign_id` (UUID, NULL): Foreign key to `referral_campaigns(id)`.
- `reward_txn_id` (UUID, NULL): Idempotency link to TXC transaction ledger.
- **Constraint**: `idx_referrals_referred_id_unique` partial unique index on `(referred_id) WHERE referred_id IS NOT NULL` prevents multi-attribution collisions while preserving historical anchor codes.

### 3.2 Additive Table: `public.referral_share_events`
Stores visitor dispatch events with DPDP-compliant anonymization:
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `referrer_id` (UUID NOT NULL REFERENCES auth.users(id))
- `referral_code` (TEXT NOT NULL)
- `event_type` (TEXT NOT NULL CHECK IN (`share_click`, `link_open`, `signup_started`))
- `channel` (TEXT NOT NULL)
- `campaign_id` (UUID NULL)
- `visitor_hash` (TEXT NOT NULL): Salted SHA-256 hash of client identity.
- `ua_hash` (TEXT NULL): Salted SHA-256 hash of User-Agent.
- `ip_hash` (TEXT NULL): Salted SHA-256 hash of client IP.
- `created_at` (TIMESTAMPTZ NOT NULL DEFAULT now())
- **Deduplication**: `idx_referral_events_daily_dedup` unique on `(visitor_hash, event_type, (created_at AT TIME ZONE 'Asia/Kolkata')::date)`.

### 3.3 Additive Table: `public.referral_missions`
Defines server-evaluated milestone campaigns:
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `key` (TEXT UNIQUE NOT NULL): Canonical key (e.g. `invite_3`, `invite_5`, `invite_10`, `share_passport`).
- `title` (TEXT NOT NULL), `description` (TEXT NOT NULL)
- `mission_type` (TEXT NOT NULL CHECK IN (`referral_count`, `profile_action`, `content_action`, `recruiter_referral`))
- `threshold` (INTEGER NOT NULL CHECK > 0)
- `reward_txc` (INTEGER NOT NULL CHECK >= 0): Platform credits awarded upon claim.
- `period` (TEXT NOT NULL CHECK IN (`lifetime`, `weekly`, `monthly`))
- `is_active` (BOOLEAN NOT NULL DEFAULT true)
- `sort_order` (INTEGER NOT NULL DEFAULT 0)

### 3.4 Additive Table: `public.referral_mission_claims`
Guarantees idempotent mission payout execution:
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `user_id` (UUID NOT NULL REFERENCES auth.users(id))
- `mission_id` (UUID NOT NULL REFERENCES public.referral_missions(id))
- `period_key` (TEXT NOT NULL): e.g. `'lifetime'`, `'2026-W45'`, `'2026-11'`.
- `reward_txc` (INTEGER NOT NULL)
- `claimed_at` (TIMESTAMPTZ NOT NULL DEFAULT now())
- **Constraint**: `UNIQUE(user_id, mission_id, period_key)` prevents double claims.

### 3.5 Additive Table: `public.referral_program_settings`
Singleton configuration row (`id = 1`) for platform controls:
- `id` (INTEGER PRIMARY KEY CHECK (id = 1))
- `rewards_paused` (BOOLEAN NOT NULL DEFAULT false): Platform-wide automated reward kill switch.
- `daily_txc_budget` (INTEGER NOT NULL DEFAULT 50000): Daily issuance ceiling.
- `updated_at` (TIMESTAMPTZ NOT NULL DEFAULT now())
- `updated_by` (UUID REFERENCES auth.users(id))

### 3.6 Additive Table: `public.referral_fraud_flags`
Anti-abuse detection ledger storing threat signals without raw PII:
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `referral_id` (UUID NULL REFERENCES public.referrals(id))
- `referrer_id` (UUID NOT NULL REFERENCES auth.users(id))
- `flag_type` (TEXT NOT NULL CHECK IN (`self_referral`, `duplicate_device`, `duplicate_ip`, `disposable_email`, `email_alias`, `velocity`))
- `severity` (TEXT NOT NULL CHECK IN (`low`, `medium`, `high`, `critical`))
- `details` (JSONB NOT NULL DEFAULT '{}'::jsonb)
- `status` (TEXT NOT NULL DEFAULT 'open' CHECK IN (`open`, `cleared`, `confirmed`))
- `reviewed_by` (UUID NULL REFERENCES auth.users(id))
- `reviewed_at` (TIMESTAMPTZ NULL)
- `created_at` (TIMESTAMPTZ NOT NULL DEFAULT now())

### 3.7 Additive Table: `public.referral_admin_actions`
Audit trail of all administrative interventions:
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `admin_id` (UUID NOT NULL REFERENCES auth.users(id))
- `action` (TEXT NOT NULL)
- `target_type` (TEXT NOT NULL)
- `target_id` (TEXT NULL)
- `before_state` (JSONB NULL)
- `after_state` (JSONB NULL)
- `created_at` (TIMESTAMPTZ NOT NULL DEFAULT now())

---

## 4. Row-Level Security (RLS) Policy Matrix

| Table | Policy Name | Permitted Roles | SQL Clause (`USING` / `WITH CHECK`) |
| :--- | :--- | :--- | :--- |
| `referral_share_events` | Authenticated users view own events | Authenticated (`auth.uid()`) | `referrer_id = auth.uid()` |
| `referral_share_events` | Service role full access | Edge Functions (`service_role`) | `true` |
| `referral_share_events` | Admins view all share telemetry | Admins (`is_app_admin`) | `public.is_app_admin(auth.uid())` |
| `referral_missions` | Anyone authenticated views active missions | Authenticated | `is_active = true OR public.is_app_admin(auth.uid())` |
| `referral_missions` | Admins manage missions | Admins | `public.is_app_admin(auth.uid())` |
| `referral_mission_claims` | Users view own claims | Authenticated | `user_id = auth.uid()` |
| `referral_mission_claims` | Admins view all claims | Admins | `public.is_app_admin(auth.uid())` |
| `referral_program_settings` | Authenticated users view settings | Authenticated | `auth.uid() IS NOT NULL` (SELECT) |
| `referral_program_settings` | Admins update settings | Admins | `public.is_app_admin(auth.uid())` (ALL) |
| `referral_fraud_flags` | Admins manage fraud flags | Admins | `public.is_app_admin(auth.uid())` |
| `referral_admin_actions` | Admins read and write audit log | Admins | `public.is_app_admin(auth.uid())` |

---

## 5. Server Functions & RPCs (Security Definer)

All RPCs set `search_path = public`, validate caller authorization, use Asia/Kolkata (IST) calendar boundaries for period aggregation, and return explicit columns:

1. **`get_ist_period_start(p_period TEXT)`**: IMMUTABLE helper returning the IST boundary for `'week'`, `'month'`, or `'all'`.
2. **`get_my_referral_stats()`**: Returns current user's invite counts, rewards earned, streak, and tier.
3. **`get_my_referral_funnel()`**: Aggregates the 5-stage personal funnel (`link_opens`, `signups`, `email_verified`, `activated`, `qualified`).
4. **`get_my_mission_progress()`**: Evaluates criteria for all active missions against verified rows for `auth.uid()`.
5. **`get_referral_leaderboard(p_period TEXT, p_limit INT)`**: Privacy-safe user leaderboard returning masked labels (`Member a3f8...`), ranks, and qualified counts. Excludes referrers with active fraud flags.
6. **`get_admin_referral_overview(p_start, p_end, p_channel)`**: Admin-only platform overview aggregating total, qualified, pending, conversion %, total TXC, unique referrers, and open fraud counts.
7. **`get_admin_k_factor(p_period TEXT)`**: Admin-only viral telemetry computing Population $K$, Active Referrer $K$, $i$, $c$, median viral cycle time, and sample size $n$.
8. **`get_admin_referral_leaderboard(p_period TEXT, p_limit INT)`**: Admin-only verified leaderboard with fraud flag indicators and exclusion state.

---

## 6. Edge Function Specifications

### 6.1 `track-referral-event`
- **Route**: `POST /functions/v1/track-referral-event`
- **Auth**: Public (`verify_jwt = false`)
- **Rate Limit**: 120 requests / minute / IP via `_shared/rateLimiter.ts`
- **Bot Filtering**: Discards social crawlers and preview bots (WhatsApp, Telegram, Slack, Twitterbot, LinkedInBot, Googlebot).
- **DPDP Hashing**: Generates `sha256(salt + visitor_id)`, `sha256(salt + ip)`, `sha256(salt + ua)`. Raw IP and UA are never logged or stored.
- **Output**: Inserts into `referral_share_events` with daily deduplication.

### 6.2 `attribute-referral`
- **Route**: `POST /functions/v1/attribute-referral`
- **Auth**: JWT Authenticated (`verify_jwt = true`)
- **Anti-Abuse Verification**:
  - Rejects self-referrals (`ref_user_id === user.id`).
  - Flags disposable email domains against top 50 disposable providers.
  - Flags Gmail/Outlook email aliases (`user+alias@gmail.com`).
  - Detects velocity spikes (> 5 referrals within 1 hour).
- **Disposition**: Inserts `referrals` row. If flags triggered, records `referral_fraud_flags` entry and sets `reward_status = 'held'`.

### 6.3 `claim-referral-mission`
- **Route**: `POST /functions/v1/claim-referral-mission`
- **Auth**: JWT Authenticated (`verify_jwt = true`)
- **Validation**:
  - Checks global killswitch `referral_program_settings.rewards_paused`. Returns 403 if paused.
  - Re-evaluates mission criteria in SQL (client cannot forge eligibility).
  - Checks `referral_mission_claims` for duplicate period claims.
- **Atomic Disbursal**: Invokes `txc_award_reward` stored procedure with idempotency key `mission_claim_{user_id}_{mission_id}_{period_key}`.

---

## 7. Production Operations Runbook

### 7.1 Emergency Rewards Kill Switch (Pause/Resume)
**When to use**: Under suspected viral exploit, bot farm surge, or budget overflow.
1. Navigate to `/admin/growth-engine` or `/admin/growth-operations` (Tab: Referral Growth Engine).
2. Under **Program Governance**, toggle **Rewards Kill Switch** to OFF.
3. This sets `referral_program_settings.rewards_paused = true`.
4. All edge function payouts (`claim-referral-mission` and automated completion rewards) will immediately stop disbursing TXC platform credits. New referrals continue recording in `pending` state with `reward_status = 'none'`.
5. An audit row is automatically written to `referral_admin_actions`.
6. To resume, toggle back ON.

### 7.2 Fraud Review & Reward Revocation
**When to use**: When unresolved abuse flags appear in the Fraud Review Queue.
1. Open Tab **Fraud Review Queue** in the Admin Command Room.
2. Inspect the detection signal: `self_referral`, `duplicate_device`, `duplicate_ip`, `disposable_email`, `email_alias`, or `velocity`.
3. Select appropriate action:
   - **Clear Flag**: False positive. Marks flag `cleared`.
   - **Hold Reward**: Suspicious account undergoing verification. Sets referral `reward_status = 'held'`.
   - **Revoke & Disqualify**: Confirmed abuse. Marks flag `confirmed`, sets referral `reward_status = 'revoked'`, and excludes referrer from public leaderboards.
4. All actions are logged into `referral_admin_actions` with administrator ID and timestamp.

### 7.3 Applying Migration to Production (Rule 7 Gate)
Once explicitly reviewed and approved by the engineering authority:
1. Ensure connection credentials for production Supabase are loaded.
2. Run database migration:
   ```bash
   npx supabase db push
   # OR execute supabase/migrations/20261105120000_referral_growth_engine_v3.sql directly via Supabase SQL Editor
   ```
3. Deploy edge functions:
   ```bash
   npx supabase functions deploy track-referral-event --no-verify-jwt
   npx supabase functions deploy attribute-referral
   npx supabase functions deploy claim-referral-mission
   ```
4. Set edge function secrets:
   ```bash
   npx supabase secrets set REFERRAL_HASH_SALT="<secure-random-salt>"
   ```
5. Verify live tables and RPC responses by running `supabase/tests/viral_growth_engine_test.sql`.
6. Rollback plan available at `supabase/migrations/20261105120000_referral_growth_engine_v3_rollback.sql`.

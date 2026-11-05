# TalentXcel Viral Growth Engine — Execution Progress Log

## Phase 0: Read-Only Audit & Discovery (Completed)
- **Referrals Table Schema**: Verified in `supabase/migrations/20250904115120_ef65b5e3-d64a-4e9c-92a4-c9ed6c0d7aaa.sql`. Columns: `id`, `referrer_id`, `referred_id`, `referral_code`, `status`, `reward_type`, `reward_amount`, `referred_email`, `referred_at`, `completed_at`, `expires_at`, `metadata`, `created_at`, `updated_at`.
- **Referral Code Generation**: Legacy code generation was done in `useReferralSystem.ts` using `Math.random().toString(36)`. It created a single pending row in `referrals`.
- **Signup Capture Gap**: `AuthPage.tsx` and `UnifiedAuthForm.tsx` currently do not persist `?ref=` in `localStorage`. OAuth callback does not ingest it.
- **Reward Pipeline**: Stored procedure `txc_award_reward` has native idempotency via `p_idempotency_key`. Edge function `earn-txc` manages cooldown and RPC dispatch. `process-txc-mining` is a legacy client invocation alias.
- **Tiers & Achievements**: Reconciled: 4 Network Tiers (Starter <3, Builder 3-9, Ambassador 10-24, Champion 25+) and 5 Individual Achievement Badges (First Steps, Network Builder, Streak Master, Career Ambassador, Conversion King).
- **QR Component**: `src/components/qr/QRCodeGenerator.tsx` exists using the `qrcode` library.
- **React Query**: `@tanstack/react-query` v5.56.2 active and available.
- **Realtime Publication**: `referrals` is in `supabase_realtime`. New Phase 1 tables will be appended.
- **Admin Verification**: `public.get_user_app_role(_user_id uuid) RETURNS app_role` and `public.is_app_admin(_user_id uuid) RETURNS boolean` are SECURITY DEFINER in `public`.
- **Audit System**: `public.audit_logs` exists; specialized `referral_admin_actions` will track configuration and reward adjustments.
- **Environment Assessment**: Local Docker daemon is not active. Under Rule 7, migrations will be authored in `supabase/migrations/` ready for user review and approval prior to live production execution.

---
## Phase 1: Data Model & SQL Migrations (Completed)
- **Migration Script Authored**: `supabase/migrations/20261105120000_referral_growth_engine_v3.sql`
- **Rollback Script Authored**: `supabase/migrations/20261105120000_referral_growth_engine_v3_rollback.sql`
- **Additive Tables Defined**:
  - `referral_share_events`: Salted hash tracking for DPDP compliance, unique deduplication index per visitor + event + IST day.
  - `referral_missions`: Admin-configurable missions with seeded defaults (`invite_3`, `invite_5`, `invite_10`, `share_passport`, `publish_article`, `invite_recruiter`).
  - `referral_mission_claims`: Server-gated claims with `UNIQUE(user_id, mission_id, period_key)` idempotency.
  - `referral_campaigns`: Multiplier caps (1.0 - 5.0x), per-user daily caps, budget allocation.
  - `referral_program_settings`: Global killswitch (`rewards_paused`) and daily TXC budget gauge.
  - `referral_fraud_flags`: Tracking self-referrals, duplicate device/IP hashes, email aliases.
  - `referral_admin_actions`: Structured before/after diff audit ledger.
- **Additive Columns on `referrals`**: `qualified_at`, `reward_status`, `source_channel`, `campaign_id`, `reward_txn_id`.
- **Partial Unique Index**: `idx_referrals_referred_id_unique` enforces single referrer per referee without deleting historical data.
- **RPCs Implemented (SECURITY DEFINER, explicit columns, IST boundaries)**:
  - `get_my_referral_stats()`
  - `get_my_referral_funnel()`
  - `get_my_mission_progress()`
  - `get_referral_leaderboard(period, limit)`
  - `get_admin_referral_overview(start, end, channel)`
  - `get_admin_k_factor(period)`
  - `get_admin_referral_leaderboard(period, limit)`
- **Publication**: Registered `referral_share_events`, `referral_mission_claims`, `referral_fraud_flags` into `supabase_realtime`.
- **Edge Functions Config**: Registered `track-referral-event` (`verify_jwt = false`), `attribute-referral` (`verify_jwt = true`), and `claim-referral-mission` (`verify_jwt = true`) in `supabase/config.toml`.
- **TypeScript Core Types**: Exported in `src/types/growthEngine.ts`.
- **Rule 7 Approval Gate**: Pending user approval before applying SQL to live production.

---
## Phase 2: Edge Functions Implementation (In Progress)
- `supabase/functions/track-referral-event/index.ts` (public, bot-ignoring, rate-limited, salted hashes)
- `supabase/functions/attribute-referral/index.ts` (JWT, fraud checks, alias detection)
- `supabase/functions/claim-referral-mission/index.ts` (JWT, progress re-verification in SQL, idempotent payout)
- Client-side landing & attribution capture in `AuthPage.tsx`, `UnifiedAuthForm.tsx`, `OAuthCallback.tsx` (persist `?ref=` for 30 days)


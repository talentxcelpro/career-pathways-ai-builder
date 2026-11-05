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
## Phase 2: Edge Functions Implementation (Completed)
- **`supabase/functions/track-referral-event/index.ts`**:
  - Public endpoint (`verify_jwt = false`) with rate limiting via `_shared/rateLimiter.ts`.
  - Filters out bots and social link preview crawlers (WhatsApp, Telegram, LinkedIn, Slack, etc.).
  - Computes salted SHA-256 hashes of visitor, IP, and UA. Raw IPs and UAs are never stored.
  - Inserts into `referral_share_events` with unique daily deduplication.
- **`supabase/functions/attribute-referral/index.ts`**:
  - JWT authenticated endpoint called on user registration/login.
  - Blocks self-referrals, flags disposable email domains, email aliases (+ tags), and IP velocity.
  - Idempotent: checks for existing attribution.
  - Inserts new referral record with `reward_status` held or none depending on risk signals.
- **`supabase/functions/claim-referral-mission/index.ts`**:
  - JWT authenticated endpoint.
  - Re-evaluates mission progress criteria server-side in SQL before awarding.
  - Enforces `referral_program_settings.rewards_paused` killswitch.
  - Awards TXC platform credits via `txc_award_reward` RPC with idempotency key `mission_claim_{user_id}_{mission_id}_{period_key}`.
- **Client-Side Telemetry (`src/utils/referralTracker.ts`)**:
  - Captures `?ref=`, `utm_source`, and `utm_campaign` with a 30-day persistence window.
  - Ingested on app boot in `App.tsx` and triggered on `SIGNED_IN` event in `OptimizedAuthContext.tsx`.

---
## Phase 3: User Surface Real-Time Integration (Completed)
- **Component Upgraded**: `src/components/referral/ViralGrowthEngineDashboard.tsx` refactored to read directly from Phase 1 RPCs with resilient fallbacks:
  - `get_my_referral_stats()`: Backed by real database rows. Zero fake or estimated numbers.
  - `get_my_referral_funnel()`: Real 5-stage funnel (Link Opened -> Signed Up -> Email Verified -> Activated -> Reward Qualified) backed by `referral_share_events` and `referrals`.
  - `get_my_mission_progress()`: Server-evaluated missions from `referral_missions` and `referral_mission_claims`.
  - `get_referral_leaderboard(p_period, p_limit)`: Filterable by Weekly, Monthly, and All-Time with IST calendar boundaries.
- **Real-Time Subscription**: Supabase Realtime channel `referrals-user-{userId}` listens to `referrals`, `referral_mission_claims`, and `referral_share_events` with debounced refresh and 45s fallback polling.
- **Channel Share Studio**: One-click sharing for WhatsApp (first), LinkedIn, Telegram, X, Facebook, and Email with automatic `utm_source` query parameter append and client telemetry logging via `trackShareClick()`.
- **QR Code Engine**: Canvas QR generation via `qrcode` package with instant high-resolution PNG download.
- **Server Mission Claims**: Connects to `claim-referral-mission` edge function; atomic credit of TXC platform credits via `txc_award_reward` with server-side criteria verification.
- **Privacy Enforcement**: Leadboard and Direct Invited Contacts show masked identifiers (`Member a3f8...`), never exposing raw email addresses (India DPDP compliant).
- **Navigation Mounted**: Swapped in both `src/pages/Network.tsx` (`tab=refer-and-earn`) and `src/pages/ReferAndEarn.tsx` while safely preserving `RealTimeReferralDashboard.tsx` in repo.

---
## Phase 4: Admin Growth Operations Command Engine (Completed)
- **Component Upgraded**: `src/components/admin/GrowthEngineAdminPanel.tsx` updated with complete real-time telemetry:
  - Consumes `get_admin_referral_overview`, `get_admin_k_factor`, and `get_admin_referral_leaderboard` with zero fabricated data.
  - Resilient SQL fallbacks to existing `referrals` table if migrations are pending execution.
- **Dual K-Factor Architecture**:
  - Population K-factor ($K_{pop} = i \times c$) across active platform members.
  - Active Referrer K-factor ($K_{ref}$) per link-sharing participant.
  - Median viral cycle time, sample size ($n$), and low-sample warning if $n < 30$.
- **Multi-Dimensional Filters**:
  - Date Range: `All Time`, `30 Days`, `7 Days`.
  - Channel Breakdown: WhatsApp, Telegram, LinkedIn, X, Facebook, Email, Direct Copy, QR Scan, Mobile Native.
- **5-Stage Multi-Stage Funnel**:
  - Link Clicks (`referral_share_events`) -> Signups (`referrals`) -> Verified -> Activated -> Granted TXC.
- **Program Governance & Kill Switch**:
  - Admin toggle for `referral_program_settings.rewards_paused` with audit logging into `referral_admin_actions`.
  - Daily TXC Platform Credit budget tracking gauge.
- **Anti-Abuse & Fraud Review Queue**:
  - DPDP-compliant hashed queue for self-referrals, device collisions, disposable emails, and velocity flags.
  - Audited action controls: `Clear Flag`, `Hold Reward`, `Confirm & Revoke`.
- **Client-Side CSV Export**:
  - Generates downloadable CSV containing platform metrics, leaderboard rankings, and channel breakdowns.
- **Real-Time Integration**:
  - Supabase Realtime channel `growth-engine-admin-live` listening to changes across all four core growth tables.

---
## Phase 5: Verification, Documentation & Production Runbook (Completed)
- **Authoritative Documentation**: Delivered in `docs/viral-growth-engine.md` detailing:
  - Theoretical viral dynamics ($K = i \times c$, cycle time acceleration, critical $K \ge 1.0$ threshold).
  - Additive database schema specification for all 7 tables and 5 additive columns on `referrals`.
  - Comprehensive Row-Level Security (RLS) matrix across all tables.
  - Server-side RPC and edge function technical specifications.
  - Production operations runbook for rewards kill switch, anti-abuse triage, and audited revocations.
- **Automated SQL Test Suite**: Authored `supabase/tests/viral_growth_engine_test.sql` to validate schema columns, table existence, unique idempotency constraints, RLS security enablement, core RPC signatures, and default seeds.
- **Static Type Safety**: `npx tsc --noEmit` verified with 0 errors across entire application.
- **Production Safety Gate**: Strict compliance with Rule 7 — zero destructive changes, migrations staged for user review, and zero live deployments executed prior to explicit authorization.





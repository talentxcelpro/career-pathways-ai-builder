-- Rollback Migration: 20261104160000_txc_production_remediation_core_rollback.sql
-- Description: Reverts functions and indexes introduced in 20261104160000_txc_production_remediation_core.sql

DROP FUNCTION IF EXISTS public.claim_email_queue_batch(INTEGER);
DROP FUNCTION IF EXISTS public.txc_award_joining_bonus(INTEGER, NUMERIC);
DROP FUNCTION IF EXISTS public.txc_award_reward(UUID, TEXT, NUMERIC, TEXT, INTEGER, TEXT, TEXT);

DROP INDEX IF EXISTS public.idx_email_queue_pending_claim;
DROP INDEX IF EXISTS public.idx_txc_transactions_user_cooldown;
DROP INDEX IF EXISTS public.idx_txc_transactions_joining_bonus;
DROP INDEX IF EXISTS public.idx_subscribers_last_payment_id;

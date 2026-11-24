-- Migration: Harden peer endorsement and referral credits security
-- Date: 2026-11-24
-- Description:
-- 1. Drops the overly permissive client INSERT policy on public.referral_credits.
-- 2. Restricts referral_credits INSERT strictly to service_role / backend functions.
-- 3. Adds unique constraint / index on peer_endorsements to prevent duplicate email endorsements.
-- 4. Enforces self-endorsement prevention at the database constraint level.

-- 1. Secure public.referral_credits from arbitrary client manipulation
DROP POLICY IF EXISTS "Allow authenticated insert referral_credits" ON public.referral_credits;

CREATE POLICY "Disallow client inserts to referral_credits"
  ON public.referral_credits
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

-- 2. Add database-level self-endorsement check constraint
ALTER TABLE public.peer_endorsements
  DROP CONSTRAINT IF EXISTS chk_peer_endorsements_no_self_endorse;

ALTER TABLE public.peer_endorsements
  ADD CONSTRAINT chk_peer_endorsements_no_self_endorse
  CHECK (
    (endorser_user_id IS NULL OR recipient_user_id IS NULL OR endorser_user_id != recipient_user_id)
  );

-- 3. Deduplication: create unique index on (lower(recipient_username), lower(endorser_email))
-- where both fields are populated
CREATE UNIQUE INDEX IF NOT EXISTS idx_peer_endorsements_unique_recipient_endorser
  ON public.peer_endorsements (lower(recipient_username), lower(endorser_email))
  WHERE recipient_username IS NOT NULL AND endorser_email IS NOT NULL;

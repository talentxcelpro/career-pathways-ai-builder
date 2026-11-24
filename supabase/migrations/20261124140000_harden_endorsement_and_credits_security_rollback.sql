-- Rollback: Harden peer endorsement and referral credits security
-- Date: 2026-11-24

DROP POLICY IF EXISTS "Disallow client inserts to referral_credits" ON public.referral_credits;

CREATE POLICY "Allow authenticated insert referral_credits"
  ON public.referral_credits
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() IS NOT NULL);

ALTER TABLE public.peer_endorsements
  DROP CONSTRAINT IF EXISTS chk_peer_endorsements_no_self_endorse;

DROP INDEX IF EXISTS public.idx_peer_endorsements_unique_recipient_endorser;

-- Rollback: 20261105153000_hardened_referral_rewards_rollback.sql
-- Restores original signature for process_successful_referral

CREATE OR REPLACE FUNCTION public.process_successful_referral(
  p_referee_id UUID,
  p_referral_code TEXT
)
RETURNS VOID AS $$
DECLARE
  referrer_uuid UUID;
  new_referral_count INTEGER;
BEGIN
  SELECT referrer_id INTO referrer_uuid
  FROM public.user_referrals
  WHERE referral_code = p_referral_code;
  
  IF referrer_uuid IS NULL THEN
    RETURN;
  END IF;
  
  UPDATE public.referral_events
  SET 
    referee_id = p_referee_id,
    status = 'registered',
    conversion_date = now()
  WHERE referral_code = p_referral_code 
    AND referee_id IS NULL
    AND status = 'pending';
  
  UPDATE public.user_referrals
  SET 
    total_referrals = total_referrals + 1,
    successful_referrals = successful_referrals + 1
  WHERE referrer_id = referrer_uuid;
END;
$$ LANGUAGE plpgsql;

-- Fix FK error by making user score updates conditional on presence in auth.users
-- and harden the function with SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.update_user_scores_on_profile_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_score INTEGER;
  user_exists BOOLEAN;
BEGIN
  -- Skip if the profile does not belong to an authenticated user
  SELECT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = NEW.id
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    -- Do not attempt to upsert into user_scores to avoid FK violations
    RETURN NEW;
  END IF;

  -- Calculate and upsert scores for real users only
  new_score := public.calculate_career_readiness_score(NEW.id);

  INSERT INTO public.user_scores (
    user_id, career_readiness_score, profile_completion_score, last_updated
  ) VALUES (
    NEW.id, new_score, new_score, now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET 
    career_readiness_score = EXCLUDED.career_readiness_score,
    profile_completion_score = EXCLUDED.profile_completion_score,
    last_updated = now();

  RETURN NEW;
END;
$$;
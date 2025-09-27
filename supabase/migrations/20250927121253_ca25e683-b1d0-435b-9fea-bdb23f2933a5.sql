-- Add missing TXC email event definitions with correct column names
INSERT INTO public.email_event_definitions (
  event_key, 
  email_title_template, 
  email_subheader_template,
  email_body_html_template,
  cta_text_template,
  cta_link_template,
  is_enabled, 
  created_at
) VALUES
  ('txc_daily_login_bonus', 
   '🎉 Daily Login Bonus Earned!', 
   'You''ve earned your daily TXC bonus!',
   '<p>Congratulations {{name}}! You''ve earned <strong>+75 TXC</strong> for logging in today.</p><p>Current Balance: <strong>{{current_balance}} TXC</strong></p><p>Keep earning by posting, applying to jobs, and engaging with the community!</p>',
   'View Dashboard',
   'https://talentxcel.com/dashboard',
   true, now()),
   
  ('txc_mining_reward', 
   '⛏️ TXC Mining Reward Earned!', 
   'You''ve earned TXC for your activity!',
   '<p>Great job {{name}}! You''ve earned <strong>+{{amount}} TXC</strong> for {{activity}}.</p><p>Current Balance: <strong>{{current_balance}} TXC</strong></p><p>Multiplier Applied: {{multiplier}}x</p>',
   'Continue Mining',
   'https://talentxcel.com/dashboard',
   true, now()),
   
  ('txc_achievement_unlocked', 
   '🏆 Achievement Unlocked!', 
   'Congratulations on your new achievement!',
   '<p>Congratulations {{name}}! You''ve unlocked: <strong>{{achievement_name}}</strong></p><p>Reward: <strong>+{{reward_amount}} TXC</strong></p><p>Current Balance: <strong>{{current_balance}} TXC</strong></p>',
   'View Achievements',
   'https://talentxcel.com/achievements',
   true, now()),
   
  ('txc_milestone_reached', 
   '🎯 Milestone Reached!', 
   'You''ve hit an important milestone!',
   '<p>Amazing {{name}}! You''ve reached <strong>{{milestone_name}}</strong></p><p>Total TXC Earned: <strong>{{lifetime_earned}} TXC</strong></p><p>Current Balance: <strong>{{current_balance}} TXC</strong></p>',
   'View Progress',
   'https://talentxcel.com/profile',
   true, now()),
   
  ('txc_purchase_confirmation', 
   '💰 TXC Purchase Confirmed', 
   'Your purchase has been confirmed!',
   '<p>Hi {{name}}, your purchase of <strong>{{feature_name}}</strong> for {{cost}} TXC has been confirmed.</p><p>Remaining Balance: <strong>{{current_balance}} TXC</strong></p><p>Enjoy your new feature!</p>',
   'Use Feature',
   'https://talentxcel.com/features',
   true, now()),
   
  ('txc_weekly_summary', 
   '📈 Your Weekly TXC Summary', 
   'Here''s your TXC activity this week',
   '<p>Hi {{name}}, here''s your TXC activity this week:</p><ul><li>TXC Earned: <strong>+{{weekly_earned}} TXC</strong></li><li>TXC Spent: <strong>-{{weekly_spent}} TXC</strong></li><li>Activities: {{activities_count}}</li></ul><p>Current Balance: <strong>{{current_balance}} TXC</strong></p>',
   'View Dashboard',
   'https://talentxcel.com/dashboard',
   true, now())
ON CONFLICT (event_key) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  updated_at = now();

-- Create trigger function to automatically send TXC notifications
CREATE OR REPLACE FUNCTION public.trigger_txc_email_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
  current_balance INTEGER;
BEGIN
  -- Get user profile information
  SELECT full_name, email INTO user_profile
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  -- Get current balance
  SELECT available_balance INTO current_balance
  FROM public.txc_user_balances
  WHERE user_id = NEW.user_id;
  
  -- Skip if no profile found
  IF user_profile IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Daily login bonus
  IF NEW.activity_type = 'daily_login' THEN
    PERFORM public.enqueue_email_event(
      'txc_daily_login_bonus',
      user_profile.email,
      user_profile.full_name,
      jsonb_build_object(
        'name', user_profile.full_name,
        'current_balance', COALESCE(current_balance, 0)
      )
    );
  END IF;
  
  -- Mining rewards (excluding daily login)
  IF NEW.transaction_type = 'mining' AND NEW.activity_type != 'daily_login' THEN
    PERFORM public.enqueue_email_event(
      'txc_mining_reward',
      user_profile.email,
      user_profile.full_name,
      jsonb_build_object(
        'name', user_profile.full_name,
        'amount', NEW.amount,
        'activity', COALESCE(NEW.description, 'platform activity'),
        'current_balance', COALESCE(current_balance, 0),
        'multiplier', '1'
      )
    );
  END IF;
  
  -- Purchase confirmations
  IF NEW.transaction_type = 'purchase' THEN
    PERFORM public.enqueue_email_event(
      'txc_purchase_confirmation',
      user_profile.email,
      user_profile.full_name,
      jsonb_build_object(
        'name', user_profile.full_name,
        'feature_name', COALESCE(NEW.description, 'Feature'),
        'cost', ABS(NEW.amount),
        'current_balance', COALESCE(current_balance, 0)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on txc_transactions to send email notifications
DROP TRIGGER IF EXISTS txc_email_notification_trigger ON public.txc_transactions;
CREATE TRIGGER txc_email_notification_trigger
  AFTER INSERT ON public.txc_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_txc_email_notifications();
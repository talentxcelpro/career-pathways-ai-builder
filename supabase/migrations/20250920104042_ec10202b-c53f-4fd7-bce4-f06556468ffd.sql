-- Fix the user scores ranking system and add comprehensive TXC automation (Fixed version)

-- Add rank column to user_scores if it doesn't exist
ALTER TABLE user_scores ADD COLUMN IF NOT EXISTS rank INTEGER;

-- Create function to update all user rankings
CREATE OR REPLACE FUNCTION update_all_user_rankings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update rankings based on total_points
  WITH ranked_users AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, career_readiness_score DESC) as new_rank
    FROM user_scores
    WHERE total_points > 0
  )
  UPDATE user_scores 
  SET rank = ranked_users.new_rank
  FROM ranked_users
  WHERE user_scores.user_id = ranked_users.user_id;
  
  -- Set rank to NULL for users with 0 points
  UPDATE user_scores SET rank = NULL WHERE total_points = 0;
END;
$$;

-- Create function to award TXC for all activities globally
CREATE OR REPLACE FUNCTION award_global_txc_rewards()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_record RECORD;
  application_record RECORD;
  connection_record RECORD;
BEGIN
  -- Award TXC for posts created today that haven't been rewarded
  FOR post_record IN 
    SELECT DISTINCT p.user_id, p.id as post_id, p.created_at
    FROM posts p
    LEFT JOIN txc_transactions tt ON tt.reference_id = p.id::text AND tt.transaction_type = 'mining' AND tt.description = 'Create a post'
    WHERE p.created_at >= CURRENT_DATE 
    AND tt.id IS NULL
    AND p.user_id IS NOT NULL
  LOOP
    -- Award 150 TXC for post creation
    INSERT INTO txc_transactions (user_id, transaction_type, amount, description, reference_id, created_at)
    VALUES (post_record.user_id, 'mining', 150, 'Create a post', post_record.post_id::text, post_record.created_at);
    
    -- Update user balance
    INSERT INTO user_txc_balances (user_id, balance, total_earned)
    VALUES (post_record.user_id, 150, 150)
    ON CONFLICT (user_id)
    DO UPDATE SET 
      balance = user_txc_balances.balance + 150,
      total_earned = user_txc_balances.total_earned + 150;
  END LOOP;

  -- Award TXC for job applications
  FOR application_record IN 
    SELECT DISTINCT ja.user_id, ja.id as app_id, ja.applied_at
    FROM job_applications ja
    LEFT JOIN txc_transactions tt ON tt.reference_id = ja.id::text AND tt.transaction_type = 'mining' AND tt.description = 'Apply to a job'
    WHERE ja.applied_at >= CURRENT_DATE 
    AND tt.id IS NULL
    AND ja.user_id IS NOT NULL
  LOOP
    -- Award 90 TXC for job application
    INSERT INTO txc_transactions (user_id, transaction_type, amount, description, reference_id, created_at)
    VALUES (application_record.user_id, 'mining', 90, 'Apply to a job', application_record.app_id::text, application_record.applied_at);
    
    -- Update user balance
    INSERT INTO user_txc_balances (user_id, balance, total_earned)
    VALUES (application_record.user_id, 90, 90)
    ON CONFLICT (user_id)
    DO UPDATE SET 
      balance = user_txc_balances.balance + 90,
      total_earned = user_txc_balances.total_earned + 90;
  END LOOP;

  -- Award TXC for connections made today
  FOR connection_record IN 
    SELECT DISTINCT c.requester_id as user_id, c.id as conn_id, c.created_at
    FROM connections c
    LEFT JOIN txc_transactions tt ON tt.reference_id = c.id::text AND tt.transaction_type = 'mining' AND tt.description = 'Connect with someone'
    WHERE c.created_at >= CURRENT_DATE 
    AND c.status = 'accepted'
    AND tt.id IS NULL
    AND c.requester_id IS NOT NULL
  LOOP
    -- Award 75 TXC for connection
    INSERT INTO txc_transactions (user_id, transaction_type, amount, description, reference_id, created_at)
    VALUES (connection_record.user_id, 'mining', 75, 'Connect with someone', connection_record.conn_id::text, connection_record.created_at);
    
    -- Update user balance
    INSERT INTO user_txc_balances (user_id, balance, total_earned)
    VALUES (connection_record.user_id, 75, 75)
    ON CONFLICT (user_id)
    DO UPDATE SET 
      balance = user_txc_balances.balance + 75,
      total_earned = user_txc_balances.total_earned + 75;
  END LOOP;

  -- Update all user rankings after awarding points
  PERFORM update_all_user_rankings();
END;
$$;

-- Create trigger function for automatic TXC rewards on new posts
CREATE OR REPLACE FUNCTION trigger_txc_for_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check cooldown and award TXC
  IF NOT EXISTS (
    SELECT 1 FROM txc_transactions 
    WHERE user_id = NEW.user_id 
    AND transaction_type = 'mining' 
    AND description = 'Create a post'
    AND created_at > NOW() - INTERVAL '1 hour'
  ) THEN
    -- Award 150 TXC for post creation
    INSERT INTO txc_transactions (user_id, transaction_type, amount, description, reference_id)
    VALUES (NEW.user_id, 'mining', 150, 'Create a post', NEW.id::text);
    
    -- Update user balance
    INSERT INTO user_txc_balances (user_id, balance, total_earned)
    VALUES (NEW.user_id, 150, 150)
    ON CONFLICT (user_id)
    DO UPDATE SET 
      balance = user_txc_balances.balance + 150,
      total_earned = user_txc_balances.total_earned + 150;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger function for automatic TXC rewards on job applications
CREATE OR REPLACE FUNCTION trigger_txc_for_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check cooldown and award TXC
  IF NOT EXISTS (
    SELECT 1 FROM txc_transactions 
    WHERE user_id = NEW.user_id 
    AND transaction_type = 'mining' 
    AND description = 'Apply to a job'
    AND created_at > NOW() - INTERVAL '1 hour'
  ) THEN
    -- Award 90 TXC for job application
    INSERT INTO txc_transactions (user_id, transaction_type, amount, description, reference_id)
    VALUES (NEW.user_id, 'mining', 90, 'Apply to a job', NEW.id::text);
    
    -- Update user balance
    INSERT INTO user_txc_balances (user_id, balance, total_earned)
    VALUES (NEW.user_id, 90, 90)
    ON CONFLICT (user_id)
    DO UPDATE SET 
      balance = user_txc_balances.balance + 90,
      total_earned = user_txc_balances.total_earned + 90;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger function for automatic TXC rewards on connections
CREATE OR REPLACE FUNCTION trigger_txc_for_connection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only award when connection is accepted
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    -- Check cooldown and award TXC to requester
    IF NOT EXISTS (
      SELECT 1 FROM txc_transactions 
      WHERE user_id = NEW.requester_id 
      AND transaction_type = 'mining' 
      AND description = 'Connect with someone'
      AND created_at > NOW() - INTERVAL '30 minutes'
    ) THEN
      -- Award 75 TXC for connection
      INSERT INTO txc_transactions (user_id, transaction_type, amount, description, reference_id)
      VALUES (NEW.requester_id, 'mining', 75, 'Connect with someone', NEW.id::text);
      
      -- Update user balance
      INSERT INTO user_txc_balances (user_id, balance, total_earned)
      VALUES (NEW.requester_id, 75, 75)
      ON CONFLICT (user_id)
      DO UPDATE SET 
        balance = user_txc_balances.balance + 75,
        total_earned = user_txc_balances.total_earned + 75;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the triggers (drop existing ones first to avoid conflicts)
DROP TRIGGER IF EXISTS txc_reward_post_trigger ON posts;
DROP TRIGGER IF EXISTS txc_reward_application_trigger ON job_applications;
DROP TRIGGER IF EXISTS txc_reward_connection_trigger ON connections;

CREATE TRIGGER txc_reward_post_trigger
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_txc_for_post();

CREATE TRIGGER txc_reward_application_trigger
  AFTER INSERT ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_txc_for_application();

CREATE TRIGGER txc_reward_connection_trigger
  AFTER UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION trigger_txc_for_connection();

-- Run the global rewards function to catch up on existing activities
SELECT award_global_txc_rewards();

-- Update rankings
SELECT update_all_user_rankings();
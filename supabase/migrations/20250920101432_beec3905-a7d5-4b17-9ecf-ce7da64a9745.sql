-- Reset the user's TXC balance to a reasonable amount and clean up duplicate transactions
-- First, let's reset the balance to 83000 as the user mentioned
UPDATE user_txc_balances 
SET balance = 83000, 
    total_earned = 83000,
    updated_at = now()
WHERE user_id = '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062';

-- Delete the excessive daily login bonus transactions from today (keep only 1)
WITH excessive_transactions AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM txc_transactions 
  WHERE user_id = '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062'
    AND transaction_type = 'mining'
    AND description = 'Daily login bonus'
    AND DATE(created_at) = CURRENT_DATE
)
DELETE FROM txc_transactions 
WHERE id IN (
  SELECT id FROM excessive_transactions WHERE rn > 1
);

-- Create a unique constraint to prevent duplicate daily login bonuses
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_daily_login_bonus 
ON txc_transactions (user_id, DATE(created_at), description) 
WHERE transaction_type = 'mining' AND description = 'Daily login bonus';

-- Create a function to safely award TXC with better duplicate prevention
CREATE OR REPLACE FUNCTION award_txc_safely(
  p_user_id UUID,
  p_action TEXT,
  p_amount INTEGER,
  p_description TEXT,
  p_cooldown_hours INTEGER DEFAULT 24
) RETURNS JSONB AS $$
DECLARE
  cooldown_time TIMESTAMP WITH TIME ZONE;
  existing_transaction_id UUID;
  current_balance NUMERIC;
  new_balance NUMERIC;
BEGIN
  -- Calculate cooldown time
  cooldown_time := NOW() - INTERVAL '1 hour' * p_cooldown_hours;
  
  -- Check for existing transaction within cooldown period
  SELECT id INTO existing_transaction_id
  FROM txc_transactions
  WHERE user_id = p_user_id
    AND transaction_type = 'mining'
    AND description = p_description
    AND created_at > cooldown_time
  LIMIT 1;
  
  -- If transaction exists within cooldown, return without awarding
  IF existing_transaction_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Transaction already processed recently',
      'duplicate', true
    );
  END IF;
  
  -- Get current balance
  SELECT balance INTO current_balance
  FROM user_txc_balances
  WHERE user_id = p_user_id;
  
  -- Calculate new balance
  new_balance := COALESCE(current_balance, 0) + p_amount;
  
  -- Insert transaction
  INSERT INTO txc_transactions (user_id, transaction_type, amount, description)
  VALUES (p_user_id, 'mining', p_amount, p_description);
  
  -- Update balance
  INSERT INTO user_txc_balances (user_id, balance, total_earned)
  VALUES (p_user_id, new_balance, new_balance)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    balance = new_balance,
    total_earned = GREATEST(user_txc_balances.total_earned, new_balance),
    updated_at = now();
  
  RETURN jsonb_build_object(
    'success', true,
    'amount', p_amount,
    'newBalance', new_balance,
    'message', 'TXC awarded successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
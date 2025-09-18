-- Check what transaction types are allowed and just update existing users manually
-- Let's use the existing structure properly

-- First, let's see the existing transaction types
-- For now, let's just manually give tokens to users using the admin panel or update existing balances
UPDATE token_balances 
SET balance = GREATEST(balance, 100)
WHERE token_type = 'TXC';

-- Update profile balances to match
UPDATE profiles 
SET tokens_balance = GREATEST(COALESCE(tokens_balance, 0), 100),
    tokens_lifetime_earned = GREATEST(COALESCE(tokens_lifetime_earned, 0), 100)
WHERE id IN (SELECT user_id FROM token_balances WHERE token_type = 'TXC');
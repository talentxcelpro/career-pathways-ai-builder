-- Ensure all existing users have TXC tokens
INSERT INTO token_balances (user_id, balance, locked_balance, token_type)
SELECT 
    id,
    100,  -- 100 TXC welcome bonus
    0,    -- No locked tokens initially
    'TXC' -- Token type
FROM auth.users 
WHERE id NOT IN (
    SELECT user_id 
    FROM token_balances 
    WHERE token_type = 'TXC'
)
ON CONFLICT (user_id, token_type) DO UPDATE SET
    balance = GREATEST(token_balances.balance, 100);

-- Create welcome transactions for existing users who got tokens
INSERT INTO token_transactions (
    to_user_id, 
    transaction_type, 
    amount, 
    description, 
    token_type, 
    status
)
SELECT 
    id,
    'earned',
    100,
    'Welcome bonus - TXC tokens for existing users!',
    'TXC',
    'completed'
FROM auth.users 
WHERE id NOT IN (
    SELECT to_user_id 
    FROM token_transactions 
    WHERE description LIKE '%Welcome bonus%' 
    AND token_type = 'TXC'
    AND to_user_id IS NOT NULL
);

-- Update profiles table with token balances for quick access
UPDATE profiles SET 
    tokens_balance = 100,
    tokens_lifetime_earned = 100
WHERE id IN (
    SELECT user_id 
    FROM token_balances 
    WHERE token_type = 'TXC' 
    AND balance >= 100
) AND (tokens_balance IS NULL OR tokens_balance < 100);
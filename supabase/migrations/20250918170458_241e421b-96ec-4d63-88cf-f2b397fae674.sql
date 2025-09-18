-- Simple fix: Give existing users tokens using the correct foreign key relationship
-- First, let's just insert tokens for users who have profiles
INSERT INTO token_balances (user_id, balance, locked_balance, token_type)
SELECT 
    p.id,
    100,  -- 100 TXC welcome bonus
    0,    -- No locked tokens initially
    'TXC' -- Token type
FROM profiles p
WHERE p.id NOT IN (
    SELECT user_id 
    FROM token_balances 
    WHERE token_type = 'TXC' AND user_id IS NOT NULL
)
ON CONFLICT DO NOTHING;

-- Create welcome transactions
INSERT INTO token_transactions (
    to_user_id, 
    transaction_type, 
    amount, 
    description, 
    token_type, 
    status
)
SELECT 
    p.id,
    'earned',
    100,
    'Welcome bonus - TXC tokens for existing users!',
    'TXC',
    'completed'
FROM profiles p
WHERE p.id NOT IN (
    SELECT COALESCE(to_user_id, '') 
    FROM token_transactions 
    WHERE description LIKE '%Welcome bonus%' 
    AND token_type = 'TXC'
    AND to_user_id IS NOT NULL
);

-- Update profiles with token info
UPDATE profiles SET 
    tokens_balance = 100,
    tokens_lifetime_earned = 100
WHERE tokens_balance IS NULL OR tokens_balance = 0;
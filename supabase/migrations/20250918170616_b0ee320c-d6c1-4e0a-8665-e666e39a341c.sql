-- Give existing users 100 TXC tokens
-- Insert token balances for users who don't have them
INSERT INTO token_balances (user_id, balance, locked_balance, token_type)
SELECT 
    p.id,
    100,
    0,
    'TXC'
FROM profiles p
LEFT JOIN token_balances tb ON p.id = tb.user_id AND tb.token_type = 'TXC'
WHERE tb.user_id IS NULL;

-- Create welcome transactions for new token holders
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
LEFT JOIN token_transactions tt ON p.id = tt.to_user_id 
    AND tt.description = 'Welcome bonus - TXC tokens for existing users!'
    AND tt.token_type = 'TXC'
WHERE tt.to_user_id IS NULL;

-- Update profile token columns
UPDATE profiles 
SET tokens_balance = 100, tokens_lifetime_earned = 100
WHERE (tokens_balance IS NULL OR tokens_balance = 0)
AND id IN (SELECT user_id FROM token_balances WHERE token_type = 'TXC');
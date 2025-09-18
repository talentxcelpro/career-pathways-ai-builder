-- Create basic token system tables
CREATE TABLE IF NOT EXISTS token_balances (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    available_balance INTEGER DEFAULT 100,
    locked_balance INTEGER DEFAULT 0,
    lifetime_earned INTEGER DEFAULT 100,
    last_daily_bonus DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create import jobs table
CREATE TABLE IF NOT EXISTS linkedin_import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending',
    total_records INTEGER DEFAULT 0,
    successful_imports INTEGER DEFAULT 0,
    failed_imports INTEGER DEFAULT 0,
    tokens_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_import_jobs ENABLE ROW LEVEL SECURITY;

-- Create basic policies
DROP POLICY IF EXISTS "Users can view own tokens" ON token_balances;
CREATE POLICY "Users can view own tokens" ON token_balances FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own transactions" ON token_transactions;  
CREATE POLICY "Users can view own transactions" ON token_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage jobs" ON linkedin_import_jobs;
CREATE POLICY "System can manage jobs" ON linkedin_import_jobs FOR ALL USING (true);

-- Add token columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tokens_balance INTEGER DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tokens_lifetime_earned INTEGER DEFAULT 100;

-- Give existing users 100 TXC tokens
INSERT INTO token_balances (user_id, available_balance, lifetime_earned)
SELECT id, 100, 100 FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET
    available_balance = 100,
    lifetime_earned = 100;

-- Update profiles with token balances
UPDATE profiles SET 
    tokens_balance = 100,
    tokens_lifetime_earned = 100
WHERE tokens_balance IS NULL OR tokens_balance = 0;
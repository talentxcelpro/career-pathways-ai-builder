-- Create user roles table first
CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'moderator', 'employer', 'user');

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Now create the token system tables
CREATE TABLE token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'import_reward')),
    amount INTEGER NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    source TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE token_balances (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    available_balance INTEGER DEFAULT 0 CHECK (available_balance >= 0),
    locked_balance INTEGER DEFAULT 0 CHECK (locked_balance >= 0),
    lifetime_earned INTEGER DEFAULT 0,
    last_daily_bonus DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE linkedin_import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    successful_imports INTEGER DEFAULT 0,
    failed_imports INTEGER DEFAULT 0,
    tokens_awarded INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Add token columns to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tokens_balance INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tokens_lifetime_earned INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_headline TEXT;

-- Indexes
CREATE INDEX idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX idx_token_transactions_created_at ON token_transactions(created_at DESC);
CREATE INDEX idx_linkedin_import_jobs_status ON linkedin_import_jobs(status);

-- RLS Policies
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_import_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own token transactions" ON token_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert token transactions" ON token_transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own token balance" ON token_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage token balances" ON token_balances
    FOR ALL USING (true);

CREATE POLICY "Admins can view all import jobs" ON linkedin_import_jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true
        )
    );

CREATE POLICY "System can manage import jobs" ON linkedin_import_jobs
    FOR ALL USING (true);

-- Token management functions
CREATE OR REPLACE FUNCTION award_tokens(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT,
    p_source TEXT DEFAULT 'manual'
) RETURNS VOID AS $$
BEGIN
    INSERT INTO token_transactions (user_id, transaction_type, amount, description, source, processed_at)
    VALUES (p_user_id, 'earned', p_amount, p_description, p_source, now());
    
    INSERT INTO token_balances (user_id, available_balance, lifetime_earned)
    VALUES (p_user_id, p_amount, p_amount)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        available_balance = token_balances.available_balance + p_amount,
        lifetime_earned = token_balances.lifetime_earned + p_amount,
        updated_at = now();
        
    UPDATE profiles SET 
        tokens_balance = COALESCE(tokens_balance, 0) + p_amount,
        tokens_lifetime_earned = COALESCE(tokens_lifetime_earned, 0) + p_amount
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Award 100 TXC to all existing users
INSERT INTO user_roles (user_id, role) 
SELECT id, 'user' FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM auth.users LOOP
        PERFORM award_tokens(user_record.id, 100, 'Welcome bonus for existing user', 'welcome_bonus');
    END LOOP;
END $$;
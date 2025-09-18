-- Create token system tables (if they don't exist)
CREATE TABLE IF NOT EXISTS token_transactions (
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

CREATE TABLE IF NOT EXISTS token_balances (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    available_balance INTEGER DEFAULT 0 CHECK (available_balance >= 0),
    locked_balance INTEGER DEFAULT 0 CHECK (locked_balance >= 0),
    lifetime_earned INTEGER DEFAULT 0,
    last_daily_bonus DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS linkedin_import_jobs (
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

-- Add token columns to existing profiles table (if not exists)
DO $$ BEGIN
    ALTER TABLE profiles ADD COLUMN tokens_balance INTEGER DEFAULT 0;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE profiles ADD COLUMN tokens_lifetime_earned INTEGER DEFAULT 0;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE profiles ADD COLUMN linkedin_url TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE profiles ADD COLUMN linkedin_headline TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Indexes (if not exists)
DO $$ BEGIN
    CREATE INDEX idx_token_transactions_user_id ON token_transactions(user_id);
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_token_transactions_created_at ON token_transactions(created_at DESC);
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_linkedin_import_jobs_status ON linkedin_import_jobs(status);
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

-- RLS Policies (only if tables exist)
DO $$ BEGIN
    ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE linkedin_import_jobs ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Create policies (ignore if they exist)
DO $$ BEGIN
    CREATE POLICY "Users can view their own token transactions" ON token_transactions
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "System can insert token transactions" ON token_transactions
        FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view their own token balance" ON token_balances
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "System can manage token balances" ON token_balances
        FOR ALL USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can view all import jobs" ON linkedin_import_jobs
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('super_admin', 'admin') 
                AND is_active = true
            )
        );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "System can manage import jobs" ON linkedin_import_jobs
        FOR ALL USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Token management function
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

-- Award 100 TXC to all existing users who don't have tokens yet
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id FROM auth.users 
        WHERE id NOT IN (SELECT user_id FROM token_balances)
    LOOP
        PERFORM award_tokens(user_record.id, 100, 'Welcome bonus for existing user', 'welcome_bonus');
    END LOOP;
END $$;
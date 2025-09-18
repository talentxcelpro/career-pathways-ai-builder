-- Simple table creation only (checking if columns exist first)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'token_transactions'
    ) THEN
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
        
        ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own token transactions" ON token_transactions
            FOR SELECT USING (auth.uid() = user_id);
            
        CREATE POLICY "System can insert token transactions" ON token_transactions
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'token_balances'
    ) THEN
        CREATE TABLE token_balances (
            user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            available_balance INTEGER DEFAULT 0 CHECK (available_balance >= 0),
            locked_balance INTEGER DEFAULT 0 CHECK (locked_balance >= 0),
            lifetime_earned INTEGER DEFAULT 0,
            last_daily_bonus DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own token balance" ON token_balances
            FOR SELECT USING (auth.uid() = user_id);
            
        CREATE POLICY "System can manage token balances" ON token_balances
            FOR ALL USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'linkedin_import_jobs'
    ) THEN
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
        
        ALTER TABLE linkedin_import_jobs ENABLE ROW LEVEL SECURITY;
        
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
    END IF;
END $$;

-- Add token columns to profiles table (if not exist)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'tokens_balance'
    ) THEN
        ALTER TABLE profiles ADD COLUMN tokens_balance INTEGER DEFAULT 0;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'tokens_lifetime_earned'
    ) THEN
        ALTER TABLE profiles ADD COLUMN tokens_lifetime_earned INTEGER DEFAULT 0;
    END IF;
END $$;

-- Award tokens to existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id FROM auth.users 
        WHERE id NOT IN (SELECT user_id FROM token_balances WHERE user_id IS NOT NULL)
    LOOP
        INSERT INTO token_balances (user_id, available_balance, lifetime_earned)
        VALUES (user_record.id, 100, 100)
        ON CONFLICT (user_id) DO NOTHING;
        
        INSERT INTO token_transactions (user_id, transaction_type, amount, description, source, processed_at)
        VALUES (user_record.id, 'earned', 100, 'Welcome bonus for existing user', 'welcome_bonus', now())
        ON CONFLICT DO NOTHING;
        
        UPDATE profiles SET 
            tokens_balance = 100,
            tokens_lifetime_earned = 100
        WHERE id = user_record.id;
    END LOOP;
END $$;
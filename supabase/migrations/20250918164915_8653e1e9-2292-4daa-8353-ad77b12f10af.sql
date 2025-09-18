-- =======================
-- COMPREHENSIVE USER MANAGEMENT & TOKEN ECONOMY
-- =======================

-- Create app_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'moderator', 'employer', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enhanced user profiles table (extend existing)
DO $$ BEGIN
    -- Add new columns to profiles if they don't exist
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_headline TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_summary TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_experience JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_education JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_skills TEXT[];
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_connections_count INTEGER DEFAULT 0;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_imported_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tokens_balance INTEGER DEFAULT 0;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tokens_lifetime_earned INTEGER DEFAULT 0;
EXCEPTION
    WHEN OTHERS THEN 
        RAISE NOTICE 'Some columns already exist or other error: %', SQLERRM;
END $$;

-- Token economy tables
CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'import_reward')),
    amount INTEGER NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    source TEXT, -- 'profile_completion', 'daily_bonus', 'job_application', 'linkedin_import', etc.
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

-- LinkedIn import jobs tracking
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

-- Service marketplace tables
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    description TEXT,
    specializations TEXT[],
    hourly_rate_min INTEGER,
    hourly_rate_max INTEGER,
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
    rating DECIMAL(2,1) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'package')),
    base_price INTEGER NOT NULL CHECK (base_price > 0),
    token_price INTEGER, -- Price in TXC tokens
    delivery_time_days INTEGER DEFAULT 7,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance optimization tables
CREATE TABLE IF NOT EXISTS user_activity_summary (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    last_login TIMESTAMP WITH TIME ZONE,
    login_streak INTEGER DEFAULT 0,
    total_logins INTEGER DEFAULT 0,
    profile_views_count INTEGER DEFAULT 0,
    job_applications_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    connections_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_linkedin_import_jobs_status ON linkedin_import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_linkedin_import_jobs_created_at ON linkedin_import_jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- RLS Policies
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_summary ENABLE ROW LEVEL SECURITY;

-- Token transaction policies
CREATE POLICY "Users can view their own token transactions" ON token_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert token transactions" ON token_transactions
    FOR INSERT WITH CHECK (true);

-- Token balance policies
CREATE POLICY "Users can view their own token balance" ON token_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage token balances" ON token_balances
    FOR ALL USING (true);

-- LinkedIn import policies
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

-- Service policies
CREATE POLICY "Everyone can view active service categories" ON service_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own provider profile" ON service_providers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own provider profile" ON service_providers
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view active services" ON services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can manage their own services" ON services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM service_providers 
            WHERE id = services.provider_id 
            AND user_id = auth.uid()
        )
    );

-- User activity summary policies
CREATE POLICY "Users can view their own activity summary" ON user_activity_summary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage activity summaries" ON user_activity_summary
    FOR ALL USING (true);

-- SQL Functions for token operations
CREATE OR REPLACE FUNCTION award_tokens(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT,
    p_source TEXT DEFAULT 'manual'
) RETURNS VOID AS $$
BEGIN
    -- Insert transaction record
    INSERT INTO token_transactions (user_id, transaction_type, amount, description, source, processed_at)
    VALUES (p_user_id, 'earned', p_amount, p_description, p_source, now());
    
    -- Update balance
    INSERT INTO token_balances (user_id, available_balance, lifetime_earned)
    VALUES (p_user_id, p_amount, p_amount)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        available_balance = token_balances.available_balance + p_amount,
        lifetime_earned = token_balances.lifetime_earned + p_amount,
        updated_at = now();
        
    -- Update profile balance for quick access
    UPDATE profiles SET 
        tokens_balance = COALESCE(tokens_balance, 0) + p_amount,
        tokens_lifetime_earned = COALESCE(tokens_lifetime_earned, 0) + p_amount
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION spend_tokens(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT,
    p_source TEXT DEFAULT 'manual'
) RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT available_balance INTO current_balance 
    FROM token_balances 
    WHERE user_id = p_user_id;
    
    -- Check if user has enough tokens
    IF current_balance IS NULL OR current_balance < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Insert transaction record
    INSERT INTO token_transactions (user_id, transaction_type, amount, description, source, processed_at)
    VALUES (p_user_id, 'spent', p_amount, p_description, p_source, now());
    
    -- Update balance
    UPDATE token_balances 
    SET available_balance = available_balance - p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Update profile balance
    UPDATE profiles SET 
        tokens_balance = COALESCE(tokens_balance, 0) - p_amount
    WHERE id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to keep profile token balance in sync
CREATE OR REPLACE FUNCTION sync_profile_token_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles 
    SET tokens_balance = NEW.available_balance
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_profile_tokens
    AFTER INSERT OR UPDATE OF available_balance ON token_balances
    FOR EACH ROW EXECUTE FUNCTION sync_profile_token_balance();

-- Award initial tokens to existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id FROM auth.users 
        WHERE created_at < now() 
        AND id NOT IN (SELECT user_id FROM token_balances)
    LOOP
        PERFORM award_tokens(
            user_record.id, 
            100, 
            'Welcome bonus for existing user', 
            'welcome_bonus'
        );
    END LOOP;
END $$;

-- Insert default service categories
INSERT INTO service_categories (name, description, icon, sort_order) VALUES
    ('Resume Writing', 'Professional resume writing and optimization services', 'file-text', 1),
    ('Interview Coaching', 'Mock interviews and interview preparation', 'users', 2),
    ('Career Counseling', 'Career guidance and strategic planning', 'compass', 3),
    ('LinkedIn Optimization', 'LinkedIn profile enhancement and networking', 'linkedin', 4),
    ('Skill Development', 'Training and certification programs', 'award', 5),
    ('Freelance Services', 'Project-based work and gig opportunities', 'briefcase', 6)
ON CONFLICT (name) DO NOTHING;
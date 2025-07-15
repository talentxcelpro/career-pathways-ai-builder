-- Create pro_subscriptions table for Network module integration
CREATE TABLE IF NOT EXISTS public.pro_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL CHECK (plan_name IN ('Starter', 'Business', 'Elite')),
    price_amount INTEGER NOT NULL CHECK (price_amount > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    razorpay_payment_id TEXT,
    razorpay_subscription_id TEXT,
    features JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pro_subscriptions_user_id ON public.pro_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_pro_subscriptions_status ON public.pro_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_pro_subscriptions_expires_at ON public.pro_subscriptions(expires_at);

-- Enable RLS
ALTER TABLE public.pro_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own subscriptions"
    ON public.pro_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
    ON public.pro_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
    ON public.pro_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_pro_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pro_subscriptions_updated_at
    BEFORE UPDATE ON public.pro_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_pro_subscriptions_updated_at();

-- Add pro_status column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'pro_status'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN pro_status TEXT DEFAULT 'free' CHECK (pro_status IN ('free', 'active', 'expired', 'cancelled'));
    END IF;
END
$$;

-- Add pro_plan column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'pro_plan'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN pro_plan TEXT CHECK (pro_plan IN ('Starter', 'Business', 'Elite'));
    END IF;
END
$$;

-- Add pro_expires_at column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'pro_expires_at'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN pro_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
END
$$;

-- Create function to activate Pro subscription
CREATE OR REPLACE FUNCTION public.activate_pro_subscription(
    p_user_id UUID,
    p_plan_name TEXT,
    p_price_amount INTEGER,
    p_razorpay_payment_id TEXT,
    p_duration_months INTEGER DEFAULT 1
) RETURNS UUID AS $$
DECLARE
    subscription_id UUID;
    expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate expiry date
    expires_at := NOW() + (p_duration_months || ' months')::INTERVAL;
    
    -- Insert subscription record
    INSERT INTO public.pro_subscriptions (
        user_id,
        plan_name,
        price_amount,
        razorpay_payment_id,
        expires_at
    ) VALUES (
        p_user_id,
        p_plan_name,
        p_price_amount,
        p_razorpay_payment_id,
        expires_at
    ) RETURNING id INTO subscription_id;
    
    -- Update user profile
    UPDATE public.profiles 
    SET 
        pro_status = 'active',
        pro_plan = p_plan_name,
        pro_expires_at = expires_at,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has active Pro subscription
CREATE OR REPLACE FUNCTION public.is_pro_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = p_user_id 
        AND pro_status = 'active' 
        AND (pro_expires_at IS NULL OR pro_expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's Pro plan
CREATE OR REPLACE FUNCTION public.get_user_pro_plan(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_plan TEXT;
BEGIN
    SELECT pro_plan INTO user_plan
    FROM public.profiles 
    WHERE id = p_user_id 
    AND pro_status = 'active' 
    AND (pro_expires_at IS NULL OR pro_expires_at > NOW());
    
    RETURN COALESCE(user_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
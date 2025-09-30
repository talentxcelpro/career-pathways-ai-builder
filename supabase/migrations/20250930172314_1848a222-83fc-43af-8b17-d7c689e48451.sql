-- Fix update_user_presence function to not reference user_scores
CREATE OR REPLACE FUNCTION public.update_user_presence(user_uuid uuid, is_online_status boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    is_online = is_online_status,
    last_seen = CASE 
      WHEN is_online_status = TRUE THEN NOW()
      ELSE last_seen
    END,
    updated_at = NOW()
  WHERE id = user_uuid;
END;
$$;

-- Create user_txc_balances table if not exists
CREATE TABLE IF NOT EXISTS public.user_txc_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  txc_balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_txc_balances
ALTER TABLE public.user_txc_balances ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_txc_balances
CREATE POLICY "Users can view own TXC balance"
  ON public.user_txc_balances
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage TXC balances"
  ON public.user_txc_balances
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create txc_transactions table if not exists
CREATE TABLE IF NOT EXISTS public.txc_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('mining', 'purchase', 'spend', 'reward', 'transfer')),
  amount INTEGER NOT NULL,
  activity_type TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on txc_transactions
ALTER TABLE public.txc_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for txc_transactions
CREATE POLICY "Users can view own transactions"
  ON public.txc_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions"
  ON public.txc_transactions
  FOR INSERT
  WITH CHECK (true);

-- Recreate the trigger function for post TXC rewards
CREATE OR REPLACE FUNCTION public.trigger_txc_for_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Award TXC for creating a post
  INSERT INTO public.user_txc_balances (user_id, txc_balance, total_earned, updated_at)
  VALUES (NEW.author_id, 10, 10, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    txc_balance = user_txc_balances.txc_balance + 10,
    total_earned = user_txc_balances.total_earned + 10,
    updated_at = NOW();
    
  -- Log the transaction
  INSERT INTO public.txc_transactions (
    user_id, 
    transaction_type, 
    amount, 
    activity_type, 
    description,
    created_at
  ) VALUES (
    NEW.author_id,
    'mining',
    10,
    'post_created',
    'TXC earned for creating a post',
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS award_txc_for_post ON public.posts;

CREATE TRIGGER award_txc_for_post
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_txc_for_post();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_txc_transactions_user_id ON public.txc_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_txc_transactions_created_at ON public.txc_transactions(created_at DESC);
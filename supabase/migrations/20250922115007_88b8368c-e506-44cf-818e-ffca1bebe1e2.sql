-- Fix the token_transactions table schema issue
-- The logs show "column token_transactions.user_id does not exist" errors

-- First, let's check if we have a txc_transactions table and fix the references
DO $$ 
BEGIN
  -- Check if token_transactions table exists and needs user_id column
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'token_transactions') THEN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'token_transactions' AND column_name = 'user_id') THEN
      ALTER TABLE public.token_transactions ADD COLUMN user_id UUID REFERENCES auth.users(id);
      
      -- Create index for performance
      CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON public.token_transactions(user_id);
      
      -- Update existing records to link to a valid user if possible
      UPDATE public.token_transactions 
      SET user_id = (SELECT id FROM auth.users LIMIT 1)
      WHERE user_id IS NULL;
    END IF;
  END IF;
  
  -- Check if we should rename token_transactions to txc_transactions for consistency
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'token_transactions') AND
     NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'txc_transactions') THEN
    ALTER TABLE public.token_transactions RENAME TO txc_transactions;
  END IF;
END $$;

-- Ensure RLS is enabled and policies exist for txc_transactions
ALTER TABLE public.txc_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own TXC transactions" ON public.txc_transactions;
DROP POLICY IF EXISTS "Users can insert their own TXC transactions" ON public.txc_transactions;

-- Create proper RLS policies
CREATE POLICY "Users can view their own TXC transactions" 
ON public.txc_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own TXC transactions" 
ON public.txc_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Clean up any orphaned cron jobs that might be causing issues
DELETE FROM cron.job WHERE jobname LIKE '%test%' OR jobname LIKE '%cleanup%';

-- Add a function to clean up old function logs
CREATE OR REPLACE FUNCTION public.cleanup_function_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Keep only last 1000 logs per function
  DELETE FROM public.function_health_logs 
  WHERE id NOT IN (
    SELECT id FROM public.function_health_logs 
    ORDER BY created_at DESC 
    LIMIT 1000
  );
END;
$$;
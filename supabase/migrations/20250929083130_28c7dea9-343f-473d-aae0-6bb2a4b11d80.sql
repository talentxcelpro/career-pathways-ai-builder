-- Fix the trigger_txc_for_post function to use correct column names
CREATE OR REPLACE FUNCTION public.trigger_txc_for_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Award TXC for creating a post
  INSERT INTO public.user_txc_balances (user_id, txc_balance, total_earned, last_activity_at)
  VALUES (NEW.author_id, 10, 10, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    txc_balance = user_txc_balances.txc_balance + 10,
    total_earned = user_txc_balances.total_earned + 10,
    last_activity_at = now();
    
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
    now()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
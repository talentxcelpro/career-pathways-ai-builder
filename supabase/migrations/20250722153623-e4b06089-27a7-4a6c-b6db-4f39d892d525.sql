-- Create subscribers table to track Razorpay subscription information
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  razorpay_customer_id TEXT,
  razorpay_subscription_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_plan TEXT,
  subscription_tier TEXT,
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  amount INTEGER, -- Amount in paise
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'inactive', -- active, inactive, cancelled, expired
  last_payment_date TIMESTAMPTZ,
  last_payment_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription info
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid());

-- Create policy for edge functions to update subscription info
CREATE POLICY "update_subscription" ON public.subscribers
FOR UPDATE
USING (true);

-- Create policy for edge functions to insert subscription info  
CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Create policy for users to delete their own subscription
CREATE POLICY "delete_own_subscription" ON public.subscribers
FOR DELETE
USING (user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX idx_subscribers_razorpay_customer_id ON public.subscribers(razorpay_customer_id);
CREATE INDEX idx_subscribers_status ON public.subscribers(status);

-- Create function to check subscription status
CREATE OR REPLACE FUNCTION public.check_user_subscription(user_uuid uuid)
RETURNS TABLE(
  is_subscribed boolean,
  subscription_tier text,
  subscription_end timestamptz,
  status text
) 
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    s.subscribed,
    s.subscription_tier,
    s.subscription_end,
    s.status
  FROM public.subscribers s
  WHERE s.user_id = user_uuid 
  AND s.status = 'active'
  AND s.subscription_end > now()
  ORDER BY s.subscription_end DESC
  LIMIT 1;
$$;
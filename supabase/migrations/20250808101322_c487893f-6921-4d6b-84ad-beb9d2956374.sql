-- Create table to track per-user resume downloads (first download free)
CREATE TABLE IF NOT EXISTS public.resume_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resume_id UUID NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  last_download_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, resume_id)
);

-- Enable RLS
ALTER TABLE public.resume_downloads ENABLE ROW LEVEL SECURITY;

-- Policies: users can view and manage their own download rows
CREATE POLICY "select_own_resume_downloads" ON public.resume_downloads
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "insert_own_resume_downloads" ON public.resume_downloads
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_resume_downloads" ON public.resume_downloads
FOR UPDATE USING (user_id = auth.uid());

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_resume_downloads_updated_at ON public.resume_downloads;
CREATE TRIGGER trg_resume_downloads_updated_at
BEFORE UPDATE ON public.resume_downloads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a generic table for one-off resume orders via Razorpay
CREATE TABLE IF NOT EXISTS public.resume_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resume_id UUID,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  amount INTEGER NOT NULL, -- in paise
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | failed | cancelled
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_resume_orders_user ON public.resume_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_orders_status ON public.resume_orders(status);
CREATE INDEX IF NOT EXISTS idx_resume_downloads_user ON public.resume_downloads(user_id);

-- Enable RLS
ALTER TABLE public.resume_orders ENABLE ROW LEVEL SECURITY;

-- Policies: users can view their own orders
CREATE POLICY "select_own_resume_orders" ON public.resume_orders
FOR SELECT USING (user_id = auth.uid());

-- Allow inserts/updates by trusted code (edge functions using service role bypass RLS).
-- For safety, also allow clients to insert their own pending order shells if needed
CREATE POLICY "insert_own_resume_orders" ON public.resume_orders
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_resume_orders" ON public.resume_orders
FOR UPDATE USING (user_id = auth.uid());
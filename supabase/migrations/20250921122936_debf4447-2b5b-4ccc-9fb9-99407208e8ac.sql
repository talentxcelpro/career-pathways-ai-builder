-- Create table for tracking TXC purchases
CREATE TABLE public.txc_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_type TEXT NOT NULL,
  feature_id TEXT NOT NULL,
  cost INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.txc_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for txc_purchases
CREATE POLICY "Users can view their own purchases" 
ON public.txc_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert purchases" 
ON public.txc_purchases 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update purchases" 
ON public.txc_purchases 
FOR UPDATE 
USING (true);

-- Create index for better performance
CREATE INDEX idx_txc_purchases_user_id ON public.txc_purchases(user_id);
CREATE INDEX idx_txc_purchases_feature ON public.txc_purchases(feature_type, feature_id);
CREATE INDEX idx_txc_purchases_expires ON public.txc_purchases(expires_at) WHERE expires_at IS NOT NULL;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_txc_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_txc_purchases_updated_at
  BEFORE UPDATE ON public.txc_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_txc_purchases_updated_at();
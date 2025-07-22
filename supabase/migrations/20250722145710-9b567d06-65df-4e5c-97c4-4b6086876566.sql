
-- Phase 1: Database Schema Standardization
-- We'll use the existing subscription_plans table as the standard and ensure consistency

-- First, let's make sure we have a consistent service_orders table for tracking payments
CREATE TABLE IF NOT EXISTS public.service_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID,
  package_type TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  payment_verified_at TIMESTAMP WITH TIME ZONE,
  order_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for service_orders
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for service_orders
CREATE POLICY "Users can view their own service orders" 
ON public.service_orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service orders" 
ON public.service_orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service orders" 
ON public.service_orders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage service orders" 
ON public.service_orders 
FOR ALL 
USING (true);

-- Update subscription_plans to ensure consistency
UPDATE public.subscription_plans 
SET features = CASE 
  WHEN name = 'Pro Starter' THEN '["Smart Service Page", "Portfolio", "Basic AI", "Service Listings", "Basic Support", "Standard Templates"]'::jsonb
  WHEN name = 'Pro Business' THEN '["CRM", "Analytics", "Full AI Tools", "Razorpay", "Priority Support", "Advanced Templates", "Client Management", "Lead Tracking", "Performance Reports"]'::jsonb
  WHEN name = 'Pro Elite' THEN '["Premium", "CRM & Lead Management", "Advanced Analytics", "AI Business Tools", "Payment Integration", "E-Contracts & NDAs", "Custom Branding", "Team View", "Premium Boosting", "Marketplace Priority", "24/7 Support", "Custom Integrations", "White-label Solutions"]'::jsonb
END
WHERE name IN ('Pro Starter', 'Pro Business', 'Pro Elite');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_orders_user_id ON public.service_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_razorpay_order_id ON public.service_orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_payment_status ON public.service_orders(payment_status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_service_orders_updated_at
BEFORE UPDATE ON public.service_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

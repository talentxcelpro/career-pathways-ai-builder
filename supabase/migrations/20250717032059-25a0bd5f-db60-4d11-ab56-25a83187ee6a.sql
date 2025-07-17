-- Create pro_subscription_tiers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pro_subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  max_services INTEGER NOT NULL DEFAULT 5,
  has_crm BOOLEAN NOT NULL DEFAULT false,
  has_analytics BOOLEAN NOT NULL DEFAULT false,
  has_ai_tools BOOLEAN NOT NULL DEFAULT false,
  has_payments BOOLEAN NOT NULL DEFAULT false,
  has_contracts BOOLEAN NOT NULL DEFAULT false,
  has_branding BOOLEAN NOT NULL DEFAULT false,
  marketplace_priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pro_subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active subscription tiers" ON public.pro_subscription_tiers
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subscription tiers" ON public.pro_subscription_tiers
FOR ALL USING (is_app_admin(auth.uid()));

-- Insert the three subscription tiers with specified features
INSERT INTO public.pro_subscription_tiers (
  name, 
  price_monthly, 
  features, 
  max_services, 
  has_crm, 
  has_analytics, 
  has_ai_tools, 
  has_payments, 
  has_contracts, 
  has_branding, 
  marketplace_priority
) VALUES 
-- Smart Service Page (Starter)
(
  'Smart Service Page',
  399,
  '["Portfolio", "Basic AI", "Service Listings", "Basic Support", "Standard Templates"]'::jsonb,
  5,
  false,
  false,
  true,
  false,
  false,
  false,
  1
),
-- CRM (Business)
(
  'CRM',
  699,
  '["All Starter features", "CRM", "Analytics", "Full AI Tools", "Razorpay", "Priority Support", "Advanced Templates", "Client Management", "Lead Tracking", "Performance Reports"]'::jsonb,
  15,
  true,
  true,
  true,
  true,
  false,
  false,
  2
),
-- Premium (Elite)
(
  'Premium',
  1999,
  '["CRM & Lead Management", "Advanced Analytics", "AI Business Tools", "Payment Integration", "E-Contracts & NDAs", "All Business features", "Custom Branding", "Team View", "Premium Boosting", "Marketplace Priority", "24/7 Support", "Custom Integrations", "White-label Solutions"]'::jsonb,
  15,
  true,
  true,
  true,
  true,
  true,
  true,
  3
)
ON CONFLICT (name) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  features = EXCLUDED.features,
  max_services = EXCLUDED.max_services,
  has_crm = EXCLUDED.has_crm,
  has_analytics = EXCLUDED.has_analytics,
  has_ai_tools = EXCLUDED.has_ai_tools,
  has_payments = EXCLUDED.has_payments,
  has_contracts = EXCLUDED.has_contracts,
  has_branding = EXCLUDED.has_branding,
  marketplace_priority = EXCLUDED.marketplace_priority,
  updated_at = now();

-- Create service packages table for detailed package selection
CREATE TABLE IF NOT EXISTS public.service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.pro_services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  delivery_days INTEGER NOT NULL DEFAULT 7,
  revisions_included INTEGER DEFAULT 1,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active service packages" ON public.service_packages
FOR SELECT USING (is_active = true);

CREATE POLICY "Service providers can manage their packages" ON public.service_packages
FOR ALL USING (
  service_id IN (
    SELECT id FROM pro_services 
    WHERE provider_id = auth.uid()
  )
);

-- Create service orders table for booking management
CREATE TABLE IF NOT EXISTS public.service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.pro_services(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.service_packages(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  total_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_id TEXT,
  order_details JSONB DEFAULT '{}',
  delivery_date DATE,
  special_requirements TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Customers can view their orders" ON public.service_orders
FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Providers can view their orders" ON public.service_orders
FOR SELECT USING (provider_id = auth.uid());

CREATE POLICY "Customers can create orders" ON public.service_orders
FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Providers can update their orders" ON public.service_orders
FOR UPDATE USING (provider_id = auth.uid());
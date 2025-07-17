-- Update subscription tiers data
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
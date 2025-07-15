-- Create pro subscription tiers table
CREATE TABLE public.pro_subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_services INTEGER DEFAULT 5,
  has_crm BOOLEAN DEFAULT false,
  has_analytics BOOLEAN DEFAULT false,
  has_ai_tools BOOLEAN DEFAULT false,
  has_payments BOOLEAN DEFAULT false,
  has_contracts BOOLEAN DEFAULT false,
  has_branding BOOLEAN DEFAULT false,
  marketplace_priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pro service profiles table
CREATE TABLE public.pro_service_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT REFERENCES pro_subscription_tiers(name) ON DELETE SET NULL,
  profile_slug TEXT UNIQUE NOT NULL,
  business_name TEXT,
  bio TEXT,
  video_bio_url TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  location TEXT,
  timezone TEXT,
  availability_hours JSONB DEFAULT '{}'::jsonb,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  custom_branding JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  total_bookings INTEGER DEFAULT 0,
  response_time_hours INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pro services table
CREATE TABLE public.pro_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES pro_service_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  service_type TEXT DEFAULT 'one-time', -- 'one-time', 'recurring', 'consultation'
  pricing_type TEXT DEFAULT 'fixed', -- 'fixed', 'hourly', 'package', 'contact'
  base_price DECIMAL(10,2),
  hourly_rate DECIMAL(10,2),
  pricing_tiers JSONB DEFAULT '[]'::jsonb,
  delivery_time_days INTEGER,
  revisions_included INTEGER DEFAULT 0,
  requirements TEXT,
  what_included TEXT[],
  what_not_included TEXT[],
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  booking_enabled BOOLEAN DEFAULT true,
  instant_booking BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  bookings_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pro portfolios table
CREATE TABLE public.pro_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES pro_service_profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES pro_services(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'image', 'video', 'pdf', 'link', 'document'
  file_url TEXT,
  thumbnail_url TEXT,
  external_url TEXT,
  file_size_mb DECIMAL(10,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pro service bookings table
CREATE TABLE public.pro_service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES pro_services(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  booking_type TEXT DEFAULT 'inquiry', -- 'inquiry', 'booking', 'consultation'
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'
  scheduled_date TIMESTAMPTZ,
  duration_hours DECIMAL(4,2),
  message TEXT,
  requirements JSONB DEFAULT '{}'::jsonb,
  pricing_selected JSONB DEFAULT '{}'::jsonb,
  total_amount DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'partial', 'refunded'
  payment_id TEXT,
  contract_id UUID,
  notes TEXT,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  source TEXT DEFAULT 'direct', -- 'direct', 'marketplace', 'referral'
  ai_lead_score INTEGER DEFAULT 0,
  follow_up_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pro analytics table
CREATE TABLE public.pro_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES pro_service_profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES pro_services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  bookings_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.0,
  revenue DECIMAL(10,2) DEFAULT 0.0,
  avg_response_time_hours DECIMAL(8,2),
  client_satisfaction DECIMAL(3,2),
  referral_source JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, service_id, date)
);

-- Create pro leads table (CRM)
CREATE TABLE public.pro_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES pro_service_profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES pro_service_bookings(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'proposal-sent', 'negotiating', 'won', 'lost'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  source TEXT DEFAULT 'direct', -- 'direct', 'marketplace', 'referral', 'social'
  ai_lead_score INTEGER DEFAULT 0,
  estimated_value DECIMAL(10,2),
  probability INTEGER DEFAULT 50, -- 0-100%
  tags TEXT[],
  notes TEXT,
  last_contact_date TIMESTAMPTZ,
  next_follow_up TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  interaction_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pro contracts table
CREATE TABLE public.pro_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES pro_service_profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES pro_service_bookings(id) ON DELETE SET NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contract_type TEXT DEFAULT 'service', -- 'service', 'nda', 'consulting'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  template_used TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'signed', 'completed', 'terminated'
  client_signature TEXT,
  provider_signature TEXT,
  signed_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  total_value DECIMAL(10,2),
  payment_terms TEXT,
  deliverables JSONB DEFAULT '[]'::jsonb,
  terms_conditions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pro deliverables table
CREATE TABLE public.pro_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES pro_contracts(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES pro_service_bookings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size_mb DECIMAL(10,2),
  file_type TEXT,
  download_count INTEGER DEFAULT 0,
  is_downloadable BOOLEAN DEFAULT true,
  access_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default subscription tiers
INSERT INTO public.pro_subscription_tiers (name, price_monthly, features, max_services, has_crm, has_analytics, has_ai_tools, has_payments, has_contracts, has_branding, marketplace_priority) VALUES
('Pro Starter', 399.00, '["Smart Service Page", "Portfolio", "Basic AI", "5 Services"]', 5, false, false, false, false, false, false, 1),
('Pro Business', 699.00, '["All Starter features", "CRM", "Analytics", "Full AI Tools", "Razorpay", "15 Services"]', 15, true, true, true, true, true, false, 2),
('Pro Elite', 1999.00, '["All Business features", "Custom Branding", "Team View", "Premium Boosting", "Marketplace Priority"]', 15, true, true, true, true, true, true, 3);

-- Enable Row Level Security
ALTER TABLE public.pro_subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_service_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_deliverables ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pro_subscription_tiers
CREATE POLICY "Anyone can view subscription tiers" ON public.pro_subscription_tiers
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subscription tiers" ON public.pro_subscription_tiers
FOR ALL USING (is_app_admin(auth.uid()));

-- Create RLS policies for pro_service_profiles
CREATE POLICY "Users can view their own profile" ON public.pro_service_profiles
FOR SELECT USING (user_id = auth.uid() OR is_active = true);

CREATE POLICY "Users can manage their own profile" ON public.pro_service_profiles
FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for pro_services
CREATE POLICY "Users can view active services" ON public.pro_services
FOR SELECT USING (
  is_active = true OR 
  profile_id IN (SELECT id FROM pro_service_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can manage their own services" ON public.pro_services
FOR ALL USING (
  profile_id IN (SELECT id FROM pro_service_profiles WHERE user_id = auth.uid())
);

-- Create RLS policies for pro_portfolios
CREATE POLICY "Users can view portfolios" ON public.pro_portfolios
FOR SELECT USING (
  profile_id IN (SELECT id FROM pro_service_profiles WHERE is_active = true) OR
  profile_id IN (SELECT id FROM pro_service_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can manage their own portfolio" ON public.pro_portfolios
FOR ALL USING (
  profile_id IN (SELECT id FROM pro_service_profiles WHERE user_id = auth.uid())
);

-- Create RLS policies for pro_service_bookings
CREATE POLICY "Users can view their bookings" ON public.pro_service_bookings
FOR SELECT USING (
  client_id = auth.uid() OR
  service_id IN (
    SELECT s.id FROM pro_services s 
    JOIN pro_service_profiles p ON s.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their bookings" ON public.pro_service_bookings
FOR ALL USING (
  client_id = auth.uid() OR
  service_id IN (
    SELECT s.id FROM pro_services s 
    JOIN pro_service_profiles p ON s.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

-- Create RLS policies for other tables
CREATE POLICY "Users can view their analytics" ON public.pro_analytics
FOR SELECT USING (profile_id IN (SELECT id FROM pro_service_profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert analytics" ON public.pro_analytics
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage their leads" ON public.pro_leads
FOR ALL USING (profile_id IN (SELECT id FROM pro_service_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their contracts" ON public.pro_contracts
FOR ALL USING (
  profile_id IN (SELECT id FROM pro_service_profiles WHERE user_id = auth.uid()) OR
  client_id = auth.uid()
);

CREATE POLICY "Users can view their deliverables" ON public.pro_deliverables
FOR SELECT USING (
  contract_id IN (
    SELECT id FROM pro_contracts WHERE 
    profile_id IN (SELECT id FROM pro_service_profiles WHERE user_id = auth.uid()) OR
    client_id = auth.uid()
  )
);

CREATE POLICY "Providers can manage deliverables" ON public.pro_deliverables
FOR ALL USING (
  contract_id IN (
    SELECT id FROM pro_contracts WHERE 
    profile_id IN (SELECT id FROM pro_service_profiles WHERE user_id = auth.uid())
  )
);

-- Create indexes for better performance
CREATE INDEX idx_pro_service_profiles_user_id ON public.pro_service_profiles(user_id);
CREATE INDEX idx_pro_service_profiles_slug ON public.pro_service_profiles(profile_slug);
CREATE INDEX idx_pro_services_profile_id ON public.pro_services(profile_id);
CREATE INDEX idx_pro_services_category ON public.pro_services(category);
CREATE INDEX idx_pro_portfolios_profile_id ON public.pro_portfolios(profile_id);
CREATE INDEX idx_pro_bookings_service_id ON public.pro_service_bookings(service_id);
CREATE INDEX idx_pro_bookings_client_id ON public.pro_service_bookings(client_id);
CREATE INDEX idx_pro_analytics_profile_date ON public.pro_analytics(profile_id, date);
CREATE INDEX idx_pro_leads_profile_id ON public.pro_leads(profile_id);
CREATE INDEX idx_pro_contracts_profile_id ON public.pro_contracts(profile_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_pro_subscription_tiers_updated_at
  BEFORE UPDATE ON public.pro_subscription_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pro_service_profiles_updated_at
  BEFORE UPDATE ON public.pro_service_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pro_services_updated_at
  BEFORE UPDATE ON public.pro_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pro_portfolios_updated_at
  BEFORE UPDATE ON public.pro_portfolios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pro_bookings_updated_at
  BEFORE UPDATE ON public.pro_service_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pro_leads_updated_at
  BEFORE UPDATE ON public.pro_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pro_contracts_updated_at
  BEFORE UPDATE ON public.pro_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pro_deliverables_updated_at
  BEFORE UPDATE ON public.pro_deliverables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
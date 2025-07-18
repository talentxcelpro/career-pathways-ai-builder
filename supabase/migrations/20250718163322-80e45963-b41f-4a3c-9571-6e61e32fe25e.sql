-- Add enhanced service fields to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS focus_keywords TEXT,
ADD COLUMN IF NOT EXISTS available_slots INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS booking_buffer TEXT DEFAULT '1',
ADD COLUMN IF NOT EXISTS working_days TEXT[] DEFAULT '{"Mon","Tue","Wed","Thu","Fri"}',
ADD COLUMN IF NOT EXISTS auto_accept_bookings BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS add_ons JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS service_slug TEXT,
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promotion_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS booking_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_rating NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create function to generate service slugs
CREATE OR REPLACE FUNCTION public.generate_service_slug(service_title text, provider_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Generate base slug from title
  base_slug := lower(trim(service_title));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Add provider identifier
  base_slug := base_slug || '-' || substring(provider_id::text, 1, 8);
  
  final_slug := base_slug;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.services WHERE service_slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Create trigger to auto-generate slugs
CREATE OR REPLACE FUNCTION public.set_service_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.service_slug IS NULL THEN
    NEW.service_slug := public.generate_service_slug(NEW.title, NEW.provider_id);
  END IF;
  NEW.last_updated := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_set_service_slug
  BEFORE INSERT OR UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.set_service_slug();

-- Create service analytics table
CREATE TABLE IF NOT EXISTS public.service_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view', 'contact', 'booking', 'share'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on service_analytics
ALTER TABLE public.service_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for service_analytics
CREATE POLICY "Service providers can view their analytics" ON public.service_analytics
  FOR SELECT USING (
    service_id IN (
      SELECT id FROM public.services WHERE provider_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert analytics events" ON public.service_analytics
  FOR INSERT WITH CHECK (true);

-- Create service bookings table
CREATE TABLE IF NOT EXISTS public.service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL,
  booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  booking_date TIMESTAMP WITH TIME ZONE,
  client_requirements TEXT,
  special_instructions TEXT,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  selected_addons JSONB DEFAULT '[]',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_method TEXT,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on service_bookings
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for service_bookings
CREATE POLICY "Clients can view their bookings" ON public.service_bookings
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Providers can view their bookings" ON public.service_bookings
  FOR SELECT USING (provider_id = auth.uid());

CREATE POLICY "Clients can create bookings" ON public.service_bookings
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Providers can update their bookings" ON public.service_bookings
  FOR UPDATE USING (provider_id = auth.uid());

CREATE POLICY "Clients can update their bookings" ON public.service_bookings
  FOR UPDATE USING (client_id = auth.uid());

-- Create trigger for service_bookings updated_at
CREATE OR REPLACE FUNCTION public.update_service_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_bookings_updated_at
  BEFORE UPDATE ON public.service_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_service_bookings_updated_at();

-- Create function to update service statistics
CREATE OR REPLACE FUNCTION public.update_service_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update view count
  IF TG_TABLE_NAME = 'service_analytics' AND NEW.event_type = 'view' THEN
    UPDATE public.services 
    SET view_count = view_count + 1
    WHERE id = NEW.service_id;
  END IF;
  
  -- Update booking count
  IF TG_TABLE_NAME = 'service_bookings' AND TG_OP = 'INSERT' THEN
    UPDATE public.services 
    SET booking_count = booking_count + 1
    WHERE id = NEW.service_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating service stats
CREATE TRIGGER trigger_update_service_view_stats
  AFTER INSERT ON public.service_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_service_stats();

CREATE TRIGGER trigger_update_service_booking_stats
  AFTER INSERT ON public.service_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_service_stats();

-- Create service promotion credits table
CREATE TABLE IF NOT EXISTS public.service_promotion_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credit_type TEXT NOT NULL, -- 'homepage_feature', 'category_top', 'sponsored_post', 'newsletter'
  credits_available INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on service_promotion_credits
ALTER TABLE public.service_promotion_credits ENABLE ROW LEVEL SECURITY;

-- Create policies for service_promotion_credits
CREATE POLICY "Users can view their promotion credits" ON public.service_promotion_credits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their promotion credits" ON public.service_promotion_credits
  FOR UPDATE USING (user_id = auth.uid());

-- Create service promotion transactions table
CREATE TABLE IF NOT EXISTS public.service_promotion_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  promotion_type TEXT NOT NULL,
  credits_used INTEGER NOT NULL,
  promotion_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  promotion_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on service_promotion_transactions
ALTER TABLE public.service_promotion_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for service_promotion_transactions
CREATE POLICY "Users can view their promotion transactions" ON public.service_promotion_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create promotion transactions" ON public.service_promotion_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_subcategory_id ON public.services(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON public.services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_is_featured ON public.services(is_featured);
CREATE INDEX IF NOT EXISTS idx_services_service_slug ON public.services(service_slug);
CREATE INDEX IF NOT EXISTS idx_services_price ON public.services(price);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON public.services(created_at);
CREATE INDEX IF NOT EXISTS idx_services_tags ON public.services USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_service_analytics_service_id ON public.service_analytics(service_id);
CREATE INDEX IF NOT EXISTS idx_service_analytics_event_type ON public.service_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_service_analytics_created_at ON public.service_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_service_bookings_service_id ON public.service_bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_client_id ON public.service_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_provider_id ON public.service_bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_booking_status ON public.service_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_service_bookings_created_at ON public.service_bookings(created_at);
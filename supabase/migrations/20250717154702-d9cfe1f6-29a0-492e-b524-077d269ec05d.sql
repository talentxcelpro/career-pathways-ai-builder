
-- Create the services table with the correct structure
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  professional_title TEXT,
  years_experience TEXT,
  location TEXT,
  description TEXT NOT NULL,
  whats_included TEXT[] DEFAULT '{}',
  client_requirements TEXT,
  delivery_time_days INTEGER NOT NULL DEFAULT 7,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_methods TEXT[] DEFAULT '{}',
  contact_email BOOLEAN DEFAULT true,
  contact_phone BOOLEAN DEFAULT false,
  contact_website BOOLEAN DEFAULT false,
  website_url TEXT,
  phone_number TEXT,
  tags TEXT[] DEFAULT '{}',
  portfolio_files TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on provider_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON public.services(provider_id);

-- Create an index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policy for reading services (anyone can view active services)
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

-- Policy for providers to manage their own services
CREATE POLICY "Providers can manage their own services" ON public.services
  FOR ALL USING (auth.uid() = provider_id);

-- Create service reviews table
CREATE TABLE IF NOT EXISTS public.service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on service_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_service_reviews_service_id ON public.service_reviews(service_id);

-- Enable Row Level Security for reviews
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

-- Policy for reading reviews (anyone can view reviews)
CREATE POLICY "Anyone can view reviews" ON public.service_reviews
  FOR SELECT USING (true);

-- Policy for reviewers to manage their own reviews
CREATE POLICY "Reviewers can manage their own reviews" ON public.service_reviews
  FOR ALL USING (auth.uid() = reviewer_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_reviews_updated_at
    BEFORE UPDATE ON public.service_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

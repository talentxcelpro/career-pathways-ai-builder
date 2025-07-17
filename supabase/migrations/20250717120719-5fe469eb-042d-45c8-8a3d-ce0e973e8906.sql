
-- Create services table for service providers
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  professional_title TEXT NOT NULL,
  years_experience TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  whats_included TEXT[] NOT NULL DEFAULT '{}',
  client_requirements TEXT NOT NULL,
  delivery_time_days INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_methods TEXT[] NOT NULL DEFAULT '{}',
  contact_email BOOLEAN DEFAULT true,
  contact_phone BOOLEAN DEFAULT false,
  contact_website BOOLEAN DEFAULT false,
  website_url TEXT,
  phone_number TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  portfolio_files TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create service reviews table
CREATE TABLE public.service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service_id, reviewer_id)
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for services
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service providers can manage their own services" ON public.services
  FOR ALL USING (auth.uid() = provider_id);

CREATE POLICY "Admins can manage all services" ON public.services
  FOR ALL USING (is_app_admin(auth.uid()));

-- RLS policies for service reviews
CREATE POLICY "Anyone can view service reviews" ON public.service_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.service_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" ON public.service_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" ON public.service_reviews
  FOR DELETE USING (auth.uid() = reviewer_id);

CREATE POLICY "Admins can manage all reviews" ON public.service_reviews
  FOR ALL USING (is_app_admin(auth.uid()));

-- Create trigger to update service rating when reviews change
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update average rating and review count for the service
  UPDATE public.services 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM public.service_reviews 
      WHERE service_id = COALESCE(NEW.service_id, OLD.service_id)
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.service_reviews 
      WHERE service_id = COALESCE(NEW.service_id, OLD.service_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.service_id, OLD.service_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.service_reviews
  FOR EACH ROW EXECUTE FUNCTION update_service_rating();

-- Create updated_at trigger for services
CREATE TRIGGER trigger_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for service reviews
CREATE TRIGGER trigger_service_reviews_updated_at
  BEFORE UPDATE ON public.service_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_services_provider_id ON public.services(provider_id);
CREATE INDEX idx_services_active ON public.services(is_active);
CREATE INDEX idx_services_featured ON public.services(is_featured);
CREATE INDEX idx_service_reviews_service_id ON public.service_reviews(service_id);
CREATE INDEX idx_service_reviews_rating ON public.service_reviews(rating);

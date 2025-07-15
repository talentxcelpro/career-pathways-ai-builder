-- Create marketplace services and related tables

-- Service providers table
CREATE TABLE public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  hourly_rate DECIMAL(10,2),
  experience_years INTEGER DEFAULT 0,
  response_time_hours INTEGER DEFAULT 24,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMPTZ,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  profile_completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service categories table
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES service_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('fixed', 'hourly', 'package')),
  base_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  delivery_time_days INTEGER DEFAULT 7,
  skills_offered TEXT[] DEFAULT '{}',
  service_type TEXT NOT NULL CHECK (service_type IN ('consultation', 'review', 'training', 'coaching', 'design', 'development')),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service reviews table
CREATE TABLE public.service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_public BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service_id, reviewer_id, booking_id)
);

-- Service bookings table
CREATE TABLE public.service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('instant', 'request_callback')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded')),
  price_agreed DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  scheduled_date TIMESTAMPTZ,
  completion_date TIMESTAMPTZ,
  client_notes TEXT,
  provider_notes TEXT,
  cancellation_reason TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service favorites table
CREATE TABLE public.service_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_id)
);

-- Service portfolio/samples table
CREATE TABLE public.service_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  attachment_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default service categories
INSERT INTO public.service_categories (name, slug, description, icon, color, display_order) VALUES
('Resume & CV', 'resume-cv', 'Professional resume writing and review services', 'file-text', '#3B82F6', 1),
('Interview Prep', 'interview-prep', 'Mock interviews and coaching services', 'message-square', '#10B981', 2),
('Career Coaching', 'career-coaching', 'Professional career guidance and mentoring', 'target', '#8B5CF6', 3),
('LinkedIn Optimization', 'linkedin-optimization', 'LinkedIn profile optimization and strategy', 'linkedin', '#0077B5', 4),
('Skill Development', 'skill-development', 'Technical and soft skills training', 'book-open', '#F59E0B', 5),
('Personal Branding', 'personal-branding', 'Build your professional brand and online presence', 'star', '#EF4444', 6),
('Salary Negotiation', 'salary-negotiation', 'Negotiation strategies and coaching', 'dollar-sign', '#059669', 7),
('Portfolio Review', 'portfolio-review', 'Professional portfolio and work samples review', 'briefcase', '#DC2626', 8);

-- Enable Row Level Security
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_portfolio ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_providers
CREATE POLICY "Users can view all service providers" ON public.service_providers
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own provider profile" ON public.service_providers
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for service_categories
CREATE POLICY "Anyone can view service categories" ON public.service_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage service categories" ON public.service_categories
  FOR ALL USING (is_app_admin(auth.uid()));

-- RLS Policies for services
CREATE POLICY "Users can view active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can manage their own services" ON public.services
  FOR ALL USING (provider_id IN (
    SELECT id FROM service_providers WHERE user_id = auth.uid()
  ));

-- RLS Policies for service_reviews
CREATE POLICY "Users can view public reviews" ON public.service_reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage their own reviews" ON public.service_reviews
  FOR ALL USING (auth.uid() = reviewer_id);

-- RLS Policies for service_bookings
CREATE POLICY "Users can view their bookings as client" ON public.service_bookings
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can view their bookings as provider" ON public.service_bookings
  FOR SELECT USING (provider_id IN (
    SELECT id FROM service_providers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create bookings" ON public.service_bookings
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their bookings" ON public.service_bookings
  FOR UPDATE USING (
    auth.uid() = client_id OR 
    provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid())
  );

-- RLS Policies for service_favorites
CREATE POLICY "Users can manage their own favorites" ON public.service_favorites
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for service_portfolio
CREATE POLICY "Users can view service portfolio" ON public.service_portfolio
  FOR SELECT USING (true);

CREATE POLICY "Providers can manage their portfolio" ON public.service_portfolio
  FOR ALL USING (service_id IN (
    SELECT s.id FROM services s
    JOIN service_providers sp ON s.provider_id = sp.id
    WHERE sp.user_id = auth.uid()
  ));

-- Add indexes for performance
CREATE INDEX idx_service_providers_user_id ON public.service_providers(user_id);
CREATE INDEX idx_service_providers_location ON public.service_providers(location);
CREATE INDEX idx_service_providers_verified ON public.service_providers(is_verified);

CREATE INDEX idx_services_provider_id ON public.services(provider_id);
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_services_active ON public.services(is_active);
CREATE INDEX idx_services_featured ON public.services(is_featured);
CREATE INDEX idx_services_rating ON public.services(average_rating);
CREATE INDEX idx_services_price ON public.services(base_price);

CREATE INDEX idx_service_reviews_service_id ON public.service_reviews(service_id);
CREATE INDEX idx_service_reviews_reviewer_id ON public.service_reviews(reviewer_id);
CREATE INDEX idx_service_reviews_rating ON public.service_reviews(rating);

CREATE INDEX idx_service_bookings_service_id ON public.service_bookings(service_id);
CREATE INDEX idx_service_bookings_client_id ON public.service_bookings(client_id);
CREATE INDEX idx_service_bookings_provider_id ON public.service_bookings(provider_id);
CREATE INDEX idx_service_bookings_status ON public.service_bookings(status);

CREATE INDEX idx_service_favorites_user_service ON public.service_favorites(user_id, service_id);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_reviews_updated_at
  BEFORE UPDATE ON public.service_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_bookings_updated_at
  BEFORE UPDATE ON public.service_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update service ratings
CREATE OR REPLACE FUNCTION public.update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.services
  SET 
    average_rating = (
      SELECT AVG(rating)::DECIMAL(3,2) 
      FROM service_reviews 
      WHERE service_id = COALESCE(NEW.service_id, OLD.service_id)
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM service_reviews 
      WHERE service_id = COALESCE(NEW.service_id, OLD.service_id)
    )
  WHERE id = COALESCE(NEW.service_id, OLD.service_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update service ratings when reviews change
CREATE TRIGGER update_service_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.service_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_service_rating();
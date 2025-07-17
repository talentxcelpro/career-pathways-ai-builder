-- Create service testimonials table
CREATE TABLE public.service_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL,
  user_id UUID NOT NULL,
  service_order_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  testimonial_text TEXT NOT NULL,
  service_experience TEXT,
  would_recommend BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_service_testimonials_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_service_testimonials_service_order_id FOREIGN KEY (service_order_id) REFERENCES service_orders(id) ON DELETE SET NULL
);

-- Enable RLS on service testimonials
ALTER TABLE public.service_testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for service testimonials
CREATE POLICY "Anyone can view approved testimonials" ON public.service_testimonials
  FOR SELECT USING (is_verified = true);

CREATE POLICY "Users can create testimonials for completed orders" ON public.service_testimonials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own testimonials" ON public.service_testimonials
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all testimonials" ON public.service_testimonials
  FOR ALL USING (is_app_admin(auth.uid()));

-- Create user verification requests table
CREATE TABLE public.user_verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('identity', 'professional', 'premium', 'business')),
  submitted_documents JSONB DEFAULT '[]'::jsonb,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'approved', 'rejected', 'additional_info_required')),
  admin_notes TEXT,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_user_verification_requests_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_verification_requests_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on user verification requests
ALTER TABLE public.user_verification_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for user verification requests
CREATE POLICY "Users can view their own verification requests" ON public.user_verification_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification requests" ON public.user_verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending requests" ON public.user_verification_requests
  FOR UPDATE USING (auth.uid() = user_id AND verification_status = 'pending');

CREATE POLICY "Admins can manage all verification requests" ON public.user_verification_requests
  FOR ALL USING (is_app_admin(auth.uid()));

-- Add verification status to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_badges JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS testimonials_count INTEGER DEFAULT 0;

-- Create trigger to update testimonials count
CREATE OR REPLACE FUNCTION update_user_testimonials_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET testimonials_count = testimonials_count + 1 
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET testimonials_count = GREATEST(testimonials_count - 1, 0) 
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_testimonials_count
  AFTER INSERT OR DELETE ON public.service_testimonials
  FOR EACH ROW EXECUTE FUNCTION update_user_testimonials_count();

-- Add updated_at trigger for testimonials
CREATE TRIGGER trigger_service_testimonials_updated_at
  BEFORE UPDATE ON public.service_testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for verification requests
CREATE TRIGGER trigger_user_verification_requests_updated_at
  BEFORE UPDATE ON public.user_verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
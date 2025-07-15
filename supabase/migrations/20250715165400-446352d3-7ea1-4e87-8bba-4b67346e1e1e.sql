-- Create elite service templates table
CREATE TABLE public.elite_service_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  recommended_pricing_type TEXT DEFAULT 'fixed',
  suggested_price_range TEXT,
  delivery_time_days INTEGER,
  features TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.elite_service_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active elite service templates"
ON public.elite_service_templates
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage elite service templates"
ON public.elite_service_templates
FOR ALL
USING (is_app_admin(auth.uid()));

-- Insert default elite service templates
INSERT INTO public.elite_service_templates (title, description, category, recommended_pricing_type, suggested_price_range, delivery_time_days, features) VALUES
('Premium AI Consulting', 'Advanced AI strategy consulting with custom implementation roadmap', 'consulting', 'hourly', '₹5000-15000/hour', 14, ARRAY['AI Strategy Development', 'Custom Implementation Plan', 'Technology Stack Recommendation', 'ROI Analysis']),
('Executive Leadership Coaching', 'One-on-one executive coaching for C-level professionals', 'coaching', 'package', '₹50000-200000/month', 30, ARRAY['Leadership Assessment', 'Personal Development Plan', 'Weekly 1-on-1 Sessions', 'Progress Tracking']),
('Enterprise Digital Transformation', 'Complete digital transformation consulting for large organizations', 'consulting', 'contact', 'Custom Quote', 90, ARRAY['Current State Analysis', 'Digital Strategy Development', 'Technology Selection', 'Implementation Planning']),
('Custom Software Architecture', 'Design and architect scalable software solutions', 'development', 'fixed', '₹100000-500000', 45, ARRAY['System Architecture Design', 'Technology Stack Selection', 'Security Implementation', 'Performance Optimization']),
('Brand Identity & Marketing Strategy', 'Complete brand identity development with marketing strategy', 'marketing', 'package', '₹75000-300000', 21, ARRAY['Brand Strategy Development', 'Visual Identity Design', 'Marketing Campaign Planning', 'Content Strategy']),
('Financial Planning & Investment Advisory', 'Comprehensive financial planning and investment advisory services', 'consulting', 'hourly', '₹3000-8000/hour', 7, ARRAY['Financial Goal Setting', 'Investment Portfolio Review', 'Risk Assessment', 'Tax Planning']),
('Technical Writing & Documentation', 'Professional technical documentation and content creation', 'writing', 'fixed', '₹25000-100000', 14, ARRAY['Technical Documentation', 'API Documentation', 'User Manuals', 'Content Strategy']),
('Product Design & UX Consultation', 'End-to-end product design and user experience consultation', 'design', 'package', '₹80000-400000', 30, ARRAY['User Research', 'Design System Creation', 'Prototype Development', 'Usability Testing']);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_elite_service_templates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_elite_service_templates_updated_at
  BEFORE UPDATE ON public.elite_service_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_elite_service_templates_updated_at();
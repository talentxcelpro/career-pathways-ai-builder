-- Create comprehensive resume builder schema for TalentXcel

-- Resume templates table
CREATE TABLE public.resume_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'professional',
  preview_image_url TEXT,
  template_config JSONB NOT NULL DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced resumes table
CREATE TABLE public.resumes_enhanced (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  template_id UUID REFERENCES public.resume_templates(id),
  content JSONB NOT NULL DEFAULT '{}',
  customization JSONB DEFAULT '{}',
  ats_score INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  public_url_slug TEXT UNIQUE,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resume sections table for flexible content management
CREATE TABLE public.resume_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes_enhanced(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  section_order INTEGER DEFAULT 0,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resume versions for tracking changes
CREATE TABLE public.resume_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes_enhanced(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  version_name TEXT,
  content_snapshot JSONB NOT NULL,
  is_current BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resume analytics for tracking performance
CREATE TABLE public.resume_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes_enhanced(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  visitor_id TEXT,
  referrer_url TEXT,
  user_agent TEXT,
  location_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resume_templates
CREATE POLICY "Everyone can view active templates" 
ON public.resume_templates FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage templates" 
ON public.resume_templates FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS Policies for resumes_enhanced
CREATE POLICY "Users can manage their own resumes" 
ON public.resumes_enhanced FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Public resumes are viewable by everyone" 
ON public.resumes_enhanced FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

-- RLS Policies for resume_sections
CREATE POLICY "Users can manage their resume sections" 
ON public.resume_sections FOR ALL 
USING (resume_id IN (SELECT id FROM public.resumes_enhanced WHERE user_id = auth.uid()));

-- RLS Policies for resume_versions
CREATE POLICY "Users can manage their resume versions" 
ON public.resume_versions FOR ALL 
USING (resume_id IN (SELECT id FROM public.resumes_enhanced WHERE user_id = auth.uid()));

-- RLS Policies for resume_analytics
CREATE POLICY "Users can view their resume analytics" 
ON public.resume_analytics FOR SELECT 
USING (resume_id IN (SELECT id FROM public.resumes_enhanced WHERE user_id = auth.uid()));

CREATE POLICY "System can insert analytics" 
ON public.resume_analytics FOR INSERT 
WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_resume_templates_updated_at
  BEFORE UPDATE ON public.resume_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resumes_enhanced_updated_at
  BEFORE UPDATE ON public.resumes_enhanced
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resume_sections_updated_at
  BEFORE UPDATE ON public.resume_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.resume_templates (name, description, category, template_config, is_active) VALUES
('TalentXcel Modern', 'Clean and contemporary design perfect for tech professionals', 'modern', '{"colors": {"primary": "#2563eb", "secondary": "#64748b"}, "fonts": {"heading": "Inter", "body": "Inter"}, "layout": "single-column"}', true),
('TalentXcel Executive', 'Sophisticated layout ideal for senior leadership roles', 'executive', '{"colors": {"primary": "#1f2937", "secondary": "#6b7280"}, "fonts": {"heading": "Playfair Display", "body": "Source Sans Pro"}, "layout": "two-column"}', true),
('TalentXcel Creative', 'Eye-catching design for creative professionals', 'creative', '{"colors": {"primary": "#7c3aed", "secondary": "#a855f7"}, "fonts": {"heading": "Poppins", "body": "Open Sans"}, "layout": "asymmetric"}', true),
('TalentXcel Minimalist', 'Simple and elegant for maximum impact', 'minimalist', '{"colors": {"primary": "#059669", "secondary": "#6b7280"}, "fonts": {"heading": "Roboto", "body": "Roboto"}, "layout": "clean"}', true),
('TalentXcel ATS-Optimized', 'Designed specifically for ATS compatibility', 'ats', '{"colors": {"primary": "#1e40af", "secondary": "#374151"}, "fonts": {"heading": "Arial", "body": "Arial"}, "layout": "traditional"}', true);
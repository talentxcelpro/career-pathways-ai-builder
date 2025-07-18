-- Create comprehensive resume template system
CREATE TABLE IF NOT EXISTS public.resume_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'professional',
  industry TEXT[] DEFAULT '{}',
  experience_level TEXT DEFAULT 'all',
  preview_image_url TEXT,
  template_config JSONB NOT NULL DEFAULT '{}',
  design_tokens JSONB NOT NULL DEFAULT '{}',
  layout_config JSONB NOT NULL DEFAULT '{}',
  features JSONB NOT NULL DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create template customization options
CREATE TABLE IF NOT EXISTS public.template_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.resume_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  customization_data JSONB NOT NULL DEFAULT '{}',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create template usage analytics
CREATE TABLE IF NOT EXISTS public.template_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.resume_templates(id) ON DELETE CASCADE,
  user_id UUID,
  action_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_usage_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for resume templates
CREATE POLICY "Templates are viewable by everyone" 
ON public.resume_templates 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage templates" 
ON public.resume_templates 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS policies for template customizations
CREATE POLICY "Users can manage their own customizations" 
ON public.template_customizations 
FOR ALL 
USING (user_id = auth.uid());

-- RLS policies for template usage analytics
CREATE POLICY "Users can view their own usage analytics" 
ON public.template_usage_analytics 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert analytics" 
ON public.template_usage_analytics 
FOR INSERT 
WITH CHECK (true);

-- Insert default professional templates
INSERT INTO public.resume_templates (name, description, category, industry, experience_level, template_config, design_tokens, layout_config, features) VALUES
('Classic Executive', 'Traditional ATS-friendly resume perfect for corporate environments', 'professional', ARRAY['finance', 'consulting', 'corporate'], 'senior', 
  '{"headerStyle": "classic", "sectionSpacing": "standard", "fontWeight": "normal"}',
  '{"primaryColor": "#2C3E50", "secondaryColor": "#34495E", "accentColor": "#3498DB", "backgroundColor": "#FFFFFF", "textColor": "#2C3E50"}',
  '{"columns": 1, "margins": "standard", "pageBreaks": "automatic"}',
  '{"atsOptimized": true, "photoSupport": false, "colorCustomization": true, "layoutFlexibility": 3}'
),
('Modern Professional', 'Clean and contemporary design with subtle color accents', 'professional', ARRAY['tech', 'marketing', 'business'], 'mid',
  '{"headerStyle": "modern", "sectionSpacing": "compact", "fontWeight": "medium"}',
  '{"primaryColor": "#1ABC9C", "secondaryColor": "#16A085", "accentColor": "#E74C3C", "backgroundColor": "#FFFFFF", "textColor": "#2C3E50"}',
  '{"columns": 1, "margins": "narrow", "pageBreaks": "smart"}',
  '{"atsOptimized": true, "photoSupport": true, "colorCustomization": true, "layoutFlexibility": 4}'
),
('Creative Designer', 'Visual-first template with design elements for creative professionals', 'creative', ARRAY['design', 'marketing', 'media'], 'all',
  '{"headerStyle": "creative", "sectionSpacing": "wide", "fontWeight": "bold"}',
  '{"primaryColor": "#9B59B6", "secondaryColor": "#8E44AD", "accentColor": "#F39C12", "backgroundColor": "#FFFFFF", "textColor": "#2C3E50"}',
  '{"columns": 2, "margins": "wide", "pageBreaks": "manual"}',
  '{"atsOptimized": false, "photoSupport": true, "colorCustomization": true, "layoutFlexibility": 5}'
),
('Engineering Excellence', 'Technical skills-focused template optimized for engineering roles', 'industry', ARRAY['engineering', 'construction', 'manufacturing'], 'all',
  '{"headerStyle": "technical", "sectionSpacing": "standard", "fontWeight": "normal"}',
  '{"primaryColor": "#34495E", "secondaryColor": "#2C3E50", "accentColor": "#3498DB", "backgroundColor": "#FFFFFF", "textColor": "#2C3E50"}',
  '{"columns": 1, "margins": "standard", "pageBreaks": "automatic"}',
  '{"atsOptimized": true, "photoSupport": false, "colorCustomization": true, "layoutFlexibility": 3}'
),
('Startup Innovator', 'Modern tech-focused design for startup environments', 'creative', ARRAY['tech', 'startup', 'innovation'], 'entry',
  '{"headerStyle": "startup", "sectionSpacing": "compact", "fontWeight": "medium"}',
  '{"primaryColor": "#E74C3C", "secondaryColor": "#C0392B", "accentColor": "#F39C12", "backgroundColor": "#FFFFFF", "textColor": "#2C3E50"}',
  '{"columns": 1, "margins": "narrow", "pageBreaks": "smart"}',
  '{"atsOptimized": true, "photoSupport": true, "colorCustomization": true, "layoutFlexibility": 4}'
),
('Entry Level', 'Skills and education focused template for new graduates', 'experience', ARRAY['general'], 'entry',
  '{"headerStyle": "simple", "sectionSpacing": "standard", "fontWeight": "normal"}',
  '{"primaryColor": "#3498DB", "secondaryColor": "#2980B9", "accentColor": "#1ABC9C", "backgroundColor": "#FFFFFF", "textColor": "#2C3E50"}',
  '{"columns": 1, "margins": "standard", "pageBreaks": "automatic"}',
  '{"atsOptimized": true, "photoSupport": false, "colorCustomization": true, "layoutFlexibility": 3}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resume_templates_category ON public.resume_templates(category);
CREATE INDEX IF NOT EXISTS idx_resume_templates_industry ON public.resume_templates USING GIN(industry);
CREATE INDEX IF NOT EXISTS idx_template_customizations_user_id ON public.template_customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_analytics_template_id ON public.template_usage_analytics(template_id);

-- Create function to update template usage count
CREATE OR REPLACE FUNCTION public.update_template_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action_type = 'template_selected' THEN
    UPDATE public.resume_templates 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for template usage tracking
CREATE TRIGGER trigger_update_template_usage_count
  AFTER INSERT ON public.template_usage_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_template_usage_count();

-- Create function to track template usage
CREATE OR REPLACE FUNCTION public.track_template_usage(
  template_uuid UUID,
  user_uuid UUID,
  action_type TEXT,
  metadata JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.template_usage_analytics (template_id, user_id, action_type, metadata)
  VALUES (template_uuid, user_uuid, action_type, metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
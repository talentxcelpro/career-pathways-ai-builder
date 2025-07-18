-- Fix template system by updating existing data
-- Add missing columns to resume_templates if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resume_templates' AND column_name = 'template_config') THEN
        ALTER TABLE public.resume_templates ADD COLUMN template_config JSONB NOT NULL DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resume_templates' AND column_name = 'design_tokens') THEN
        ALTER TABLE public.resume_templates ADD COLUMN design_tokens JSONB NOT NULL DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resume_templates' AND column_name = 'layout_config') THEN
        ALTER TABLE public.resume_templates ADD COLUMN layout_config JSONB NOT NULL DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resume_templates' AND column_name = 'features') THEN
        ALTER TABLE public.resume_templates ADD COLUMN features JSONB NOT NULL DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resume_templates' AND column_name = 'industry') THEN
        ALTER TABLE public.resume_templates ADD COLUMN industry TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resume_templates' AND column_name = 'experience_level') THEN
        ALTER TABLE public.resume_templates ADD COLUMN experience_level TEXT DEFAULT 'all';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resume_templates' AND column_name = 'usage_count') THEN
        ALTER TABLE public.resume_templates ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resume_templates' AND column_name = 'rating') THEN
        ALTER TABLE public.resume_templates ADD COLUMN rating NUMERIC DEFAULT 0;
    END IF;
END $$;

-- Update existing templates with proper configuration
UPDATE public.resume_templates SET 
  template_config = '{"headerStyle": "modern", "sectionSpacing": "compact", "fontWeight": "medium"}'::jsonb,
  design_tokens = '{"primaryColor": "#1ABC9C", "secondaryColor": "#16A085", "accentColor": "#E74C3C", "backgroundColor": "#FFFFFF", "textColor": "#2C3E50"}'::jsonb,
  layout_config = '{"columns": 1, "margins": "narrow", "pageBreaks": "smart"}'::jsonb,
  features = '{"atsOptimized": true, "photoSupport": true, "colorCustomization": true, "layoutFlexibility": 4}'::jsonb,
  industry = ARRAY['tech', 'business', 'general'],
  experience_level = 'all'
WHERE name = 'Modern Professional';

-- Insert comprehensive template data if not exists
INSERT INTO public.resume_templates (name, description, category, industry, experience_level, template_config, design_tokens, layout_config, features) 
SELECT 'Classic Executive', 'Traditional ATS-friendly resume perfect for corporate environments', 'professional', ARRAY['finance', 'consulting', 'corporate'], 'senior', 
  '{"headerStyle": "classic", "sectionSpacing": "standard", "fontWeight": "normal"}'::jsonb,
  '{"primaryColor": "#2C3E50", "secondaryColor": "#34495E", "accentColor": "#3498DB", "backgroundColor": "#FFFFFF", "textColor": "#2C3E50"}'::jsonb,
  '{"columns": 1, "margins": "standard", "pageBreaks": "automatic"}'::jsonb,
  '{"atsOptimized": true, "photoSupport": false, "colorCustomization": true, "layoutFlexibility": 3}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.resume_templates WHERE name = 'Classic Executive');

INSERT INTO public.resume_templates (name, description, category, industry, experience_level, template_config, design_tokens, layout_config, features) 
SELECT 'Creative Designer', 'Visual-first template with design elements for creative professionals', 'creative', ARRAY['design', 'marketing', 'media'], 'all',
  '{"headerStyle": "creative", "sectionSpacing": "wide", "fontWeight": "bold"}'::jsonb,
  '{"primaryColor": "#9B59B6", "secondaryColor": "#8E44AD", "accentColor": "#F39C12", "backgroundColor": "#FFFFFF", "textColor": "#2C3E50"}'::jsonb,
  '{"columns": 2, "margins": "wide", "pageBreaks": "manual"}'::jsonb,
  '{"atsOptimized": false, "photoSupport": true, "colorCustomization": true, "layoutFlexibility": 5}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.resume_templates WHERE name = 'Creative Designer');

INSERT INTO public.resume_templates (name, description, category, industry, experience_level, template_config, design_tokens, layout_config, features) 
SELECT 'Engineering Excellence', 'Technical skills-focused template optimized for engineering roles', 'industry', ARRAY['engineering', 'construction', 'manufacturing'], 'all',
  '{"headerStyle": "technical", "sectionSpacing": "standard", "fontWeight": "normal"}'::jsonb,
  '{"primaryColor": "#34495E", "secondaryColor": "#2C3E50", "accentColor": "#3498DB", "backgroundColor": "#FFFFFF", "textColor": "#2C3E50"}'::jsonb,
  '{"columns": 1, "margins": "standard", "pageBreaks": "automatic"}'::jsonb,
  '{"atsOptimized": true, "photoSupport": false, "colorCustomization": true, "layoutFlexibility": 3}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.resume_templates WHERE name = 'Engineering Excellence');

INSERT INTO public.resume_templates (name, description, category, industry, experience_level, template_config, design_tokens, layout_config, features) 
SELECT 'Entry Level', 'Skills and education focused template for new graduates', 'experience', ARRAY['general'], 'entry',
  '{"headerStyle": "simple", "sectionSpacing": "standard", "fontWeight": "normal"}'::jsonb,
  '{"primaryColor": "#3498DB", "secondaryColor": "#2980B9", "accentColor": "#1ABC9C", "backgroundColor": "#FFFFFF", "textColor": "#2C3E50"}'::jsonb,
  '{"columns": 1, "margins": "standard", "pageBreaks": "automatic"}'::jsonb,
  '{"atsOptimized": true, "photoSupport": false, "colorCustomization": true, "layoutFlexibility": 3}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.resume_templates WHERE name = 'Entry Level');

-- Create template customization and analytics tables
CREATE TABLE IF NOT EXISTS public.template_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.resume_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  customization_data JSONB NOT NULL DEFAULT '{}',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.template_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.resume_templates(id) ON DELETE CASCADE,
  user_id UUID,
  action_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.template_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_customizations' AND policyname = 'Users can manage their own customizations') THEN
        CREATE POLICY "Users can manage their own customizations" 
        ON public.template_customizations 
        FOR ALL 
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_usage_analytics' AND policyname = 'Users can view their own usage analytics') THEN
        CREATE POLICY "Users can view their own usage analytics" 
        ON public.template_usage_analytics 
        FOR SELECT 
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_usage_analytics' AND policyname = 'System can insert analytics') THEN
        CREATE POLICY "System can insert analytics" 
        ON public.template_usage_analytics 
        FOR INSERT 
        WITH CHECK (true);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_template_customizations_user_id ON public.template_customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_analytics_template_id ON public.template_usage_analytics(template_id);

-- Create functions for tracking template usage
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
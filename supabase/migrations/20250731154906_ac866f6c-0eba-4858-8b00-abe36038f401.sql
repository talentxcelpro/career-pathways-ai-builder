-- Create content templates table for AI bot content generation
CREATE TABLE public.bot_content_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.ai_bots(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'professional',
  domain TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL,
  seo_keywords TEXT[] NOT NULL DEFAULT '{}',
  template_type TEXT NOT NULL DEFAULT 'post',
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bot_content_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage bot content templates" 
ON public.bot_content_templates 
FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view active templates" 
ON public.bot_content_templates 
FOR SELECT 
USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX idx_bot_content_templates_bot_id ON public.bot_content_templates(bot_id);
CREATE INDEX idx_bot_content_templates_category ON public.bot_content_templates(category);
CREATE INDEX idx_bot_content_templates_domain ON public.bot_content_templates(domain);
CREATE INDEX idx_bot_content_templates_active ON public.bot_content_templates(is_active);

-- Update the bot_generated_content table to include template reference
ALTER TABLE public.bot_generated_content 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.bot_content_templates(id),
ADD COLUMN IF NOT EXISTS seo_url TEXT,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Create content generation schedule table
CREATE TABLE public.content_generation_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_name TEXT NOT NULL,
  cron_expression TEXT NOT NULL DEFAULT '*/15 * * * *', -- Every 15 minutes
  is_active BOOLEAN NOT NULL DEFAULT true,
  daily_quota INTEGER NOT NULL DEFAULT 420,
  current_day_count INTEGER NOT NULL DEFAULT 0,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  generation_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for schedule table
ALTER TABLE public.content_generation_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage generation schedule" 
ON public.content_generation_schedule 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bot_content_templates_updated_at
    BEFORE UPDATE ON public.bot_content_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_generation_schedule_updated_at
    BEFORE UPDATE ON public.content_generation_schedule
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content generation schedule
INSERT INTO public.content_generation_schedule (
  schedule_name,
  cron_expression,
  daily_quota,
  generation_config
) VALUES (
  'Daily Content Generation',
  '*/15 * * * *',
  420,
  '{"templates_per_run": 7, "variation_enabled": true, "seo_optimization": true}'::jsonb
);
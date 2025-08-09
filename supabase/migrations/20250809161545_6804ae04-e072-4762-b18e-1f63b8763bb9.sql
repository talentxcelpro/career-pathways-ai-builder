-- Create resume_templates table with RLS and admin controls
CREATE TABLE IF NOT EXISTS public.resume_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  preview_url TEXT,
  template_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  category TEXT NOT NULL DEFAULT 'modern',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;

-- Policies: Public can view active templates
DROP POLICY IF EXISTS "Public can view active resume templates" ON public.resume_templates;
CREATE POLICY "Public can view active resume templates"
ON public.resume_templates
FOR SELECT
USING (is_active = true);

-- Policies: Admins can insert/update/delete templates
DROP POLICY IF EXISTS "Admins can insert resume templates" ON public.resume_templates;
CREATE POLICY "Admins can insert resume templates"
ON public.resume_templates
FOR INSERT
WITH CHECK (is_app_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update resume templates" ON public.resume_templates;
CREATE POLICY "Admins can update resume templates"
ON public.resume_templates
FOR UPDATE
USING (is_app_admin(auth.uid()))
WITH CHECK (is_app_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete resume templates" ON public.resume_templates;
CREATE POLICY "Admins can delete resume templates"
ON public.resume_templates
FOR DELETE
USING (is_app_admin(auth.uid()));

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_resume_templates_updated_at ON public.resume_templates;
CREATE TRIGGER update_resume_templates_updated_at
BEFORE UPDATE ON public.resume_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_resume_templates_category ON public.resume_templates (category);
CREATE INDEX IF NOT EXISTS idx_resume_templates_is_premium ON public.resume_templates (is_premium);
CREATE INDEX IF NOT EXISTS idx_resume_templates_is_active ON public.resume_templates (is_active);
CREATE INDEX IF NOT EXISTS idx_resume_templates_name_lower ON public.resume_templates ((lower(name)));

-- Seed a few default templates if table is empty
INSERT INTO public.resume_templates (name, preview_url, template_config, category, is_premium, is_active)
SELECT * FROM (
  VALUES
    ('Modern', '/templates/modern.png', '{"style":"modern","fonts":["Inter","system-ui"],"colors":{"primary":"hsl(222,89%,56%)"}}'::jsonb, 'modern', false, true),
    ('Corporate', '/templates/corporate.png', '{"style":"corporate","fonts":["Inter","system-ui"],"colors":{"primary":"hsl(210,50%,45%)"}}'::jsonb, 'corporate', false, true),
    ('Minimal', '/templates/minimal.png', '{"style":"minimal","fonts":["Inter","system-ui"],"colors":{"primary":"hsl(0,0%,10%)"}}'::jsonb, 'minimal', false, true),
    ('Creative', '/templates/creative.png', '{"style":"creative","fonts":["Inter","system-ui"],"colors":{"primary":"hsl(280,70%,55%)"}}'::jsonb, 'creative', true, true),
    ('Two Column', '/templates/twocol.png', '{"style":"two-col","fonts":["Inter","system-ui"],"colors":{"primary":"hsl(200,70%,45%)"}}'::jsonb, 'two-column', true, true),
    ('ATS Focused', '/templates/ats.png', '{"style":"ats","fonts":["Inter","system-ui"],"colors":{"primary":"hsl(140,60%,40%)"}}'::jsonb, 'ats', false, true)
) AS v(name, preview_url, template_config, category, is_premium, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.resume_templates);

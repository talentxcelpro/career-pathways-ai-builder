-- Phase 1: Enhanced Resume Builder Database Structure (Final Fix)

-- Update resume_templates with better structure
ALTER TABLE public.resume_templates 
ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ats_score INTEGER DEFAULT 85,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create resume_versions for version control
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.ai_resumes(id) ON DELETE CASCADE NOT NULL,
  version_name TEXT NOT NULL DEFAULT 'Version 1',
  version_number INTEGER NOT NULL DEFAULT 1,
  content_snapshot JSONB NOT NULL DEFAULT '{}',
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Create resume_export_history
CREATE TABLE IF NOT EXISTS public.resume_export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.ai_resumes(id) ON DELETE CASCADE NOT NULL,
  export_format TEXT NOT NULL, -- pdf, docx, html
  template_id UUID REFERENCES public.resume_templates(id),
  file_url TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for new tables
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_export_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can manage their resume versions" ON public.resume_versions;
DROP POLICY IF EXISTS "Users can manage their export history" ON public.resume_export_history;

-- RLS policies for resume_versions
CREATE POLICY "Users can manage their resume versions" ON public.resume_versions
FOR ALL USING (
  resume_id IN (
    SELECT id FROM public.ai_resumes WHERE user_id = auth.uid()
  )
);

-- RLS policies for resume_export_history
CREATE POLICY "Users can manage their export history" ON public.resume_export_history
FOR ALL USING (
  resume_id IN (
    SELECT id FROM public.ai_resumes WHERE user_id = auth.uid()
  )
);

-- Insert new template data (without conflict handling)
INSERT INTO public.resume_templates (name, category, description, layout_config, is_premium, ats_score, tags, component_name, css_config, thumbnail_url) 
SELECT * FROM (VALUES
  ('ATS Professional New', 'professional', 'Highly optimized for ATS systems with clean formatting', '{"columns": 1, "header_style": "minimal", "spacing": "standard"}'::jsonb, false, 98, ARRAY['ats-friendly', 'minimal', 'corporate'], 'ATSTemplate', '{"fontFamily": "Arial", "primaryColor": "#2563eb"}'::jsonb, '/templates/ats-professional.jpg'),
  ('Software Engineer Pro', 'technical', 'Optimized for software engineering roles', '{"columns": 2, "header_style": "tech", "spacing": "compact"}'::jsonb, false, 94, ARRAY['technical', 'software', 'development'], 'TechnicalTemplate', '{"fontFamily": "Roboto Mono", "primaryColor": "#dc2626"}'::jsonb, '/templates/software-engineer.jpg'),
  ('Creative Designer Plus', 'creative', 'Visually appealing for design professionals', '{"columns": 2, "header_style": "artistic", "spacing": "creative"}'::jsonb, false, 78, ARRAY['creative', 'design', 'visual'], 'CreativeTemplate', '{"fontFamily": "Poppins", "primaryColor": "#ec4899"}'::jsonb, '/templates/creative-designer.jpg'),
  ('Fresh Graduate Starter', 'entry-level', 'Perfect for recent graduates with limited experience', '{"columns": 1, "header_style": "clean", "spacing": "standard"}'::jsonb, false, 91, ARRAY['graduate', 'entry-level', 'student'], 'GraduateTemplate', '{"fontFamily": "Open Sans", "primaryColor": "#8b5cf6"}'::jsonb, '/templates/fresh-graduate.jpg')
) AS new_templates(name, category, description, layout_config, is_premium, ats_score, tags, component_name, css_config, thumbnail_url)
WHERE NOT EXISTS (
  SELECT 1 FROM public.resume_templates WHERE name = new_templates.name
);

-- Create trigger for resume version tracking
CREATE OR REPLACE FUNCTION public.create_resume_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a new version when resume content is updated
  IF TG_OP = 'UPDATE' AND OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO public.resume_versions (
      resume_id,
      version_name,
      version_number,
      content_snapshot,
      is_current,
      notes
    ) VALUES (
      NEW.id,
      'Auto-save ' || to_char(now(), 'MM/DD HH24:MI'),
      COALESCE((SELECT MAX(version_number) + 1 FROM public.resume_versions WHERE resume_id = NEW.id), 1),
      NEW.content,
      true,
      'Automatic version created on content update'
    );
    
    -- Mark previous versions as not current
    UPDATE public.resume_versions 
    SET is_current = false 
    WHERE resume_id = NEW.id AND id != (SELECT id FROM public.resume_versions WHERE resume_id = NEW.id ORDER BY created_at DESC LIMIT 1);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS resume_version_trigger ON public.ai_resumes;

CREATE TRIGGER resume_version_trigger
  AFTER UPDATE ON public.ai_resumes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_resume_version();
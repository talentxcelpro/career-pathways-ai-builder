
-- Phase 1 & 2: Clean up old tables and create new unified schema

-- Drop all existing resume-related tables
DROP TABLE IF EXISTS public.ai_resume_analysis CASCADE;
DROP TABLE IF EXISTS public.ai_resume_suggestions CASCADE;
DROP TABLE IF EXISTS public.ai_resumes CASCADE;
DROP TABLE IF EXISTS public.ai_cover_letters CASCADE;
DROP TABLE IF EXISTS public.ai_cover_letters_enhanced CASCADE;
DROP TABLE IF EXISTS public.resume_templates CASCADE;
DROP TABLE IF EXISTS public.resume_sections CASCADE;
DROP TABLE IF EXISTS public.resume_versions CASCADE;
DROP TABLE IF EXISTS public.resume_upload_status CASCADE;
DROP TABLE IF EXISTS public.resume_content_blocks CASCADE;
DROP TABLE IF EXISTS public.resume_skills CASCADE;
DROP TABLE IF EXISTS public.resume_comments CASCADE;
DROP TABLE IF EXISTS public.resumes CASCADE;

-- Create new unified schema

-- Main resumes table
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  ats_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resume sections table for structured content
CREATE TABLE public.resume_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('personal_info', 'summary', 'experience', 'education', 'skills', 'certifications', 'projects', 'languages', 'hobbies', 'awards')),
  data JSONB NOT NULL DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Cover letters table
CREATE TABLE public.cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Cover Letter',
  job_title TEXT,
  company_name TEXT,
  letter TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resume templates table
CREATE TABLE public.resume_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'modern',
  preview_url TEXT,
  template_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resumes
CREATE POLICY "Users can manage their own resumes" ON public.resumes
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for resume_sections
CREATE POLICY "Users can manage their own resume sections" ON public.resume_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = resume_sections.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

-- RLS Policies for cover_letters
CREATE POLICY "Users can manage their own cover letters" ON public.cover_letters
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for resume_templates (public read)
CREATE POLICY "Everyone can view active templates" ON public.resume_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage templates" ON public.resume_templates
  FOR ALL USING (is_app_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_resumes_status ON public.resumes(status);
CREATE INDEX idx_resume_sections_resume_id ON public.resume_sections(resume_id);
CREATE INDEX idx_resume_sections_section ON public.resume_sections(section);
CREATE INDEX idx_cover_letters_resume_id ON public.cover_letters(resume_id);
CREATE INDEX idx_cover_letters_user_id ON public.cover_letters(user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON public.resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resume_sections_updated_at BEFORE UPDATE ON public.resume_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cover_letters_updated_at BEFORE UPDATE ON public.cover_letters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default templates
INSERT INTO public.resume_templates (name, category, template_config) VALUES
  ('Modern Professional', 'modern', '{"primaryColor": "#2563eb", "fontFamily": "Inter", "layout": "single-column"}'),
  ('ATS Optimized', 'ats', '{"primaryColor": "#1f2937", "fontFamily": "Arial", "layout": "single-column"}'),
  ('Creative Designer', 'creative', '{"primaryColor": "#7c3aed", "fontFamily": "Poppins", "layout": "two-column"}'),
  ('Executive Classic', 'executive', '{"primaryColor": "#374151", "fontFamily": "Georgia", "layout": "single-column"}'),
  ('Tech Stack', 'technical', '{"primaryColor": "#dc2626", "fontFamily": "Roboto", "layout": "single-column"}'),
  ('Minimal Clean', 'minimal', '{"primaryColor": "#059669", "fontFamily": "Lato", "layout": "single-column"}');

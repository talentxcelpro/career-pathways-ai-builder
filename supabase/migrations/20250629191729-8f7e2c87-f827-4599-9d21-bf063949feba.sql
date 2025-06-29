
-- Create resume templates table
CREATE TABLE IF NOT EXISTS public.resume_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'professional',
  thumbnail_url TEXT,
  preview_url TEXT,
  css_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create resumes table (enhanced)
CREATE TABLE IF NOT EXISTS public.ai_resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  template_id UUID REFERENCES public.resume_templates(id),
  content JSONB NOT NULL DEFAULT '{}',
  ats_score INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  public_url_slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create resume sections table
CREATE TABLE IF NOT EXISTS public.resume_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create resume versions table for history
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  version_name TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cover letters table
CREATE TABLE IF NOT EXISTS public.ai_cover_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  job_title TEXT,
  company_name TEXT,
  content TEXT NOT NULL,
  tone TEXT DEFAULT 'professional',
  template_id TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cover_letters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resume_templates (public read access)
CREATE POLICY "Templates are viewable by everyone" ON public.resume_templates
  FOR SELECT USING (is_active = true);

-- RLS Policies for ai_resumes
CREATE POLICY "Users can view their own resumes" ON public.ai_resumes
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own resumes" ON public.ai_resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" ON public.ai_resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" ON public.ai_resumes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for resume_sections
CREATE POLICY "Users can view their own resume sections" ON public.resume_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ai_resumes 
      WHERE ai_resumes.id = resume_sections.resume_id 
      AND (ai_resumes.user_id = auth.uid() OR ai_resumes.is_public = true)
    )
  );

CREATE POLICY "Users can manage their own resume sections" ON public.resume_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.ai_resumes 
      WHERE ai_resumes.id = resume_sections.resume_id 
      AND ai_resumes.user_id = auth.uid()
    )
  );

-- RLS Policies for resume_versions
CREATE POLICY "Users can view their own resume versions" ON public.resume_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ai_resumes 
      WHERE ai_resumes.id = resume_versions.resume_id 
      AND ai_resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own resume versions" ON public.resume_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_resumes 
      WHERE ai_resumes.id = resume_versions.resume_id 
      AND ai_resumes.user_id = auth.uid()
    )
  );

-- RLS Policies for ai_cover_letters
CREATE POLICY "Users can view their own cover letters" ON public.ai_cover_letters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cover letters" ON public.ai_cover_letters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cover letters" ON public.ai_cover_letters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cover letters" ON public.ai_cover_letters
  FOR DELETE USING (auth.uid() = user_id);

-- Insert default resume templates
INSERT INTO public.resume_templates (name, category, thumbnail_url, css_config) VALUES
  ('Modern Professional', 'professional', '/templates/modern-professional.jpg', '{"primaryColor": "#2563eb", "fontFamily": "Inter"}'),
  ('Executive Classic', 'executive', '/templates/executive-classic.jpg', '{"primaryColor": "#1f2937", "fontFamily": "Georgia"}'),
  ('Creative Designer', 'creative', '/templates/creative-designer.jpg', '{"primaryColor": "#7c3aed", "fontFamily": "Poppins"}'),
  ('Minimal Clean', 'minimal', '/templates/minimal-clean.jpg', '{"primaryColor": "#059669", "fontFamily": "Lato"}'),
  ('Tech Stack', 'technical', '/templates/tech-stack.jpg', '{"primaryColor": "#dc2626", "fontFamily": "Roboto"}'),
  ('Academic Research', 'academic', '/templates/academic-research.jpg', '{"primaryColor": "#1e40af", "fontFamily": "Times New Roman"}'),
  ('Two Column Modern', 'modern', '/templates/two-column-modern.jpg', '{"primaryColor": "#0891b2", "fontFamily": "Open Sans"}'),
  ('Corporate Standard', 'corporate', '/templates/corporate-standard.jpg', '{"primaryColor": "#374151", "fontFamily": "Arial"}')
ON CONFLICT DO NOTHING;

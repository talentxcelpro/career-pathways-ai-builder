-- Create enhanced resume builder tables
CREATE TABLE IF NOT EXISTS public.ai_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  content JSONB NOT NULL DEFAULT '{}',
  template_id TEXT DEFAULT 'modern',
  ats_score INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  public_url_slug TEXT UNIQUE,
  version_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create resume templates table
CREATE TABLE IF NOT EXISTS public.resume_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_url TEXT,
  category TEXT DEFAULT 'modern',
  ats_optimized BOOLEAN DEFAULT true,
  design_config JSONB DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create resume analytics table
CREATE TABLE IF NOT EXISTS public.resume_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_resumes
CREATE POLICY "Users can view their own resumes" ON public.ai_resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own resumes" ON public.ai_resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" ON public.ai_resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" ON public.ai_resumes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public resumes can be viewed by anyone" ON public.ai_resumes
  FOR SELECT USING (is_public = true);

-- RLS Policies for resume_templates
CREATE POLICY "Anyone can view resume templates" ON public.resume_templates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage templates" ON public.resume_templates
  FOR ALL USING (is_current_user_admin());

-- RLS Policies for resume_analytics
CREATE POLICY "Users can view their resume analytics" ON public.resume_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ai_resumes 
      WHERE ai_resumes.id = resume_analytics.resume_id 
      AND ai_resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analytics" ON public.resume_analytics
  FOR INSERT WITH CHECK (true);

-- Insert default templates
INSERT INTO public.resume_templates (id, name, description, category, ats_optimized, design_config) VALUES
('modern', 'Modern Professional', 'Clean, contemporary design perfect for tech and business roles', 'modern', true, '{"colors": {"primary": "#2563eb", "text": "#374151"}, "fonts": {"header": "Inter", "body": "Inter"}}'),
('classic', 'Classic Traditional', 'Traditional format ideal for conservative industries', 'classic', true, '{"colors": {"primary": "#1f2937", "text": "#374151"}, "fonts": {"header": "Georgia", "body": "Georgia"}}'),
('creative', 'Creative Bold', 'Eye-catching design for creative professionals', 'creative', false, '{"colors": {"primary": "#7c3aed", "text": "#374151"}, "fonts": {"header": "Poppins", "body": "Inter"}}'),
('technical', 'Technical Specialist', 'Optimized for engineering and technical roles', 'technical', true, '{"colors": {"primary": "#059669", "text": "#374151"}, "fonts": {"header": "JetBrains Mono", "body": "Inter"}}'),
('executive', 'Executive Leadership', 'Professional layout for senior positions', 'modern', true, '{"colors": {"primary": "#dc2626", "text": "#374151"}, "fonts": {"header": "Playfair Display", "body": "Inter"}}')
ON CONFLICT (id) DO NOTHING;
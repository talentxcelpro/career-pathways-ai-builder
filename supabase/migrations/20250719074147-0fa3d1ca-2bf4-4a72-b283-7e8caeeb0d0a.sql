
-- Create comprehensive resume builder database schema

-- Main resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  ats_score integer DEFAULT 0,
  summary text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
  template_id text DEFAULT 'modern',
  is_public boolean DEFAULT false,
  public_url_slug text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Resume sections for structured content
CREATE TABLE IF NOT EXISTS public.resume_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id uuid NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  section_type text NOT NULL CHECK (section_type IN ('personal_info', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'awards')),
  content jsonb NOT NULL DEFAULT '{}',
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Resume analytics tracking
CREATE TABLE IF NOT EXISTS public.resume_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id uuid NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  view_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  last_viewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Resume export history
CREATE TABLE IF NOT EXISTS public.resume_exports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id uuid NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  template_id text NOT NULL,
  format text NOT NULL CHECK (format IN ('pdf', 'docx', 'html')),
  file_url text,
  exported_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Resume upload status tracking
CREATE TABLE IF NOT EXISTS public.resume_upload_status (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  upload_status text DEFAULT 'uploading' CHECK (upload_status IN ('uploading', 'processing', 'completed', 'failed')),
  current_step text DEFAULT 'upload',
  progress_percentage integer DEFAULT 0,
  error_message text,
  parsed_content jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- AI enhancement suggestions
CREATE TABLE IF NOT EXISTS public.ai_resume_enhancements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id uuid NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  original_content text,
  enhanced_content text NOT NULL,
  enhancement_type text NOT NULL CHECK (enhancement_type IN ('keyword_optimization', 'format_improvement', 'content_enhancement', 'ats_optimization')),
  confidence_score numeric(3,2) DEFAULT 0.0,
  is_applied boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_upload_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_resume_enhancements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resumes
CREATE POLICY "Users can manage their own resumes" ON public.resumes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public resumes are viewable by anyone" ON public.resumes
  FOR SELECT USING (is_public = true);

-- RLS Policies for resume_sections
CREATE POLICY "Users can manage their resume sections" ON public.resume_sections
  FOR ALL USING (resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid()));

CREATE POLICY "Public resume sections are viewable" ON public.resume_sections
  FOR SELECT USING (resume_id IN (SELECT id FROM public.resumes WHERE is_public = true));

-- RLS Policies for resume_analytics
CREATE POLICY "Users can view their resume analytics" ON public.resume_analytics
  FOR ALL USING (resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid()));

-- RLS Policies for resume_exports
CREATE POLICY "Users can manage their resume exports" ON public.resume_exports
  FOR ALL USING (resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid()));

-- RLS Policies for resume_upload_status
CREATE POLICY "Users can manage their upload status" ON public.resume_upload_status
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for ai_resume_enhancements
CREATE POLICY "Users can view their AI enhancements" ON public.ai_resume_enhancements
  FOR ALL USING (resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_public_url_slug ON public.resumes(public_url_slug);
CREATE INDEX IF NOT EXISTS idx_resume_sections_resume_id ON public.resume_sections(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_sections_type ON public.resume_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_resume_analytics_resume_id ON public.resume_analytics(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_exports_resume_id ON public.resume_exports(resume_id);
CREATE INDEX IF NOT EXISTS idx_upload_status_user_id ON public.resume_upload_status(user_id);

-- Create storage bucket for resume files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resume-uploads', 'resume-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resume uploads
CREATE POLICY "Users can upload their resume files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resume-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their resume files" ON storage.objects
  FOR SELECT USING (bucket_id = 'resume-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their resume files" ON storage.objects
  FOR DELETE USING (bucket_id = 'resume-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update triggers for updated_at columns
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

CREATE TRIGGER update_resume_analytics_updated_at BEFORE UPDATE ON public.resume_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upload_status_updated_at BEFORE UPDATE ON public.resume_upload_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique public URL slugs
CREATE OR REPLACE FUNCTION generate_resume_slug(resume_title text, user_uuid uuid)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Generate base slug from title
  base_slug := lower(regexp_replace(trim(resume_title), '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := substring(user_uuid::text, 1, 8) || '-' || base_slug;
  
  final_slug := base_slug;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.resumes WHERE public_url_slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate ATS score
CREATE OR REPLACE FUNCTION calculate_ats_score(resume_content jsonb)
RETURNS integer AS $$
DECLARE
  score integer := 0;
  section_count integer := 0;
BEGIN
  -- Check for essential sections
  IF resume_content ? 'personal_info' AND (resume_content->'personal_info'->>'name') IS NOT NULL THEN
    score := score + 15;
  END IF;
  
  IF resume_content ? 'summary' AND length(resume_content->'summary'->>'content') > 50 THEN
    score := score + 15;
  END IF;
  
  IF resume_content ? 'experience' AND jsonb_array_length(resume_content->'experience') > 0 THEN
    score := score + 25;
  END IF;
  
  IF resume_content ? 'education' AND jsonb_array_length(resume_content->'education') > 0 THEN
    score := score + 15;
  END IF;
  
  IF resume_content ? 'skills' AND jsonb_array_length(resume_content->'skills') > 0 THEN
    score := score + 20;
  END IF;
  
  -- Additional points for optional sections
  IF resume_content ? 'projects' AND jsonb_array_length(resume_content->'projects') > 0 THEN
    score := score + 5;
  END IF;
  
  IF resume_content ? 'certifications' AND jsonb_array_length(resume_content->'certifications') > 0 THEN
    score := score + 5;
  END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

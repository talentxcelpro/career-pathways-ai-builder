-- Create resume exports table
CREATE TABLE public.resume_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resume_id UUID,
  export_format TEXT NOT NULL CHECK (export_format IN ('pdf', 'docx', 'html')),
  template_id TEXT DEFAULT 'modern',
  color_scheme TEXT DEFAULT 'blue',
  customization JSONB DEFAULT '{}'::jsonb,
  file_path TEXT,
  file_size INTEGER,
  download_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create resume shares table
CREATE TABLE public.resume_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resume_id UUID,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  share_type TEXT DEFAULT 'public' CHECK (share_type IN ('public', 'private', 'password')),
  password_hash TEXT,
  access_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create export preferences table
CREATE TABLE public.export_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  default_template TEXT DEFAULT 'modern',
  default_color_scheme TEXT DEFAULT 'blue',
  default_font_family TEXT DEFAULT 'Inter',
  default_font_size TEXT DEFAULT 'medium',
  include_photo BOOLEAN DEFAULT true,
  include_branding BOOLEAN DEFAULT false,
  page_margins TEXT DEFAULT 'normal' CHECK (page_margins IN ('narrow', 'normal', 'wide')),
  section_order TEXT[] DEFAULT ARRAY['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create resume downloads tracking table
CREATE TABLE public.resume_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resume_id TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  last_download_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, resume_id)
);

-- Enable RLS
ALTER TABLE public.resume_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resume_exports
CREATE POLICY "Users can view their own exports" ON public.resume_exports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exports" ON public.resume_exports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exports" ON public.resume_exports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can update export status" ON public.resume_exports
  FOR UPDATE USING (true);

-- RLS Policies for resume_shares
CREATE POLICY "Users can manage their own shares" ON public.resume_shares
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view active shares" ON public.resume_shares
  FOR SELECT USING (is_active = true);

-- RLS Policies for export_preferences
CREATE POLICY "Users can manage their own preferences" ON public.export_preferences
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for resume_downloads
CREATE POLICY "Users can view their own downloads" ON public.resume_downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own downloads" ON public.resume_downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update downloads" ON public.resume_downloads
  FOR UPDATE USING (true);

-- Create storage bucket for exports
INSERT INTO storage.buckets (id, name, public) VALUES ('resume-exports', 'resume-exports', false);

-- Storage policies for resume exports
CREATE POLICY "Users can upload their own exports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resume-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own exports" ON storage.objects
  FOR SELECT USING (bucket_id = 'resume-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own exports" ON storage.objects
  FOR DELETE USING (bucket_id = 'resume-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_resume_exports_updated_at
  BEFORE UPDATE ON public.resume_exports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resume_shares_updated_at
  BEFORE UPDATE ON public.resume_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_export_preferences_updated_at
  BEFORE UPDATE ON public.export_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resume_downloads_updated_at
  BEFORE UPDATE ON public.resume_downloads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
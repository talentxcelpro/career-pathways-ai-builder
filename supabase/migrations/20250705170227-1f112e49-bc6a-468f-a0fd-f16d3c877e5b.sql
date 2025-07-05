-- Resume Upload and Processing Schema Extensions

-- Table for storing parsed resume data
CREATE TABLE public.resume_parsed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_name TEXT NOT NULL,
  original_file_url TEXT,
  file_size INTEGER,
  file_type TEXT,
  full_text TEXT,
  parsed_data JSONB DEFAULT '{}',
  personal_info JSONB DEFAULT '{}',
  experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  skills TEXT[],
  certifications JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  languages JSONB DEFAULT '[]',
  extraction_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for ATS optimization results
CREATE TABLE public.resume_ats_optimization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
  parsed_resume_id UUID REFERENCES public.resume_parsed(id) ON DELETE CASCADE,
  optimization_score INTEGER DEFAULT 0,
  keywords_matched TEXT[],
  missing_keywords TEXT[],
  suggestions JSONB DEFAULT '[]',
  optimized_content JSONB DEFAULT '{}',
  issues_found JSONB DEFAULT '[]',
  optimization_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for AI enhancement suggestions
CREATE TABLE public.resume_enhancements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
  parsed_resume_id UUID REFERENCES public.resume_parsed(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- experience, education, skills, summary, etc.
  original_content TEXT,
  enhanced_content TEXT,
  enhancement_type TEXT, -- impact, quantification, keywords, structure
  suggestion_reason TEXT,
  is_applied BOOLEAN DEFAULT false,
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for upload processing status
CREATE TABLE public.resume_upload_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  upload_status TEXT DEFAULT 'uploading', -- uploading, parsing, optimizing, enhancing, completed, failed
  current_step TEXT DEFAULT 'upload', -- upload, extract, optimize, enhance, complete
  progress_percentage INTEGER DEFAULT 0,
  error_message TEXT,
  resume_id UUID REFERENCES public.resumes(id),
  parsed_resume_id UUID REFERENCES public.resume_parsed(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resume_parsed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_ats_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_enhancements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_upload_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their parsed resumes" ON public.resume_parsed FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their ATS optimizations" ON public.resume_ats_optimization FOR ALL USING (
  resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid()) OR
  parsed_resume_id IN (SELECT id FROM public.resume_parsed WHERE user_id = auth.uid())
);
CREATE POLICY "Users can manage their enhancements" ON public.resume_enhancements FOR ALL USING (
  resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid()) OR
  parsed_resume_id IN (SELECT id FROM public.resume_parsed WHERE user_id = auth.uid())
);
CREATE POLICY "Users can manage their upload status" ON public.resume_upload_status FOR ALL USING (auth.uid() = user_id);

-- Functions for processing workflow
CREATE OR REPLACE FUNCTION public.update_upload_progress(
  status_id UUID,
  new_status TEXT,
  new_step TEXT,
  new_progress INTEGER,
  error_msg TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.resume_upload_status
  SET 
    upload_status = new_status,
    current_step = new_step,
    progress_percentage = new_progress,
    error_message = error_msg,
    updated_at = now()
  WHERE id = status_id;
END;
$$;

-- Trigger to update timestamps
CREATE TRIGGER update_resume_parsed_updated_at
  BEFORE UPDATE ON public.resume_parsed
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resume_ats_optimization_updated_at
  BEFORE UPDATE ON public.resume_ats_optimization
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resume_enhancements_updated_at
  BEFORE UPDATE ON public.resume_enhancements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resume_upload_status_updated_at
  BEFORE UPDATE ON public.resume_upload_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_resume_parsed_user_id ON public.resume_parsed(user_id);
CREATE INDEX idx_resume_parsed_status ON public.resume_parsed(extraction_status);
CREATE INDEX idx_resume_ats_optimization_resume_id ON public.resume_ats_optimization(resume_id);
CREATE INDEX idx_resume_enhancements_resume_id ON public.resume_enhancements(resume_id);
CREATE INDEX idx_resume_upload_status_user_id ON public.resume_upload_status(user_id);
CREATE INDEX idx_resume_upload_status_status ON public.resume_upload_status(upload_status);
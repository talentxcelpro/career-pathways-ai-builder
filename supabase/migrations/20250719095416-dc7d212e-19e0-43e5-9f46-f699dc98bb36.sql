-- Create resume upload status tracking table
CREATE TABLE IF NOT EXISTS public.resume_upload_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  upload_status TEXT NOT NULL DEFAULT 'pending',
  current_step TEXT NOT NULL DEFAULT 'starting',
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  parsed_content JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resumes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  summary TEXT,
  ats_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resume sections table
CREATE TABLE IF NOT EXISTS public.resume_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resume analytics table
CREATE TABLE IF NOT EXISTS public.resume_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.resume_upload_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for resume_upload_status
CREATE POLICY "Users can view their own upload status" ON public.resume_upload_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own upload status" ON public.resume_upload_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own upload status" ON public.resume_upload_status
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for resumes
CREATE POLICY "Users can view their own resumes" ON public.resumes
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own resumes" ON public.resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" ON public.resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" ON public.resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for resume_sections
CREATE POLICY "Users can view sections of their resumes" ON public.resume_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = resume_sections.resume_id 
      AND (resumes.user_id = auth.uid() OR resumes.is_public = true)
    )
  );

CREATE POLICY "Users can create sections for their resumes" ON public.resume_sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = resume_sections.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sections of their resumes" ON public.resume_sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = resume_sections.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sections of their resumes" ON public.resume_sections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = resume_sections.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

-- Create RLS policies for resume_analytics
CREATE POLICY "Users can view analytics of their resumes" ON public.resume_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = resume_analytics.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create analytics" ON public.resume_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update analytics" ON public.resume_analytics
  FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resume_upload_status_user_id ON public.resume_upload_status(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_sections_resume_id ON public.resume_sections(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_analytics_resume_id ON public.resume_analytics(resume_id);

-- Phase 3: Advanced Resume Features Database Schema

-- Resume sharing and analytics
CREATE TABLE public.resume_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id uuid NOT NULL REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  share_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_public boolean DEFAULT false,
  password_hash text,
  expires_at timestamp with time zone,
  view_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Resume analytics
CREATE TABLE public.resume_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id uuid NOT NULL REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'view', 'download', 'share', 'application'
  visitor_id text,
  ip_address inet,
  user_agent text,
  referrer text,
  location_data jsonb,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Job application tracking
CREATE TABLE public.resume_job_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id uuid NOT NULL REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  job_title text NOT NULL,
  application_date timestamp with time zone DEFAULT now(),
  status text DEFAULT 'applied', -- 'applied', 'viewed', 'interview', 'rejected', 'offer', 'hired'
  notes text,
  follow_up_date timestamp with time zone,
  salary_offered numeric,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Resume feedback and collaboration
CREATE TABLE public.resume_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id uuid NOT NULL REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_email text,
  feedback_type text DEFAULT 'general', -- 'general', 'ats', 'content', 'design'
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comments text,
  suggestions jsonb DEFAULT '[]',
  is_anonymous boolean DEFAULT false,
  status text DEFAULT 'pending', -- 'pending', 'reviewed', 'implemented'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Resume optimization suggestions
CREATE TABLE public.resume_optimizations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id uuid NOT NULL REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  optimization_type text NOT NULL, -- 'ats', 'industry', 'role', 'keywords'
  target_job_title text,
  target_industry text,
  suggestions jsonb NOT NULL DEFAULT '[]',
  keywords_added jsonb DEFAULT '[]',
  keywords_removed jsonb DEFAULT '[]',
  ats_score_before integer,
  ats_score_after integer,
  confidence_score numeric DEFAULT 0.0,
  is_applied boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  applied_at timestamp with time zone
);

-- Cover letter integration
CREATE TABLE public.resume_cover_letters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id uuid NOT NULL REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  cover_letter_id uuid REFERENCES public.ai_cover_letters(id) ON DELETE CASCADE,
  job_application_id uuid REFERENCES public.resume_job_applications(id) ON DELETE CASCADE,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Resume export history
CREATE TABLE public.resume_exports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id uuid NOT NULL REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  export_format text NOT NULL, -- 'pdf', 'docx', 'html', 'txt'
  export_settings jsonb DEFAULT '{}',
  file_url text,
  file_size bigint,
  export_status text DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  error_message text,
  downloaded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Performance tracking
CREATE TABLE public.resume_performance_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id uuid NOT NULL REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  metric_date date DEFAULT CURRENT_DATE,
  total_views integer DEFAULT 0,
  unique_views integer DEFAULT 0,
  downloads integer DEFAULT 0,
  applications_sent integer DEFAULT 0,
  responses_received integer DEFAULT 0,
  interviews_scheduled integer DEFAULT 0,
  avg_time_on_page interval,
  bounce_rate numeric DEFAULT 0.0,
  conversion_rate numeric DEFAULT 0.0,
  created_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(resume_id, metric_date)
);

-- RLS Policies
ALTER TABLE public.resume_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Resume shares policies
CREATE POLICY "Users can manage their resume shares" ON public.resume_shares
  FOR ALL USING (
    resume_id IN (SELECT id FROM public.ai_resumes WHERE user_id = auth.uid())
  );

CREATE POLICY "Public shares are viewable by anyone" ON public.resume_shares
  FOR SELECT USING (is_public = true);

-- Resume analytics policies
CREATE POLICY "Users can view their resume analytics" ON public.resume_analytics
  FOR SELECT USING (
    resume_id IN (SELECT id FROM public.ai_resumes WHERE user_id = auth.uid())
  );

CREATE POLICY "System can insert analytics" ON public.resume_analytics
  FOR INSERT WITH CHECK (true);

-- Job applications policies
CREATE POLICY "Users can manage their job applications" ON public.resume_job_applications
  FOR ALL USING (
    resume_id IN (SELECT id FROM public.ai_resumes WHERE user_id = auth.uid())
  );

-- Resume feedback policies
CREATE POLICY "Users can view feedback for their resumes" ON public.resume_feedback
  FOR SELECT USING (
    resume_id IN (SELECT id FROM public.ai_resumes WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can provide feedback on shared resumes" ON public.resume_feedback
  FOR INSERT WITH CHECK (
    resume_id IN (SELECT resume_id FROM public.resume_shares WHERE is_public = true)
  );

-- Resume optimizations policies
CREATE POLICY "Users can manage their resume optimizations" ON public.resume_optimizations
  FOR ALL USING (
    resume_id IN (SELECT id FROM public.ai_resumes WHERE user_id = auth.uid())
  );

-- Cover letters policies
CREATE POLICY "Users can manage their resume cover letters" ON public.resume_cover_letters
  FOR ALL USING (
    resume_id IN (SELECT id FROM public.ai_resumes WHERE user_id = auth.uid())
  );

-- Export history policies
CREATE POLICY "Users can view their export history" ON public.resume_exports
  FOR ALL USING (
    resume_id IN (SELECT id FROM public.ai_resumes WHERE user_id = auth.uid())
  );

-- Performance metrics policies
CREATE POLICY "Users can view their performance metrics" ON public.resume_performance_metrics
  FOR ALL USING (
    resume_id IN (SELECT id FROM public.ai_resumes WHERE user_id = auth.uid())
  );

-- Functions for analytics
CREATE OR REPLACE FUNCTION public.track_resume_view(
  p_resume_id uuid,
  p_visitor_id text DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_referrer text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert analytics event
  INSERT INTO public.resume_analytics (
    resume_id,
    event_type,
    visitor_id,
    ip_address,
    user_agent,
    referrer
  ) VALUES (
    p_resume_id,
    'view',
    p_visitor_id,
    p_ip_address,
    p_user_agent,
    p_referrer
  );
  
  -- Update share view count if public
  UPDATE public.resume_shares 
  SET view_count = view_count + 1 
  WHERE resume_id = p_resume_id AND is_public = true;
  
  -- Update daily metrics
  INSERT INTO public.resume_performance_metrics (
    resume_id,
    metric_date,
    total_views,
    unique_views
  ) VALUES (
    p_resume_id,
    CURRENT_DATE,
    1,
    CASE WHEN p_visitor_id IS NOT NULL THEN 1 ELSE 0 END
  )
  ON CONFLICT (resume_id, metric_date)
  DO UPDATE SET
    total_views = resume_performance_metrics.total_views + 1,
    unique_views = resume_performance_metrics.unique_views + 
      CASE WHEN p_visitor_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.resume_analytics 
        WHERE resume_id = p_resume_id 
        AND visitor_id = p_visitor_id 
        AND DATE(created_at) = CURRENT_DATE
        AND created_at < NOW()
      ) THEN 1 ELSE 0 END;
END;
$$;

-- Function to calculate ATS score
CREATE OR REPLACE FUNCTION public.calculate_enhanced_ats_score(resume_content jsonb)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  score integer := 0;
  personal_info jsonb;
  experience jsonb;
  skills jsonb;
  education jsonb;
BEGIN
  personal_info := resume_content->'personalInfo';
  experience := resume_content->'experience';
  skills := resume_content->'skills';
  education := resume_content->'education';
  
  -- Personal information (20 points)
  IF personal_info->>'fullName' IS NOT NULL AND LENGTH(personal_info->>'fullName') > 0 THEN
    score := score + 5;
  END IF;
  IF personal_info->>'email' IS NOT NULL AND personal_info->>'email' LIKE '%@%.%' THEN
    score := score + 5;
  END IF;
  IF personal_info->>'phone' IS NOT NULL AND LENGTH(personal_info->>'phone') > 9 THEN
    score := score + 5;
  END IF;
  IF personal_info->>'location' IS NOT NULL AND LENGTH(personal_info->>'location') > 0 THEN
    score := score + 5;
  END IF;
  
  -- Experience (40 points)
  IF jsonb_array_length(COALESCE(experience, '[]'::jsonb)) >= 1 THEN
    score := score + 20;
    IF jsonb_array_length(experience) >= 3 THEN
      score := score + 10;
    END IF;
    -- Check for detailed descriptions
    IF EXISTS (
      SELECT 1 FROM jsonb_array_elements(experience) AS exp
      WHERE LENGTH(exp->>'description') > 100
    ) THEN
      score := score + 10;
    END IF;
  END IF;
  
  -- Skills (20 points)
  IF skills IS NOT NULL AND jsonb_typeof(skills) = 'object' THEN
    IF jsonb_array_length(COALESCE(skills->'technical', '[]'::jsonb)) >= 5 THEN
      score := score + 10;
    END IF;
    IF skills->'soft' IS NOT NULL AND jsonb_array_length(skills->'soft') >= 3 THEN
      score := score + 10;
    END IF;
  END IF;
  
  -- Education (10 points)
  IF jsonb_array_length(COALESCE(education, '[]'::jsonb)) >= 1 THEN
    score := score + 10;
  END IF;
  
  -- Additional formatting checks (10 points)
  IF resume_content->'summary' IS NOT NULL AND LENGTH(resume_content->>'summary') > 50 THEN
    score := score + 5;
  END IF;
  IF resume_content->'projects' IS NOT NULL AND jsonb_array_length(resume_content->'projects') >= 1 THEN
    score := score + 5;
  END IF;
  
  RETURN LEAST(score, 100);
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_resume_shares_updated_at
  BEFORE UPDATE ON public.resume_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resume_job_applications_updated_at
  BEFORE UPDATE ON public.resume_job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resume_feedback_updated_at
  BEFORE UPDATE ON public.resume_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_resume_shares_token ON public.resume_shares(share_token);
CREATE INDEX idx_resume_shares_resume_id ON public.resume_shares(resume_id);
CREATE INDEX idx_resume_analytics_resume_id_date ON public.resume_analytics(resume_id, created_at);
CREATE INDEX idx_resume_job_applications_resume_id ON public.resume_job_applications(resume_id);
CREATE INDEX idx_resume_feedback_resume_id ON public.resume_feedback(resume_id);
CREATE INDEX idx_resume_performance_metrics_resume_date ON public.resume_performance_metrics(resume_id, metric_date);

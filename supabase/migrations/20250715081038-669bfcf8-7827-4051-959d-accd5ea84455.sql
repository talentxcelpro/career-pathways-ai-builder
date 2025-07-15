-- Create job applications table for smart application tracking
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_url TEXT,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('draft', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn')),
  application_method TEXT DEFAULT 'platform' CHECK (application_method IN ('platform', 'email', 'website', 'referral')),
  resume_version TEXT,
  cover_letter_content TEXT,
  application_notes TEXT,
  follow_up_date DATE,
  interview_date TIMESTAMP WITH TIME ZONE,
  interview_type TEXT CHECK (interview_type IN ('phone', 'video', 'in_person', 'technical', 'panel')),
  interview_notes TEXT,
  salary_offered DECIMAL,
  response_received BOOLEAN DEFAULT false,
  response_date TIMESTAMP WITH TIME ZONE,
  employer_feedback TEXT,
  ai_match_score INTEGER,
  ats_optimized BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create application timeline table for tracking interactions
CREATE TABLE public.application_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('applied', 'viewed', 'screening', 'interview_scheduled', 'interview_completed', 'feedback_received', 'status_update', 'follow_up')),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT DEFAULT 'system',
  metadata JSONB
);

-- Create interview coaching sessions table
CREATE TABLE public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_role TEXT NOT NULL,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('behavioral', 'technical', 'situational', 'general')),
  duration_minutes INTEGER DEFAULT 30,
  questions JSONB NOT NULL,
  responses JSONB,
  ai_feedback JSONB,
  overall_score DECIMAL,
  strengths TEXT[],
  improvement_areas TEXT[],
  practice_recommendations TEXT[],
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create smart apply templates table
CREATE TABLE public.smart_apply_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  job_category TEXT,
  industry TEXT,
  resume_template JSONB NOT NULL,
  cover_letter_template TEXT,
  keywords TEXT[],
  ats_optimization_rules JSONB,
  is_default BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_apply_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for job applications
CREATE POLICY "Users can manage their own applications" 
ON public.job_applications 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Employers can view applications to their jobs" 
ON public.job_applications 
FOR SELECT 
USING (job_id IN (
  SELECT id FROM jobs WHERE posted_by = auth.uid()
));

-- Create policies for application timeline
CREATE POLICY "Users can view their application timeline" 
ON public.application_timeline 
FOR SELECT 
USING (application_id IN (
  SELECT id FROM job_applications WHERE user_id = auth.uid()
));

CREATE POLICY "System can insert timeline events" 
ON public.application_timeline 
FOR INSERT 
WITH CHECK (true);

-- Create policies for interview sessions
CREATE POLICY "Users can manage their own interview sessions" 
ON public.interview_sessions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies for smart apply templates
CREATE POLICY "Users can manage their own templates" 
ON public.smart_apply_templates 
FOR ALL 
USING (auth.uid() = user_id);

-- Create foreign key relationships
ALTER TABLE public.application_timeline 
ADD CONSTRAINT fk_application_timeline_application_id 
FOREIGN KEY (application_id) REFERENCES public.job_applications(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);
CREATE INDEX idx_job_applications_created_at ON public.job_applications(created_at DESC);
CREATE INDEX idx_application_timeline_application_id ON public.application_timeline(application_id);
CREATE INDEX idx_application_timeline_event_date ON public.application_timeline(event_date DESC);
CREATE INDEX idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX idx_smart_apply_templates_user_id ON public.smart_apply_templates(user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smart_apply_templates_updated_at
  BEFORE UPDATE ON public.smart_apply_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
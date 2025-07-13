-- Enhanced AI Management Tables

-- AI Tools Configuration
CREATE TABLE IF NOT EXISTS public.ai_tools_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT NOT NULL,
  tool_slug TEXT NOT NULL UNIQUE,
  description TEXT,
  prompt_template TEXT,
  system_message TEXT DEFAULT 'You are a helpful AI assistant specialized in career guidance.',
  model_name TEXT DEFAULT 'gpt-4.1-2025-04-14',
  max_tokens INTEGER DEFAULT 2000,
  temperature NUMERIC DEFAULT 0.7,
  is_enabled BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  rate_limit_per_hour INTEGER DEFAULT 10,
  rate_limit_per_day INTEGER DEFAULT 50,
  cost_per_request NUMERIC DEFAULT 0.01,
  category TEXT DEFAULT 'general',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Admin Inputs (Keywords, Custom Data, Tool Configurations)
CREATE TABLE IF NOT EXISTS public.ai_admin_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug TEXT REFERENCES ai_tools_config(tool_slug) ON DELETE CASCADE,
  input_type TEXT NOT NULL, -- 'keywords', 'templates', 'examples', 'modifiers'
  category TEXT,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Content Library (Admin-curated templates and responses)
CREATE TABLE IF NOT EXISTS public.ai_content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  template_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  quality_score NUMERIC DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT false,
  tags TEXT[],
  created_by UUID,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Feedback System (User ratings and admin quality control)
CREATE TABLE IF NOT EXISTS public.ai_feedback_system (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tool_slug TEXT NOT NULL,
  operation_id UUID, -- Reference to specific AI operation
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_type TEXT DEFAULT 'rating', -- 'rating', 'report', 'suggestion'
  feedback_text TEXT,
  admin_response TEXT,
  is_resolved BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- AI Operation Queue (Background processing)
CREATE TABLE IF NOT EXISTS public.ai_operation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tool_slug TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  input_data JSONB NOT NULL,
  output_data JSONB,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  processing_time_ms INTEGER,
  cost NUMERIC DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced AI Usage Logs (extend existing table)
ALTER TABLE public.ai_usage_logs 
ADD COLUMN IF NOT EXISTS tool_slug TEXT,
ADD COLUMN IF NOT EXISTS operation_id UUID,
ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS user_rating INTEGER,
ADD COLUMN IF NOT EXISTS admin_flagged BOOLEAN DEFAULT false;

-- Insert default AI tools configuration
INSERT INTO public.ai_tools_config (tool_name, tool_slug, description, category, prompt_template, is_premium) VALUES
('Resume Tailor', 'resume-tailor', 'Tailor resume content to specific job descriptions', 'resume', 'Analyze the provided resume and job description, then suggest specific improvements to better match the role requirements. Focus on keywords, skills, and experience alignment.', false),
('Cover Letter Generator', 'cover-letter', 'Generate personalized cover letters for job applications', 'applications', 'Create a compelling cover letter based on the user''s background, the job description, and company information. Make it personal and engaging while highlighting relevant qualifications.', false),
('Career Pathfinder', 'career-pathfinder', 'Suggest career paths and transitions based on user profile', 'career', 'Analyze the user''s current background, skills, and interests to suggest potential career paths and transition strategies. Include growth opportunities and skill requirements.', true),
('Job Match GPT', 'job-match', 'Intelligent job matching with compatibility scoring', 'jobs', 'Compare user profile and preferences with job requirements to provide match scores and detailed compatibility analysis.', false),
('Interview Q&A Simulator', 'interview-qa', 'Generate and practice interview questions and answers', 'interview', 'Create relevant interview questions for the specific role and help prepare comprehensive answers based on the user''s experience and the job requirements.', false),
('Career SWOT Analysis', 'career-swot', 'Analyze strengths, weaknesses, opportunities, and threats', 'analysis', 'Conduct a comprehensive SWOT analysis for the user''s career based on their profile, market conditions, and career goals.', true),
('Skill Gap Analyzer', 'skills-gap', 'Identify skill gaps for target roles', 'skills', 'Compare current skills with target role requirements to identify gaps and suggest learning paths and resources.', false),
('AI Career Roadmap', 'ai-roadmap', 'Generate detailed 5-year career progression plans', 'planning', 'Create a comprehensive 5-year career roadmap with milestones, skill development plans, and strategic recommendations.', true),
('Resume Analytics', 'resume-score', 'ATS scoring and resume optimization insights', 'resume', 'Analyze resume for ATS compatibility, keyword optimization, and provide detailed scoring with improvement suggestions.', false),
('Network Outreach', 'outreach-message', 'Generate personalized networking messages', 'networking', 'Create personalized connection requests and follow-up messages for professional networking based on mutual interests and goals.', false);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_tools_config_slug ON ai_tools_config(tool_slug);
CREATE INDEX IF NOT EXISTS idx_ai_admin_inputs_tool ON ai_admin_inputs(tool_slug);
CREATE INDEX IF NOT EXISTS idx_ai_admin_inputs_type ON ai_admin_inputs(input_type);
CREATE INDEX IF NOT EXISTS idx_ai_content_library_category ON ai_content_library(category);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_system_tool ON ai_feedback_system(tool_slug);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_system_user ON ai_feedback_system(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_operation_queue_status ON ai_operation_queue(status);
CREATE INDEX IF NOT EXISTS idx_ai_operation_queue_user ON ai_operation_queue(user_id);

-- Enable RLS on new tables
ALTER TABLE public.ai_tools_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_admin_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback_system ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_operation_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI Tools Config
CREATE POLICY "Anyone can view enabled AI tools" ON public.ai_tools_config
  FOR SELECT USING (is_enabled = true);

CREATE POLICY "Admins can manage AI tools config" ON public.ai_tools_config
  FOR ALL USING (is_app_admin(auth.uid()));

-- RLS Policies for AI Admin Inputs
CREATE POLICY "Admins can manage AI admin inputs" ON public.ai_admin_inputs
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view active admin inputs" ON public.ai_admin_inputs
  FOR SELECT USING (is_active = true);

-- RLS Policies for AI Content Library
CREATE POLICY "Anyone can view approved content" ON public.ai_content_library
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Admins can manage content library" ON public.ai_content_library
  FOR ALL USING (is_app_admin(auth.uid()));

-- RLS Policies for AI Feedback System
CREATE POLICY "Users can manage their own feedback" ON public.ai_feedback_system
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" ON public.ai_feedback_system
  FOR SELECT USING (is_app_admin(auth.uid()));

CREATE POLICY "Admins can update feedback responses" ON public.ai_feedback_system
  FOR UPDATE USING (is_app_admin(auth.uid()));

-- RLS Policies for AI Operation Queue
CREATE POLICY "Users can view their own operations" ON public.ai_operation_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage operation queue" ON public.ai_operation_queue
  FOR ALL USING (true);

-- Create trigger functions
CREATE OR REPLACE FUNCTION update_ai_tools_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_ai_admin_inputs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_ai_content_library_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_ai_tools_config_updated_at
  BEFORE UPDATE ON public.ai_tools_config
  FOR EACH ROW EXECUTE FUNCTION update_ai_tools_config_updated_at();

CREATE TRIGGER trigger_update_ai_admin_inputs_updated_at
  BEFORE UPDATE ON public.ai_admin_inputs
  FOR EACH ROW EXECUTE FUNCTION update_ai_admin_inputs_updated_at();

CREATE TRIGGER trigger_update_ai_content_library_updated_at
  BEFORE UPDATE ON public.ai_content_library
  FOR EACH ROW EXECUTE FUNCTION update_ai_content_library_updated_at();
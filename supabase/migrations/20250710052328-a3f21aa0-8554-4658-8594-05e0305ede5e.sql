-- Create AI features status tracking table
CREATE TABLE public.ai_features_status (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name text NOT NULL,
  feature_name text NOT NULL,
  feature_key text NOT NULL, -- For programmatic access (e.g., 'matchgpt', 'resume_enhancer')
  enabled boolean NOT NULL DEFAULT true,
  last_checked timestamp with time zone DEFAULT now(),
  last_success timestamp with time zone,
  last_error timestamp with time zone,
  error_message text,
  usage_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  average_response_time integer, -- in milliseconds
  prompt_version text DEFAULT 'v1.0',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(module_name, feature_key)
);

-- Create AI usage logs table for detailed tracking
CREATE TABLE public.ai_usage_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  module_name text NOT NULL,
  feature_key text NOT NULL,
  input_data jsonb,
  output_data jsonb,
  response_time integer, -- in milliseconds
  tokens_used integer,
  cost_estimate numeric(10,6), -- estimated cost in dollars
  success boolean NOT NULL,
  error_message text,
  session_id text, -- for grouping related AI calls
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create AI prompt templates table
CREATE TABLE public.ai_prompt_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name text NOT NULL,
  feature_key text NOT NULL,
  template_name text NOT NULL,
  prompt_template text NOT NULL,
  system_message text,
  version text NOT NULL DEFAULT 'v1.0',
  is_active boolean NOT NULL DEFAULT true,
  temperature numeric(3,2) DEFAULT 0.7,
  max_tokens integer DEFAULT 1000,
  model_name text DEFAULT 'gpt-4o-mini',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(module_name, feature_key, version)
);

-- Enable RLS
ALTER TABLE public.ai_features_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_features_status
CREATE POLICY "Admins can manage AI features status" 
ON public.ai_features_status 
FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "Users can view AI features status" 
ON public.ai_features_status 
FOR SELECT 
USING (true);

-- RLS Policies for ai_usage_logs
CREATE POLICY "Users can view their own AI usage logs" 
ON public.ai_usage_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI usage logs" 
ON public.ai_usage_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all AI usage logs" 
ON public.ai_usage_logs 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS Policies for ai_prompt_templates
CREATE POLICY "Admins can manage AI prompt templates" 
ON public.ai_prompt_templates 
FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "Users can view active prompt templates" 
ON public.ai_prompt_templates 
FOR SELECT 
USING (is_active = true);

-- Create function to update AI feature status
CREATE OR REPLACE FUNCTION public.update_ai_feature_status(
  p_module_name text,
  p_feature_key text,
  p_success boolean,
  p_response_time integer DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.ai_features_status (
    module_name, 
    feature_name, 
    feature_key, 
    last_checked,
    last_success,
    last_error,
    error_message,
    usage_count,
    success_count,
    error_count,
    average_response_time
  )
  VALUES (
    p_module_name,
    COALESCE((SELECT feature_name FROM ai_features_status WHERE feature_key = p_feature_key LIMIT 1), p_feature_key),
    p_feature_key,
    now(),
    CASE WHEN p_success THEN now() ELSE NULL END,
    CASE WHEN NOT p_success THEN now() ELSE NULL END,
    p_error_message,
    1,
    CASE WHEN p_success THEN 1 ELSE 0 END,
    CASE WHEN NOT p_success THEN 1 ELSE 0 END,
    p_response_time
  )
  ON CONFLICT (module_name, feature_key) 
  DO UPDATE SET
    last_checked = now(),
    last_success = CASE WHEN p_success THEN now() ELSE ai_features_status.last_success END,
    last_error = CASE WHEN NOT p_success THEN now() ELSE ai_features_status.last_error END,
    error_message = CASE WHEN NOT p_success THEN p_error_message ELSE NULL END,
    usage_count = ai_features_status.usage_count + 1,
    success_count = ai_features_status.success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
    error_count = ai_features_status.error_count + CASE WHEN NOT p_success THEN 1 ELSE 0 END,
    average_response_time = CASE 
      WHEN p_response_time IS NOT NULL THEN 
        COALESCE((ai_features_status.average_response_time + p_response_time) / 2, p_response_time)
      ELSE ai_features_status.average_response_time 
    END,
    updated_at = now();
END;
$$;

-- Insert initial AI features based on your mapping
INSERT INTO public.ai_features_status (module_name, feature_name, feature_key, enabled) VALUES
('Network', 'Smart Post Suggestions', 'smart_post_suggestions', true),
('Network', 'Comment Enhancer', 'comment_enhancer', true),
('Network', 'Intro Generator', 'intro_generator', true),
('Jobs', 'Job Description Summarizer', 'jd_summarizer', true),
('Jobs', 'Smart Apply', 'smart_apply', true),
('Jobs', 'MatchGPT', 'match_gpt', true),
('Jobs', 'Resume-JD Fit Scorer', 'resume_jd_scorer', true),
('Employer', 'JD Generator', 'jd_generator', true),
('Employer', 'Candidate Ranking', 'candidate_ranking', true),
('Employer', 'Interview Question Generator', 'interview_questions', true),
('Companies', 'Company Description Generator', 'company_description', true),
('Companies', 'AI Career Fit Checker', 'career_fit_checker', true),
('Resume Builder', 'Resume Enhancer', 'resume_enhancer', true),
('Resume Builder', 'Section Writer', 'section_writer', true),
('Resume Builder', 'ATS Scoring', 'ats_scoring', true),
('Tools', 'Cover Letter Generator', 'cover_letter_generator', true),
('Tools', 'Career Bio Generator', 'career_bio', true),
('Tools', 'Personality Insights', 'personality_insights', true),
('Learning', 'Learning Path Creator', 'learning_path_creator', true),
('Learning', 'Course Recommender', 'course_recommender', true),
('Career Map', '5-Year Roadmap Generator', 'career_roadmap', true),
('Career Map', 'Goal Breakdown', 'goal_breakdown', true);

-- Insert default prompt templates
INSERT INTO public.ai_prompt_templates (module_name, feature_key, template_name, prompt_template, system_message) VALUES
('Network', 'smart_post_suggestions', 'Default Post Suggestion', 
'Based on the user''s profile and recent activity, suggest 3 engaging professional posts they could share. User profile: {profile_data}. Recent activity: {recent_activity}', 
'You are a professional networking AI assistant. Create engaging, authentic post suggestions that would resonate with the user''s professional network.'),

('Jobs', 'match_gpt', 'Default Job Matching', 
'Analyze the compatibility between this resume and job description. Resume: {resume_text}. Job Description: {job_description}. Provide a match score (0-100) and explain key strengths and gaps.',
'You are an expert recruiter and career advisor. Provide detailed, actionable feedback on job-candidate fit.'),

('Resume Builder', 'resume_enhancer', 'Default Resume Enhancement', 
'Enhance this resume section to be more impactful and ATS-friendly: {section_content}. Target role: {target_role}',
'You are a professional resume writer with expertise in ATS optimization and modern recruiting practices.');
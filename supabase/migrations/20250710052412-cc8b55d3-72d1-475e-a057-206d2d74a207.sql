-- Create AI features status tracking table (if not exists)
CREATE TABLE IF NOT EXISTS public.ai_features_status (
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

-- Create AI prompt templates table (if not exists)
CREATE TABLE IF NOT EXISTS public.ai_prompt_templates (
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

-- Enable RLS on new tables
ALTER TABLE public.ai_features_status ENABLE ROW LEVEL SECURITY;
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
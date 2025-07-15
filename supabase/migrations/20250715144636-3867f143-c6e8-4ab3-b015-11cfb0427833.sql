-- Create AI model management tables

-- AI Models registry
CREATE TABLE public.ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL DEFAULT 'v1.0',
    description TEXT,
    task_type TEXT NOT NULL, -- 'generation', 'classification', 'recommendation', 'scoring'
    model_path TEXT, -- Path to model file or API endpoint
    api_endpoint TEXT,
    model_size_mb INTEGER DEFAULT 0,
    training_accuracy NUMERIC(5,4),
    training_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    model_config JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(model_name, model_version)
);

-- AI Model deployments to modules
CREATE TABLE public.ai_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES public.ai_models(id) ON DELETE CASCADE,
    module_name TEXT NOT NULL, -- 'network', 'jobs', 'employer', 'resume_builder', etc.
    deployment_name TEXT NOT NULL,
    endpoint_url TEXT NOT NULL,
    deployment_config JSONB DEFAULT '{}',
    is_live BOOLEAN DEFAULT false,
    deployment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_health_check TIMESTAMP WITH TIME ZONE,
    health_status TEXT DEFAULT 'unknown', -- 'healthy', 'unhealthy', 'unknown'
    request_count INTEGER DEFAULT 0,
    average_response_time_ms INTEGER DEFAULT 0,
    error_rate NUMERIC(5,4) DEFAULT 0,
    deployed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(module_name, deployment_name)
);

-- AI request logs
CREATE TABLE public.ai_request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID REFERENCES public.ai_deployments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    request_type TEXT NOT NULL,
    input_data JSONB NOT NULL,
    output_data JSONB,
    response_time_ms INTEGER,
    tokens_used INTEGER DEFAULT 0,
    cost_estimate NUMERIC(10,6) DEFAULT 0,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI feedback and ratings
CREATE TABLE public.ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID REFERENCES public.ai_request_logs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    feedback_type TEXT DEFAULT 'general', -- 'general', 'accuracy', 'performance', 'relevance'
    is_helpful BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI model training datasets
CREATE TABLE public.ai_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_name TEXT NOT NULL UNIQUE,
    description TEXT,
    dataset_type TEXT NOT NULL, -- 'resume', 'job_description', 'user_interactions', etc.
    file_path TEXT,
    sample_count INTEGER DEFAULT 0,
    file_size_mb NUMERIC(10,2) DEFAULT 0,
    processing_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'processed', 'failed'
    processing_progress INTEGER DEFAULT 0,
    data_schema JSONB DEFAULT '{}',
    quality_score NUMERIC(5,4),
    last_processed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI model training jobs
CREATE TABLE public.ai_training_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    model_id UUID REFERENCES public.ai_models(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES public.ai_datasets(id) ON DELETE CASCADE,
    training_config JSONB DEFAULT '{}',
    status TEXT DEFAULT 'queued', -- 'queued', 'running', 'completed', 'failed', 'cancelled'
    progress INTEGER DEFAULT 0,
    current_epoch INTEGER DEFAULT 0,
    total_epochs INTEGER DEFAULT 100,
    loss_value NUMERIC(10,6),
    accuracy NUMERIC(5,4),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    training_logs JSONB DEFAULT '[]',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_training_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- AI Models - Admins can manage, everyone can view active models
CREATE POLICY "Admins can manage AI models" ON public.ai_models
    FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Everyone can view active AI models" ON public.ai_models
    FOR SELECT USING (is_active = true);

-- AI Deployments - Admins can manage, everyone can view live deployments
CREATE POLICY "Admins can manage AI deployments" ON public.ai_deployments
    FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Everyone can view live AI deployments" ON public.ai_deployments
    FOR SELECT USING (is_live = true);

-- AI Request Logs - Users can view their own logs, admins can view all
CREATE POLICY "Users can view their own AI request logs" ON public.ai_request_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all AI request logs" ON public.ai_request_logs
    FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "System can insert AI request logs" ON public.ai_request_logs
    FOR INSERT WITH CHECK (true);

-- AI Feedback - Users can manage their own feedback
CREATE POLICY "Users can manage their own AI feedback" ON public.ai_feedback
    FOR ALL USING (user_id = auth.uid());

-- AI Datasets - Admins can manage
CREATE POLICY "Admins can manage AI datasets" ON public.ai_datasets
    FOR ALL USING (is_app_admin(auth.uid()));

-- AI Training Jobs - Admins can manage
CREATE POLICY "Admins can manage AI training jobs" ON public.ai_training_jobs
    FOR ALL USING (is_app_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_ai_models_active ON public.ai_models(is_active);
CREATE INDEX idx_ai_deployments_module ON public.ai_deployments(module_name);
CREATE INDEX idx_ai_deployments_live ON public.ai_deployments(is_live);
CREATE INDEX idx_ai_request_logs_user ON public.ai_request_logs(user_id);
CREATE INDEX idx_ai_request_logs_deployment ON public.ai_request_logs(deployment_id);
CREATE INDEX idx_ai_request_logs_created_at ON public.ai_request_logs(created_at);
CREATE INDEX idx_ai_datasets_status ON public.ai_datasets(processing_status);
CREATE INDEX idx_ai_training_jobs_status ON public.ai_training_jobs(status);

-- Create triggers for updated_at
CREATE TRIGGER update_ai_models_updated_at
    BEFORE UPDATE ON public.ai_models
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_deployments_updated_at
    BEFORE UPDATE ON public.ai_deployments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_datasets_updated_at
    BEFORE UPDATE ON public.ai_datasets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_training_jobs_updated_at
    BEFORE UPDATE ON public.ai_training_jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.ai_models (model_name, model_version, description, task_type, api_endpoint, training_accuracy, model_config) VALUES
('Resume Ranker', 'v1.0', 'AI model for scoring and ranking resumes', 'scoring', 'https://api.talentxcel.in/ai/resume-score', 0.8750, '{"max_tokens": 1000, "temperature": 0.3}'),
('Job Match GPT', 'v2.0', 'Advanced job matching using GPT', 'recommendation', 'https://api.talentxcel.in/ai/job-match', 0.9200, '{"max_tokens": 2000, "temperature": 0.5}'),
('AI Career Pathfinder', 'v1.0', 'Career path generation and planning', 'generation', 'https://api.talentxcel.in/ai/career-path', 0.8900, '{"max_tokens": 1500, "temperature": 0.4}'),
('Smart Course Advisor', 'v1.0', 'Course recommendation engine', 'recommendation', 'https://api.talentxcel.in/ai/course-recommend', 0.8650, '{"max_tokens": 1200, "temperature": 0.3}'),
('AI JD Generator', 'v1.0', 'Job description generation', 'generation', 'https://api.talentxcel.in/ai/jd-generate', 0.8800, '{"max_tokens": 2000, "temperature": 0.6}');

-- Insert sample deployments
INSERT INTO public.ai_deployments (model_id, module_name, deployment_name, endpoint_url, is_live, deployment_config) VALUES
((SELECT id FROM public.ai_models WHERE model_name = 'Resume Ranker'), 'resume_builder', 'Resume Scoring Service', '/api/ai/resume-score', true, '{"rate_limit": 100, "cache_ttl": 300}'),
((SELECT id FROM public.ai_models WHERE model_name = 'Job Match GPT'), 'jobs', 'Job Matching Service', '/api/ai/job-match', true, '{"rate_limit": 50, "cache_ttl": 600}'),
((SELECT id FROM public.ai_models WHERE model_name = 'AI Career Pathfinder'), 'career_map', 'Career Path Generator', '/api/ai/career-path', true, '{"rate_limit": 30, "cache_ttl": 900}'),
((SELECT id FROM public.ai_models WHERE model_name = 'Smart Course Advisor'), 'learning', 'Course Recommendation', '/api/ai/course-recommend', true, '{"rate_limit": 75, "cache_ttl": 450}'),
((SELECT id FROM public.ai_models WHERE model_name = 'AI JD Generator'), 'employer', 'JD Generation Service', '/api/ai/jd-generate', true, '{"rate_limit": 25, "cache_ttl": 1200}');

-- Insert sample datasets
INSERT INTO public.ai_datasets (dataset_name, description, dataset_type, sample_count, file_size_mb, processing_status, quality_score) VALUES
('Resume Dataset 2024', 'Resumes & Scores', 'resume', 45234, 125.50, 'processed', 0.9200),
('Job Descriptions', 'JD & Requirements', 'job_description', 12890, 45.20, 'processing', 0.8750),
('User Interactions', 'Clicks & Preferences', 'user_interactions', 78234, 89.30, 'processed', 0.9100);
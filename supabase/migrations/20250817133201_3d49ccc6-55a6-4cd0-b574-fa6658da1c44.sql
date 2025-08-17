-- AI Agent Operations Engine - Fixed Database Schema

-- Drop existing tables if they have conflicts
DROP TABLE IF EXISTS public.agent_logs CASCADE;
DROP TABLE IF EXISTS public.agent_metrics CASCADE;
DROP TABLE IF EXISTS public.agent_tasks CASCADE;
DROP TABLE IF EXISTS public.agents CASCADE;

-- Agents table for AI agent management
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  content_domains JSONB DEFAULT '[]'::jsonb,
  tone TEXT DEFAULT 'professional',
  frequency TEXT DEFAULT 'daily',
  status TEXT DEFAULT 'active',
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent tasks table for task management
CREATE TABLE public.agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- scheduler, worker, adminbot
  action TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  payload JSONB DEFAULT '{}'::jsonb,
  run_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent logs table for detailed logging
CREATE TABLE public.agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.agent_tasks(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  level TEXT DEFAULT 'info', -- info, warning, error, debug
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent performance metrics
CREATE TABLE public.agent_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_agent_tasks_status ON public.agent_tasks(status);
CREATE INDEX idx_agent_tasks_run_at ON public.agent_tasks(run_at);
CREATE INDEX idx_agent_tasks_agent_id ON public.agent_tasks(agent_id);
CREATE INDEX idx_agent_tasks_source ON public.agent_tasks(source);
CREATE INDEX idx_agent_logs_task_id ON public.agent_logs(task_id);
CREATE INDEX idx_agent_logs_level ON public.agent_logs(level);
CREATE INDEX idx_agent_metrics_agent_id ON public.agent_metrics(agent_id);
CREATE INDEX idx_agent_metrics_date ON public.agent_metrics(metric_date);

-- RLS Policies
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_metrics ENABLE ROW LEVEL SECURITY;

-- Agents policies
CREATE POLICY "Admins can manage agents" ON public.agents
  FOR ALL USING (is_current_user_admin());

CREATE POLICY "Everyone can view active agents" ON public.agents
  FOR SELECT USING (status = 'active');

-- Agent tasks policies
CREATE POLICY "Admins can manage agent tasks" ON public.agent_tasks
  FOR ALL USING (is_current_user_admin());

CREATE POLICY "System can insert agent tasks" ON public.agent_tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update agent tasks" ON public.agent_tasks
  FOR UPDATE USING (true);

-- Agent logs policies
CREATE POLICY "Admins can view agent logs" ON public.agent_logs
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "System can insert agent logs" ON public.agent_logs
  FOR INSERT WITH CHECK (true);

-- Agent metrics policies
CREATE POLICY "Admins can view agent metrics" ON public.agent_metrics
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "System can insert agent metrics" ON public.agent_metrics
  FOR INSERT WITH CHECK (true);

-- Insert default agents
INSERT INTO public.agents (name, email, role, department, content_domains, tone, frequency, status) VALUES
('Admin Bot', 'admin-bot@talentxcel.ai', 'System Administrator', 'Platform', '["system", "monitoring", "alerts"]', 'professional', 'continuous', 'active'),
('Community Manager', 'community@talentxcel.ai', 'Community Manager', 'Marketing', '["social", "engagement", "welcome"]', 'friendly', 'daily', 'active'),
('Application Support Specialist', 'support@talentxcel.ai', 'Support Specialist', 'Support', '["technical", "troubleshooting", "faq"]', 'helpful', 'continuous', 'active'),
('Career Coach Pro', 'coach@talentxcel.ai', 'Career Coach', 'Career Development', '["resume", "interview", "career"]', 'encouraging', 'weekly', 'active'),
('Mentorship Coordinator', 'mentorship@talentxcel.ai', 'Mentorship Coordinator', 'Mentorship', '["matching", "guidance", "relationships"]', 'supportive', 'weekly', 'active'),
('Learning Path Assistant', 'learning@talentxcel.ai', 'Learning Assistant', 'Learning', '["courses", "paths", "recommendations"]', 'educational', 'daily', 'active'),
('Job Matching AI', 'jobs@talentxcel.ai', 'Job Matching AI', 'Jobs', '["matching", "notifications", "recommendations"]', 'professional', 'continuous', 'active'),
('Content Creator', 'content@talentxcel.ai', 'Content Creator', 'Marketing', '["blogs", "newsletters", "social"]', 'engaging', 'daily', 'active'),
('Upskilling Advisor', 'upskill@talentxcel.ai', 'Upskilling Advisor', 'Skills', '["training", "certifications", "development"]', 'motivational', 'weekly', 'active'),
('Customer Service Rep', 'service@talentxcel.ai', 'Customer Service', 'Support', '["queries", "help", "notifications"]', 'friendly', 'continuous', 'active');

-- Functions for agent operations
CREATE OR REPLACE FUNCTION public.get_pending_agent_tasks(limit_count INTEGER DEFAULT 10)
RETURNS SETOF public.agent_tasks
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.agent_tasks
  WHERE status = 'pending' 
    AND run_at <= NOW()
  ORDER BY run_at ASC, created_at ASC
  LIMIT limit_count;
$$;

CREATE OR REPLACE FUNCTION public.claim_agent_task(task_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.agent_tasks
  SET status = 'running',
      started_at = NOW(),
      attempts = attempts + 1,
      updated_at = NOW()
  WHERE id = task_id 
    AND status = 'pending'
    AND run_at <= NOW();
    
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_agent_task(
  task_id UUID,
  success BOOLEAN DEFAULT true,
  error_msg TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF success THEN
    UPDATE public.agent_tasks
    SET status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = task_id;
  ELSE
    UPDATE public.agent_tasks
    SET status = CASE 
                  WHEN attempts >= max_attempts THEN 'failed'
                  ELSE 'pending'
                 END,
        error_message = error_msg,
        run_at = CASE 
                  WHEN attempts >= max_attempts THEN run_at
                  ELSE NOW() + INTERVAL '5 minutes' * attempts
                 END,
        updated_at = NOW()
    WHERE id = task_id;
  END IF;
  
  RETURN FOUND;
END;
$$;
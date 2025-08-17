-- AI Agent Operations Engine - Complete Database Schema

-- Agents table for AI agent management
CREATE TABLE IF NOT EXISTS public.agents (
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
CREATE TABLE IF NOT EXISTS public.agent_tasks (
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
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.agent_tasks(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  level TEXT DEFAULT 'info', -- info, warning, error, debug
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent performance metrics
CREATE TABLE IF NOT EXISTS public.agent_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON public.agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_run_at ON public.agent_tasks(run_at);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id ON public.agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_source ON public.agent_tasks(source);
CREATE INDEX IF NOT EXISTS idx_agent_logs_task_id ON public.agent_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_level ON public.agent_logs(level);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_id ON public.agent_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_date ON public.agent_metrics(metric_date);

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

-- Views for dashboard
CREATE OR REPLACE VIEW public.all_agent_tasks AS
SELECT 
    at.id as task_id,
    a.name as agent_name,
    a.role as agent_role,
    a.department,
    at.source as task_source,
    at.action,
    at.status,
    at.attempts,
    at.max_attempts,
    at.error_message,
    at.created_at,
    at.run_at,
    at.started_at,
    at.completed_at,
    CASE 
        WHEN at.status = 'pending' THEN '⚪ Pending'
        WHEN at.status = 'running' THEN '🟡 Running'
        WHEN at.status = 'completed' THEN '✅ Completed'
        WHEN at.status = 'failed' THEN '❌ Failed'
        ELSE at.status
    END as status_emoji,
    CASE 
        WHEN at.completed_at IS NOT NULL AND at.started_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (at.completed_at - at.started_at))::INTEGER
        ELSE NULL
    END as duration_seconds
FROM public.agent_tasks at
JOIN public.agents a ON a.id = at.agent_id
ORDER BY at.created_at DESC;

-- Agent task summary view
CREATE OR REPLACE VIEW public.agent_task_summary AS
SELECT 
    task_source,
    status,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as last_hour
FROM public.agent_tasks
GROUP BY task_source, status
ORDER BY task_source, status;

-- Agent performance view
CREATE OR REPLACE VIEW public.agent_performance AS
SELECT 
    a.id,
    a.name,
    a.role,
    a.department,
    a.status,
    COUNT(at.id) as total_tasks,
    COUNT(at.id) FILTER (WHERE at.status = 'completed') as completed_tasks,
    COUNT(at.id) FILTER (WHERE at.status = 'failed') as failed_tasks,
    COUNT(at.id) FILTER (WHERE at.created_at >= NOW() - INTERVAL '24 hours') as tasks_24h,
    ROUND(
        CASE 
            WHEN COUNT(at.id) > 0 
            THEN (COUNT(at.id) FILTER (WHERE at.status = 'completed')::NUMERIC / COUNT(at.id) * 100)
            ELSE 0 
        END, 2
    ) as success_rate
FROM public.agents a
LEFT JOIN public.agent_tasks at ON a.id = at.agent_id
GROUP BY a.id, a.name, a.role, a.department, a.status
ORDER BY success_rate DESC, total_tasks DESC;

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
('Customer Service Rep', 'service@talentxcel.ai', 'Customer Service', 'Support', '["queries", "help", "notifications"]', 'friendly', 'continuous', 'active')
ON CONFLICT (email) DO NOTHING;

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

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_updated_at 
  BEFORE UPDATE ON public.agents 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_tasks_updated_at 
  BEFORE UPDATE ON public.agent_tasks 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
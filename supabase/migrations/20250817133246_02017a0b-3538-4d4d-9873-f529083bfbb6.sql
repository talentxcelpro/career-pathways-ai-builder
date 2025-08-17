-- Create dashboard views and additional functions

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

-- Function to create agent tasks
CREATE OR REPLACE FUNCTION public.create_agent_task(
  p_agent_id UUID,
  p_source TEXT,
  p_action TEXT,
  p_payload JSONB DEFAULT '{}'::jsonb,
  p_run_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  task_id UUID;
BEGIN
  INSERT INTO public.agent_tasks (agent_id, source, action, payload, run_at)
  VALUES (p_agent_id, p_source, p_action, p_payload, p_run_at)
  RETURNING id INTO task_id;
  
  -- Log task creation
  INSERT INTO public.agent_logs (task_id, agent_id, message, level)
  VALUES (task_id, p_agent_id, 'Task created: ' || p_action, 'info');
  
  RETURN task_id;
END;
$$;

-- Function to log agent activity
CREATE OR REPLACE FUNCTION public.log_agent_activity(
  p_task_id UUID,
  p_agent_id UUID,
  p_message TEXT,
  p_level TEXT DEFAULT 'info',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.agent_logs (task_id, agent_id, message, level, metadata)
  VALUES (p_task_id, p_agent_id, p_message, p_level, p_metadata)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to get agent by role
CREATE OR REPLACE FUNCTION public.get_agent_by_role(p_role TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  department TEXT,
  content_domains JSONB,
  tone TEXT,
  frequency TEXT,
  status TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT a.id, a.name, a.email, a.role, a.department, a.content_domains, a.tone, a.frequency, a.status
  FROM public.agents a
  WHERE a.role = p_role AND a.status = 'active'
  LIMIT 1;
$$;
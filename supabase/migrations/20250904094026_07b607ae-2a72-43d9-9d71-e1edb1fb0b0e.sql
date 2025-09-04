-- Batch 10: Fix Security Definer Views

-- Remove security definer from views that don't need it
-- These views should use the permissions of the querying user, not the view creator

-- Drop and recreate views without SECURITY DEFINER
DROP VIEW IF EXISTS public.agent_performance;
CREATE VIEW public.agent_performance AS
  SELECT 
    a.id,
    a.name,
    a.role,
    a.department,
    a.status,
    COUNT(at.id) as total_tasks,
    COUNT(CASE WHEN at.status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN at.status = 'failed' THEN 1 END) as failed_tasks,
    COUNT(CASE WHEN at.created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as tasks_24h,
    CASE 
      WHEN COUNT(at.id) > 0 
      THEN ROUND((COUNT(CASE WHEN at.status = 'completed' THEN 1 END)::numeric / COUNT(at.id)::numeric) * 100, 2)
      ELSE 0 
    END as success_rate
  FROM public.agents a
  LEFT JOIN public.agent_tasks at ON a.id = at.agent_id
  GROUP BY a.id, a.name, a.role, a.department, a.status;

DROP VIEW IF EXISTS public.agent_task_summary;
CREATE VIEW public.agent_task_summary AS
  SELECT 
    COALESCE(at.source, 'unknown') as task_source,
    COALESCE(at.status, 'pending') as status,
    COUNT(*) as total,
    COUNT(CASE WHEN at.created_at >= NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour,
    COUNT(CASE WHEN at.created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h
  FROM public.agent_tasks at
  GROUP BY at.source, at.status;

-- Add RLS policies for the recreated views
CREATE POLICY "Admins can view agent performance"
ON public.agent_performance
FOR SELECT
USING (is_current_user_admin());

CREATE POLICY "Admins can view task summary"
ON public.agent_task_summary
FOR SELECT
USING (is_current_user_admin());
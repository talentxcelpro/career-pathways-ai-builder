-- AI Agents System - End-to-End Implementation

-- 1. Create enums for task management
CREATE TYPE task_status AS ENUM ('pending','running','completed','failed','canceled','deadletter');
CREATE TYPE task_kind AS ENUM (
  'plan_content','generate_content','optimize_seo','publish_content',
  'post_community','match_jobs','career_advice','learning_path','support_reply',
  'mentor_match','platform_announcement'
);

-- 2. AI Agents registry
CREATE TABLE public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT UNIQUE NOT NULL,              -- "adminbot", "ananya", ...
  display_name TEXT NOT NULL,               -- "Admin Bot", "Ananya"
  email TEXT UNIQUE,
  role TEXT NOT NULL,                       -- "Admin Bot", "Career Coach (Pro)"
  departments TEXT[] NOT NULL,              -- ['Career','Community'] etc.
  content_domains TEXT[] NOT NULL,          -- ['Mentorship','Posts']
  tone TEXT NOT NULL DEFAULT 'professional',
  frequency TEXT NOT NULL DEFAULT 'daily',  -- 'daily','weekly','as_needed'
  status TEXT NOT NULL DEFAULT 'active',    -- 'active','paused','disabled'
  assigned_to UUID,                         -- user id (nullable)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for ai_agents
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

-- 3. Agent tools configuration
CREATE TABLE public.agent_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  tool_key TEXT NOT NULL,                   -- 'post_to_feed','match_jobs','send_email', etc.
  config JSONB NOT NULL DEFAULT '{}'
);

-- Enable RLS for agent_tools
ALTER TABLE public.agent_tools ENABLE ROW LEVEL SECURITY;

-- 4. Task management
CREATE TABLE public.agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  kind task_kind NOT NULL,
  priority INT NOT NULL DEFAULT 5,       -- 1(high) to 9(low)
  payload JSONB NOT NULL,                -- inputs (topic, user_id, job_id, etc.)
  status task_status NOT NULL DEFAULT 'pending',
  error TEXT,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_by UUID,                        -- optional human/admin
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for agent_tasks
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

-- 5. Event system
CREATE TABLE public.agent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,                    -- 'task.created','task.failed','publish.done', etc.
  origin TEXT NOT NULL,                   -- agent handle or 'system'
  ref_task UUID REFERENCES public.agent_tasks(id),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for agent_events
ALTER TABLE public.agent_events ENABLE ROW LEVEL SECURITY;

-- 6. Content drafts
CREATE TABLE public.ai_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.agent_tasks(id) ON DELETE SET NULL,
  slug TEXT,                               -- tentative URL slug
  title TEXT,
  summary TEXT,
  body_md TEXT,                            -- markdown
  seo JSONB,                               -- {title, metaDesc, schema, keywords, internalLinks}
  status TEXT NOT NULL DEFAULT 'draft',    -- 'draft','approved','rejected'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for ai_drafts
ALTER TABLE public.ai_drafts ENABLE ROW LEVEL SECURITY;

-- 7. Published content
CREATE TABLE public.ai_published (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES public.ai_drafts(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT now(),
  indexable BOOLEAN DEFAULT true,
  mobile_alt_url TEXT                      -- for m. subdomain if applicable
);

-- Enable RLS for ai_published
ALTER TABLE public.ai_published ENABLE ROW LEVEL SECURITY;

-- 8. Sitemap management
CREATE TABLE public.sitemap_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  mobile_alt_url TEXT,
  lastmod TIMESTAMPTZ NOT NULL DEFAULT now(),
  kind TEXT NOT NULL,                      -- 'profiles','posts','jobs','learning'
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for sitemap_queue
ALTER TABLE public.sitemap_queue ENABLE ROW LEVEL SECURITY;

-- 9. Analytics metrics
CREATE TABLE public.ai_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_url TEXT,
  metric TEXT NOT NULL,                    -- 'impressions','clicks','ctr','index_status'
  value NUMERIC NOT NULL,
  ts TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for ai_metrics
ALTER TABLE public.ai_metrics ENABLE ROW LEVEL SECURITY;

-- 10. Create indexes for performance
CREATE INDEX idx_agent_tasks_status_priority ON public.agent_tasks(status, priority, scheduled_at);
CREATE INDEX idx_agent_tasks_agent_id ON public.agent_tasks(agent_id);
CREATE INDEX idx_agent_events_topic ON public.agent_events(topic, created_at);
CREATE INDEX idx_sitemap_queue_processed ON public.sitemap_queue(processed, created_at);
CREATE INDEX idx_ai_metrics_ref_url ON public.ai_metrics(ref_url, ts);

-- 11. RLS Policies

-- AI Agents: Admins can manage, everyone can read active agents
CREATE POLICY "Admins can manage ai_agents" ON public.ai_agents
  FOR ALL USING (is_current_user_admin());

CREATE POLICY "Everyone can view active agents" ON public.ai_agents
  FOR SELECT USING (status = 'active');

-- Agent Tools: Admins can manage
CREATE POLICY "Admins can manage agent_tools" ON public.agent_tools
  FOR ALL USING (is_current_user_admin());

-- Agent Tasks: Admins can manage, system can insert
CREATE POLICY "Admins can manage agent_tasks" ON public.agent_tasks
  FOR ALL USING (is_current_user_admin());

CREATE POLICY "System can insert agent_tasks" ON public.agent_tasks
  FOR INSERT WITH CHECK (true);

-- Agent Events: Admins can view, system can insert
CREATE POLICY "Admins can view agent_events" ON public.agent_events
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "System can insert agent_events" ON public.agent_events
  FOR INSERT WITH CHECK (true);

-- AI Drafts: Admins can manage
CREATE POLICY "Admins can manage ai_drafts" ON public.ai_drafts
  FOR ALL USING (is_current_user_admin());

-- AI Published: Everyone can read published content
CREATE POLICY "Everyone can view published content" ON public.ai_published
  FOR SELECT USING (indexable = true);

CREATE POLICY "Admins can manage published content" ON public.ai_published
  FOR ALL USING (is_current_user_admin());

-- Sitemap Queue: System and admins can manage
CREATE POLICY "System can manage sitemap_queue" ON public.sitemap_queue
  FOR ALL WITH CHECK (true);

-- AI Metrics: Admins can view
CREATE POLICY "Admins can view ai_metrics" ON public.ai_metrics
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "System can insert ai_metrics" ON public.ai_metrics
  FOR INSERT WITH CHECK (true);

-- 12. Utility functions for task management
CREATE OR REPLACE FUNCTION public.claim_next_task()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  task_id UUID;
BEGIN
  SELECT id INTO task_id
  FROM public.agent_tasks
  WHERE status = 'pending'
    AND scheduled_at <= now()
  ORDER BY priority, created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1;
  
  IF task_id IS NOT NULL THEN
    UPDATE public.agent_tasks
    SET status = 'running', started_at = now(), attempts = attempts + 1
    WHERE id = task_id;
  END IF;
  
  RETURN task_id;
END;
$$;

-- 13. Function to get due agents for scheduling
CREATE OR REPLACE FUNCTION public.get_due_agents()
RETURNS TABLE(
  id UUID,
  handle TEXT,
  display_name TEXT,
  role TEXT,
  departments TEXT[],
  content_domains TEXT[],
  tone TEXT,
  frequency TEXT,
  last_run TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH agent_last_run AS (
    SELECT 
      a.id,
      MAX(ae.created_at) as last_event
    FROM public.ai_agents a
    LEFT JOIN public.agent_events ae ON ae.origin = a.handle AND ae.topic = 'task.created'
    WHERE a.status = 'active'
    GROUP BY a.id
  )
  SELECT 
    a.id,
    a.handle,
    a.display_name,
    a.role,
    a.departments,
    a.content_domains,
    a.tone,
    a.frequency,
    alr.last_event as last_run
  FROM public.ai_agents a
  JOIN agent_last_run alr ON a.id = alr.id
  WHERE a.status = 'active'
    AND (
      (a.frequency = 'daily' AND (alr.last_event IS NULL OR alr.last_event < now() - INTERVAL '23 hours')) OR
      (a.frequency = 'weekly' AND (alr.last_event IS NULL OR alr.last_event < now() - INTERVAL '6 days')) OR
      (a.frequency = 'as_needed')
    );
END;
$$;
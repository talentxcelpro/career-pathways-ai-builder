-- AI Company OS Phase 1 skeleton
-- Helper enums
DO $$ BEGIN
  CREATE TYPE public.ai_department AS ENUM ('engineering','sales','marketing','hr','finance','executive');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.ai_decision_status AS ENUM ('pending','approved','rejected','modified','auto_executed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Central AI decision queue
CREATE TABLE IF NOT EXISTS public.ai_company_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department public.ai_department NOT NULL,
  decision_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  status public.ai_decision_status NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 3,
  confidence_score NUMERIC(5,2),
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  created_by_agent TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- KPI time series
CREATE TABLE IF NOT EXISTS public.ai_company_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department public.ai_department NOT NULL,
  metric_key TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  period TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Strategic goals
CREATE TABLE IF NOT EXISTS public.ai_company_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department public.ai_department NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  due_date DATE,
  priority INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Engineering
CREATE TABLE IF NOT EXISTS public.ai_engineering_sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  goal TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'planned',
  velocity_target INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_engineering_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID REFERENCES public.ai_engineering_sprints(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT DEFAULT 'feature',
  status TEXT NOT NULL DEFAULT 'todo',
  priority INTEGER NOT NULL DEFAULT 3,
  estimated_hours NUMERIC,
  assignee TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sales
CREATE TABLE IF NOT EXISTS public.ai_sales_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  stage TEXT NOT NULL DEFAULT 'new',
  deal_value NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  score INTEGER DEFAULT 0,
  notes TEXT,
  next_action_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marketing
CREATE TABLE IF NOT EXISTS public.ai_marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  objective TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  budget NUMERIC DEFAULT 0,
  spent NUMERIC DEFAULT 0,
  metrics JSONB DEFAULT '{}'::jsonb,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HR
CREATE TABLE IF NOT EXISTS public.ai_hr_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  stage TEXT NOT NULL DEFAULT 'sourced',
  ai_score INTEGER DEFAULT 0,
  resume_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Finance
CREATE TABLE IF NOT EXISTS public.ai_finance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT NOT NULL,
  category TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  department public.ai_department,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_company_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_company_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_company_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_engineering_sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_engineering_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_hr_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_finance_entries ENABLE ROW LEVEL SECURITY;

-- Helper: superuser check (uses existing user_roles + app_role enum with 'super_admin')
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
      AND COALESCE(is_active, true) = true
  );
$$;

-- Apply identical superuser-only policies to all AI Company OS tables
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'ai_company_decisions','ai_company_metrics','ai_company_goals',
    'ai_engineering_sprints','ai_engineering_tasks',
    'ai_sales_leads','ai_marketing_campaigns',
    'ai_hr_candidates','ai_finance_entries'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Superusers can select %1$s" ON public.%1$I;', t);
    EXECUTE format('CREATE POLICY "Superusers can select %1$s" ON public.%1$I FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));', t);

    EXECUTE format('DROP POLICY IF EXISTS "Superusers can insert %1$s" ON public.%1$I;', t);
    EXECUTE format('CREATE POLICY "Superusers can insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.uid()));', t);

    EXECUTE format('DROP POLICY IF EXISTS "Superusers can update %1$s" ON public.%1$I;', t);
    EXECUTE format('CREATE POLICY "Superusers can update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));', t);

    EXECUTE format('DROP POLICY IF EXISTS "Superusers can delete %1$s" ON public.%1$I;', t);
    EXECUTE format('CREATE POLICY "Superusers can delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));', t);
  END LOOP;
END $$;

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.aios_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'ai_company_decisions','ai_company_goals',
    'ai_engineering_sprints','ai_engineering_tasks',
    'ai_sales_leads','ai_marketing_campaigns',
    'ai_hr_candidates','ai_finance_entries'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %1$s_set_updated_at ON public.%1$I;', t);
    EXECUTE format('CREATE TRIGGER %1$s_set_updated_at BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.aios_set_updated_at();', t);
  END LOOP;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_aios_decisions_status ON public.ai_company_decisions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aios_decisions_dept ON public.ai_company_decisions(department, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aios_metrics_dept_time ON public.ai_company_metrics(department, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_aios_eng_tasks_sprint ON public.ai_engineering_tasks(sprint_id, status);
CREATE INDEX IF NOT EXISTS idx_aios_leads_stage ON public.ai_sales_leads(stage, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aios_finance_date ON public.ai_finance_entries(entry_date DESC);
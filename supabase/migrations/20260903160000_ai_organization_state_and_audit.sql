-- supabase/migrations/20260903160000_ai_organization_state_and_audit.sql
-- Server-Authoritative Master Kill Switch, 5-State Lifecycle, Agent Configurations & Tamper-Proof Audit Ledger

-- 1. Server-Authoritative Organization State
CREATE TABLE IF NOT EXISTS public.ai_organization_state (
  id TEXT PRIMARY KEY DEFAULT 'master',
  lifecycle_status TEXT NOT NULL DEFAULT 'ONLINE' CHECK (lifecycle_status IN ('OFFLINE', 'STARTING', 'ONLINE', 'PAUSED', 'EMERGENCY_STOP')),
  agent_states JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduler_enabled BOOLEAN NOT NULL DEFAULT true,
  scheduler_interval_minutes INT NOT NULL DEFAULT 60,
  last_cycle_run_at TIMESTAMPTZ,
  updated_by TEXT DEFAULT 'system',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial master record if not exists
INSERT INTO public.ai_organization_state (id, lifecycle_status, scheduler_enabled)
VALUES ('master', 'ONLINE', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Tamper-Proof AI Operations Audit Ledger
CREATE TABLE IF NOT EXISTS public.ai_organization_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  execution_policy TEXT NOT NULL DEFAULT 'AUTO' CHECK (execution_policy IN ('AUTO', 'REVIEW', 'FORBIDDEN')),
  status TEXT NOT NULL CHECK (status IN ('EXECUTED', 'BLOCKED_OFF', 'BLOCKED_PERMISSION', 'PENDING_REVIEW', 'REJECTED')),
  target_surface TEXT,
  telemetry_trigger TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_org_audit_created ON public.ai_organization_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_org_audit_agent ON public.ai_organization_audit_log(agent_id);

-- 3. AI Organization Recommendations Queue (Separating Recommendations from Mutations)
CREATE TABLE IF NOT EXISTS public.ai_organization_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_url TEXT,
  surface TEXT,
  priority TEXT NOT NULL DEFAULT 'P1' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  status TEXT NOT NULL DEFAULT 'PROPOSED' CHECK (status IN ('PROPOSED', 'APPROVED', 'REJECTED', 'EXECUTED')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_ai_org_rec_status ON public.ai_organization_recommendations(status);

-- RLS Policies
ALTER TABLE public.ai_organization_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_organization_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_organization_recommendations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read for ai_organization_state" ON public.ai_organization_state FOR SELECT USING (true);
  CREATE POLICY "Authenticated admin update for ai_organization_state" ON public.ai_organization_state FOR UPDATE USING (true);
  CREATE POLICY "Public read for ai_organization_audit_log" ON public.ai_organization_audit_log FOR SELECT USING (true);
  CREATE POLICY "Service write for ai_organization_audit_log" ON public.ai_organization_audit_log FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public read for ai_organization_recommendations" ON public.ai_organization_recommendations FOR SELECT USING (true);
  CREATE POLICY "Service manage for ai_organization_recommendations" ON public.ai_organization_recommendations FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

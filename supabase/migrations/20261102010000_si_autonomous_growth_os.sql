-- TalentXcel SI — Autonomous Growth OS Core Tables
-- Migration: 20261102010000_si_autonomous_growth_os.sql

-- SI Tasks
CREATE TABLE IF NOT EXISTS si_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  permission_level TEXT NOT NULL DEFAULT 'L1_AUTOMATIC',
  input_payload JSONB DEFAULT '{}',
  output_payload JSONB,
  error_message TEXT,
  token_usage INTEGER,
  cost_inr NUMERIC(10,4) DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT si_tasks_status_check CHECK (status IN ('QUEUED','RUNNING','COMPLETED','FAILED','CANCELLED')),
  CONSTRAINT si_tasks_priority_check CHECK (priority IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  CONSTRAINT si_tasks_permission_check CHECK (permission_level IN ('L1_AUTOMATIC','L2_CONDITIONAL','L3_HUMAN_APPROVAL'))
);

-- SI Approval Queue
CREATE TABLE IF NOT EXISTS si_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  engine_id TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  permission_level TEXT NOT NULL,
  financial_impact_inr NUMERIC(10,2),
  payload JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'PENDING',
  requested_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '48 hours'),
  CONSTRAINT si_approvals_status_check CHECK (status IN ('PENDING','APPROVED','REJECTED','EXPIRED'))
);

-- SI Audit Logs
CREATE TABLE IF NOT EXISTS si_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id TEXT,
  agent_id TEXT NOT NULL,
  action TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  cost_inr NUMERIC(10,4) DEFAULT 0,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SI Commands
CREATE TABLE IF NOT EXISTS si_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instruction TEXT NOT NULL,
  engine_target TEXT,
  agent_target TEXT,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  result TEXT,
  workflow_id TEXT,
  issued_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT si_commands_status_check CHECK (status IN ('QUEUED','EXECUTING','COMPLETED','FAILED'))
);

-- SI MCP Servers Registry
CREATE TABLE IF NOT EXISTS si_mcp_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  connection_status TEXT NOT NULL DEFAULT 'DISCONNECTED',
  endpoint TEXT,
  auth_type TEXT NOT NULL DEFAULT 'API_KEY',
  tool_count INTEGER DEFAULT 0,
  last_health_check_at TIMESTAMPTZ,
  usage_this_month INTEGER DEFAULT 0,
  cost_inr NUMERIC(10,2) DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SI Technology Registry
CREATE TABLE IF NOT EXISTS si_technology_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT,
  repository_url TEXT,
  documentation_url TEXT,
  version TEXT,
  license TEXT,
  security_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
  evaluation_status TEXT NOT NULL DEFAULT 'DISCOVERED',
  expected_benefit TEXT,
  recommended_use_case TEXT,
  benchmark_results JSONB,
  discovered_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SI Growth Experiments
CREATE TABLE IF NOT EXISTS si_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hypothesis TEXT,
  engine_id TEXT,
  status TEXT NOT NULL DEFAULT 'PLANNED',
  variant_a JSONB,
  variant_b JSONB,
  metric TEXT,
  baseline_value NUMERIC,
  current_value NUMERIC,
  result TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_si_tasks_engine_id ON si_tasks(engine_id);
CREATE INDEX IF NOT EXISTS idx_si_tasks_status ON si_tasks(status);
CREATE INDEX IF NOT EXISTS idx_si_tasks_created_at ON si_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_si_approvals_status ON si_approvals(status);
CREATE INDEX IF NOT EXISTS idx_si_approvals_expires_at ON si_approvals(expires_at);
CREATE INDEX IF NOT EXISTS idx_si_audit_logs_agent_id ON si_audit_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_si_audit_logs_created_at ON si_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_si_commands_status ON si_commands(status);
CREATE INDEX IF NOT EXISTS idx_si_commands_created_at ON si_commands(created_at DESC);

-- RLS
ALTER TABLE si_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE si_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE si_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE si_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE si_mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE si_technology_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE si_experiments ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY IF NOT EXISTS "Admin read si_tasks" ON si_tasks FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin','superadmin')))
);
CREATE POLICY IF NOT EXISTS "System insert si_tasks" ON si_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Admin update si_tasks" ON si_tasks FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin','superadmin')))
);

CREATE POLICY IF NOT EXISTS "Admin all si_approvals" ON si_approvals FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin','superadmin')))
);

CREATE POLICY IF NOT EXISTS "Admin read si_audit_logs" ON si_audit_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin','superadmin')))
);
CREATE POLICY IF NOT EXISTS "System insert si_audit_logs" ON si_audit_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Admin all si_commands" ON si_commands FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin','superadmin')))
);

CREATE POLICY IF NOT EXISTS "Admin read si_mcp_servers" ON si_mcp_servers FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin','superadmin')))
);

CREATE POLICY IF NOT EXISTS "Admin read si_technology_registry" ON si_technology_registry FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin','superadmin')))
);

CREATE POLICY IF NOT EXISTS "Admin all si_experiments" ON si_experiments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin','superadmin')))
);

-- Seed MCP Servers registry
INSERT INTO si_mcp_servers (name, description, category, connection_status, auth_type, tool_count) VALUES
  ('Google Search Console', 'GSC performance data, indexation, and query intelligence', 'SEARCH', 'CONNECTED', 'SERVICE_ACCOUNT', 5),
  ('Google Analytics 4', 'Website traffic, conversions, and user behaviour analytics', 'ANALYTICS', 'AUTH_REQUIRED', 'OAUTH', 8),
  ('OpenAI API', 'GPT-4o and o-series models for content generation and reasoning', 'AI', 'AUTH_REQUIRED', 'API_KEY', 12),
  ('Razorpay', 'Payment gateway for subscriptions and recruitment contracts', 'PAYMENTS', 'AUTH_REQUIRED', 'API_KEY', 6),
  ('LinkedIn API', 'Professional network data and authorised content distribution', 'SOCIAL', 'DISCONNECTED', 'OAUTH', 4),
  ('Meta Graph API', 'Facebook and Instagram authorised publishing and analytics', 'SOCIAL', 'DISCONNECTED', 'OAUTH', 6),
  ('GitHub API', 'Repository intelligence and technology evolution monitoring', 'DEVELOPMENT', 'AUTH_REQUIRED', 'API_KEY', 8),
  ('Vercel API', 'Deployment status, edge function monitoring, and CI/CD', 'DEVELOPMENT', 'AUTH_REQUIRED', 'API_KEY', 5),
  ('Supabase Management API', 'Database health, Edge Function logs, and migration management', 'DEVELOPMENT', 'API_KEY', 'API_KEY', 10),
  ('WhatsApp Business API', 'Consent-based customer communication and follow-ups', 'COMMUNICATION', 'DISCONNECTED', 'API_KEY', 3),
  ('PostHog', 'Product analytics, funnel tracking, and user session recordings', 'ANALYTICS', 'AUTH_REQUIRED', 'API_KEY', 7),
  ('AWS SES', 'Transactional email delivery and bounce management', 'COMMUNICATION', 'CONNECTED', 'SERVICE_ACCOUNT', 4)
ON CONFLICT (name) DO NOTHING;

-- Seed Technology Registry with initial entries
INSERT INTO si_technology_registry (name, category, source, evaluation_status, expected_benefit, recommended_use_case) VALUES
  ('Claude Sonnet 4.5', 'AI_MODEL', 'Anthropic', 'ADOPTED', 'Superior reasoning for complex agent tasks', 'Content generation, market analysis, proposal drafting'),
  ('GPT-4o', 'AI_MODEL', 'OpenAI', 'ADOPTED', 'Strong multimodal capabilities', 'Image understanding, structured extraction, embeddings'),
  ('Gemini 2.0 Flash', 'AI_MODEL', 'Google DeepMind', 'EVALUATING', 'Fast and cost-effective for high-volume tasks', 'Lead qualification, email classification'),
  ('LangChain Agents', 'FRAMEWORK', 'GitHub', 'DISCOVERED', 'Agent orchestration framework', 'Tool-calling workflows with memory'),
  ('Firecrawl MCP', 'MCP_SERVER', 'MCP Registry', 'EVALUATING', 'Web research and content extraction', 'Competitor monitoring, market intelligence'),
  ('Browserbase', 'MCP_SERVER', 'MCP Registry', 'DISCOVERED', 'Reliable browser automation in cloud', 'Lead discovery, social monitoring')
ON CONFLICT DO NOTHING;

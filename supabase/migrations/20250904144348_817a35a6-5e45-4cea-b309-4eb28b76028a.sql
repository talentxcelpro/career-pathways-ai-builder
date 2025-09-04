-- ========================================
-- PHASE 1: ACCESS DEMOCRATIZATION BACKEND
-- ========================================

-- Subscription tiers and user access tracking
CREATE TABLE IF NOT EXISTS user_tier_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
  payment_provider TEXT DEFAULT 'stripe',
  external_subscription_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Usage tracking for tiered limits
CREATE TABLE IF NOT EXISTS user_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL, -- 'dailyAIRequests', 'monthlyJobApplications', etc.
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  current_usage INTEGER NOT NULL DEFAULT 0,
  limit_reached_at TIMESTAMP WITH TIME ZONE,
  reset_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, usage_type, period_start)
);

-- ========================================
-- PHASE 2: CORE MODULE ENHANCEMENT BACKEND
-- ========================================

-- Enhanced employer CRM data
CREATE TABLE IF NOT EXISTS employer_crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'contacted', 'interview', 'offer', 'hired', 'rejected')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  notes TEXT,
  tags TEXT[],
  source TEXT,
  last_interaction TIMESTAMP WITH TIME ZONE,
  next_followup TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CRM pipeline tracking
CREATE TABLE IF NOT EXISTS employer_crm_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES employer_crm_contacts(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  stage_entered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stage_duration_days INTEGER,
  notes TEXT,
  automated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced company profiles
CREATE TABLE IF NOT EXISTS enhanced_company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tech_stack TEXT[],
  company_culture JSONB DEFAULT '{}'::jsonb,
  benefits JSONB DEFAULT '{}'::jsonb,
  interview_process JSONB DEFAULT '{}'::jsonb,
  diversity_metrics JSONB DEFAULT '{}'::jsonb,
  growth_metrics JSONB DEFAULT '{}'::jsonb,
  employee_reviews JSONB DEFAULT '{}'::jsonb,
  salary_insights JSONB DEFAULT '{}'::jsonb,
  workplace_type TEXT CHECK (workplace_type IN ('remote', 'hybrid', 'onsite', 'flexible')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Services marketplace
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL, -- 'individual', 'company'
  specializations TEXT[] NOT NULL,
  experience_years INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  portfolio_url TEXT,
  certifications JSONB DEFAULT '[]'::jsonb,
  languages TEXT[] DEFAULT '{"English"}'::text[],
  timezone TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 60,
  price DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  notes TEXT,
  meeting_link TEXT,
  deliverables JSONB DEFAULT '[]'::jsonb,
  feedback JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================
-- PHASE 3: ADVANCED AI FEATURES BACKEND
-- ========================================

-- Predictive analytics data
CREATE TABLE IF NOT EXISTS ai_predictive_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL, -- 'career_path', 'salary_forecast', 'skill_demand'
  input_data JSONB NOT NULL,
  predictions JSONB NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.00,
  model_version TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  accuracy_feedback DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI coaching sessions data
CREATE TABLE IF NOT EXISTS ai_coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- 'general', 'goal_setting', 'skill_development', 'interview_prep'
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  goals JSONB DEFAULT '[]'::jsonb,
  progress_metrics JSONB DEFAULT '{}'::jsonb,
  coaching_plan JSONB DEFAULT '{}'::jsonb,
  session_notes JSONB DEFAULT '[]'::jsonb,
  resources_shared JSONB DEFAULT '[]'::jsonb,
  next_session_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Market intelligence data
CREATE TABLE IF NOT EXISTS ai_market_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL, -- 'skill_trends', 'salary_data', 'industry_insights', 'location_data'
  geographic_scope TEXT, -- 'global', 'country', 'region', 'city'
  location_data JSONB,
  time_period TEXT NOT NULL, -- '7d', '30d', '90d', '1y'
  raw_data JSONB NOT NULL,
  processed_insights JSONB NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.00,
  data_sources TEXT[],
  refresh_frequency TEXT DEFAULT 'daily',
  last_refreshed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================
-- PHASE 4: WORKFLOW AUTOMATION BACKEND
-- ========================================

-- Workflow definitions
CREATE TABLE IF NOT EXISTS workflow_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'manual', 'schedule', 'event', 'webhook'
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  workflow_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_execution TIMESTAMP WITH TIME ZONE,
  next_execution TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Workflow execution history
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
  trigger_data JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  execution_log JSONB DEFAULT '[]'::jsonb,
  error_details JSONB,
  output_data JSONB DEFAULT '{}'::jsonb,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Integration management
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL, -- 'linkedin', 'gmail', 'calendar', 'github', 'slack'
  integration_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'pending')),
  credentials_encrypted TEXT, -- Encrypted JSON of auth tokens/keys
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_frequency TEXT DEFAULT 'daily',
  sync_settings JSONB DEFAULT '{}'::jsonb,
  data_mapping JSONB DEFAULT '{}'::jsonb,
  webhook_url TEXT,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, integration_type)
);

-- Integration sync logs
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES user_integrations(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'full', 'incremental', 'manual'
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  sync_duration_ms INTEGER,
  error_details JSONB,
  sync_summary JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advanced reporting cache
CREATE TABLE IF NOT EXISTS report_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  parameters JSONB NOT NULL,
  parameters_hash TEXT NOT NULL, -- MD5 hash of parameters for quick lookup
  report_data JSONB NOT NULL,
  generation_time_ms INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, report_type, parameters_hash)
);

-- Performance monitoring
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL, -- 'system', 'user', 'api', 'database'
  metric_value DECIMAL(15,6) NOT NULL,
  metric_unit TEXT, -- 'ms', '%', 'count', 'bytes'
  dimensions JSONB DEFAULT '{}'::jsonb, -- Additional metric dimensions
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  retention_days INTEGER DEFAULT 90
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Phase 1 indexes
CREATE INDEX IF NOT EXISTS idx_user_tier_subscriptions_user_id ON user_tier_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tier_subscriptions_status ON user_tier_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_usage_tracking_user_type ON user_usage_tracking(user_id, usage_type);
CREATE INDEX IF NOT EXISTS idx_user_usage_tracking_period ON user_usage_tracking(period_start, period_end);

-- Phase 2 indexes
CREATE INDEX IF NOT EXISTS idx_employer_crm_contacts_employer ON employer_crm_contacts(employer_id);
CREATE INDEX IF NOT EXISTS idx_employer_crm_contacts_stage ON employer_crm_contacts(stage);
CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON service_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_type ON service_providers(provider_type, specializations);
CREATE INDEX IF NOT EXISTS idx_service_bookings_client ON service_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_provider ON service_bookings(provider_id);

-- Phase 3 indexes
CREATE INDEX IF NOT EXISTS idx_ai_predictive_analytics_user ON ai_predictive_analytics(user_id, prediction_type);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_sessions_user ON ai_coaching_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_market_intelligence_type ON ai_market_intelligence(data_type, time_period);

-- Phase 4 indexes
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_user ON workflow_definitions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id, status);
CREATE INDEX IF NOT EXISTS idx_user_integrations_user ON user_integrations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_integration ON integration_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_report_cache_user_type ON report_cache(user_id, report_type);
CREATE INDEX IF NOT EXISTS idx_report_cache_hash ON report_cache(parameters_hash);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_time ON performance_metrics(metric_name, timestamp);

-- ========================================
-- RLS POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE user_tier_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_crm_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictive_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_market_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- User-specific access policies
CREATE POLICY "Users can manage their own subscription data" ON user_tier_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own usage tracking" ON user_usage_tracking FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Employers can manage their CRM contacts" ON employer_crm_contacts FOR ALL USING (auth.uid() = employer_id);
CREATE POLICY "Employers can manage their CRM pipeline" ON employer_crm_pipeline FOR ALL USING (auth.uid() = employer_id);
CREATE POLICY "Companies can manage their enhanced profiles" ON enhanced_company_profiles FOR ALL USING (EXISTS (SELECT 1 FROM companies WHERE id = enhanced_company_profiles.company_id AND created_by = auth.uid()));
CREATE POLICY "Users can manage their service provider profiles" ON service_providers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their bookings" ON service_bookings FOR ALL USING (auth.uid() = client_id OR EXISTS (SELECT 1 FROM service_providers WHERE id = service_bookings.provider_id AND user_id = auth.uid()));
CREATE POLICY "Users can access their AI analytics" ON ai_predictive_analytics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their coaching sessions" ON ai_coaching_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their workflows" ON workflow_definitions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their workflow executions" ON workflow_executions FOR ALL USING (EXISTS (SELECT 1 FROM workflow_definitions WHERE id = workflow_executions.workflow_id AND user_id = auth.uid()));
CREATE POLICY "Users can manage their integrations" ON user_integrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their integration sync logs" ON integration_sync_logs FOR SELECT USING (EXISTS (SELECT 1 FROM user_integrations WHERE id = integration_sync_logs.integration_id AND user_id = auth.uid()));
CREATE POLICY "Users can access their report cache" ON report_cache FOR ALL USING (auth.uid() = user_id);

-- Public access policies
CREATE POLICY "Anyone can view enhanced company profiles" ON enhanced_company_profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can view active service providers" ON service_providers FOR SELECT USING (availability_status != 'unavailable');
CREATE POLICY "Anyone can view market intelligence" ON ai_market_intelligence FOR SELECT USING (true);

-- Admin access policies
CREATE POLICY "Admins can view all performance metrics" ON performance_metrics FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true));
CREATE POLICY "System can insert performance metrics" ON performance_metrics FOR INSERT WITH CHECK (true);

-- ========================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ========================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_user_tier_subscriptions_updated_at BEFORE UPDATE ON user_tier_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_user_usage_tracking_updated_at BEFORE UPDATE ON user_usage_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_employer_crm_contacts_updated_at BEFORE UPDATE ON employer_crm_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_enhanced_company_profiles_updated_at BEFORE UPDATE ON enhanced_company_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_service_bookings_updated_at BEFORE UPDATE ON service_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_ai_predictive_analytics_updated_at BEFORE UPDATE ON ai_predictive_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_ai_coaching_sessions_updated_at BEFORE UPDATE ON ai_coaching_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_workflow_definitions_updated_at BEFORE UPDATE ON workflow_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_user_integrations_updated_at BEFORE UPDATE ON user_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
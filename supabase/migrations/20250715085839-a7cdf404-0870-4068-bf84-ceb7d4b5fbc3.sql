-- Phase 8: Enterprise Features - Comprehensive Database Infrastructure

-- 1. Organizations/Multi-Tenant Architecture
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  custom_domain TEXT UNIQUE,
  subscription_tier TEXT DEFAULT 'enterprise' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise', 'custom')),
  max_users INTEGER DEFAULT 1000,
  max_storage_gb INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Organization Settings & Configurations
CREATE TABLE public.organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  setting_type TEXT DEFAULT 'config' CHECK (setting_type IN ('config', 'branding', 'security', 'integration')),
  is_encrypted BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, setting_key)
);

-- 3. Enhanced Audit Logs for Compliance
CREATE TABLE public.enterprise_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  event_details JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  compliance_category TEXT,
  retention_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. API Management & Rate Limiting
CREATE TABLE public.enterprise_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL UNIQUE,
  api_key_preview TEXT NOT NULL, -- Last 4 characters for display
  permissions JSONB NOT NULL DEFAULT '[]',
  rate_limit_per_hour INTEGER DEFAULT 1000,
  rate_limit_per_day INTEGER DEFAULT 10000,
  allowed_ips TEXT[],
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Webhook Management
CREATE TABLE public.enterprise_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  secret_token TEXT,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  last_triggered_at TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Webhook Delivery Logs
CREATE TABLE public.webhook_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES public.enterprise_webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  delivery_attempt INTEGER DEFAULT 1,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Custom Branding & White-Label
CREATE TABLE public.organization_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1E40AF',
  accent_color TEXT DEFAULT '#F59E0B',
  logo_url TEXT,
  logo_dark_url TEXT,
  favicon_url TEXT,
  custom_css TEXT,
  custom_fonts JSONB DEFAULT '{}',
  email_header_logo TEXT,
  email_footer_text TEXT,
  login_page_background TEXT,
  dashboard_layout JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Advanced User Management - Departments
CREATE TABLE public.organization_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_department_id UUID REFERENCES public.organization_departments(id),
  department_head_id UUID REFERENCES auth.users(id),
  budget_allocation DECIMAL(12,2),
  cost_center_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Enhanced Role Hierarchies
CREATE TABLE public.organization_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  role_level INTEGER NOT NULL DEFAULT 1,
  parent_role_id UUID REFERENCES public.organization_roles(id),
  permissions JSONB NOT NULL DEFAULT '{}',
  department_access TEXT[] DEFAULT '{}',
  data_access_level TEXT DEFAULT 'department' CHECK (data_access_level IN ('own', 'team', 'department', 'organization', 'global')),
  can_approve_budget BOOLEAN DEFAULT false,
  max_approval_amount DECIMAL(12,2),
  is_system_role BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, role_name)
);

-- 10. User-Department Assignments
CREATE TABLE public.user_department_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.organization_departments(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.organization_roles(id),
  assignment_type TEXT DEFAULT 'member' CHECK (assignment_type IN ('member', 'lead', 'manager', 'admin')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_primary BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Bulk Operations Tracking
CREATE TABLE public.bulk_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  operation_name TEXT NOT NULL,
  target_count INTEGER NOT NULL DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]',
  result_summary JSONB DEFAULT '{}',
  started_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Compliance Reports
CREATE TABLE public.compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('gdpr', 'soc2', 'hipaa', 'pci', 'custom')),
  report_name TEXT NOT NULL,
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  report_data JSONB NOT NULL DEFAULT '{}',
  compliance_score INTEGER,
  findings JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
  generated_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ
);

-- 13. Data Import/Export Jobs
CREATE TABLE public.data_transfer_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('import', 'export')),
  data_type TEXT NOT NULL,
  source_format TEXT,
  target_format TEXT,
  file_url TEXT,
  mapping_config JSONB DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',
  progress_percentage INTEGER DEFAULT 0,
  records_total INTEGER,
  records_processed INTEGER DEFAULT 0,
  records_successful INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  error_log JSONB DEFAULT '[]',
  result_file_url TEXT,
  started_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Enterprise Integrations Config
CREATE TABLE public.enterprise_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  credentials_encrypted TEXT,
  sync_frequency TEXT DEFAULT 'daily',
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'paused', 'error', 'disabled')),
  error_count INTEGER DEFAULT 0,
  last_error_message TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Single Sign-On (SSO) Configuration
CREATE TABLE public.sso_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('saml', 'oauth', 'oidc', 'ldap')),
  configuration JSONB NOT NULL DEFAULT '{}',
  metadata_xml TEXT,
  is_active BOOLEAN DEFAULT true,
  auto_provision_users BOOLEAN DEFAULT false,
  default_role_id UUID REFERENCES public.organization_roles(id),
  attribute_mapping JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all enterprise tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_department_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_transfer_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sso_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organizations
CREATE POLICY "Organization members can view their organization"
ON public.organizations FOR SELECT
USING (
  id IN (
    SELECT organization_id FROM public.user_department_assignments 
    WHERE user_id = auth.uid() AND end_date IS NULL
  )
);

CREATE POLICY "Super admins can manage all organizations"
ON public.organizations FOR ALL
USING (is_super_admin());

-- RLS Policies for Organization Settings
CREATE POLICY "Organization admins can manage settings"
ON public.organization_settings FOR ALL
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM public.user_department_assignments uda
    JOIN public.organization_roles or ON uda.role_id = or.id
    WHERE uda.user_id = auth.uid() 
    AND or.permissions->>'manage_organization' = 'true'
  )
);

-- RLS Policies for Audit Logs
CREATE POLICY "Organization security admins can view audit logs"
ON public.enterprise_audit_logs FOR SELECT
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM public.user_department_assignments uda
    JOIN public.organization_roles or ON uda.role_id = or.id
    WHERE uda.user_id = auth.uid() 
    AND or.permissions->>'view_audit_logs' = 'true'
  )
);

CREATE POLICY "System can insert audit logs"
ON public.enterprise_audit_logs FOR INSERT
WITH CHECK (true);

-- RLS Policies for API Keys
CREATE POLICY "Organization admins can manage API keys"
ON public.enterprise_api_keys FOR ALL
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM public.user_department_assignments uda
    JOIN public.organization_roles or ON uda.role_id = or.id
    WHERE uda.user_id = auth.uid() 
    AND or.permissions->>'manage_api_keys' = 'true'
  )
);

-- RLS Policies for Webhooks
CREATE POLICY "Organization admins can manage webhooks"
ON public.enterprise_webhooks FOR ALL
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM public.user_department_assignments uda
    JOIN public.organization_roles or ON uda.role_id = or.id
    WHERE uda.user_id = auth.uid() 
    AND or.permissions->>'manage_webhooks' = 'true'
  )
);

-- RLS Policies for Webhook Delivery Logs
CREATE POLICY "Organization admins can view webhook logs"
ON public.webhook_delivery_logs FOR SELECT
USING (
  webhook_id IN (
    SELECT ew.id FROM public.enterprise_webhooks ew
    JOIN public.user_department_assignments uda ON ew.organization_id = uda.organization_id
    JOIN public.organization_roles or ON uda.role_id = or.id
    WHERE uda.user_id = auth.uid() 
    AND or.permissions->>'manage_webhooks' = 'true'
  )
);

-- RLS Policies for Branding
CREATE POLICY "Organization admins can manage branding"
ON public.organization_branding FOR ALL
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM public.user_department_assignments uda
    JOIN public.organization_roles or ON uda.role_id = or.id
    WHERE uda.user_id = auth.uid() 
    AND or.permissions->>'manage_branding' = 'true'
  )
);

-- RLS Policies for Departments
CREATE POLICY "Organization members can view departments"
ON public.organization_departments FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.user_department_assignments 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization admins can manage departments"
ON public.organization_departments FOR ALL
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM public.user_department_assignments uda
    JOIN public.organization_roles or ON uda.role_id = or.id
    WHERE uda.user_id = auth.uid() 
    AND or.permissions->>'manage_departments' = 'true'
  )
);

-- RLS Policies for Organization Roles
CREATE POLICY "Organization members can view roles"
ON public.organization_roles FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.user_department_assignments 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization admins can manage roles"
ON public.organization_roles FOR ALL
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM public.user_department_assignments uda
    JOIN public.organization_roles or ON uda.role_id = or.id
    WHERE uda.user_id = auth.uid() 
    AND or.permissions->>'manage_roles' = 'true'
  )
);

-- RLS Policies for User Department Assignments
CREATE POLICY "Users can view their own assignments"
ON public.user_department_assignments FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Organization admins can manage assignments"
ON public.user_department_assignments FOR ALL
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM public.user_department_assignments uda
    JOIN public.organization_roles or ON uda.role_id = or.id
    WHERE uda.user_id = auth.uid() 
    AND or.permissions->>'manage_users' = 'true'
  )
);

-- RLS Policies for Bulk Operations
CREATE POLICY "Organization admins can view bulk operations"
ON public.bulk_operations FOR ALL
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM public.user_department_assignments uda
    JOIN public.organization_roles or ON uda.role_id = or.id
    WHERE uda.user_id = auth.uid() 
    AND or.permissions->>'manage_users' = 'true'
  )
);

-- RLS Policies for Compliance Reports
CREATE POLICY "Organization compliance admins can manage reports"
ON public.compliance_reports FOR ALL
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM public.user_department_assignments uda
    JOIN public.organization_roles or ON uda.role_id = or.id
    WHERE uda.user_id = auth.uid() 
    AND or.permissions->>'manage_compliance' = 'true'
  )
);

-- RLS Policies for Data Transfer Jobs
CREATE POLICY "Organization admins can manage data transfer"
ON public.data_transfer_jobs FOR ALL
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM public.user_department_assignments uda
    JOIN public.organization_roles or ON uda.role_id = or.id
    WHERE uda.user_id = auth.uid() 
    AND or.permissions->>'manage_data_transfer' = 'true'
  )
);

-- RLS Policies for Enterprise Integrations
CREATE POLICY "Organization admins can manage integrations"
ON public.enterprise_integrations FOR ALL
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM public.user_department_assignments uda
    JOIN public.organization_roles or ON uda.role_id = or.id
    WHERE uda.user_id = auth.uid() 
    AND or.permissions->>'manage_integrations' = 'true'
  )
);

-- RLS Policies for SSO Configurations
CREATE POLICY "Organization security admins can manage SSO"
ON public.sso_configurations FOR ALL
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM public.user_department_assignments uda
    JOIN public.organization_roles or ON uda.role_id = or.id
    WHERE uda.user_id = auth.uid() 
    AND or.permissions->>'manage_sso' = 'true'
  )
);

-- Create indexes for performance
CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_organizations_custom_domain ON public.organizations(custom_domain);
CREATE INDEX idx_organization_settings_org_key ON public.organization_settings(organization_id, setting_key);
CREATE INDEX idx_audit_logs_org_created ON public.enterprise_audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_action ON public.enterprise_audit_logs(user_id, action_type);
CREATE INDEX idx_api_keys_org_active ON public.enterprise_api_keys(organization_id, is_active);
CREATE INDEX idx_webhooks_org_active ON public.enterprise_webhooks(organization_id, is_active);
CREATE INDEX idx_webhook_logs_webhook_created ON public.webhook_delivery_logs(webhook_id, created_at DESC);
CREATE INDEX idx_departments_org_parent ON public.organization_departments(organization_id, parent_department_id);
CREATE INDEX idx_roles_org_level ON public.organization_roles(organization_id, role_level);
CREATE INDEX idx_user_assignments_user_org ON public.user_department_assignments(user_id, organization_id);
CREATE INDEX idx_user_assignments_dept_role ON public.user_department_assignments(department_id, role_id);
CREATE INDEX idx_bulk_operations_org_status ON public.bulk_operations(organization_id, status);
CREATE INDEX idx_compliance_reports_org_type ON public.compliance_reports(organization_id, report_type);
CREATE INDEX idx_data_transfer_org_status ON public.data_transfer_jobs(organization_id, status);
CREATE INDEX idx_integrations_org_active ON public.enterprise_integrations(organization_id, is_active);
CREATE INDEX idx_sso_config_org_active ON public.sso_configurations(organization_id, is_active);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_settings_updated_at
  BEFORE UPDATE ON public.organization_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enterprise_api_keys_updated_at
  BEFORE UPDATE ON public.enterprise_api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enterprise_webhooks_updated_at
  BEFORE UPDATE ON public.enterprise_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_branding_updated_at
  BEFORE UPDATE ON public.organization_branding
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_departments_updated_at
  BEFORE UPDATE ON public.organization_departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_roles_updated_at
  BEFORE UPDATE ON public.organization_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_department_assignments_updated_at
  BEFORE UPDATE ON public.user_department_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enterprise_integrations_updated_at
  BEFORE UPDATE ON public.enterprise_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sso_configurations_updated_at
  BEFORE UPDATE ON public.sso_configurations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create enterprise audit logging function
CREATE OR REPLACE FUNCTION public.log_enterprise_audit(
  p_organization_id UUID,
  p_user_id UUID,
  p_action_type TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_event_details JSONB DEFAULT '{}',
  p_risk_level TEXT DEFAULT 'low',
  p_compliance_category TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.enterprise_audit_logs (
    organization_id,
    user_id,
    action_type,
    resource_type,
    resource_id,
    event_details,
    risk_level,
    compliance_category,
    ip_address,
    user_agent
  ) VALUES (
    p_organization_id,
    p_user_id,
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_event_details,
    p_risk_level,
    p_compliance_category,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;
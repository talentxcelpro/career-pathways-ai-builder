-- Create permission requests table
CREATE TABLE public.permission_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  permission_type TEXT NOT NULL,
  resource_id UUID,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create team activity logs
CREATE TABLE public.team_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create role permissions mapping
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role team_role NOT NULL,
  permission_type TEXT NOT NULL,
  is_allowed BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission_type)
);

-- Insert default role permissions
INSERT INTO public.role_permissions (role, permission_type, is_allowed, requires_approval) VALUES
-- Owner permissions (full access)
('owner', 'view_dashboard', true, false),
('owner', 'manage_jobs', true, false),
('owner', 'view_applications', true, false),
('owner', 'manage_team', true, false),
('owner', 'view_analytics', true, false),
('owner', 'manage_company', true, false),
('owner', 'access_crm_full', true, false),
('owner', 'view_activity_logs', true, false),
('owner', 'approve_permissions', true, false),

-- Admin permissions (most access)
('admin', 'view_dashboard', true, false),
('admin', 'manage_jobs', true, false),
('admin', 'view_applications', true, false),
('admin', 'manage_team', true, true),
('admin', 'view_analytics', true, false),
('admin', 'manage_company', false, true),
('admin', 'access_crm_full', false, true),
('admin', 'view_activity_logs', false, true),

-- Recruiter permissions (limited access)
('recruiter', 'view_dashboard', true, false),
('recruiter', 'manage_jobs', true, false),
('recruiter', 'view_applications', true, false),
('recruiter', 'manage_team', false, true),
('recruiter', 'view_analytics', false, true),
('recruiter', 'manage_company', false, true),
('recruiter', 'access_crm_basic', true, false),
('recruiter', 'access_crm_full', false, true),

-- Viewer permissions (read-only)
('viewer', 'view_dashboard', true, false),
('viewer', 'manage_jobs', false, true),
('viewer', 'view_applications', true, false),
('viewer', 'manage_team', false, true),
('viewer', 'view_analytics', false, true),
('viewer', 'manage_company', false, true),
('viewer', 'access_crm_basic', false, true);

-- Enable RLS
ALTER TABLE public.permission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permission_requests
CREATE POLICY "Team members can view permission requests for their company"
ON public.permission_requests FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM company_team_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Users can create permission requests for their company"
ON public.permission_requests FOR INSERT
WITH CHECK (
  requester_id = auth.uid() AND
  company_id IN (
    SELECT company_id FROM company_team_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Company owners/admins can update permission requests"
ON public.permission_requests FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM company_team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
  )
);

-- RLS Policies for team_activity_logs
CREATE POLICY "Company owners can view all activity logs"
ON public.team_activity_logs FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM company_team_members 
    WHERE user_id = auth.uid() AND role = 'owner' AND is_active = true
  )
);

CREATE POLICY "System can insert activity logs"
ON public.team_activity_logs FOR INSERT
WITH CHECK (true);

-- RLS Policies for role_permissions
CREATE POLICY "Anyone can view role permissions"
ON public.role_permissions FOR SELECT
USING (true);

-- Function to check specific permission
CREATE OR REPLACE FUNCTION public.has_team_permission(
  _user_id UUID,
  _company_id UUID,
  _permission_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_role team_role;
  permission_allowed BOOLEAN := false;
BEGIN
  -- Get user's role in the company
  SELECT role INTO user_role
  FROM company_team_members
  WHERE user_id = _user_id 
    AND company_id = _company_id 
    AND is_active = true;
  
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if permission is allowed for the role
  SELECT is_allowed INTO permission_allowed
  FROM role_permissions
  WHERE role = user_role AND permission_type = _permission_type;
  
  RETURN COALESCE(permission_allowed, false);
END;
$$;

-- Function to log team activity
CREATE OR REPLACE FUNCTION public.log_team_activity(
  _company_id UUID,
  _user_id UUID,
  _action_type TEXT,
  _resource_type TEXT DEFAULT NULL,
  _resource_id UUID DEFAULT NULL,
  _details JSONB DEFAULT '{}'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO team_activity_logs (
    company_id,
    user_id,
    action_type,
    resource_type,
    resource_id,
    details
  ) VALUES (
    _company_id,
    _user_id,
    _action_type,
    _resource_type,
    _resource_id,
    _details
  );
END;
$$;

-- Function to create permission request
CREATE OR REPLACE FUNCTION public.create_permission_request(
  _company_id UUID,
  _permission_type TEXT,
  _reason TEXT,
  _resource_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id UUID;
BEGIN
  INSERT INTO permission_requests (
    requester_id,
    company_id,
    permission_type,
    resource_id,
    reason
  ) VALUES (
    auth.uid(),
    _company_id,
    _permission_type,
    _resource_id,
    _reason
  ) RETURNING id INTO request_id;
  
  -- Log the permission request
  PERFORM log_team_activity(
    _company_id,
    auth.uid(),
    'permission_requested',
    'permission',
    request_id,
    jsonb_build_object('permission_type', _permission_type, 'reason', _reason)
  );
  
  RETURN request_id;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_permission_requests_updated_at
  BEFORE UPDATE ON permission_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_permission_requests_company_status ON permission_requests(company_id, status);
CREATE INDEX idx_team_activity_logs_company_user ON team_activity_logs(company_id, user_id);
CREATE INDEX idx_team_activity_logs_created_at ON team_activity_logs(created_at DESC);
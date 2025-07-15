-- Create organization_members table for user management
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  department_id UUID,
  hired_date DATE,
  salary DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(organization_id, user_id)
);

-- Create marketing_campaigns table
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'draft',
  budget DECIMAL(10,2),
  spent DECIMAL(10,2) DEFAULT 0,
  target_audience JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create system_metrics table for live reporting
CREATE TABLE public.system_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metric_type TEXT NOT NULL DEFAULT 'counter',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Create index for system_metrics
CREATE INDEX idx_system_metrics_org_name_time ON public.system_metrics(organization_id, metric_name, timestamp);

-- Create department_members junction table
CREATE TABLE public.department_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(department_id, user_id)
);

-- Add RLS policies for organization_members
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization admins can manage members" 
ON public.organization_members 
FOR ALL 
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM user_department_assignments uda
    JOIN organization_roles org_roles ON uda.role_id = org_roles.id
    WHERE uda.user_id = auth.uid() 
    AND (org_roles.permissions ->> 'manage_users')::boolean = true
  )
);

CREATE POLICY "Users can view organization members" 
ON public.organization_members 
FOR SELECT 
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM user_department_assignments uda
    WHERE uda.user_id = auth.uid()
  )
);

-- Add RLS policies for marketing_campaigns
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can manage campaigns" 
ON public.marketing_campaigns 
FOR ALL 
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM user_department_assignments uda
    JOIN organization_roles org_roles ON uda.role_id = org_roles.id
    WHERE uda.user_id = auth.uid() 
    AND (org_roles.permissions ->> 'manage_marketing')::boolean = true
  )
);

-- Add RLS policies for system_metrics
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view metrics" 
ON public.system_metrics 
FOR SELECT 
USING (
  organization_id IN (
    SELECT uda.organization_id 
    FROM user_department_assignments uda
    WHERE uda.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert metrics" 
ON public.system_metrics 
FOR INSERT 
WITH CHECK (true);

-- Add RLS policies for department_members
ALTER TABLE public.department_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization admins can manage department members" 
ON public.department_members 
FOR ALL 
USING (
  department_id IN (
    SELECT od.id 
    FROM organization_departments od
    JOIN user_department_assignments uda ON od.organization_id = uda.organization_id
    JOIN organization_roles org_roles ON uda.role_id = org_roles.id
    WHERE uda.user_id = auth.uid() 
    AND (org_roles.permissions ->> 'manage_departments')::boolean = true
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_organization_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
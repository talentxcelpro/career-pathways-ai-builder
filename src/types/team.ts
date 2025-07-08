export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
}

export interface PermissionRequest {
  id: string;
  requester_id: string;
  company_id: string;
  permission_type: string;
  resource_id: string | null;
  reason: string | null;
  status: string;
  approved_by: string | null;
  requested_at: string;
  responded_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
  requester?: UserProfile;
  approver?: UserProfile | null;
}

export interface ActivityLog {
  id: string;
  company_id: string;
  user_id: string;
  action_type: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: UserProfile;
}
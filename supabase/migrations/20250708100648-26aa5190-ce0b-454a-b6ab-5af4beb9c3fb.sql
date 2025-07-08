-- Fix CRM permissions for company owners
-- Add missing access_crm_basic permission for owners and admins

INSERT INTO role_permissions (role, permission_type, is_allowed, requires_approval) 
VALUES 
  ('owner', 'access_crm_basic', true, false),
  ('admin', 'access_crm_basic', true, false)
ON CONFLICT (role, permission_type) 
DO UPDATE SET 
  is_allowed = EXCLUDED.is_allowed,
  requires_approval = EXCLUDED.requires_approval;
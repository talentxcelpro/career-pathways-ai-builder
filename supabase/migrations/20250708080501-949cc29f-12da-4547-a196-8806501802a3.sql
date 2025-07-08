-- Update recruiter permissions to be more practical
UPDATE public.role_permissions 
SET is_allowed = true, requires_approval = false
WHERE role = 'recruiter' AND permission_type = 'view_analytics';

-- Also allow recruiters to view basic analytics without approval
UPDATE public.role_permissions 
SET is_allowed = true, requires_approval = false
WHERE role = 'recruiter' AND permission_type = 'manage_company';
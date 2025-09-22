-- Grant admin access to current user
INSERT INTO public.user_roles (user_id, role, is_active, created_at) 
VALUES ('94a6a9f4-e2d4-4098-82c8-9a83af18d506', 'super_admin', true, now())
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'super_admin',
  is_active = true,
  updated_at = now();

-- Assign admin role to talentxcelservices@gmail.com
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT 
    au.id,
    'admin'::app_role,
    true
FROM auth.users au
WHERE au.email = 'talentxcelservices@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = au.id 
    AND ur.role IN ('super_admin', 'admin', 'moderator')
);

-- Also ensure arsh.wani@gmail.com has admin role if they exist
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT 
    au.id,
    'admin'::app_role,
    true
FROM auth.users au
WHERE au.email = 'arsh.wani@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = au.id 
    AND ur.role IN ('super_admin', 'admin', 'moderator')
);

-- Update existing admin roles to super_admin for main admin accounts
UPDATE public.user_roles 
SET role = 'super_admin'::app_role
WHERE user_id IN (
    SELECT au.id FROM auth.users au 
    WHERE au.email IN ('talentxcelpro@gmail.com', 'viralpay2025@gmail.com', 'talentxcelpro12@gmail.com')
);

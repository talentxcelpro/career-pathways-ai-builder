-- Assign super admin role to current user if none exists
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Only create super admin if no super admins exist and user is authenticated
    IF current_user_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE role = 'super_admin' AND is_active = true
    ) THEN
        INSERT INTO public.user_roles (user_id, role, assigned_by, notes)
        VALUES (
            current_user_id,
            'super_admin',
            current_user_id,
            'Initial super admin user'
        );
    END IF;
END $$;
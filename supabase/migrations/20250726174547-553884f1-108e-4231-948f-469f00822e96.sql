-- Drop and recreate the function with correct parameters
DROP FUNCTION IF EXISTS public.is_app_admin(uuid);

-- Create secure admin function with proper search path
CREATE OR REPLACE FUNCTION public.is_app_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = user_uuid
      AND role = ANY(ARRAY['super_admin'::public.app_role, 'admin'::public.app_role])
      AND is_active = true
  );
$function$;
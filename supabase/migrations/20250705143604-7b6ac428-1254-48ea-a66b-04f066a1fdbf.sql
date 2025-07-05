-- Enable admin access to profiles table for user management
-- Add RLS policy for admins to view and manage all user profiles

-- Create admin access policy for profiles table
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'talentxcelpro@gmail.com'
  )
);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'talentxcelpro@gmail.com'
  )
);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'talentxcelpro@gmail.com'
  );
$$;

-- Update existing admin policies to use the new function
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Super admin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_super_admin());

CREATE POLICY "Super admin can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (is_super_admin());

-- Ensure the profiles table has all necessary columns for user management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_profile_view TIMESTAMP WITH TIME ZONE;
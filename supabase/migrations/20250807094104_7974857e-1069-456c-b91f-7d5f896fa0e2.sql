-- Fix RLS policies that got mixed up between tables
-- First, enable RLS on all critical tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Clean up and recreate profiles policies
DROP POLICY IF EXISTS "Admins can manage bot profiles" ON public.profiles;
DROP POLICY IF EXISTS "Employers can view CV database" ON public.profiles;
DROP POLICY IF EXISTS "Secure profile visibility" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles and their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Create proper profiles policies
CREATE POLICY "Users can view public profiles and their own" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid() OR NOT is_private);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

-- Clean up and recreate user_roles policies  
DROP POLICY IF EXISTS "Admins can manage bot profiles" ON public.user_roles;
DROP POLICY IF EXISTS "Employers can view CV database" ON public.user_roles;
DROP POLICY IF EXISTS "Secure profile visibility" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view public profiles and their own profile" ON public.user_roles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.user_roles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.user_roles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.user_roles;

-- Create proper user_roles policies
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'admin') 
    AND ur.is_active = true
  )
);

-- Clean up mixed policies on job_applications
DROP POLICY IF EXISTS "Admins can manage bot profiles" ON public.job_applications;
DROP POLICY IF EXISTS "Employers can view CV database" ON public.job_applications;
DROP POLICY IF EXISTS "Secure profile visibility" ON public.job_applications;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.job_applications;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.job_applications;
DROP POLICY IF EXISTS "Users can view public profiles and their own profile" ON public.job_applications;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.job_applications;
DROP POLICY IF EXISTS "profiles_select_own" ON public.job_applications;
DROP POLICY IF EXISTS "profiles_select_public" ON public.job_applications;
DROP POLICY IF EXISTS "profiles_update_own" ON public.job_applications;
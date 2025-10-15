-- Fix profiles table UPDATE policies by removing duplicates and ensuring WITH CHECK
-- Drop all existing UPDATE policies first
DROP POLICY IF EXISTS "Own records update" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create single comprehensive UPDATE policy with proper checks
CREATE POLICY "users_can_update_own_profile"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
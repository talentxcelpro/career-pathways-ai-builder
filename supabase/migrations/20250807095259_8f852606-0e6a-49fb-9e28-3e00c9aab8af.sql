-- Remove duplicate and fix existing policies
DROP POLICY IF EXISTS "Users can view public profiles and their own" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Use the proper column name for profile visibility
CREATE POLICY "Users can view public profiles and their own" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid() OR profile_visibility = 'public');

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
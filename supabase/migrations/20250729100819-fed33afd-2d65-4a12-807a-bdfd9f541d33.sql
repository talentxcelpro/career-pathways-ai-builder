-- Fix RLS policies to allow bot profiles to be created
-- Add policy to allow admins to insert/update bot profiles
CREATE POLICY "Admins can manage bot profiles" 
ON public.profiles 
FOR ALL
USING (is_app_admin(auth.uid()) OR is_ai_bot = true)
WITH CHECK (is_app_admin(auth.uid()) OR is_ai_bot = true);
-- Fix bot accounts and admin permissions

-- First, update bot profiles to ensure consistency
UPDATE public.profiles 
SET 
  provider = 'email',
  oauth_provider = 'email',
  profile_completed = true,
  onboarding_completed = true,
  primary_role = COALESCE(primary_role, 'user')
WHERE is_ai_bot = true;

-- Drop any conflicting policies before creating new ones
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;

-- Create better admin policies for posts
CREATE POLICY "Admins can manage all posts" ON public.posts
FOR ALL TO public
USING (
  is_app_admin(auth.uid()) OR 
  auth.uid() = author_id
)
WITH CHECK (
  is_app_admin(auth.uid()) OR 
  auth.uid() = author_id
);

-- Allow admins to see all posts regardless of visibility
CREATE POLICY "Admins can view all posts" ON public.posts
FOR SELECT TO public
USING (
  is_app_admin(auth.uid()) OR 
  (visibility = 'public' AND is_deleted = false) OR 
  auth.uid() = author_id
);
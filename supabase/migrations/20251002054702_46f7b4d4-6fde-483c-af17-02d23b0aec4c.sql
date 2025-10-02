-- Fix profile_views RLS policies - drop all and recreate correctly
DROP POLICY IF EXISTS "Users can view their own profile views" ON public.profile_views;
DROP POLICY IF EXISTS "Users can manage their own data" ON public.profile_views;
DROP POLICY IF EXISTS "Public read access" ON public.profile_views;
DROP POLICY IF EXISTS "Anyone can track profile views" ON public.profile_views;
DROP POLICY IF EXISTS "System can update profile views" ON public.profile_views;
DROP POLICY IF EXISTS "Allow realtime for own profile views" ON public.profile_views;

-- Create correct policies
-- Only profile owners can view who viewed their profile
CREATE POLICY "Profile owners can view their profile views"
ON public.profile_views
FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

-- Allow tracking profile views (anyone can insert)
CREATE POLICY "Allow inserting profile views"
ON public.profile_views
FOR INSERT
WITH CHECK (true);

-- Allow updates for triggers
CREATE POLICY "Allow system updates"
ON public.profile_views
FOR UPDATE
USING (true);
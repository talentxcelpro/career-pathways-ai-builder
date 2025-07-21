-- Add policy to allow admins to create profiles for other users during import
CREATE POLICY "Admins can create profiles for users"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (is_app_admin(auth.uid()));
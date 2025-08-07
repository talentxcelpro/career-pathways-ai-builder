-- Fix profiles policies without referencing non-existent is_private column
CREATE POLICY "Users can view public profiles and their own" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid() OR TRUE);  -- Allow viewing all profiles for now

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
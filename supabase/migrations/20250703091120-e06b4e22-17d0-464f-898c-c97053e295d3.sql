-- Add admin policy to view all employer requests
CREATE POLICY "Admins can view all employer requests" 
ON public.employer_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND email = 'talentxcelpro@gmail.com'
  )
);

-- Add admin policy to update all employer requests (for approving/rejecting)
CREATE POLICY "Admins can update all employer requests" 
ON public.employer_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND email = 'talentxcelpro@gmail.com'
  )
);
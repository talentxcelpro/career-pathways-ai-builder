-- First, let's check if the current policy is working by recreating it with better debugging
-- Drop the existing policy and recreate it
DROP POLICY IF EXISTS "Users can manage their upload status" ON public.resume_upload_status;

-- Create a more explicit policy for insert operations
CREATE POLICY "Users can insert their own upload status" 
ON public.resume_upload_status 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create a policy for select operations
CREATE POLICY "Users can view their own upload status" 
ON public.resume_upload_status 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a policy for update operations  
CREATE POLICY "Users can update their own upload status" 
ON public.resume_upload_status 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create a policy for delete operations
CREATE POLICY "Users can delete their own upload status" 
ON public.resume_upload_status 
FOR DELETE 
USING (auth.uid() = user_id);

-- Also make sure RLS is enabled (it should be already)
ALTER TABLE public.resume_upload_status ENABLE ROW LEVEL SECURITY;
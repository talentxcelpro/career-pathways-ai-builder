-- Fix RLS policies for resumes bucket to allow user uploads
DROP POLICY IF EXISTS "Users can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own resumes" ON storage.objects;

-- Create proper RLS policies for resumes bucket
CREATE POLICY "Users can upload to resumes bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own resume files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own resume files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own resume files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Also ensure the enhance-resume edge function exists and is accessible
-- Check if the ai_resumes table has proper RLS policies
DROP POLICY IF EXISTS "Users can manage their own AI resumes" ON public.ai_resumes;

CREATE POLICY "Users can manage their own AI resumes"
ON public.ai_resumes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
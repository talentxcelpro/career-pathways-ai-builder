-- Create storage buckets for user uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for user uploads bucket
CREATE POLICY "Users can upload their own profile content" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own profile content" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile content" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile content" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add profile photo and video resume columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS video_resume_url TEXT;
-- Create storage bucket for bot profile assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bot-profiles', 'bot-profiles', true);

-- Create storage policies for bot profile assets
CREATE POLICY "Admins can upload bot profile assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bot-profiles' 
  AND is_app_admin(auth.uid())
);

CREATE POLICY "Admins can update bot profile assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'bot-profiles' 
  AND is_app_admin(auth.uid())
);

CREATE POLICY "Admins can delete bot profile assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'bot-profiles' 
  AND is_app_admin(auth.uid())
);

CREATE POLICY "Everyone can view bot profile assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'bot-profiles');

-- Add banner field to ai_bots table
ALTER TABLE public.ai_bots 
ADD COLUMN banner_picture_url TEXT;

-- Add banner field to profiles table for bots
ALTER TABLE public.profiles 
ADD COLUMN banner_picture_url TEXT;
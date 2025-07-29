-- Create storage bucket for bot profiles
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bot-profiles', 'bot-profiles', true);

-- Create storage policies for bot profile images
CREATE POLICY "Anyone can view bot profile images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'bot-profiles');

CREATE POLICY "Admins can upload bot profile images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'bot-profiles' AND is_app_admin(auth.uid()));

CREATE POLICY "Admins can update bot profile images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'bot-profiles' AND is_app_admin(auth.uid()));

CREATE POLICY "Admins can delete bot profile images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'bot-profiles' AND is_app_admin(auth.uid()));
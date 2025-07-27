-- Create storage bucket for BIMI logos and email branding assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('email-branding', 'email-branding', true);

-- Create policies for public access to email branding assets
CREATE POLICY "Email branding assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'email-branding');

CREATE POLICY "Authenticated users can upload email branding assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'email-branding' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own email branding assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'email-branding' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own email branding assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'email-branding' AND auth.uid() IS NOT NULL);
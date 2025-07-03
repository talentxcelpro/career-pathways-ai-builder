-- Create URL previews table for caching link metadata
CREATE TABLE public.url_previews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  image_url TEXT,
  site_name TEXT,
  favicon_url TEXT,
  domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_valid BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.url_previews ENABLE ROW LEVEL SECURITY;

-- Create policies for URL previews
CREATE POLICY "Anyone can view URL previews" 
ON public.url_previews 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage URL previews" 
ON public.url_previews 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create index for faster lookups
CREATE INDEX idx_url_previews_url ON public.url_previews(url);
CREATE INDEX idx_url_previews_domain ON public.url_previews(domain);

-- Add preview_url field to posts table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'preview_url'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN preview_url TEXT;
  END IF;
END $$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_url_previews_updated_at
BEFORE UPDATE ON public.url_previews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
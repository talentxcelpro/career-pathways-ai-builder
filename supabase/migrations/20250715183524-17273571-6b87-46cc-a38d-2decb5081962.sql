-- Add custom branding fields to profiles table for Elite tier users
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_logo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS video_bio_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vanity_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_theme JSONB DEFAULT '{"primary": "hsl(var(--primary))", "secondary": "hsl(var(--secondary))", "accent": "hsl(var(--accent))"}';

-- Create unique index for vanity URLs
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_vanity_url ON public.profiles(vanity_url) WHERE vanity_url IS NOT NULL;

-- Create function to generate vanity URL suggestions
CREATE OR REPLACE FUNCTION public.generate_vanity_url_suggestions(base_name TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
    suggestions TEXT[] := '{}';
    base_slug TEXT;
    counter INTEGER := 1;
    candidate TEXT;
BEGIN
    -- Clean and format the base name
    base_slug := LOWER(REGEXP_REPLACE(TRIM(base_name), '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
    base_slug := SUBSTRING(base_slug FROM 1 FOR 30);
    
    -- Add original suggestion
    suggestions := array_append(suggestions, base_slug);
    
    -- Add numbered variations
    FOR i IN 1..5 LOOP
        candidate := base_slug || '-' || counter;
        suggestions := array_append(suggestions, candidate);
        counter := counter + 1;
    END LOOP;
    
    RETURN suggestions;
END;
$$;

-- Create function to check vanity URL availability
CREATE OR REPLACE FUNCTION public.check_vanity_url_availability(url TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE vanity_url = url
    );
$$;
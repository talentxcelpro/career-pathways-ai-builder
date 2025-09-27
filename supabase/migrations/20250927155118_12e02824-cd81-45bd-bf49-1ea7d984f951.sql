-- Add canonical_url column to seo_generated_content table
ALTER TABLE public.seo_generated_content 
ADD COLUMN canonical_url text;
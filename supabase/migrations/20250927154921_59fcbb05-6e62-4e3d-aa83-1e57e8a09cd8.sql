-- Add breadcrumbs column to seo_generated_content table
ALTER TABLE public.seo_generated_content 
ADD COLUMN breadcrumbs jsonb DEFAULT '[]'::jsonb;
-- Add SEO slug column to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS seo_slug TEXT;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_jobs_seo_slug ON public.jobs(seo_slug);

-- Create function to generate SEO-friendly slugs
CREATE OR REPLACE FUNCTION public.generate_job_seo_slug(job_title text, job_location text, job_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base slug from title and location
  base_slug := LOWER(
    TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          job_title || '-' || COALESCE(job_location, 'india'),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-'
    )
  );
  
  -- Add first 8 characters of UUID for uniqueness
  final_slug := base_slug || '-' || SUBSTRING(job_id::TEXT, 1, 8);
  
  -- Ensure uniqueness (though UUID part should make it unique)
  WHILE EXISTS (SELECT 1 FROM public.jobs WHERE seo_slug = final_slug AND id != job_id) LOOP
    final_slug := base_slug || '-' || SUBSTRING(job_id::TEXT, 1, 8) || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  -- Limit slug length to 100 characters
  RETURN SUBSTRING(final_slug, 1, 100);
END;
$$;

-- Update existing jobs with SEO slugs
UPDATE public.jobs 
SET seo_slug = public.generate_job_seo_slug(title, location, id)
WHERE seo_slug IS NULL AND title IS NOT NULL;

-- Create trigger to auto-generate slugs for new jobs
CREATE OR REPLACE FUNCTION public.auto_generate_job_seo_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only generate if seo_slug is not provided or empty
  IF NEW.seo_slug IS NULL OR NEW.seo_slug = '' THEN
    NEW.seo_slug := public.generate_job_seo_slug(NEW.title, NEW.location, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_auto_generate_job_seo_slug ON public.jobs;
CREATE TRIGGER trigger_auto_generate_job_seo_slug
  BEFORE INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_job_seo_slug();

-- Add constraint to ensure seo_slug is unique
ALTER TABLE public.jobs ADD CONSTRAINT unique_job_seo_slug UNIQUE (seo_slug);

-- Update existing jobs without location to use 'india' as default
UPDATE public.jobs 
SET seo_slug = public.generate_job_seo_slug(title, COALESCE(location, 'india'), id)
WHERE seo_slug IS NULL OR seo_slug = '';

-- Verify the update
SELECT COUNT(*) as total_jobs, 
       COUNT(seo_slug) as jobs_with_slugs,
       COUNT(seo_slug) * 100.0 / COUNT(*) as percentage_complete
FROM public.jobs;
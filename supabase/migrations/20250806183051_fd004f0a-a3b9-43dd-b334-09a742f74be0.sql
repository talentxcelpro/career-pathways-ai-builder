-- Update the auto-generate job SEO slug function to use the new standardized format
CREATE OR REPLACE FUNCTION public.generate_job_seo_slug_v2(job_title text, job_company text, job_location text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  title_slug TEXT;
  company_slug TEXT;
  location_slug TEXT;
  job_code TEXT;
  final_slug TEXT;
BEGIN
  -- Extract job code from title (e.g., "Data Scientist - GOV0004" -> "GOV0004")
  SELECT SUBSTRING(job_title FROM '([A-Z]{2,}\d{3,})') INTO job_code;
  
  -- Create slugs for each component
  title_slug := LOWER(
    TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(job_title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-'
    )
  );
  
  company_slug := LOWER(
    TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(job_company, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-'
    )
  );
  
  location_slug := COALESCE(
    LOWER(
      TRIM(
        REGEXP_REPLACE(
          REGEXP_REPLACE(job_location, '[^a-zA-Z0-9\s-]', '', 'g'),
          '\s+', '-', 'g'
        ),
        '-'
      )
    ),
    'india'
  );
  
  -- Build final slug: title-[code]-company-location
  IF job_code IS NOT NULL THEN
    final_slug := title_slug || '-' || LOWER(job_code) || '-' || company_slug || '-' || location_slug;
  ELSE
    final_slug := title_slug || '-' || company_slug || '-' || location_slug;
  END IF;
  
  -- Limit slug length to 100 characters
  RETURN SUBSTRING(final_slug, 1, 100);
END;
$function$;

-- Update the trigger function to use the new slug generation
CREATE OR REPLACE FUNCTION public.auto_generate_job_seo_slug_v2()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only generate if seo_slug is not provided or empty
  IF NEW.seo_slug IS NULL OR NEW.seo_slug = '' THEN
    NEW.seo_slug := public.generate_job_seo_slug_v2(NEW.title, NEW.company_name, NEW.location);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update the trigger to use the new function
DROP TRIGGER IF EXISTS auto_generate_job_seo_slug_trigger ON public.jobs;
CREATE TRIGGER auto_generate_job_seo_slug_trigger_v2
  BEFORE INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_job_seo_slug_v2();
-- Rollback M6: Restore previous auto_generate_job_seo_slug_v2 without id-suffix collision handling
BEGIN;

CREATE OR REPLACE FUNCTION public.auto_generate_job_seo_slug_v2()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.seo_slug IS NULL OR NEW.seo_slug = '' THEN
    NEW.seo_slug := public.generate_job_seo_slug_v2(NEW.title, NEW.company_name, NEW.location);
  END IF;
  RETURN NEW;
END;
$$;

COMMIT;

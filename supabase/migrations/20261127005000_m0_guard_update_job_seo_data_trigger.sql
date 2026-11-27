-- M0 (REQUIRED FIRST before any UPDATE on public.jobs in production):
-- Guard update_job_seo_data() so existing seo_slug, meta_title, meta_description,
-- popularity_score, and trending_score are NEVER overwritten on UPDATE.
BEGIN;

CREATE OR REPLACE FUNCTION public.update_job_seo_data()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  -- Never overwrite an existing seo_slug on UPDATE (existing URLs are indexed)
  IF NEW.seo_slug IS NULL OR NEW.seo_slug = '' THEN
    NEW.seo_slug := public.generate_job_seo_slug(NEW.title, NEW.company_name, NEW.location);
  END IF;

  IF NEW.meta_title IS NULL OR NEW.meta_title = '' THEN
    NEW.meta_title := SUBSTRING(NEW.title || ' at ' || NEW.company_name || ' | TalentXcel', 1, 60);
  END IF;

  IF NEW.meta_description IS NULL OR NEW.meta_description = '' THEN
    NEW.meta_description := SUBSTRING(
      'Join ' || NEW.company_name || ' as ' || NEW.title ||
      CASE
        WHEN NEW.location IS NOT NULL THEN ' in ' || NEW.location
        ELSE ' (Remote)'
      END ||
      '. Apply now and advance your career with competitive salary and benefits.',
      1, 160
    );
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.popularity_score := COALESCE(NEW.popularity_score, 0);
    NEW.trending_score := COALESCE(NEW.trending_score, 0);
  END IF;

  RETURN NEW;
END;
$function$;

SELECT proname, prosrc LIKE '%IF NEW.seo_slug IS NULL%' AS has_seo_slug_guard
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname = 'update_job_seo_data';

COMMIT;

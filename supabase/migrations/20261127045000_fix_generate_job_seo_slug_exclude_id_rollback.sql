-- Rollback fix_generate_job_seo_slug_exclude_id
BEGIN;

CREATE OR REPLACE FUNCTION public.update_job_seo_data()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
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

DROP FUNCTION IF EXISTS public.generate_job_seo_slug(text, text, text, uuid);

COMMIT;

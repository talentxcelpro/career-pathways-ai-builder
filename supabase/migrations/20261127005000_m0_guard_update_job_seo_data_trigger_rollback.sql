-- Rollback M0: Restore original unguarded update_job_seo_data() function
BEGIN;

CREATE OR REPLACE FUNCTION public.update_job_seo_data()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  NEW.seo_slug := public.generate_job_seo_slug(NEW.title, NEW.company_name, NEW.location);
  NEW.meta_title := SUBSTRING(NEW.title || ' at ' || NEW.company_name || ' | TalentXcel', 1, 60);
  NEW.meta_description := SUBSTRING(
    'Join ' || NEW.company_name || ' as ' || NEW.title ||
    CASE
      WHEN NEW.location IS NOT NULL THEN ' in ' || NEW.location
      ELSE ' (Remote)'
    END ||
    '. Apply now and advance your career with competitive salary and benefits.',
    1, 160
  );
  NEW.popularity_score := 0;
  NEW.trending_score := 0;
  RETURN NEW;
END;
$function$;

COMMIT;

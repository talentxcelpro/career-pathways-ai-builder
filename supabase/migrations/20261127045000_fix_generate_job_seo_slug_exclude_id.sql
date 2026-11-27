-- Fix generate_job_seo_slug() to exclude NEW.id in its collision check
-- and append first 8 hex chars of id on collision instead of "-1".
BEGIN;

CREATE OR REPLACE FUNCTION public.generate_job_seo_slug(
  job_title text,
  company_name text,
  location text,
  exclude_id uuid
)
RETURNS text
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  short_id TEXT;
BEGIN
  base_slug := LOWER(
    REGEXP_REPLACE(
      TRIM(job_title || '-' || company_name || '-' || COALESCE(location, 'remote')),
      '[^a-zA-Z0-9\s-]', '', 'g'
    )
  );
  base_slug := REGEXP_REPLACE(REGEXP_REPLACE(base_slug, '\s+', '-', 'g'), '-+', '-', 'g');
  base_slug := TRIM(BOTH '-' FROM base_slug);
  base_slug := SUBSTRING(base_slug, 1, 100);
  final_slug := base_slug;

  IF EXISTS (
    SELECT 1 FROM public.jobs
    WHERE seo_slug = final_slug
      AND (exclude_id IS NULL OR id <> exclude_id)
  ) THEN
    short_id := SUBSTRING(COALESCE(exclude_id, gen_random_uuid())::text, 1, 8);
    final_slug := LEFT(base_slug, 91) || '-' || short_id;
  END IF;

  RETURN final_slug;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_job_seo_data()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  IF NEW.seo_slug IS NULL OR NEW.seo_slug = '' THEN
    NEW.seo_slug := public.generate_job_seo_slug(NEW.title, NEW.company_name, NEW.location, NEW.id);
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

SELECT proname, pg_get_function_identity_arguments(oid) AS args
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('generate_job_seo_slug', 'update_job_seo_data')
ORDER BY proname, args;

COMMIT;

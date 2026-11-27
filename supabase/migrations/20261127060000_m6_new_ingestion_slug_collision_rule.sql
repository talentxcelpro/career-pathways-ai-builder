-- M6: New-ingestion slug collision rule — append first 8 hex chars of id instead of "-1"
-- Does NOT modify any existing rows.
BEGIN;

CREATE OR REPLACE FUNCTION public.auto_generate_job_seo_slug_v2()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  candidate_slug text;
  short_id text;
BEGIN
  IF NEW.seo_slug IS NULL OR NEW.seo_slug = '' THEN
    candidate_slug := public.generate_job_seo_slug_v2(NEW.title, NEW.company_name, NEW.location);
    IF EXISTS (SELECT 1 FROM public.jobs WHERE seo_slug = candidate_slug AND id <> NEW.id) THEN
      short_id := substring(coalesce(NEW.id, gen_random_uuid())::text, 1, 8);
      candidate_slug := left(candidate_slug, 91) || '-' || short_id;
    END IF;
    NEW.seo_slug := candidate_slug;
  END IF;

  RETURN NEW;
END;
$$;

SELECT proname, prosrc LIKE '%short_id%' AS uses_id_suffix_on_collision
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname = 'auto_generate_job_seo_slug_v2';

COMMIT;

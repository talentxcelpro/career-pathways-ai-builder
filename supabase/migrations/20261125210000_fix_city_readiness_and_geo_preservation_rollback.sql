-- supabase/migrations/20261125210000_fix_city_readiness_and_geo_preservation_rollback.sql
-- Restores the exact previous definition of evaluate_city_index_readiness(TEXT)
-- from supabase/migrations/20261125_city_registry_seo.sql without touching public.jobs.

CREATE OR REPLACE FUNCTION public.evaluate_city_index_readiness(p_city_slug TEXT)
RETURNS TABLE(
  city_slug TEXT,
  index_ready BOOLEAN,
  quality_score SMALLINT,
  active_job_count INTEGER,
  unique_employer_count INTEGER,
  recent_job_count INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_city_name TEXT;
  v_job_count INTEGER;
  v_unique_job_count INTEGER;
  v_employer_count INTEGER;
  v_recent_count INTEGER;
  v_score SMALLINT;
  v_ready BOOLEAN;
  v_cutoff TIMESTAMPTZ;
BEGIN
  v_city_name := REPLACE(p_city_slug, '-', ' ');
  v_cutoff := NOW() - INTERVAL '30 days';

  SELECT COUNT(*) INTO v_job_count
  FROM public.jobs
  WHERE is_active = true
    AND (location ILIKE '%' || v_city_name || '%' OR location_city ILIKE '%' || v_city_name || '%');

  SELECT COUNT(DISTINCT CONCAT(title, '||', COALESCE(company_name, ''))) INTO v_unique_job_count
  FROM public.jobs
  WHERE is_active = true
    AND (location ILIKE '%' || v_city_name || '%' OR location_city ILIKE '%' || v_city_name || '%')
  LIMIT 200;

  SELECT COUNT(DISTINCT company_name) INTO v_employer_count
  FROM public.jobs
  WHERE is_active = true
    AND company_name IS NOT NULL
    AND (location ILIKE '%' || v_city_name || '%' OR location_city ILIKE '%' || v_city_name || '%');

  SELECT COUNT(*) INTO v_recent_count
  FROM public.jobs
  WHERE is_active = true
    AND posted_at >= v_cutoff
    AND (location ILIKE '%' || v_city_name || '%' OR location_city ILIKE '%' || v_city_name || '%');

  v_score := 0;
  IF v_job_count >= 5 THEN v_score := v_score + 15; END IF;
  IF v_unique_job_count >= 3 THEN v_score := v_score + 15; END IF;
  IF v_employer_count >= 2 THEN v_score := v_score + 15; END IF;
  IF v_recent_count >= 1 THEN v_score := v_score + 10; END IF;
  IF v_job_count > 0 THEN v_score := v_score + 5; END IF;
  v_score := v_score + LEAST(20, v_unique_job_count * 2);
  v_score := v_score + LEAST(10, v_employer_count * 2);

  v_ready := (v_job_count >= 5 AND v_unique_job_count >= 3 AND v_employer_count >= 2
              AND v_recent_count >= 1 AND v_score >= 40);

  UPDATE public.city_registry AS cr
  SET active_job_count = v_job_count,
      unique_employer_count = v_employer_count,
      index_ready = v_ready,
      quality_score = v_score,
      gate_evaluated_at = NOW(),
      in_sitemap = v_ready,
      last_material_update = CASE WHEN v_ready AND NOT cr.index_ready THEN NOW() ELSE cr.last_material_update END
  WHERE cr.slug = p_city_slug;

  RETURN QUERY
  SELECT p_city_slug, v_ready, v_score, v_job_count, v_employer_count, v_recent_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.evaluate_city_index_readiness(TEXT) TO service_role;

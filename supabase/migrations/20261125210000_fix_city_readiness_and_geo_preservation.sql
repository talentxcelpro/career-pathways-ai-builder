-- supabase/migrations/20261125210000_fix_city_readiness_and_geo_preservation.sql
-- TalentXcel Phase 3: Fix City Readiness RPC (Alias-Aware, Word-Boundary Safe, Inventory Preserving)
--
-- SAFETY GUARANTEES:
-- 1. NEVER mutates, deactivates, or deletes any row in public.jobs.
-- 2. Preserves ALL is_active = true jobs in active_job_count (independent of expiry_date).
-- 3. Evaluates SEO index_ready separately using unexpired + fresh + diverse jobs.
-- 4. Uses word-boundary regex (~*) + city_registry.aliases instead of ILIKE '%patna%'
--    so Visakhapatnam never leaks into Patna, and Bengaluru aggregates into bangalore.
-- 5. Hardened SECURITY DEFINER with SET search_path = public, pg_temp and service_role-only EXECUTE.
-- 6. Single-pass scan over public.jobs (replaces 5 separate scans).
--
-- STATUS: Qualified for production — NOT executed without explicit approval.

CREATE OR REPLACE FUNCTION public.evaluate_city_index_readiness(p_city_slug TEXT)
RETURNS TABLE(
  city_slug TEXT,
  index_ready BOOLEAN,
  quality_score SMALLINT,
  active_job_count INTEGER,
  unique_employer_count INTEGER,
  recent_job_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_aliases TEXT[];
  v_terms TEXT[];
  v_regex TEXT;
  v_total_active INTEGER := 0;
  v_seo_unexpired INTEGER := 0;
  v_unique_job_count INTEGER := 0;
  v_employer_count INTEGER := 0;
  v_recent_count INTEGER := 0;
  v_score SMALLINT := 0;
  v_ready BOOLEAN := false;
  v_cutoff TIMESTAMPTZ;
BEGIN
  IF p_city_slug IS NULL OR TRIM(p_city_slug) = '' THEN
    RETURN QUERY SELECT p_city_slug, false, 0::SMALLINT, 0, 0, 0;
    RETURN;
  END IF;

  v_cutoff := NOW() - INTERVAL '30 days';

  SELECT COALESCE(cr.aliases, '{}') INTO v_aliases
  FROM public.city_registry cr
  WHERE cr.slug = p_city_slug;

  -- Build word-boundary regex from canonical slug term + aliases
  -- Prevents substring false positives like 'patna' matching 'Visakhapatnam'
  SELECT ARRAY_AGG(DISTINCT LOWER(TRIM(t)))
  INTO v_terms
  FROM unnest(ARRAY[REPLACE(p_city_slug, '-', ' ')] || COALESCE(v_aliases, '{}')) AS t
  WHERE TRIM(t) <> '';

  SELECT '\m(' || STRING_AGG(REGEXP_REPLACE(t, '([.^$*+?()[\]{}|\\])', '\\\1', 'g'), '|') || ')\M'
  INTO v_regex
  FROM unnest(v_terms) AS t;

  IF v_regex IS NULL THEN
    RETURN QUERY SELECT p_city_slug, false, 0::SMALLINT, 0, 0, 0;
    RETURN;
  END IF;

  -- Single-pass scan over matched active jobs
  WITH matched AS (
    SELECT
      j.id,
      LOWER(TRIM(COALESCE(j.title, ''))) AS title_norm,
      LOWER(TRIM(COALESCE(j.company_name, ''))) AS company_norm,
      (j.expiry_date IS NULL OR j.expiry_date >= CURRENT_DATE) AS is_unexpired,
      (COALESCE(j.posted_at, j.created_at) >= v_cutoff) AS is_recent
    FROM public.jobs j
    WHERE j.is_active = true
      AND (COALESCE(j.location_city, '') ~* v_regex OR COALESCE(j.location, '') ~* v_regex)
  )
  SELECT
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE is_unexpired)::INTEGER,
    COUNT(DISTINCT (title_norm || '||' || company_norm)) FILTER (WHERE is_unexpired)::INTEGER,
    COUNT(DISTINCT company_norm) FILTER (WHERE is_unexpired AND company_norm <> '')::INTEGER,
    COUNT(*) FILTER (WHERE is_unexpired AND is_recent)::INTEGER
  INTO
    v_total_active,
    v_seo_unexpired,
    v_unique_job_count,
    v_employer_count,
    v_recent_count
  FROM matched;

  -- Compute SEO quality score from unexpired SEO-eligible inventory
  v_score := 0;
  IF v_seo_unexpired >= 5 THEN v_score := v_score + 15; END IF;
  IF v_unique_job_count >= 3 THEN v_score := v_score + 15; END IF;
  IF v_employer_count >= 2 THEN v_score := v_score + 15; END IF;
  IF v_recent_count >= 1 THEN v_score := v_score + 10; END IF;
  IF v_total_active > 0 THEN v_score := v_score + 5; END IF;
  v_score := v_score + LEAST(20, v_unique_job_count * 2);
  v_score := v_score + LEAST(10, v_employer_count * 2);

  v_ready := (v_seo_unexpired >= 5 AND v_unique_job_count >= 3 AND v_employer_count >= 2
              AND v_recent_count >= 1 AND v_score >= 40);

  -- Update city_registry: active_job_count preserves ALL active jobs; index_ready reflects SEO gate
  UPDATE public.city_registry AS cr
  SET active_job_count = v_total_active,
      unique_employer_count = v_employer_count,
      index_ready = v_ready,
      quality_score = v_score,
      gate_evaluated_at = NOW(),
      in_sitemap = v_ready,
      last_material_update = CASE WHEN v_ready AND NOT cr.index_ready THEN NOW() ELSE cr.last_material_update END
  WHERE cr.slug = p_city_slug;

  RETURN QUERY
  SELECT p_city_slug, v_ready, v_score, v_total_active, v_employer_count, v_recent_count;
END;
$$;

REVOKE ALL ON FUNCTION public.evaluate_city_index_readiness(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.evaluate_city_index_readiness(TEXT) TO service_role;

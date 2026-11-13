-- Migration: 20261114000000_production_disk_io_and_performance_optimization.sql
-- Description: Resolve Supabase Production Disk I/O Budget Depletion Warning
-- Targets: Eliminate temp disk spills, reduce index write amplification, optimize high-traffic queries, and streamline Realtime CDC publication

-- =========================================================================
-- 1. OPTIMIZE get_jobs_paginated_optimized (Eliminate Temp Disk Spill)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.get_jobs_paginated_optimized(
  p_page integer DEFAULT 1,
  p_limit integer DEFAULT 20,
  p_search text DEFAULT ''::text,
  p_location text DEFAULT ''::text,
  p_employment_types text[] DEFAULT '{}'::text[],
  p_experience_levels text[] DEFAULT '{}'::text[],
  p_min_salary integer DEFAULT 0,
  p_max_salary integer DEFAULT 0,
  p_is_remote boolean DEFAULT false,
  p_skills text[] DEFAULT '{}'::text[],
  p_sort_by text DEFAULT 'created_at'::text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
DECLARE
  offset_val INTEGER := (p_page - 1) * p_limit;
  result_json JSONB;
BEGIN
  WITH filtered_jobs AS (
    SELECT 
      j.id,
      j.title,
      j.description,
      j.location,
      j.salary_min,
      j.salary_max,
      j.salary_range,
      j.employment_type,
      j.experience_level,
      j.skills_required,
      j.is_remote,
      j.is_featured,
      j.views_count,
      j.applications_count,
      j.posted_at,
      j.created_at,
      j.expires_at,
      j.external_url,
      j.seo_slug,
      j.company_id,
      j.company_name
    FROM public.jobs j
    WHERE 
      j.is_active = true 
      AND j.job_status = 'open'
      AND j.expires_at > NOW()
      AND (p_search = '' OR (
        j.title ILIKE '%' || p_search || '%' OR
        j.description ILIKE '%' || p_search || '%' OR
        j.company_name ILIKE '%' || p_search || '%'
      ))
      AND (p_location = '' OR 
           (p_location = 'India' AND j.location ILIKE '%india%') OR
           (p_location = 'International' AND j.location NOT ILIKE '%india%') OR
           j.location ILIKE '%' || p_location || '%')
      AND (array_length(p_employment_types, 1) IS NULL OR j.employment_type = ANY(p_employment_types))
      AND (array_length(p_experience_levels, 1) IS NULL OR j.experience_level = ANY(p_experience_levels))
      AND (NOT p_is_remote OR j.is_remote = true)
      AND (p_min_salary = 0 OR j.salary_min >= p_min_salary OR j.salary_max >= p_min_salary)
      AND (p_max_salary = 0 OR j.salary_max <= p_max_salary OR j.salary_min <= p_max_salary)
      AND (array_length(p_skills, 1) IS NULL OR j.skills_required && p_skills)
  ),
  total_count AS (
    SELECT COUNT(*)::INTEGER AS total FROM filtered_jobs
  ),
  paginated_ids AS (
    SELECT fj.*
    FROM filtered_jobs fj
    ORDER BY 
      (CASE WHEN p_sort_by = 'salary_max' THEN fj.salary_max END) DESC NULLS LAST,
      (CASE WHEN p_sort_by = 'views_count' THEN fj.views_count END) DESC NULLS LAST,
      (CASE WHEN p_sort_by = 'applications_count' THEN fj.applications_count END) ASC NULLS LAST,
      (CASE WHEN p_sort_by = 'created_at' OR p_sort_by IS NULL THEN fj.created_at END) DESC
    LIMIT p_limit
    OFFSET offset_val
  ),
  enriched_jobs AS (
    SELECT 
      pj.*,
      COALESCE(c.name, pj.company_name, 'Company') AS final_company_name,
      c.logo_url AS company_logo,
      c.industry AS company_industry,
      COALESCE(c.is_verified, false) AS company_verified_flag
    FROM paginated_ids pj
    LEFT JOIN public.companies c ON pj.company_id = c.id
  )
  SELECT 
    jsonb_build_object(
      'jobs', COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', ej.id,
            'title', ej.title,
            'description', ej.description,
            'location', ej.location,
            'salary_min', ej.salary_min,
            'salary_max', ej.salary_max,
            'salary_range', ej.salary_range,
            'employment_type', ej.employment_type,
            'experience_level', ej.experience_level,
            'skills_required', ej.skills_required,
            'is_remote', ej.is_remote,
            'is_featured', ej.is_featured,
            'views_count', ej.views_count,
            'applications_count', ej.applications_count,
            'posted_at', ej.posted_at,
            'created_at', ej.created_at,
            'expires_at', ej.expires_at,
            'external_url', ej.external_url,
            'seo_slug', ej.seo_slug,
            'company_name', ej.final_company_name,
            'companies', jsonb_build_object(
              'id', ej.company_id,
              'name', ej.final_company_name,
              'logo_url', ej.company_logo,
              'industry', ej.company_industry,
              'is_verified', ej.company_verified_flag
            )
          )
        ) FILTER (WHERE ej.id IS NOT NULL),
        '[]'::jsonb
      ),
      'total_count', COALESCE((SELECT total FROM total_count), 0),
      'has_more', (COALESCE((SELECT total FROM total_count), 0) > (offset_val + p_limit))
    ) INTO result_json
  FROM enriched_jobs ej;
  
  RETURN result_json;
END;
$function$;

-- =========================================================================
-- 2. OPTIMIZE get_trending_job_locations (STABLE function cache)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.get_trending_job_locations()
RETURNS TABLE(location text, job_count bigint)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    j.location,
    COUNT(*)::bigint as job_count
  FROM public.jobs j
  WHERE j.is_active = true 
    AND j.job_status = 'open'
    AND j.expires_at > NOW()
    AND j.location IS NOT NULL
    AND LENGTH(TRIM(j.location)) > 0
  GROUP BY j.location
  HAVING COUNT(*) > 0
  ORDER BY job_count DESC
  LIMIT 10;
END;
$function$;

-- =========================================================================
-- 3. PROFILES TRIGGER HARDENING (Skip expensive score recalculation on presence updates)
-- =========================================================================
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON public.profiles;
DROP TRIGGER IF EXISTS trigger_update_profile_completion_insert ON public.profiles;
DROP TRIGGER IF EXISTS trigger_update_profile_completion_update ON public.profiles;

CREATE TRIGGER trigger_update_profile_completion_insert 
BEFORE INSERT ON public.profiles 
FOR EACH ROW 
EXECUTE FUNCTION update_profile_completion_status();

CREATE TRIGGER trigger_update_profile_completion_update 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW 
WHEN (
  OLD.full_name IS DISTINCT FROM NEW.full_name OR
  OLD.email IS DISTINCT FROM NEW.email OR
  OLD.profile_picture_url IS DISTINCT FROM NEW.profile_picture_url OR
  OLD.title IS DISTINCT FROM NEW.title OR
  OLD.about IS DISTINCT FROM NEW.about OR
  OLD.location IS DISTINCT FROM NEW.location OR
  OLD.linkedin_url IS DISTINCT FROM NEW.linkedin_url OR
  OLD.current_company IS DISTINCT FROM NEW.current_company OR
  OLD.skills IS DISTINCT FROM NEW.skills OR
  OLD.experience_years IS DISTINCT FROM NEW.experience_years
)
EXECUTE FUNCTION update_profile_completion_status();

DROP TRIGGER IF EXISTS trigger_update_user_scores_on_profile_change ON public.profiles;
DROP TRIGGER IF EXISTS trigger_update_user_scores_on_profile_insert ON public.profiles;
DROP TRIGGER IF EXISTS trigger_update_user_scores_on_profile_update ON public.profiles;

CREATE TRIGGER trigger_update_user_scores_on_profile_insert 
AFTER INSERT ON public.profiles 
FOR EACH ROW 
EXECUTE FUNCTION update_user_scores_on_profile_change();

CREATE TRIGGER trigger_update_user_scores_on_profile_update 
AFTER UPDATE ON public.profiles 
FOR EACH ROW 
WHEN (
  OLD.full_name IS DISTINCT FROM NEW.full_name OR
  OLD.title IS DISTINCT FROM NEW.title OR
  OLD.about IS DISTINCT FROM NEW.about OR
  OLD.profile_picture_url IS DISTINCT FROM NEW.profile_picture_url OR
  OLD.linkedin_url IS DISTINCT FROM NEW.linkedin_url OR
  OLD.location IS DISTINCT FROM NEW.location
)
EXECUTE FUNCTION update_user_scores_on_profile_change();

-- =========================================================================
-- 4. INDEX AUDIT REMEDIATION (Drop redundant duplicate indexes, add missing FK/query indexes)
-- =========================================================================
-- Drop redundant duplicate GIN indexes on jobs (idx_jobs_search_performance is preserved)
DROP INDEX IF EXISTS public.idx_jobs_fulltext;
DROP INDEX IF EXISTS public.idx_jobs_search_vector;
DROP INDEX IF EXISTS public.idx_jobs_search_optimized;

-- Drop redundant b-tree duplicates on jobs
DROP INDEX IF EXISTS public.idx_jobs_seo_slug;
DROP INDEX IF EXISTS public.idx_jobs_seo_company;

-- Drop redundant duplicate index on notifications
DROP INDEX IF EXISTS public.idx_notifications_user_id;

-- Add essential composite index for notifications feed
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON public.notifications (user_id, created_at DESC);

-- Drop duplicate index on job_applications
DROP INDEX IF EXISTS public.idx_job_applications_job_user;

-- Drop duplicate index on posts
DROP INDEX IF EXISTS public.idx_posts_author_created;

-- =========================================================================
-- 5. STREAMLINE REALTIME CDC PUBLICATION (Remove high-churn catalog tables)
-- =========================================================================
ALTER PUBLICATION supabase_realtime DROP TABLE 
  public.jobs,
  public.content_scores,
  public.company_realtime_metrics,
  public.claim1_listings,
  public.txc_transactions,
  public.user_presence,
  public.ai_job_matches,
  public.ai_career_recommendations;

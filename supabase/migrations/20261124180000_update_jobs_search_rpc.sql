-- ============================================================================
-- Migration: 20261124180000_update_jobs_search_rpc.sql
-- Description: Upgrade public.get_jobs_paginated_optimized to support
--              20 Industries, 100 Cities, Fresher, Internship, and Work Modes.
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_jobs_paginated_optimized(integer, integer, text, text, text[], text[], integer, integer, boolean, text[], text);

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
  p_sort_by text DEFAULT 'created_at'::text,
  p_industries text[] DEFAULT '{}'::text[],
  p_cities text[] DEFAULT '{}'::text[],
  p_is_fresher boolean DEFAULT NULL,
  p_is_internship boolean DEFAULT NULL,
  p_work_modes text[] DEFAULT '{}'::text[]
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
      j.location_city,
      j.location_state,
      j.industry,
      j.subindustry,
      j.salary_min,
      j.salary_max,
      j.salary_range,
      j.employment_type,
      j.experience_level,
      j.min_experience,
      j.max_experience,
      j.is_fresher_eligible,
      j.is_internship,
      j.is_paid_internship,
      j.is_apprenticeship,
      j.is_graduate_trainee,
      j.is_part_time,
      j.skills_required,
      j.is_remote,
      j.is_featured,
      j.views_count,
      j.applications_count,
      j.posted_at,
      j.created_at,
      j.expires_at,
      j.external_url,
      j.apply_url,
      j.seo_slug,
      j.company_id,
      j.company_name,
      j.verification_status
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
           (p_location = 'India' AND (j.location ILIKE '%india%' OR j.location_city IS NOT NULL)) OR
           (p_location = 'International' AND j.location NOT ILIKE '%india%') OR
           j.location ILIKE '%' || p_location || '%' OR
           j.location_city ILIKE '%' || p_location || '%')
      AND (array_length(p_employment_types, 1) IS NULL OR j.employment_type = ANY(p_employment_types))
      AND (array_length(p_experience_levels, 1) IS NULL OR j.experience_level = ANY(p_experience_levels))
      AND (NOT p_is_remote OR j.is_remote = true)
      AND (p_min_salary = 0 OR j.salary_min >= p_min_salary OR j.salary_max >= p_min_salary)
      AND (p_max_salary = 0 OR j.salary_max <= p_max_salary OR j.salary_min <= p_max_salary)
      AND (array_length(p_skills, 1) IS NULL OR j.skills_required && p_skills)
      AND (array_length(p_industries, 1) IS NULL OR j.industry = ANY(p_industries))
      AND (array_length(p_cities, 1) IS NULL OR j.location_city = ANY(p_cities) OR j.location ILIKE ANY(ARRAY(SELECT '%' || c || '%' FROM unnest(p_cities) AS c)))
      AND (p_is_fresher IS NULL OR (p_is_fresher = true AND (j.is_fresher_eligible = true OR j.experience_level = 'fresher' OR j.min_experience = 0)))
      AND (p_is_internship IS NULL OR (p_is_internship = true AND (j.is_internship = true OR j.employment_type ILIKE '%intern%')))
      AND (array_length(p_work_modes, 1) IS NULL OR (
        ('remote' = ANY(p_work_modes) AND j.is_remote = true) OR
        ('hybrid' = ANY(p_work_modes) AND (j.location ILIKE '%hybrid%' OR j.job_location_type = 'HYBRID')) OR
        ('onsite' = ANY(p_work_modes) AND j.is_remote = false AND j.location NOT ILIKE '%hybrid%')
      ))
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
      COALESCE(pj.industry, c.industry) AS resolved_industry,
      COALESCE(c.is_verified, pj.verification_status = 'verified', false) AS company_verified_flag
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
            'location_city', ej.location_city,
            'location_state', ej.location_state,
            'industry', ej.industry,
            'subindustry', ej.subindustry,
            'salary_min', ej.salary_min,
            'salary_max', ej.salary_max,
            'salary_range', ej.salary_range,
            'employment_type', ej.employment_type,
            'experience_level', ej.experience_level,
            'min_experience', ej.min_experience,
            'max_experience', ej.max_experience,
            'is_fresher_eligible', ej.is_fresher_eligible,
            'is_internship', ej.is_internship,
            'is_paid_internship', ej.is_paid_internship,
            'is_apprenticeship', ej.is_apprenticeship,
            'is_graduate_trainee', ej.is_graduate_trainee,
            'is_part_time', ej.is_part_time,
            'skills_required', ej.skills_required,
            'is_remote', ej.is_remote,
            'is_featured', ej.is_featured,
            'views_count', ej.views_count,
            'applications_count', ej.applications_count,
            'posted_at', ej.posted_at,
            'created_at', ej.created_at,
            'expires_at', ej.expires_at,
            'external_url', ej.external_url,
            'apply_url', ej.apply_url,
            'seo_slug', ej.seo_slug,
            'company_name', ej.final_company_name,
            'companies', jsonb_build_object(
              'id', ej.company_id,
              'name', ej.final_company_name,
              'logo_url', ej.company_logo,
              'industry', ej.resolved_industry,
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

GRANT EXECUTE ON FUNCTION public.get_jobs_paginated_optimized TO anon, authenticated, service_role;

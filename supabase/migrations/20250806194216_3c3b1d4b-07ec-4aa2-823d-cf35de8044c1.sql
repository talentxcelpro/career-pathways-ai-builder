-- Fix the ambiguous column reference in get_jobs_paginated_optimized function
DROP FUNCTION IF EXISTS get_jobs_paginated_optimized(INTEGER, INTEGER, TEXT, TEXT, TEXT[], TEXT[], INTEGER, INTEGER, BOOLEAN, TEXT[], TEXT);

CREATE OR REPLACE FUNCTION get_jobs_paginated_optimized(
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 20,
  p_search TEXT DEFAULT '',
  p_location TEXT DEFAULT '',
  p_employment_types TEXT[] DEFAULT '{}',
  p_experience_levels TEXT[] DEFAULT '{}',
  p_min_salary INTEGER DEFAULT 0,
  p_max_salary INTEGER DEFAULT 0,
  p_is_remote BOOLEAN DEFAULT false,
  p_skills TEXT[] DEFAULT '{}',
  p_sort_by TEXT DEFAULT 'created_at'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  offset_val INTEGER := (p_page - 1) * p_limit;
  sort_column TEXT := p_sort_by;
BEGIN
  -- Return jobs with filters and pagination
  RETURN QUERY
  WITH filtered_jobs AS (
    SELECT 
      j.*,
      c.name as company_name_from_companies,
      c.logo_url as company_logo,
      c.industry as company_industry,
      c.is_verified as company_verified
    FROM public.jobs j
    LEFT JOIN public.companies c ON j.company_id = c.id
    WHERE 
      j.is_active = true 
      AND j.job_status = 'open'
      AND j.expires_at > NOW()
      -- Search filter (use j.company_name instead of ambiguous company_name)
      AND (p_search = '' OR (
        j.title ILIKE '%' || p_search || '%' OR
        j.description ILIKE '%' || p_search || '%' OR
        j.company_name ILIKE '%' || p_search || '%'
      ))
      -- Location filter
      AND (p_location = '' OR 
           (p_location = 'India' AND j.location ILIKE '%india%') OR
           (p_location = 'International' AND j.location NOT ILIKE '%india%') OR
           j.location ILIKE '%' || p_location || '%')
      -- Employment type filter
      AND (array_length(p_employment_types, 1) IS NULL OR j.employment_type = ANY(p_employment_types))
      -- Experience level filter  
      AND (array_length(p_experience_levels, 1) IS NULL OR j.experience_level = ANY(p_experience_levels))
      -- Remote filter
      AND (NOT p_is_remote OR j.is_remote = true)
      -- Salary filter
      AND (p_min_salary = 0 OR j.salary_min >= p_min_salary OR j.salary_max >= p_min_salary)
      AND (p_max_salary = 0 OR j.salary_max <= p_max_salary OR j.salary_min <= p_max_salary)
      -- Skills filter (simplified for performance)
      AND (array_length(p_skills, 1) IS NULL OR j.skills_required && p_skills)
  ),
  job_count AS (
    SELECT COUNT(*) as total FROM filtered_jobs
  ),
  paginated_jobs AS (
    SELECT fj.*, jc.total
    FROM filtered_jobs fj
    CROSS JOIN job_count jc
    ORDER BY 
      CASE WHEN sort_column = 'salary_max' THEN fj.salary_max END DESC NULLS LAST,
      CASE WHEN sort_column = 'views_count' THEN fj.views_count END DESC NULLS LAST,
      CASE WHEN sort_column = 'applications_count' THEN fj.applications_count END ASC NULLS LAST,
      CASE WHEN sort_column = 'created_at' THEN fj.created_at END DESC
    LIMIT p_limit
    OFFSET offset_val
  )
  SELECT 
    jsonb_build_object(
      'jobs', COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', pj.id,
            'title', pj.title,
            'description', pj.description,
            'location', pj.location,
            'salary_min', pj.salary_min,
            'salary_max', pj.salary_max,
            'salary_range', pj.salary_range,
            'employment_type', pj.employment_type,
            'experience_level', pj.experience_level,
            'skills_required', pj.skills_required,
            'is_remote', pj.is_remote,
            'is_featured', pj.is_featured,
            'views_count', pj.views_count,
            'applications_count', pj.applications_count,
            'posted_at', pj.posted_at,
            'created_at', pj.created_at,
            'expires_at', pj.expires_at,
            'external_url', pj.external_url,
            'seo_slug', pj.seo_slug,
            'company_name', COALESCE(pj.company_name_from_companies, pj.company_name, 'Company'),
            'companies', jsonb_build_object(
              'id', pj.company_id,
              'name', COALESCE(pj.company_name_from_companies, pj.company_name, 'Company'),
              'logo_url', pj.company_logo,
              'industry', pj.company_industry,
              'is_verified', COALESCE(pj.company_verified, false)
            )
          )
        ) FILTER (WHERE pj.id IS NOT NULL),
        '[]'::jsonb
      ),
      'total_count', COALESCE(MAX(pj.total), 0)::INTEGER,
      'has_more', (COALESCE(MAX(pj.total), 0) > (offset_val + p_limit))
    )
  FROM paginated_jobs pj;
END;
$$;
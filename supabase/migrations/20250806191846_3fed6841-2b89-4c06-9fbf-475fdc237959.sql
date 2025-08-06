-- PHASE 1: Database optimization for ultra-fast jobs scaling (Fixed)

-- 1. Create optimized RPC function for paginated jobs with filters
CREATE OR REPLACE FUNCTION get_jobs_paginated_optimized(
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 20,
  p_search TEXT DEFAULT '',
  p_location TEXT DEFAULT '',
  p_employment_types TEXT[] DEFAULT '{}',
  p_experience_levels TEXT[] DEFAULT '{}',
  p_min_salary INTEGER DEFAULT 0,
  p_max_salary INTEGER DEFAULT 0,
  p_is_remote BOOLEAN DEFAULT FALSE,
  p_skills TEXT[] DEFAULT '{}',
  p_sort_by TEXT DEFAULT 'created_at'
)
RETURNS TABLE(
  jobs JSONB,
  total_count INTEGER,
  has_more BOOLEAN
) LANGUAGE plpgsql STABLE AS $$
DECLARE
  offset_val INTEGER;
  sort_column TEXT;
  sort_direction TEXT;
BEGIN
  -- Calculate offset
  offset_val := (p_page - 1) * p_limit;
  
  -- Parse sort parameter
  CASE p_sort_by
    WHEN 'salary_desc' THEN 
      sort_column := 'salary_max';
      sort_direction := 'DESC NULLS LAST';
    WHEN 'views_desc' THEN
      sort_column := 'views_count';
      sort_direction := 'DESC NULLS LAST';
    WHEN 'applications_asc' THEN
      sort_column := 'applications_count';
      sort_direction := 'ASC NULLS LAST';
    ELSE
      sort_column := 'created_at';
      sort_direction := 'DESC';
  END CASE;

  -- Return paginated jobs with optimized query
  RETURN QUERY
  WITH filtered_jobs AS (
    SELECT 
      j.*,
      c.name as company_name,
      c.logo_url as company_logo,
      c.industry as company_industry,
      c.is_verified as company_verified
    FROM public.jobs j
    LEFT JOIN public.companies c ON j.company_id = c.id
    WHERE 
      j.is_active = true 
      AND j.job_status = 'open'
      AND j.expires_at > NOW()
      -- Search filter
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
    COALESCE(
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
          'company', jsonb_build_object(
            'id', pj.company_id,
            'name', COALESCE(pj.company_name, 'Company'),
            'logo_url', pj.company_logo,
            'industry', pj.company_industry,
            'is_verified', COALESCE(pj.company_verified, false)
          )
        )
      ),
      '[]'::jsonb
    ) as jobs,
    COALESCE(MAX(pj.total), 0)::INTEGER as total_count,
    (COALESCE(MAX(pj.total), 0) > (offset_val + p_limit)) as has_more
  FROM paginated_jobs pj;
END;
$$;

-- 2. Create function for job categories with counts
CREATE OR REPLACE FUNCTION get_job_categories_with_counts()
RETURNS TABLE(
  category TEXT,
  job_count INTEGER,
  avg_salary INTEGER
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.role_category as category,
    COUNT(*)::INTEGER as job_count,
    AVG(COALESCE(j.salary_max, j.salary_min, 0))::INTEGER as avg_salary
  FROM public.jobs j
  WHERE 
    j.is_active = true 
    AND j.job_status = 'open'
    AND j.expires_at > NOW()
    AND j.role_category IS NOT NULL
  GROUP BY j.role_category
  HAVING COUNT(*) > 0
  ORDER BY job_count DESC, avg_salary DESC
  LIMIT 20;
END;
$$;

-- 3. Create function for trending job locations
CREATE OR REPLACE FUNCTION get_trending_job_locations()
RETURNS TABLE(
  location TEXT,
  job_count INTEGER,
  growth_rate NUMERIC
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  WITH current_week AS (
    SELECT 
      location,
      COUNT(*) as current_count
    FROM public.jobs
    WHERE 
      is_active = true 
      AND job_status = 'open'
      AND created_at >= NOW() - INTERVAL '7 days'
    GROUP BY location
  ),
  previous_week AS (
    SELECT 
      location,
      COUNT(*) as previous_count
    FROM public.jobs
    WHERE 
      is_active = true
      AND created_at >= NOW() - INTERVAL '14 days'
      AND created_at < NOW() - INTERVAL '7 days'
    GROUP BY location
  )
  SELECT 
    COALESCE(cw.location, pw.location) as location,
    COALESCE(cw.current_count, 0)::INTEGER as job_count,
    CASE 
      WHEN pw.previous_count > 0 
      THEN ((COALESCE(cw.current_count, 0) - pw.previous_count)::NUMERIC / pw.previous_count * 100)
      ELSE 100.0
    END as growth_rate
  FROM current_week cw
  FULL OUTER JOIN previous_week pw ON cw.location = pw.location
  WHERE COALESCE(cw.current_count, 0) > 0
  ORDER BY job_count DESC, growth_rate DESC
  LIMIT 15;
END;
$$;
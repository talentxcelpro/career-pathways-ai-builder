-- Create AI search edge function for intelligent job search
CREATE OR REPLACE FUNCTION public.ai_enhanced_job_search(
  search_query TEXT,
  parsed_filters JSONB DEFAULT '{}'::jsonb,
  page_limit INTEGER DEFAULT 50,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  job_id UUID,
  title TEXT,
  company_name TEXT,
  location TEXT,
  is_remote BOOLEAN,
  salary_min INTEGER,
  salary_max INTEGER,
  employment_type TEXT,
  experience_level TEXT,
  skills_required JSONB,
  description TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  relevance_score NUMERIC,
  company_id UUID,
  company_logo TEXT,
  company_industry TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH job_scores AS (
    SELECT 
      j.id,
      j.title,
      j.company_name,
      j.location,
      j.is_remote,
      j.salary_min,
      j.salary_max,
      j.employment_type,
      j.experience_level,
      j.skills_required,
      j.description,
      j.posted_at,
      c.id as company_id,
      c.logo_url as company_logo,
      c.industry as company_industry,
      -- Calculate relevance score
      (
        -- Title match score
        CASE 
          WHEN j.title ILIKE '%' || search_query || '%' THEN 10
          WHEN j.title ILIKE '%' || split_part(search_query, ' ', 1) || '%' THEN 7
          ELSE 0
        END +
        -- Description match score
        CASE 
          WHEN j.description ILIKE '%' || search_query || '%' THEN 5
          WHEN j.description ILIKE '%' || split_part(search_query, ' ', 1) || '%' THEN 3
          ELSE 0
        END +
        -- Company match score
        CASE 
          WHEN j.company_name ILIKE '%' || search_query || '%' THEN 8
          ELSE 0
        END +
        -- Skills match score
        CASE 
          WHEN j.skills_required::text ILIKE '%' || search_query || '%' THEN 6
          ELSE 0
        END +
        -- Location preference score
        CASE 
          WHEN j.is_remote = true THEN 2
          WHEN j.location ILIKE '%' || COALESCE(parsed_filters->>'location', '') || '%' THEN 3
          ELSE 0
        END +
        -- Recency score
        CASE 
          WHEN j.posted_at > NOW() - INTERVAL '7 days' THEN 5
          WHEN j.posted_at > NOW() - INTERVAL '30 days' THEN 3
          WHEN j.posted_at > NOW() - INTERVAL '90 days' THEN 1
          ELSE 0
        END
      ) as score
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    WHERE j.is_active = true 
      AND j.job_status = 'open'
      AND (
        search_query = '' OR
        j.title ILIKE '%' || search_query || '%' OR
        j.description ILIKE '%' || search_query || '%' OR
        j.company_name ILIKE '%' || search_query || '%' OR
        j.location ILIKE '%' || search_query || '%' OR
        j.skills_required::text ILIKE '%' || search_query || '%'
      )
      -- Apply parsed filters
      AND (
        (parsed_filters->>'remote')::boolean IS NULL OR 
        j.is_remote = (parsed_filters->>'remote')::boolean
      )
      AND (
        (parsed_filters->>'location') IS NULL OR 
        j.location ILIKE '%' || (parsed_filters->>'location') || '%'
      )
      AND (
        (parsed_filters->>'employment_type') IS NULL OR 
        j.employment_type = ANY(string_to_array(parsed_filters->>'employment_type', ','))
      )
      AND (
        (parsed_filters->>'experience_level') IS NULL OR 
        j.experience_level = ANY(string_to_array(parsed_filters->>'experience_level', ','))
      )
  )
  SELECT 
    job_scores.id,
    job_scores.title,
    job_scores.company_name,
    job_scores.location,
    job_scores.is_remote,
    job_scores.salary_min,
    job_scores.salary_max,
    job_scores.employment_type,
    job_scores.experience_level,
    job_scores.skills_required,
    job_scores.description,
    job_scores.posted_at,
    job_scores.score,
    job_scores.company_id,
    job_scores.company_logo,
    job_scores.company_industry
  FROM job_scores
  WHERE job_scores.score > 0
  ORDER BY job_scores.score DESC, job_scores.posted_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;
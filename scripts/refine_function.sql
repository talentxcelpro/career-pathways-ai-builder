DROP FUNCTION IF EXISTS public.get_distribution_eligible_jobs(text,integer,uuid[]);
DROP FUNCTION IF EXISTS public.get_distribution_eligible_jobs(text,integer);
DROP FUNCTION IF EXISTS public.get_distribution_eligible_jobs(text);

CREATE OR REPLACE FUNCTION public.get_distribution_eligible_jobs(
    p_category TEXT,
    p_limit INTEGER DEFAULT 5,
    p_exclude_ids UUID[] DEFAULT '{}'::uuid[]
)
RETURNS TABLE (
    id UUID,
    job_title TEXT,
    company_name TEXT,
    location TEXT,
    location_city TEXT,
    location_state TEXT,
    experience_level TEXT,
    salary_range TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    external_url TEXT,
    seo_slug TEXT,
    is_remote BOOLEAN,
    is_government_job BOOLEAN,
    posted_at TIMESTAMPTZ,
    match_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH eligible AS (
        SELECT 
            j.id,
            trim(j.title) AS effective_title,
            j.company_name,
            j.location,
            j.location_city,
            j.location_state,
            j.experience_level,
            j.salary_range,
            j.salary_min::INTEGER AS effective_salary_min,
            j.salary_max::INTEGER AS effective_salary_max,
            COALESCE(NULLIF(trim(j.apply_url), ''), NULLIF(trim(j.external_url), '')) AS effective_apply_url,
            COALESCE(NULLIF(trim(j.seo_slug), ''), NULLIF(trim(j.slug), '')) AS effective_seo_slug,
            COALESCE(j.is_remote, false) AS effective_is_remote,
            COALESCE(j.is_government_job, false) AS effective_is_government_job,
            j.posted_at,
            (
                CASE 
                    WHEN j.created_at >= (now() - INTERVAL '7 days') THEN 30
                    WHEN j.created_at >= (now() - INTERVAL '30 days') THEN 15
                    ELSE 5
                END +
                CASE 
                    WHEN j.salary_min > 0 AND j.salary_max > 0 THEN 20
                    ELSE 10
                END +
                CASE 
                    WHEN COALESCE(j.apply_url, j.external_url) IS NOT NULL AND length(trim(COALESCE(j.apply_url, j.external_url))) > 5 THEN 20
                    ELSE 5
                END +
                CASE 
                    WHEN p_category = 'fresher_entry' AND (lower(COALESCE(j.experience_level, '')) LIKE '%fresher%' OR lower(COALESCE(j.title, '')) LIKE '%fresher%' OR lower(COALESCE(j.title, '')) LIKE '%intern%' OR lower(COALESCE(j.title, '')) LIKE '%junior%' OR lower(COALESCE(j.title, '')) LIKE '%trainee%') THEN 35
                    WHEN p_category = 'remote_executive' AND (j.is_remote = true OR lower(COALESCE(j.location, '')) LIKE '%remote%') THEN 25
                    WHEN p_category = 'tech_high_growth' AND (lower(COALESCE(j.title, '')) LIKE '%engineer%' OR lower(COALESCE(j.title, '')) LIKE '%developer%' OR lower(COALESCE(j.title, '')) LIKE '%software%' OR lower(COALESCE(j.title, '')) LIKE '%tech%' OR lower(COALESCE(j.title, '')) LIKE '%product%') THEN 25
                    WHEN p_category = 'city_spotlight' AND j.location_city IS NOT NULL THEN 25
                    WHEN p_category = 'govt_psu' AND (j.is_government_job = true OR lower(j.company_name) LIKE '%ministry%' OR lower(j.company_name) LIKE '%govt%' OR lower(j.company_name) LIKE '%psu%') THEN 40
                    ELSE 10
                END +
                CASE WHEN j.is_remote = true THEN 10 ELSE 0 END
            )::INTEGER AS computed_match_score
        FROM public.jobs j
        WHERE j.is_active = true
          AND (j.job_status = 'open' OR j.job_status IS NULL)
          AND (j.expires_at > now() OR j.expires_at IS NULL)
          AND j.company_name IS NOT NULL
          AND length(trim(COALESCE(j.title, ''))) > 2
          AND j.id != ALL(p_exclude_ids)
          AND NOT EXISTS (
              SELECT 1 FROM public.distribution_deduplication d 
              WHERE d.job_id = j.id AND d.cooldown_until > now()
          )
          AND (
              CASE
                  WHEN p_category = 'fresher_entry' THEN
                      (
                          (
                              lower(COALESCE(j.experience_level, '')) LIKE '%fresher%'
                              OR lower(COALESCE(j.experience_level, '')) LIKE '%entry%'
                              OR lower(COALESCE(j.title, '')) LIKE '%fresher%'
                              OR lower(COALESCE(j.title, '')) LIKE '%intern%'
                              OR lower(COALESCE(j.title, '')) LIKE '%graduate%'
                              OR lower(COALESCE(j.title, '')) LIKE '%trainee%'
                              OR lower(COALESCE(j.title, '')) LIKE '%junior%'
                              OR (j.min_experience = 0 AND j.max_experience <= 2)
                          )
                          AND lower(COALESCE(j.title, '')) NOT LIKE '%senior%'
                          AND lower(COALESCE(j.title, '')) NOT LIKE '%lead%'
                          AND lower(COALESCE(j.title, '')) NOT LIKE '%manager%'
                          AND lower(COALESCE(j.title, '')) NOT LIKE '%director%'
                          AND lower(COALESCE(j.title, '')) NOT LIKE '%principal%'
                          AND lower(COALESCE(j.title, '')) NOT LIKE '%architect%'
                      )
                  WHEN p_category = 'remote_executive' THEN
                      (j.is_remote = true OR lower(COALESCE(j.location, '')) LIKE '%remote%')
                  WHEN p_category = 'tech_high_growth' THEN
                      (lower(COALESCE(j.title, '')) LIKE '%engineer%' OR lower(COALESCE(j.title, '')) LIKE '%developer%' OR lower(COALESCE(j.title, '')) LIKE '%software%' OR lower(COALESCE(j.title, '')) LIKE '%tech%' OR lower(COALESCE(j.title, '')) LIKE '%product%')
                  WHEN p_category = 'non_it_business' THEN
                      (lower(COALESCE(j.title, '')) NOT LIKE '%developer%' AND lower(COALESCE(j.title, '')) NOT LIKE '%software%' AND lower(COALESCE(j.title, '')) NOT LIKE '%backend%' AND lower(COALESCE(j.title, '')) NOT LIKE '%frontend%')
                  WHEN p_category = 'govt_psu' THEN
                      (j.is_government_job = true OR lower(j.company_name) LIKE '%ministry%' OR lower(j.company_name) LIKE '%govt%' OR lower(j.company_name) LIKE '%upsc%' OR lower(j.company_name) LIKE '%ssc%' OR lower(j.company_name) LIKE '%psu%')
                  ELSE true
              END
          )
    )
    SELECT 
        e.id,
        e.effective_title AS job_title,
        e.company_name,
        e.location,
        e.location_city,
        e.location_state,
        e.experience_level,
        e.salary_range,
        e.effective_salary_min AS salary_min,
        e.effective_salary_max AS salary_max,
        e.effective_apply_url AS external_url,
        e.effective_seo_slug AS seo_slug,
        e.effective_is_remote AS is_remote,
        e.effective_is_government_job AS is_government_job,
        e.posted_at,
        e.computed_match_score AS match_score
    FROM eligible e
    ORDER BY e.computed_match_score DESC, e.posted_at DESC NULLS LAST
    LIMIT p_limit;
END;
$$;

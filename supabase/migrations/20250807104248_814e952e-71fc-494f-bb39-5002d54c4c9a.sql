-- Drop the existing function and recreate it with proper parameter naming
DROP FUNCTION create_seo_pages_for_job(uuid);

-- Recreate the function with proper parameter naming to avoid job_id ambiguity
CREATE OR REPLACE FUNCTION create_seo_pages_for_job(p_job_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_record jobs%ROWTYPE;
  base_url text := 'https://talentxcel.in';
BEGIN
  -- Get job details
  SELECT * INTO job_record FROM jobs WHERE id = p_job_id;
  
  IF job_record.id IS NULL THEN
    RETURN;
  END IF;
  
  -- Main job page
  INSERT INTO seo_job_pages (job_id, page_type, page_slug, page_url, meta_title, meta_description, structured_data)
  VALUES (
    p_job_id,
    'main',
    job_record.seo_slug,
    base_url || '/jobs/' || job_record.seo_slug,
    job_record.meta_title,
    job_record.meta_description,
    job_record.structured_data
  ) ON CONFLICT (job_id, page_type) DO UPDATE SET
    page_slug = EXCLUDED.page_slug,
    page_url = EXCLUDED.page_url,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    structured_data = EXCLUDED.structured_data;
  
  -- Location-based SEO page
  IF job_record.location IS NOT NULL THEN
    INSERT INTO seo_job_pages (job_id, page_type, page_slug, page_url, meta_title, meta_description)
    VALUES (
      p_job_id,
      'location',
      'jobs-in-' || LOWER(REPLACE(job_record.location, ' ', '-')),
      base_url || '/jobs/location/' || LOWER(REPLACE(job_record.location, ' ', '-')),
      'Jobs in ' || job_record.location || ' | TalentXcel',
      'Find the best job opportunities in ' || job_record.location || '. Browse verified jobs across various industries.'
    ) ON CONFLICT (job_id, page_type) DO NOTHING;
  END IF;
  
  -- Role-based SEO page
  INSERT INTO seo_job_pages (job_id, page_type, page_slug, page_url, meta_title, meta_description)
  VALUES (
    p_job_id,
    'role',
    LOWER(REPLACE(job_record.title, ' ', '-')) || '-jobs',
    base_url || '/jobs/role/' || LOWER(REPLACE(job_record.title, ' ', '-')),
    job_record.title || ' Jobs | TalentXcel',
    'Explore ' || job_record.title || ' job opportunities. Find verified ' || job_record.title || ' positions with top companies.'
  ) ON CONFLICT (job_id, page_type) DO NOTHING;
  
  -- Company-based SEO page
  IF job_record.company_name IS NOT NULL THEN
    INSERT INTO seo_job_pages (job_id, page_type, page_slug, page_url, meta_title, meta_description)
    VALUES (
      p_job_id,
      'company',
      LOWER(REPLACE(job_record.company_name, ' ', '-')) || '-jobs',
      base_url || '/companies/' || LOWER(REPLACE(job_record.company_name, ' ', '-')),
      'Jobs at ' || job_record.company_name || ' | TalentXcel',
      'Explore career opportunities at ' || job_record.company_name || '. Apply for latest job openings.'
    ) ON CONFLICT (job_id, page_type) DO NOTHING;
  END IF;
  
  -- Industry-based SEO page
  IF job_record.industry_domain IS NOT NULL THEN
    INSERT INTO seo_job_pages (job_id, page_type, page_slug, page_url, meta_title, meta_description)
    VALUES (
      p_job_id,
      'industry',
      LOWER(REPLACE(job_record.industry_domain, ' ', '-')) || '-jobs',
      base_url || '/jobs/industry/' || LOWER(REPLACE(job_record.industry_domain, ' ', '-')),
      job_record.industry_domain || ' Jobs | TalentXcel',
      'Find the best ' || job_record.industry_domain || ' job opportunities. Browse verified positions in ' || job_record.industry_domain || ' industry.'
    ) ON CONFLICT (job_id, page_type) DO NOTHING;
  END IF;
END;
$$;
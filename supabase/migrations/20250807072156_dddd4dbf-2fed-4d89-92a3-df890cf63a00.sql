-- Create SEO functions and triggers
CREATE OR REPLACE FUNCTION generate_job_seo_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate SEO slug if not provided
  IF NEW.seo_slug IS NULL OR NEW.seo_slug = '' THEN
    NEW.seo_slug := public.generate_job_seo_slug_v2(NEW.title, NEW.company_name, NEW.location);
  END IF;
  
  -- Generate meta title if not provided
  IF NEW.meta_title IS NULL OR NEW.meta_title = '' THEN
    NEW.meta_title := NEW.title || ' at ' || COALESCE(NEW.company_name, 'Company') || ' | TalentXcel Jobs';
    IF LENGTH(NEW.meta_title) > 60 THEN
      NEW.meta_title := NEW.title || ' | TalentXcel Jobs';
    END IF;
  END IF;
  
  -- Generate meta description if not provided
  IF NEW.meta_description IS NULL OR NEW.meta_description = '' THEN
    NEW.meta_description := 'Apply for ' || NEW.title || ' position at ' || COALESCE(NEW.company_name, 'Company') || 
                            ' in ' || COALESCE(NEW.location, 'India') || '. Join TalentXcel to advance your career!';
    IF LENGTH(NEW.meta_description) > 160 THEN
      NEW.meta_description := NEW.title || ' job at ' || COALESCE(NEW.company_name, 'Company') || '. Apply now on TalentXcel!';
    END IF;
  END IF;
  
  -- Generate SEO tags if not provided
  IF NEW.seo_tags IS NULL OR array_length(NEW.seo_tags, 1) IS NULL THEN
    NEW.seo_tags := ARRAY[
      LOWER(NEW.title),
      LOWER(NEW.title) || '-jobs',
      'jobs-in-' || LOWER(COALESCE(NEW.location, 'india')),
      LOWER(COALESCE(NEW.company_name, 'company')) || '-jobs',
      'career-opportunities'
    ];
  END IF;
  
  -- Generate employment type schema for Google
  IF NEW.employment_type_schema IS NULL OR NEW.employment_type_schema = '' THEN
    NEW.employment_type_schema := CASE 
      WHEN NEW.employment_type ILIKE '%full%time%' THEN 'FULL_TIME'
      WHEN NEW.employment_type ILIKE '%part%time%' THEN 'PART_TIME'
      WHEN NEW.employment_type ILIKE '%contract%' THEN 'CONTRACTOR'
      WHEN NEW.employment_type ILIKE '%intern%' THEN 'INTERN'
      ELSE 'FULL_TIME'
    END;
  END IF;
  
  -- Generate identifier value
  IF NEW.identifier_value IS NULL OR NEW.identifier_value = '' THEN
    NEW.identifier_value := 'TXL-' || SUBSTRING(NEW.id::text, 1, 8);
  END IF;
  
  -- Generate structured data for Google Jobs schema
  NEW.structured_data := jsonb_build_object(
    '@context', 'https://schema.org/',
    '@type', 'JobPosting',
    'title', NEW.title,
    'description', COALESCE(NEW.description, NEW.title || ' position at ' || COALESCE(NEW.company_name, 'Company')),
    'identifier', jsonb_build_object(
      '@type', 'PropertyValue',
      'name', 'TalentXcel',
      'value', NEW.identifier_value
    ),
    'datePosted', NEW.created_at,
    'validThrough', NEW.expires_at,
    'employmentType', NEW.employment_type_schema,
    'hiringOrganization', jsonb_build_object(
      '@type', 'Organization',
      'name', COALESCE(NEW.company_name, 'Company'),
      'sameAs', NEW.external_url
    ),
    'jobLocation', jsonb_build_object(
      '@type', 'Place',
      'address', jsonb_build_object(
        '@type', 'PostalAddress',
        'addressLocality', COALESCE(NEW.location, 'India'),
        'addressCountry', 'IN'
      )
    ),
    'baseSalary', CASE 
      WHEN NEW.salary_min IS NOT NULL OR NEW.salary_max IS NOT NULL THEN
        jsonb_build_object(
          '@type', 'MonetaryAmount',
          'currency', COALESCE(NEW.salary_currency, 'INR'),
          'value', jsonb_build_object(
            '@type', 'QuantitativeValue',
            'value', COALESCE(NEW.salary_min, NEW.salary_max, 0),
            'unitText', 'YEAR'
          )
        )
      ELSE NULL
    END,
    'applicantLocationRequirements', jsonb_build_object(
      '@type', 'Country',
      'name', 'India'
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating SEO data
DROP TRIGGER IF EXISTS generate_job_seo_data_trigger ON jobs;
CREATE TRIGGER generate_job_seo_data_trigger
  BEFORE INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION generate_job_seo_data();

-- Function to create SEO pages for a job
CREATE OR REPLACE FUNCTION create_seo_pages_for_job(job_id uuid)
RETURNS void AS $$
DECLARE
  job_record jobs%ROWTYPE;
  base_url text := 'https://talentxcel.in';
BEGIN
  -- Get job details
  SELECT * INTO job_record FROM jobs WHERE id = job_id;
  
  IF job_record.id IS NULL THEN
    RETURN;
  END IF;
  
  -- Main job page
  INSERT INTO seo_job_pages (job_id, page_type, page_slug, page_url, meta_title, meta_description, structured_data)
  VALUES (
    job_id,
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
      job_id,
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
    job_id,
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
      job_id,
      'company',
      LOWER(REPLACE(job_record.company_name, ' ', '-')) || '-jobs',
      base_url || '/companies/' || LOWER(REPLACE(job_record.company_name, ' ', '-')),
      'Jobs at ' || job_record.company_name || ' | TalentXcel',
      'Explore career opportunities at ' || job_record.company_name || '. Apply for latest job openings.'
    ) ON CONFLICT (job_id, page_type) DO NOTHING;
  END IF;
  
  -- Industry-based SEO page
  IF job_record.industry IS NOT NULL THEN
    INSERT INTO seo_job_pages (job_id, page_type, page_slug, page_url, meta_title, meta_description)
    VALUES (
      job_id,
      'industry',
      LOWER(REPLACE(job_record.industry, ' ', '-')) || '-jobs',
      base_url || '/jobs/industry/' || LOWER(REPLACE(job_record.industry, ' ', '-')),
      job_record.industry || ' Jobs | TalentXcel',
      'Find the best ' || job_record.industry || ' job opportunities. Browse verified positions in ' || job_record.industry || ' industry.'
    ) ON CONFLICT (job_id, page_type) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create SEO pages
CREATE OR REPLACE FUNCTION trigger_create_seo_pages()
RETURNS TRIGGER AS $$
BEGIN
  -- Create SEO pages for new job
  PERFORM create_seo_pages_for_job(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_seo_pages_trigger ON jobs;
CREATE TRIGGER create_seo_pages_trigger
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_seo_pages();

-- Update existing jobs to generate SEO data
UPDATE jobs SET title = title WHERE id IN (SELECT id FROM jobs LIMIT 5);

-- Success message
SELECT 'SEO functions and triggers created successfully! Jobs now auto-generate 5-10 SEO pages each!' as result;
-- Enhance jobs table for full SEO & Google Jobs compatibility
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS salary_unit TEXT DEFAULT 'YEAR',
ADD COLUMN IF NOT EXISTS job_benefits TEXT,
ADD COLUMN IF NOT EXISTS qualifications TEXT,
ADD COLUMN IF NOT EXISTS education_requirements TEXT,
ADD COLUMN IF NOT EXISTS experience_requirements TEXT,
ADD COLUMN IF NOT EXISTS job_location_type TEXT DEFAULT 'TELECOMMUTE',
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS applicant_location_requirements TEXT DEFAULT 'India',
ADD COLUMN IF NOT EXISTS base_salary_currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS organization_logo_url TEXT,
ADD COLUMN IF NOT EXISTS organization_website TEXT;

-- Add indexes for better performance on SEO-related queries
CREATE INDEX IF NOT EXISTS idx_jobs_seo_slug ON jobs(seo_slug);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_company_name ON jobs(company_name);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON jobs(expires_at);
CREATE INDEX IF NOT EXISTS idx_jobs_status_active ON jobs(job_status, is_active);

-- Enhanced SEO slug generation function
CREATE OR REPLACE FUNCTION generate_enhanced_seo_slug(
  job_title TEXT,
  company_name TEXT,
  location TEXT,
  job_id UUID
) RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Create comprehensive slug: title-at-company-in-location
  base_slug := LOWER(
    TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          job_title || '-at-' || company_name || '-in-' || COALESCE(location, 'india'),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-'
    )
  );
  
  -- Add job ID suffix for uniqueness
  final_slug := base_slug || '-' || SUBSTRING(job_id::TEXT, 1, 8);
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM jobs WHERE seo_slug = final_slug AND id != job_id) LOOP
    final_slug := base_slug || '-' || SUBSTRING(job_id::TEXT, 1, 8) || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  -- Limit to 100 characters for SEO best practices
  RETURN SUBSTRING(final_slug, 1, 100);
END;
$$ LANGUAGE plpgsql;

-- Update trigger for enhanced SEO slug generation
CREATE OR REPLACE FUNCTION auto_generate_enhanced_seo_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate slug if not provided
  IF NEW.seo_slug IS NULL OR NEW.seo_slug = '' THEN
    NEW.seo_slug := generate_enhanced_seo_slug(
      NEW.title, 
      NEW.company_name, 
      NEW.location, 
      NEW.id
    );
  END IF;
  
  -- Auto-generate meta title for SEO
  IF NEW.meta_title IS NULL OR NEW.meta_title = '' THEN
    NEW.meta_title := NEW.title || ' at ' || COALESCE(NEW.company_name, 'Company') || ' | TalentXcel Jobs';
    -- Keep under 60 characters
    IF LENGTH(NEW.meta_title) > 60 THEN
      NEW.meta_title := NEW.title || ' | TalentXcel Jobs';
    END IF;
  END IF;
  
  -- Auto-generate meta description
  IF NEW.meta_description IS NULL OR NEW.meta_description = '' THEN
    NEW.meta_description := 'Apply for ' || NEW.title || ' position at ' || 
                            COALESCE(NEW.company_name, 'Company') || ' in ' || 
                            COALESCE(NEW.location, 'India') || '. Salary: ' ||
                            CASE 
                              WHEN NEW.salary_min IS NOT NULL AND NEW.salary_max IS NOT NULL 
                              THEN NEW.salary_min || '-' || NEW.salary_max || ' ' || COALESCE(NEW.salary_currency, 'INR')
                              ELSE 'Competitive'
                            END || '. Apply now on TalentXcel!';
    -- Keep under 160 characters
    IF LENGTH(NEW.meta_description) > 160 THEN
      NEW.meta_description := NEW.title || ' job at ' || COALESCE(NEW.company_name, 'Company') || 
                               ' in ' || COALESCE(NEW.location, 'India') || '. Apply now!';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace existing trigger with enhanced version
DROP TRIGGER IF EXISTS auto_generate_job_seo_slug_trigger ON jobs;
CREATE TRIGGER auto_generate_enhanced_seo_slug_trigger
  BEFORE INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_enhanced_seo_slug();

-- Function to generate comprehensive structured data
CREATE OR REPLACE FUNCTION generate_job_structured_data(job_record jobs)
RETURNS JSONB AS $$
DECLARE
  structured_data JSONB;
BEGIN
  structured_data := jsonb_build_object(
    '@context', 'https://schema.org/',
    '@type', 'JobPosting',
    'title', job_record.title,
    'description', job_record.description,
    'identifier', jsonb_build_object(
      '@type', 'PropertyValue',
      'name', COALESCE(job_record.company_name, 'TalentXcel'),
      'value', 'TXL-' || SUBSTRING(job_record.id::TEXT, 1, 8)
    ),
    'datePosted', job_record.posted_at,
    'validThrough', job_record.expires_at,
    'employmentType', CASE 
      WHEN job_record.employment_type ILIKE '%full%' THEN 'FULL_TIME'
      WHEN job_record.employment_type ILIKE '%part%' THEN 'PART_TIME'
      WHEN job_record.employment_type ILIKE '%contract%' THEN 'CONTRACTOR'
      WHEN job_record.employment_type ILIKE '%intern%' THEN 'INTERN'
      ELSE 'FULL_TIME'
    END,
    'hiringOrganization', jsonb_build_object(
      '@type', 'Organization',
      'name', COALESCE(job_record.company_name, 'Company'),
      'sameAs', COALESCE(job_record.organization_website, job_record.external_url),
      'logo', job_record.organization_logo_url
    ),
    'jobLocation', jsonb_build_object(
      '@type', 'Place',
      'address', jsonb_build_object(
        '@type', 'PostalAddress',
        'addressLocality', job_record.location,
        'addressCountry', 'IN'
      )
    ),
    'applicantLocationRequirements', jsonb_build_object(
      '@type', 'Country',
      'name', COALESCE(job_record.applicant_location_requirements, 'India')
    )
  );
  
  -- Add salary information if available
  IF job_record.salary_min IS NOT NULL OR job_record.salary_max IS NOT NULL THEN
    structured_data := structured_data || jsonb_build_object(
      'baseSalary', jsonb_build_object(
        '@type', 'MonetaryAmount',
        'currency', COALESCE(job_record.salary_currency, 'INR'),
        'value', jsonb_build_object(
          '@type', 'QuantitativeValue',
          'minValue', job_record.salary_min,
          'maxValue', job_record.salary_max,
          'unitText', COALESCE(job_record.salary_unit, 'YEAR')
        )
      )
    );
  END IF;
  
  -- Add remote work information
  IF job_record.is_remote = true THEN
    structured_data := structured_data || jsonb_build_object(
      'jobLocationType', 'TELECOMMUTE'
    );
  END IF;
  
  -- Add qualifications if available
  IF job_record.qualifications IS NOT NULL THEN
    structured_data := structured_data || jsonb_build_object(
      'qualifications', job_record.qualifications
    );
  END IF;
  
  -- Add education requirements if available
  IF job_record.education_requirements IS NOT NULL THEN
    structured_data := structured_data || jsonb_build_object(
      'educationRequirements', job_record.education_requirements
    );
  END IF;
  
  -- Add experience requirements if available
  IF job_record.experience_requirements IS NOT NULL THEN
    structured_data := structured_data || jsonb_build_object(
      'experienceRequirements', job_record.experience_requirements
    );
  END IF;
  
  -- Add benefits if available
  IF job_record.job_benefits IS NOT NULL THEN
    structured_data := structured_data || jsonb_build_object(
      'jobBenefits', job_record.job_benefits
    );
  END IF;
  
  -- Add industry if available
  IF job_record.industry IS NOT NULL THEN
    structured_data := structured_data || jsonb_build_object(
      'industry', job_record.industry
    );
  END IF;
  
  RETURN structured_data;
END;
$$ LANGUAGE plpgsql;

-- Update existing jobs with enhanced SEO data
UPDATE jobs 
SET seo_slug = generate_enhanced_seo_slug(title, company_name, location, id)
WHERE seo_slug IS NULL OR seo_slug = '';

-- Add some sample enhanced data for testing
UPDATE jobs 
SET 
  salary_currency = COALESCE(salary_currency, 'INR'),
  salary_unit = COALESCE(salary_unit, 'YEAR'),
  applicant_location_requirements = COALESCE(applicant_location_requirements, 'India'),
  job_location_type = CASE WHEN is_remote = true THEN 'TELECOMMUTE' ELSE 'ONSITE' END
WHERE salary_currency IS NULL OR salary_unit IS NULL;
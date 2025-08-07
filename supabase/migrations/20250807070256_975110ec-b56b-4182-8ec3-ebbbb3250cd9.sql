-- Phase 2: Enhanced Job Schema & Bulk Upload System
-- First, clear existing jobs and enhance the schema with SEO and bulk upload features

-- Step 1: Backup existing jobs data if needed (commented for safety)
-- CREATE TABLE jobs_backup AS SELECT * FROM jobs;

-- Step 2: Remove existing jobs (as requested by user)
DELETE FROM jobs;

-- Step 3: Enhance jobs table with SEO and bulk upload fields
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS seo_tags text[],
ADD COLUMN IF NOT EXISTS priority boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS posted_by_role text,
ADD COLUMN IF NOT EXISTS employment_type_schema text,
ADD COLUMN IF NOT EXISTS identifier_value text,
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS company_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS application_email text,
ADD COLUMN IF NOT EXISTS bulk_upload_batch_id uuid,
ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS structured_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS canonical_url text;

-- Step 4: Create index for SEO and performance
CREATE INDEX IF NOT EXISTS idx_jobs_seo_tags ON jobs USING GIN(seo_tags);
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs(industry);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_bulk_batch ON jobs(bulk_upload_batch_id);
CREATE INDEX IF NOT EXISTS idx_jobs_source_type ON jobs(source_type);

-- Step 5: Create bulk upload batches table
CREATE TABLE IF NOT EXISTS bulk_upload_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by uuid REFERENCES auth.users(id),
  batch_name text NOT NULL,
  total_jobs integer DEFAULT 0,
  processed_jobs integer DEFAULT 0,
  failed_jobs integer DEFAULT 0,
  status text DEFAULT 'processing',
  upload_data jsonb DEFAULT '{}',
  error_log jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- RLS for bulk upload batches
ALTER TABLE bulk_upload_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bulk uploads" ON bulk_upload_batches
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'staffing_partner') 
      AND is_active = true
    )
  );

-- Step 6: Create SEO pages tracking table
CREATE TABLE IF NOT EXISTS seo_job_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  page_type text NOT NULL, -- 'main', 'location', 'role', 'company', 'category'
  page_slug text NOT NULL,
  page_url text NOT NULL,
  meta_title text,
  meta_description text,
  structured_data jsonb DEFAULT '{}',
  is_indexed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(job_id, page_type)
);

-- Index for SEO pages
CREATE INDEX IF NOT EXISTS idx_seo_pages_slug ON seo_job_pages(page_slug);
CREATE INDEX IF NOT EXISTS idx_seo_pages_type ON seo_job_pages(page_type);
CREATE INDEX IF NOT EXISTS idx_seo_pages_indexed ON seo_job_pages(is_indexed);

-- RLS for SEO pages
ALTER TABLE seo_job_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view SEO pages" ON seo_job_pages
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage SEO pages" ON seo_job_pages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

-- Step 7: Create function to auto-generate SEO data
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

-- Step 8: Function to create SEO pages for a job
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

-- Step 9: Trigger to auto-create SEO pages
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

-- Step 10: Update user roles for bulk upload access
UPDATE user_roles SET role = 'staffing_partner' 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email LIKE '%partner%' OR email LIKE '%staffing%'
) AND role = 'user';

-- Insert some sample job data to test the enhanced system
INSERT INTO jobs (
  title, company_name, location, employment_type, industry, 
  description, salary_min, salary_max, priority, posted_by_role,
  source_type, is_active, job_status, expires_at
) VALUES 
(
  'Senior Frontend Developer',
  'TechCorp India',
  'Mumbai',
  'Full-time',
  'Information Technology',
  'We are looking for an experienced frontend developer to join our team. You will be responsible for building modern web applications using React, TypeScript, and other cutting-edge technologies.',
  800000,
  1200000,
  true,
  'admin',
  'manual',
  true,
  'open',
  NOW() + INTERVAL '30 days'
),
(
  'Digital Marketing Specialist',
  'Marketing Pro Solutions',
  'Bangalore',
  'Full-time',
  'Marketing',
  'Join our dynamic marketing team to drive digital growth initiatives. Experience with SEO, SEM, and social media marketing required.',
  500000,
  700000,
  false,
  'admin',
  'manual',
  true,
  'open',
  NOW() + INTERVAL '30 days'
),
(
  'Data Analyst',
  'Analytics Plus',
  'Delhi',
  'Full-time',
  'Data Science',
  'Analyze complex datasets to derive business insights. Strong SQL and Python skills required.',
  600000,
  900000,
  false,
  'admin',
  'manual',
  true,
  'open',
  NOW() + INTERVAL '30 days'
);

-- Success message
SELECT 'Enhanced job posting system implemented successfully!' as result;
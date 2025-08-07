-- Fix the enum issue and create the enhanced job system
-- Step 1: Add staffing_partner to the app_role enum
ALTER TYPE app_role ADD VALUE 'staffing_partner';

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

-- Step 4: Create indexes for SEO and performance
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
  page_type text NOT NULL, -- 'main', 'location', 'role', 'company', 'industry'
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

-- Insert sample jobs to test the enhanced system
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
SELECT 'Enhanced job posting system with SEO and bulk upload capabilities created successfully!' as result;
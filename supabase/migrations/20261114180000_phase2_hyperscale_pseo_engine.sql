-- supabase/migrations/20261114180000_phase2_hyperscale_pseo_engine.sql
-- Phase 2: Hyper-Scale pSEO Engine & Automated Multi-ATS Ingestion Architecture
-- Includes: canonical taxonomies, multi-ATS ingestion queue, indexing outbox,
-- stateful hysteresis hub state, materialized view, and Stage 0 cleanup.

BEGIN;

-- 1. Canonical Cities Taxonomy Table
CREATE TABLE IF NOT EXISTS public.canonical_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  state text NOT NULL,
  tier int NOT NULL CHECK (tier IN (1, 2, 3, 4)),
  country_code text NOT NULL DEFAULT 'IN',
  latitude double precision,
  longitude double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Canonical Roles Taxonomy Table
CREATE TABLE IF NOT EXISTS public.canonical_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  is_fresher_eligible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. External ATS Sources Configuration Table
CREATE TABLE IF NOT EXISTS public.external_ats_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider IN ('greenhouse','lever','workday','darwinbox','keka','psu_feed','partner_xml')),
  company_name text NOT NULL,
  board_token text,
  base_url text,
  access_basis text NOT NULL CHECK (access_basis IN ('employer_authorized','public_api_terms_reviewed','government_public_notice','partner_agreement')),
  crawl_interval interval NOT NULL DEFAULT '6 hours',
  last_success_at timestamptz,
  last_status text,
  consecutive_failures int NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, board_token)
);

-- 4. Ingestion Staging & Quarantine Queue Table
CREATE TABLE IF NOT EXISTS public.job_ingestion_queue (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_id uuid NOT NULL REFERENCES public.external_ats_sources(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  payload jsonb NOT NULL,
  payload_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','accepted','quarantined','duplicate','failed')),
  attempts int NOT NULL DEFAULT 0,
  locked_at timestamptz,
  locked_by text,
  reject_reasons text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_ingest_pending ON public.job_ingestion_queue (id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_job_ingest_hash ON public.job_ingestion_queue (source_id, external_id, payload_hash);

-- 5. Google Indexing API Dispatcher Outbox Table
CREATE TABLE IF NOT EXISTS public.indexing_outbox (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  url text NOT NULL,
  action text NOT NULL CHECK (action IN ('URL_UPDATED', 'URL_DELETED')),
  priority int NOT NULL DEFAULT 5,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'dispatched', 'failed', 'dropped')),
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  dispatched_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_indexing_outbox_queue ON public.indexing_outbox (priority, scheduled_at) WHERE status = 'queued';

-- 6. Stateful Hysteresis & Overlap Tracking Table (Refinement 1)
CREATE TABLE IF NOT EXISTS public.seo_hub_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_type text NOT NULL CHECK (hub_type IN ('city', 'role_city', 'fresher_role_city', 'company_city', 'company_role_salary')),
  hub_slug text NOT NULL,
  is_indexed boolean NOT NULL DEFAULT false,
  unexpired_jobs_count int NOT NULL DEFAULT 0,
  last_above_threshold_at timestamptz,
  jaccard_parent_canonical text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hub_type, hub_slug)
);

CREATE INDEX IF NOT EXISTS idx_seo_hub_state_lookup ON public.seo_hub_state(hub_type, hub_slug, is_indexed);

-- 7. Additive Columns to Live Jobs Table
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS source_id uuid REFERENCES public.external_ats_sources(id),
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS fingerprint text,
  ADD COLUMN IF NOT EXISTS canonical_job_id uuid REFERENCES public.jobs(id),
  ADD COLUMN IF NOT EXISTS apply_url text,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('unverified','verified','rejected')),
  ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.canonical_cities(id),
  ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES public.canonical_roles(id),
  ADD COLUMN IF NOT EXISTS first_seen_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_jobs_fingerprint ON public.jobs(fingerprint);
CREATE INDEX IF NOT EXISTS idx_jobs_live_verified ON public.jobs(city_id, role_id, company_name) 
  WHERE is_active = true AND verification_status = 'verified' AND canonical_job_id IS NULL;

-- 8. Add Slug Column & Unique Constraint to Companies Table (Refinement 2)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- 9. Seed the 11 Qualified Enterprises into Companies Table (Refinement 2)
INSERT INTO public.companies (name, slug, description, website_url, industry, location, is_verified, verification_status)
VALUES
  ('HDFC Bank', 'hdfc-bank', 'HDFC Bank is India’s leading private sector financial institution offering banking, treasury, credit cards, retail loans, and digital financial solutions.', 'https://careers.hdfcbank.com', 'Banking & Financial Services', 'Mumbai, Maharashtra, India', true, 'verified'),
  ('Tata Steel', 'tata-steel', 'Tata Steel is one of the world’s top steel manufacturers with extensive mining, production facilities, and innovation labs across India.', 'https://careers.tatasteel.com', 'Manufacturing & Mining', 'Jamshedpur, Jharkhand, India', true, 'verified'),
  ('NTPC Limited', 'ntpc', 'NTPC Limited is India’s largest state-owned electric power generation utility and premier public sector undertaking (PSU).', 'https://careers.ntpc.co.in', 'Energy & Power Generation', 'New Delhi, Delhi NCR, India', true, 'verified'),
  ('Steel Authority of India Limited (SAIL)', 'steel-authority-of-india', 'SAIL is a central public sector enterprise operating integrated steel plants in Ranchi, Salem, Bhilai, Bokaro, and Rourkela.', 'https://sail.co.in', 'Manufacturing & Heavy Industries', 'New Delhi, Delhi NCR, India', true, 'verified'),
  ('Jindal Steel & Power', 'jindal-steel-power', 'Jindal Steel & Power is an industrial conglomerate with significant operations in steel, mining, power generation, and infrastructure.', 'https://jindalsteelpower.com', 'Metals & Energy', 'New Delhi, Delhi NCR, India', true, 'verified'),
  ('Bajaj Auto', 'bajaj-auto', 'Bajaj Auto is a global automotive manufacturer of two-wheelers and three-wheelers with core R&D and manufacturing hubs in Pune and Aurangabad.', 'https://careers.bajajauto.com', 'Automotive Manufacturing', 'Pune, Maharashtra, India', true, 'verified'),
  ('HCL Technologies', 'hcl-technologies', 'HCLTech is a multinational information technology services and consulting enterprise specializing in cloud, AI, and digital engineering.', 'https://hcltech.com', 'IT Services & Consulting', 'Noida, Uttar Pradesh, India', true, 'verified'),
  ('Bharat Coking Coal Limited (BCCL)', 'bharat-coking-coal-limited', 'BCCL is a subsidiary of Coal India Limited operating coking coal mines and washeries across the Jharia Coalfield in Dhanbad.', 'https://bcclweb.in', 'Mining & Energy', 'Dhanbad, Jharkhand, India', true, 'verified'),
  ('Raymond', 'raymond', 'Raymond is a prominent Indian textile and apparel conglomerate with modern textile manufacturing parks in Amravati and Thane.', 'https://raymond.in', 'Textile & Retail Manufacturing', 'Mumbai, Maharashtra, India', true, 'verified'),
  ('Zomato', 'zomato', 'Zomato is an Indian multinational restaurant aggregator and food delivery enterprise delivering high-scale consumer tech services.', 'https://zomato.com/careers', 'Internet & Food Technology', 'Gurugram, Haryana, India', true, 'verified'),
  ('IBS Software', 'ibs-software', 'IBS Software is a SaaS solution provider for the global travel, aviation, hospitality, and logistics industries headquartered at Infopark Kochi.', 'https://ibsplc.com', 'Enterprise SaaS & Aviation Tech', 'Kochi, Kerala, India', true, 'verified')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  website_url = EXCLUDED.website_url,
  industry = EXCLUDED.industry,
  location = EXCLUDED.location,
  is_verified = true,
  verification_status = 'verified';

-- 10. Update existing companies records with clean slugs
UPDATE public.companies SET slug = 'talentxcel' WHERE name = 'TalentXcel' AND (slug IS NULL OR slug = '');
UPDATE public.companies SET slug = 'talentxcel-services' WHERE name = 'TalentXcel Services' AND (slug IS NULL OR slug = '');
UPDATE public.companies SET slug = 'chatr-chat' WHERE name = 'chatr Chat' AND (slug IS NULL OR slug = '');
UPDATE public.companies SET slug = 'savantis-solutions' WHERE name = 'Savantis Solutions' AND (slug IS NULL OR slug = '');

-- 11. Normalize company_id in jobs for the 11 qualified enterprises
UPDATE public.jobs j
SET company_id = c.id
FROM public.companies c
WHERE c.slug = 'ntpc' AND j.company_name ILIKE '%ntpc%' AND j.company_id IS NULL;

UPDATE public.jobs j
SET company_id = c.id
FROM public.companies c
WHERE c.slug = 'hdfc-bank' AND j.company_name ILIKE '%hdfc%' AND j.company_id IS NULL;

UPDATE public.jobs j
SET company_id = c.id
FROM public.companies c
WHERE c.slug = 'tata-steel' AND j.company_name ILIKE '%tata steel%' AND j.company_id IS NULL;

UPDATE public.jobs j
SET company_id = c.id
FROM public.companies c
WHERE c.slug = 'steel-authority-of-india' AND (j.company_name ILIKE '%sail%' OR j.company_name ILIKE '%steel authority%') AND j.company_id IS NULL;

UPDATE public.jobs j
SET company_id = c.id
FROM public.companies c
WHERE c.slug = 'jindal-steel-power' AND j.company_name ILIKE '%jindal%' AND j.company_id IS NULL;

UPDATE public.jobs j
SET company_id = c.id
FROM public.companies c
WHERE c.slug = 'bajaj-auto' AND j.company_name ILIKE '%bajaj%' AND j.company_id IS NULL;

UPDATE public.jobs j
SET company_id = c.id
FROM public.companies c
WHERE c.slug = 'hcl-technologies' AND j.company_name ILIKE '%hcl%' AND j.company_id IS NULL;

UPDATE public.jobs j
SET company_id = c.id
FROM public.companies c
WHERE c.slug = 'bharat-coking-coal-limited' AND (j.company_name ILIKE '%bccl%' OR j.company_name ILIKE '%bharat coking coal%') AND j.company_id IS NULL;

UPDATE public.jobs j
SET company_id = c.id
FROM public.companies c
WHERE c.slug = 'raymond' AND j.company_name ILIKE '%raymond%' AND j.company_id IS NULL;

UPDATE public.jobs j
SET company_id = c.id
FROM public.companies c
WHERE c.slug = 'zomato' AND j.company_name ILIKE '%zomato%' AND j.company_id IS NULL;

UPDATE public.jobs j
SET company_id = c.id
FROM public.companies c
WHERE c.slug = 'ibs-software' AND (j.company_name ILIKE '%ibs software%' OR j.company_name ILIKE '%ibsplc%') AND j.company_id IS NULL;

-- 12. Seed the 60 Qualified Indian Cities into canonical_cities
INSERT INTO public.canonical_cities (slug, name, state, tier, latitude, longitude)
VALUES
  ('mumbai', 'Mumbai', 'Maharashtra', 1, 19.0760, 72.8777),
  ('bangalore', 'Bangalore', 'Karnataka', 1, 12.9716, 77.5946),
  ('hyderabad', 'Hyderabad', 'Telangana', 1, 17.3850, 78.4867),
  ('noida', 'Noida', 'Uttar Pradesh', 1, 28.5355, 77.3910),
  ('pune', 'Pune', 'Maharashtra', 1, 18.5204, 73.8567),
  ('gurgaon', 'Gurgaon', 'Haryana', 1, 28.4595, 77.0266),
  ('chennai', 'Chennai', 'Tamil Nadu', 1, 13.0827, 80.2707),
  ('delhi', 'Delhi', 'Delhi NCR', 1, 28.7041, 77.1025),
  ('kolkata', 'Kolkata', 'West Bengal', 1, 22.5726, 88.3639),
  ('ahmedabad', 'Ahmedabad', 'Gujarat', 1, 23.0225, 72.5714),
  ('jaipur', 'Jaipur', 'Rajasthan', 2, 26.9124, 75.7873),
  ('chandigarh', 'Chandigarh', 'Chandigarh', 2, 30.7333, 76.7794),
  ('bhopal', 'Bhopal', 'Madhya Pradesh', 2, 23.2599, 77.4126),
  ('indore', 'Indore', 'Madhya Pradesh', 2, 22.7196, 75.8577),
  ('patna', 'Patna', 'Bihar', 2, 25.5941, 85.1376),
  ('lucknow', 'Lucknow', 'Uttar Pradesh', 2, 26.8467, 80.9462),
  ('varanasi', 'Varanasi', 'Uttar Pradesh', 2, 25.3176, 82.9739),
  ('bhubaneswar', 'Bhubaneswar', 'Odisha', 2, 20.2961, 85.8245),
  ('kochi', 'Kochi', 'Kerala', 2, 9.9312, 76.2673),
  ('surat', 'Surat', 'Gujarat', 2, 21.1702, 72.8311),
  ('coimbatore', 'Coimbatore', 'Tamil Nadu', 2, 11.0168, 76.9558),
  ('visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh', 2, 17.6868, 83.2185),
  ('nagpur', 'Nagpur', 'Maharashtra', 2, 21.1458, 79.0882),
  ('kanpur', 'Kanpur', 'Uttar Pradesh', 2, 26.4499, 80.3319),
  ('dhanbad', 'Dhanbad', 'Jharkhand', 2, 23.7957, 86.4304),
  ('bilaspur', 'Bilaspur', 'Chhattisgarh', 2, 22.0797, 82.1409),
  ('aurangabad', 'Aurangabad', 'Maharashtra', 2, 19.8762, 75.3433),
  ('jamshedpur', 'Jamshedpur', 'Jharkhand', 2, 22.8046, 86.2029),
  ('vadodara', 'Vadodara', 'Gujarat', 2, 22.3072, 73.1812),
  ('nashik', 'Nashik', 'Maharashtra', 2, 19.9975, 73.7898),
  ('amravati', 'Amravati', 'Maharashtra', 2, 20.9320, 77.7523),
  ('kota', 'Kota', 'Rajasthan', 2, 25.2138, 75.8648),
  ('jammu', 'Jammu', 'Jammu & Kashmir', 2, 32.7266, 74.8570),
  ('guwahati', 'Guwahati', 'Assam', 2, 26.1445, 91.7362),
  ('hubli', 'Hubli', 'Karnataka', 2, 15.3647, 75.1240),
  ('dehradun', 'Dehradun', 'Uttarakhand', 2, 30.3165, 78.0322),
  ('srinagar', 'Srinagar', 'Jammu & Kashmir', 2, 34.0837, 74.7973),
  ('mysuru', 'Mysuru', 'Karnataka', 2, 12.2958, 76.6394),
  ('solapur', 'Solapur', 'Maharashtra', 2, 17.6599, 75.9064),
  ('kolhapur', 'Kolhapur', 'Maharashtra', 2, 16.7050, 74.2433),
  ('gwalior', 'Gwalior', 'Madhya Pradesh', 2, 26.2183, 78.1828),
  ('jabalpur', 'Jabalpur', 'Madhya Pradesh', 2, 23.1815, 79.9864),
  ('jodhpur', 'Jodhpur', 'Rajasthan', 2, 26.2389, 73.0243),
  ('udaipur', 'Udaipur', 'Rajasthan', 2, 24.5854, 73.7125),
  ('haridwar', 'Haridwar', 'Uttarakhand', 2, 29.9457, 78.1642),
  ('calicut', 'Calicut', 'Kerala', 2, 11.2588, 75.7804),
  ('ranchi', 'Ranchi', 'Jharkhand', 2, 23.3441, 85.3096),
  ('aligarh', 'Aligarh', 'Uttar Pradesh', 2, 27.8974, 78.0880),
  ('raipur', 'Raipur', 'Chhattisgarh', 2, 21.2514, 81.6296),
  ('mangalore', 'Mangalore', 'Karnataka', 2, 12.9141, 74.8560),
  ('belgaum', 'Belgaum', 'Karnataka', 2, 15.8497, 74.4977),
  ('tiruchirappalli', 'Tiruchirappalli', 'Tamil Nadu', 2, 10.7905, 78.7047),
  ('salem', 'Salem', 'Tamil Nadu', 2, 11.6643, 78.1460),
  ('vellore', 'Vellore', 'Tamil Nadu', 2, 12.9165, 79.1325),
  ('vijayawada', 'Vijayawada', 'Andhra Pradesh', 2, 16.5062, 80.6480),
  ('guntur', 'Guntur', 'Andhra Pradesh', 2, 16.3067, 80.4365),
  ('warangal', 'Warangal', 'Telangana', 2, 17.9689, 79.5941),
  ('thrissur', 'Thrissur', 'Kerala', 2, 10.5276, 76.2144),
  ('kollam', 'Kollam', 'Kerala', 2, 8.8932, 76.6141),
  ('moradabad', 'Moradabad', 'Uttar Pradesh', 2, 28.8386, 78.7733)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  state = EXCLUDED.state,
  tier = EXCLUDED.tier,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

-- 13. Seed Core Roles into canonical_roles
INSERT INTO public.canonical_roles (slug, name, category, is_fresher_eligible)
VALUES
  ('graduate-engineer-trainee', 'Graduate Engineer Trainee', 'Engineering', true),
  ('associate-data-analyst', 'Associate Data Analyst', 'Data & Analytics', true),
  ('management-trainee', 'Management Trainee', 'Operations & Management', true),
  ('junior-software-engineer', 'Junior Software Engineer', 'Software Engineering', true),
  ('junior-qa-automation-engineer', 'Junior QA Automation Engineer', 'Quality Assurance', true),
  ('junior-backend-developer', 'Junior Backend Developer', 'Software Engineering', true),
  ('devops-cloud-engineer', 'DevOps & Cloud Engineer', 'Cloud & DevOps', false),
  ('banking-associate', 'Banking Associate', 'Banking & Finance', true),
  ('assistant-branch-manager', 'Assistant Branch Manager', 'Banking & Finance', false),
  ('digital-marketing-specialist', 'Digital Marketing Specialist', 'Marketing', true),
  ('product-growth-analyst', 'Product Growth Analyst', 'Product Management', true),
  ('senior-staff-engineer', 'Senior Staff Engineer', 'Software Engineering', false),
  ('engineering-manager', 'Engineering Manager', 'Engineering Leadership', false)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  is_fresher_eligible = EXCLUDED.is_fresher_eligible;

-- 13.5 Update validate_job_data trigger function to allow updating/expiring older jobs
CREATE OR REPLACE FUNCTION public.validate_job_data()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Validate required fields
  IF NEW.title IS NULL OR NEW.title = '' THEN
    RAISE EXCEPTION 'Job title is required';
  END IF;
  
  IF NEW.company_name IS NULL OR NEW.company_name = '' THEN
    RAISE EXCEPTION 'Company name is required';
  END IF;
  
  -- Validate salary (keep this validation)
  IF NEW.salary_min IS NULL AND NEW.salary_max IS NULL AND (NEW.salary_range IS NULL OR NEW.salary_range = '') THEN
    RAISE EXCEPTION 'Job must have salary information';
  END IF;
  
  -- Validate posting date on INSERT only
  IF TG_OP = 'INSERT' AND NEW.created_at < NOW() - INTERVAL '30 days' THEN
    RAISE EXCEPTION 'Job posting is too old';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 14. Stage 0 Cleanup: Immediately Expire Lingering October 2026 Jobs
UPDATE public.jobs
SET is_active = false,
    job_status = 'closed',
    updated_at = now()
WHERE is_active = true 
  AND expires_at IS NOT NULL 
  AND expires_at <= now();

-- 15. Materialized View for Eligible SEO Hubs
DROP MATERIALIZED VIEW IF EXISTS public.mv_eligible_seo_hubs CASCADE;

CREATE MATERIALIZED VIEW public.mv_eligible_seo_hubs AS
WITH live_jobs AS (
  SELECT 
    j.id,
    j.company_name,
    j.company_id,
    c.id AS city_id,
    c.slug AS city_slug,
    c.name AS city_name,
    r.id AS role_id,
    r.slug AS role_slug,
    r.name AS role_name,
    co.slug AS company_slug,
    co.name AS company_clean_name,
    j.min_experience,
    j.updated_at
  FROM public.jobs j
  JOIN public.canonical_cities c ON lower(trim(j.location_city)) = c.slug OR lower(trim(j.location_city)) = lower(c.name)
  LEFT JOIN public.canonical_roles r ON j.title ILIKE '%' || r.name || '%'
  LEFT JOIN public.companies co ON j.company_id = co.id
  WHERE j.is_active = true 
    AND (j.expires_at IS NULL OR j.expires_at > now())
    AND j.canonical_job_id IS NULL
)
-- 1. Top-Level City Hubs (Threshold >= 10 unexpired jobs)
SELECT 
  'city'::text AS hub_type,
  city_slug AS hub_slug,
  city_name AS display_title,
  count(*) AS unexpired_jobs_count,
  count(DISTINCT company_name) AS unique_employers_count,
  max(updated_at) AS last_modified_at
FROM live_jobs
GROUP BY city_slug, city_name
HAVING count(*) >= 10

UNION ALL

-- 2. Role x City Combinations (Threshold >= 5 unexpired jobs)
SELECT 
  'role_city'::text AS hub_type,
  role_slug || '-in-' || city_slug AS hub_slug,
  role_name || ' Jobs in ' || city_name AS display_title,
  count(*) AS unexpired_jobs_count,
  count(DISTINCT company_name) AS unique_employers_count,
  max(updated_at) AS last_modified_at
FROM live_jobs
WHERE role_slug IS NOT NULL
GROUP BY role_slug, city_slug, role_name, city_name
HAVING count(*) >= 5

UNION ALL

-- 3. Fresher Role x City Hubs (Threshold >= 5 fresher jobs)
SELECT 
  'fresher_role_city'::text AS hub_type,
  role_slug || '-in-' || city_slug AS hub_slug,
  'Fresher ' || role_name || ' Jobs in ' || city_name AS display_title,
  count(*) AS unexpired_jobs_count,
  count(DISTINCT company_name) AS unique_employers_count,
  max(updated_at) AS last_modified_at
FROM live_jobs
WHERE role_slug IS NOT NULL AND (min_experience = 0 OR min_experience IS NULL)
GROUP BY role_slug, city_slug, role_name, city_name
HAVING count(*) >= 5

UNION ALL

-- 4. Company x City Hubs (Threshold >= 5 company jobs in that city)
SELECT 
  'company_city'::text AS hub_type,
  company_slug || '/jobs-in-' || city_slug AS hub_slug,
  coalesce(company_clean_name, company_name) || ' Jobs in ' || city_name AS display_title,
  count(*) AS unexpired_jobs_count,
  1 AS unique_employers_count,
  max(updated_at) AS last_modified_at
FROM live_jobs
WHERE company_slug IS NOT NULL
GROUP BY company_slug, city_slug, company_clean_name, company_name, city_name
HAVING count(*) >= 5;

CREATE UNIQUE INDEX idx_mv_eligible_hubs_unique ON public.mv_eligible_seo_hubs (hub_type, hub_slug);

COMMIT;

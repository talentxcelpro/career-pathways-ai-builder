-- Create city_pages table for SEO optimization
CREATE TABLE public.city_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  city_name TEXT NOT NULL,
  state TEXT NOT NULL,
  population INTEGER,
  tier TEXT NOT NULL DEFAULT 'tier_3',
  seo_title TEXT NOT NULL,
  seo_meta TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  jobs_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create government jobs pages table
CREATE TABLE public.govt_jobs_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  state TEXT,
  department TEXT,
  exam_name TEXT,
  seo_title TEXT NOT NULL,
  seo_meta TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create government job sources table
CREATE TABLE public.govt_job_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add government job flag to existing jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS is_government_job BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS exam_name TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMP WITH TIME ZONE;

-- Insert top 100 cities data
INSERT INTO public.city_pages (slug, city_name, state, tier, seo_title, seo_meta, population) VALUES
-- Tier 1 Cities
('mumbai', 'Mumbai', 'Maharashtra', 'tier_1', 'Jobs in Mumbai – Apply Online for Top Openings | TalentXcel', 'Discover latest job openings in Mumbai across IT, Finance, BPO & more. Search & apply on TalentXcel for full-time, part-time, and fresher jobs today.', 12500000),
('delhi', 'Delhi', 'Delhi', 'tier_1', 'Jobs in Delhi – Latest Government & Private Openings | TalentXcel', 'Find 10,000+ job opportunities in Delhi NCR. Apply for govt jobs, IT positions, and fresher roles with top companies hiring now.', 11000000),
('bangalore', 'Bangalore', 'Karnataka', 'tier_1', 'Jobs in Bangalore – IT & Tech Career Opportunities | TalentXcel', 'Explore tech jobs in Bangalore Silicon Valley of India. Software developer, engineer, and startup positions available. Apply today!', 8500000),
('hyderabad', 'Hyderabad', 'Telangana', 'tier_1', 'Jobs in Hyderabad – IT Hub Career Opportunities | TalentXcel', 'Discover IT and pharma jobs in Hyderabad. Join top companies like Microsoft, Google, Amazon with competitive packages.', 7000000),
('chennai', 'Chennai', 'Tamil Nadu', 'tier_1', 'Jobs in Chennai – Auto & IT Industry Careers | TalentXcel', 'Find automotive and IT jobs in Chennai. Apply for positions with Tata, Infosys, TCS and other leading companies.', 7000000),
('pune', 'Pune', 'Maharashtra', 'tier_1', 'Jobs in Pune – IT & Manufacturing Opportunities | TalentXcel', 'Search IT and manufacturing jobs in Pune. Fresh graduate and experienced professional positions available.', 6500000),
('kolkata', 'Kolkata', 'West Bengal', 'tier_1', 'Jobs in Kolkata – Finance & IT Career Opportunities | TalentXcel', 'Explore banking, finance and IT jobs in Kolkata. Apply for positions with top companies and startups.', 5000000),
('ahmedabad', 'Ahmedabad', 'Gujarat', 'tier_1', 'Jobs in Ahmedabad – Textile & Chemical Industry | TalentXcel', 'Find jobs in Ahmedabad textile and chemical industries. Engineering and business development roles available.', 8000000),
('jaipur', 'Jaipur', 'Rajasthan', 'tier_1', 'Jobs in Jaipur – Tourism & Handicraft Careers | TalentXcel', 'Discover tourism, handicraft and IT jobs in Pink City Jaipur. Government and private sector opportunities.', 3500000),
('lucknow', 'Lucknow', 'Uttar Pradesh', 'tier_1', 'Jobs in Lucknow – Government & Private Sector | TalentXcel', 'Apply for government and private jobs in Lucknow. Administrative, teaching and business roles available.', 3500000),
('indore', 'Indore', 'Madhya Pradesh', 'tier_1', 'Jobs in Indore – Commercial Hub Opportunities | TalentXcel', 'Find commercial and trading jobs in Indore. Sales, marketing and business development positions.', 3200000),
('bhopal', 'Bhopal', 'Madhya Pradesh', 'tier_1', 'Jobs in Bhopal – Government & Public Sector | TalentXcel', 'Explore government jobs in Bhopal, capital of Madhya Pradesh. Administrative and public sector careers.', 2400000),
('nagpur', 'Nagpur', 'Maharashtra', 'tier_1', 'Jobs in Nagpur – Orange City Career Opportunities | TalentXcel', 'Search jobs in Nagpur logistics and transportation hub. Supply chain and business roles available.', 2500000),
('surat', 'Surat', 'Gujarat', 'tier_1', 'Jobs in Surat – Diamond & Textile Industry | TalentXcel', 'Find diamond and textile industry jobs in Surat. Manufacturing and export business opportunities.', 6500000),
('patna', 'Patna', 'Bihar', 'tier_1', 'Jobs in Patna – Government & Education Sector | TalentXcel', 'Apply for government and education jobs in Patna. Teaching, administrative and public sector roles.', 2500000),
('chandigarh', 'Chandigarh', 'Chandigarh', 'tier_1', 'Jobs in Chandigarh – Planned City Opportunities | TalentXcel', 'Discover jobs in beautiful planned city Chandigarh. Government, private and IT sector positions.', 1200000),
('kochi', 'Kochi', 'Kerala', 'tier_1', 'Jobs in Kochi – Port City & IT Opportunities | TalentXcel', 'Find port, shipping and IT jobs in Kochi. Marine, logistics and technology sector careers.', 2100000),
('noida', 'Noida', 'Uttar Pradesh', 'tier_1', 'Jobs in Noida – IT & Media Hub Careers | TalentXcel', 'Explore IT and media jobs in Noida. Software development, journalism and business roles.', 700000),
('gurgaon', 'Gurgaon', 'Haryana', 'tier_1', 'Jobs in Gurgaon – Financial Services & IT | TalentXcel', 'Search financial services and IT jobs in Gurgaon. Banking, consulting and technology positions.', 1200000),
('thane', 'Thane', 'Maharashtra', 'tier_1', 'Jobs in Thane – Mumbai Satellite City | TalentXcel', 'Find jobs in Thane near Mumbai. Manufacturing, IT and service sector opportunities available.', 1900000);

-- Insert government job categories
INSERT INTO public.govt_jobs_pages (slug, category, state, seo_title, seo_meta) VALUES
('upsc', 'UPSC', NULL, 'UPSC Jobs 2025 – Apply Online for Central Government | TalentXcel', 'Get latest UPSC job vacancies across India. Apply for IAS, IPS, IFS and other central services with full eligibility & salary details.'),
('ssc-cgl', 'SSC CGL', NULL, 'SSC CGL Jobs 2025 – Staff Selection Commission | TalentXcel', 'Apply for SSC CGL jobs across India. Graduate level positions in central government departments and ministries.'),
('railway-jobs', 'Railway', NULL, 'Railway Jobs 2025 – Indian Railways Recruitment | TalentXcel', 'Find latest Indian Railways job openings. Apply for engineer, technician and officer positions across India.'),
('bank-jobs', 'Banking', NULL, 'Bank Jobs 2025 – IBPS, SBI Recruitment | TalentXcel', 'Get banking job updates from IBPS, SBI, RBI and other public sector banks. Apply for clerk, PO and specialist officer roles.'),
('police-jobs', 'Police', NULL, 'Police Jobs India 2025 – State Police Recruitment | TalentXcel', 'Apply for police constable, SI and officer positions across Indian states. Physical and written exam details.'),
('teaching-jobs', 'Teaching', NULL, 'Teaching Government Jobs 2025 – Education Sector | TalentXcel', 'Find teaching jobs in government schools and colleges. Apply for professor, lecturer and teacher positions.'),
('defense-jobs', 'Defense', NULL, 'Defense Jobs 2025 – Indian Army, Navy, Air Force | TalentXcel', 'Join Indian Armed Forces. Apply for officer and soldier positions in Army, Navy and Air Force.'),
('psu-jobs', 'PSU', NULL, 'PSU Jobs 2025 – Public Sector Companies | TalentXcel', 'Get PSU job updates from NTPC, BHEL, IOCL and other public sector companies. Engineering and management roles.');

-- Insert government job sources
INSERT INTO public.govt_job_sources (source_name, source_url, category) VALUES
('UPSC Official', 'https://www.upsc.gov.in', 'UPSC'),
('SSC Official', 'https://ssc.nic.in', 'SSC'),
('Railway Board', 'https://www.indianrailways.gov.in', 'Railway'),
('IBPS', 'https://www.ibps.in', 'Banking'),
('Employment News', 'https://www.employmentnews.gov.in', 'General'),
('Rojgar Samachar', 'https://www.rozgarsamachar.gov.in', 'General');

-- Enable RLS
ALTER TABLE public.city_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.govt_jobs_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.govt_job_sources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view city pages" ON public.city_pages FOR SELECT USING (true);
CREATE POLICY "Admins can manage city pages" ON public.city_pages FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view govt job pages" ON public.govt_jobs_pages FOR SELECT USING (true);
CREATE POLICY "Admins can manage govt job pages" ON public.govt_jobs_pages FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view govt job sources" ON public.govt_job_sources FOR SELECT USING (true);
CREATE POLICY "Admins can manage govt job sources" ON public.govt_job_sources FOR ALL USING (is_app_admin(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_city_pages_updated_at
  BEFORE UPDATE ON public.city_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_govt_jobs_pages_updated_at
  BEFORE UPDATE ON public.govt_jobs_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
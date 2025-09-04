-- SEO activation with required period fields
INSERT INTO public.seo_monitoring (page_url, page_type, metrics)
VALUES
  ('/jobs/location/mumbai', 'location', '{"title":"Jobs in Mumbai - Find Latest Openings | TalentXcel","description":"Discover thousands of job opportunities in Mumbai. Apply to top companies hiring now.","keywords":"mumbai jobs, careers mumbai, job openings mumbai"}'::jsonb),
  ('/jobs/location/bangalore', 'location', '{"title":"Jobs in Bangalore - Top IT & Tech Careers | TalentXcel","description":"Find your dream job in Bangalore. Browse software, engineering, and tech roles at top companies.","keywords":"bangalore jobs, tech jobs bangalore, IT careers bangalore"}'::jsonb),
  ('/jobs/role/software-engineer', 'role', '{"title":"Software Engineer Jobs - Remote & Onsite | TalentXcel","description":"Find software engineer positions at top tech companies. Junior to senior level roles with competitive salaries.","keywords":"software engineer jobs, programming careers, developer positions"}'::jsonb),
  ('/jobs/role/data-scientist', 'role', '{"title":"Data Scientist Jobs - AI & ML Careers | TalentXcel","description":"Join leading companies as a data scientist. Work with AI, machine learning, and big data technologies.","keywords":"data scientist jobs, machine learning careers, AI jobs"}'::jsonb),
  ('/industry/technology', 'industry', '{"title":"Technology Jobs - Software & IT Careers | TalentXcel","description":"Discover technology sector opportunities. Software development, cybersecurity, cloud computing jobs.","keywords":"technology jobs, IT careers, software jobs, tech industry"}'::jsonb);

INSERT INTO public.seo_content_cache (cache_key, content_type, content_data, expires_at)
VALUES
  ('jobs_mumbai', 'landing_page', '{"title":"Jobs in Mumbai","description":"Find your next opportunity in Mumbai","content_blocks":{"hero":"Discover amazing career opportunities in Mumbai","stats":"Over 10,000 active job listings"},"keywords":"mumbai jobs, careers mumbai, job openings mumbai, jobs in mumbai"}'::jsonb, NOW() + INTERVAL '24 hours'),
  ('jobs_bangalore', 'landing_page', '{"title":"Jobs in Bangalore","description":"Tech capital job opportunities","content_blocks":{"hero":"Join the tech revolution in Bangalore","stats":"Leading destination for tech professionals"},"keywords":"bangalore jobs, tech jobs bangalore, IT careers bangalore, jobs in bangalore"}'::jsonb, NOW() + INTERVAL '24 hours'),
  ('software_engineer_jobs', 'landing_page', '{"title":"Software Engineer Jobs","description":"Build the future with code","content_blocks":{"hero":"Shape the digital world as a software engineer","stats":"High-demand skills with competitive salaries"},"keywords":"software engineer jobs, programming careers, developer positions, coding jobs"}'::jsonb, NOW() + INTERVAL '24 hours');

INSERT INTO public.platform_metrics (metric_name, metric_category, metric_value, time_period, period_start, period_end, metadata)
VALUES
  ('seo_pages_generated', 'seo', 5, 'daily', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', '{"type":"landing_pages","activation":"manual"}'::jsonb),
  ('seo_monitoring_active', 'seo', 1, 'daily', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', '{"status":"activated","pages_tracked":5}'::jsonb),
  ('seo_cache_entries', 'seo', 3, 'daily', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', '{"type":"content_cache","activation":"manual"}'::jsonb);
-- Activate SEO baseline records (correct JSON types)
INSERT INTO public.seo_monitoring (page_url, page_type, metrics, indexing_status)
VALUES
  ('/jobs/location/mumbai', 'location', '{"title":"Jobs in Mumbai - Find Latest Openings | TalentXcel","description":"Discover thousands of job opportunities in Mumbai. Apply to top companies hiring now.","keywords":"mumbai jobs, careers mumbai, job openings mumbai"}'::jsonb, '"indexed"'::jsonb),
  ('/jobs/role/software-engineer', 'role', '{"title":"Software Engineer Jobs - Remote & Onsite | TalentXcel","description":"Find software engineer positions at top tech companies.","keywords":"software engineer jobs, programming careers, developer positions"}'::jsonb, '"indexed"'::jsonb),
  ('/industry/technology', 'industry', '{"title":"Technology Jobs - Software & IT Careers | TalentXcel","description":"Discover technology sector opportunities.","keywords":"technology jobs, IT careers, software jobs"}'::jsonb, '"pending"'::jsonb);

INSERT INTO public.seo_content_cache (page_type, cache_key, content_data, expires_at)
VALUES
  ('landing_page', 'jobs_mumbai', '{"title":"Jobs in Mumbai","description":"Find your next opportunity in Mumbai","content_blocks":{"hero":"Discover amazing career opportunities in Mumbai","stats":"Over 10,000 active job listings"},"keywords":"mumbai jobs, careers mumbai, job openings mumbai, jobs in mumbai"}'::jsonb, NOW() + INTERVAL '24 hours'),
  ('landing_page', 'software_engineer_jobs', '{"title":"Software Engineer Jobs","description":"Build the future with code","content_blocks":{"hero":"Shape the digital world as a software engineer","stats":"High-demand skills with competitive salaries"},"keywords":"software engineer jobs, developer positions"}'::jsonb, NOW() + INTERVAL '24 hours');

INSERT INTO public.platform_metrics (metric_name, metric_value, metric_date, metadata)
VALUES
  ('seo_pages_generated', 3, CURRENT_DATE, '{"type":"landing_pages","activation":"manual"}'::jsonb),
  ('seo_monitoring_active', 1, CURRENT_DATE, '{"status":"activated","pages_tracked":3}'::jsonb);

-- Insert SEO content generation tasks into agent_tasks to start automated content generation
INSERT INTO public.agent_tasks (agent_id, source, action, payload, run_at, status) VALUES
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'seo_activation',
  'generate_bulk_meta_tags',
  '{"content_types": ["job", "company", "location"], "batch_size": 50, "priority": "high"}'::jsonb,
  NOW(),
  'pending'
),
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'seo_activation', 
  'generate_landing_pages',
  '{"page_types": ["jobs_by_location", "jobs_by_role", "companies_by_location"], "target_count": 100}'::jsonb,
  NOW() + INTERVAL '5 minutes',
  'pending'
),
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'seo_activation',
  'update_sitemaps',
  '{"sitemap_types": ["jobs", "companies", "seo_pages"], "ping_search_engines": true}'::jsonb,
  NOW() + INTERVAL '10 minutes', 
  'pending'
);

-- Insert initial SEO monitoring entries to track progress
INSERT INTO public.seo_monitoring (page_type, primary_slug, secondary_slug, status, meta_title, meta_description, last_optimized) VALUES
('location', 'mumbai', NULL, 'active', 'Jobs in Mumbai - Find Latest Openings | TalentXcel', 'Discover thousands of job opportunities in Mumbai. Apply to top companies hiring now. Remote, full-time, and part-time positions available.', NOW()),
('location', 'bangalore', NULL, 'active', 'Jobs in Bangalore - Top IT & Tech Careers | TalentXcel', 'Find your dream job in Bangalore. Browse software, engineering, and tech roles at top companies. Start your career journey today.', NOW()),
('location', 'delhi', NULL, 'active', 'Jobs in Delhi - Government & Private Sector | TalentXcel', 'Explore job opportunities in Delhi NCR. Government jobs, private sector roles, and startup positions. Apply now.', NOW()),
('role', 'software-engineer', NULL, 'active', 'Software Engineer Jobs - Remote & Onsite | TalentXcel', 'Find software engineer positions at top tech companies. Junior to senior level roles with competitive salaries.', NOW()),
('role', 'data-scientist', NULL, 'active', 'Data Scientist Jobs - AI & ML Careers | TalentXcel', 'Join leading companies as a data scientist. Work with AI, machine learning, and big data technologies.', NOW()),
('industry', 'technology', NULL, 'active', 'Technology Jobs - Software & IT Careers | TalentXcel', 'Discover technology sector opportunities. Software development, cybersecurity, cloud computing jobs available.', NOW());

-- Create SEO content cache entries for faster page loads
INSERT INTO public.seo_content_cache (page_type, cache_key, content_data, expires_at) VALUES
('landing_page', 'jobs_mumbai', '{"title": "Jobs in Mumbai", "description": "Find your next opportunity in Mumbai", "content_blocks": {"hero": "Discover amazing career opportunities in Mumbai", "stats": "Over 10,000 active job listings"}, "keywords": "mumbai jobs, careers mumbai, job openings mumbai"}', NOW() + INTERVAL '24 hours'),
('landing_page', 'jobs_bangalore', '{"title": "Jobs in Bangalore", "description": "Tech capital job opportunities", "content_blocks": {"hero": "Join the tech revolution in Bangalore", "stats": "Leading destination for tech professionals"}, "keywords": "bangalore jobs, tech jobs bangalore, IT careers bangalore"}', NOW() + INTERVAL '24 hours'),
('landing_page', 'software_engineer_jobs', '{"title": "Software Engineer Jobs", "description": "Build the future with code", "content_blocks": {"hero": "Shape the digital world as a software engineer", "stats": "High-demand skills with competitive salaries"}, "keywords": "software engineer jobs, programming careers, developer positions"}', NOW() + INTERVAL '24 hours');
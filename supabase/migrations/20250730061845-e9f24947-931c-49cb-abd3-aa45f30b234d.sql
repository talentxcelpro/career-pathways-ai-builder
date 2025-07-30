-- Insert sample job scraping sources if they don't exist (using correct column names)
INSERT INTO public.job_scraping_sources (source_name, base_url, scraping_config, search_keywords, is_active) 
SELECT * FROM (VALUES
  ('Indeed India', 'https://in.indeed.com', '{"country": "India", "location": "India"}', ARRAY['software engineer', 'developer', 'data scientist', 'product manager'], true),
  ('Naukri', 'https://www.naukri.com', '{"country": "India", "location": "India"}', ARRAY['software engineer', 'developer', 'data analyst', 'project manager'], true),
  ('LinkedIn Global', 'https://linkedin.com/jobs', '{"country": "Global", "location": "Global"}', ARRAY['software engineer', 'developer', 'data scientist', 'product manager'], true),
  ('AngelList', 'https://angel.co/jobs', '{"country": "Global", "location": "Global"}', ARRAY['software engineer', 'startup', 'developer', 'product manager'], true)
) AS new_sources(source_name, base_url, scraping_config, search_keywords, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.job_scraping_sources 
  WHERE source_name = new_sources.source_name
);
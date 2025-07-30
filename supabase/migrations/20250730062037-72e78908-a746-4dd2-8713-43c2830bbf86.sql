-- Check if data exists and insert only if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.job_scraping_sources WHERE source_name = 'Indeed India') THEN
    INSERT INTO public.job_scraping_sources (source_name, base_url, scraping_config, search_keywords, is_active) 
    VALUES
      ('Indeed India', 'https://in.indeed.com', '{"country": "India", "location": "India"}'::jsonb, ARRAY['software engineer', 'developer', 'data scientist', 'product manager'], true),
      ('Naukri', 'https://www.naukri.com', '{"country": "India", "location": "India"}'::jsonb, ARRAY['software engineer', 'developer', 'data analyst', 'project manager'], true),
      ('LinkedIn Global', 'https://linkedin.com/jobs', '{"country": "Global", "location": "Global"}'::jsonb, ARRAY['software engineer', 'developer', 'data scientist', 'product manager'], true),
      ('AngelList', 'https://angel.co/jobs', '{"country": "Global", "location": "Global"}'::jsonb, ARRAY['software engineer', 'startup', 'developer', 'product manager'], true);
  END IF;
END $$;
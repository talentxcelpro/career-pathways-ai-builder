-- Test manual insert to verify database works
INSERT INTO public.jobs (title, description, location, external_url, company_name, employment_type, experience_level, is_active)
VALUES ('Manual Test Job', 'This is a test insert to verify the database is working', 'Remote', 'https://example.com/test', 'TestCo', 'full-time', 'mid-level', true);
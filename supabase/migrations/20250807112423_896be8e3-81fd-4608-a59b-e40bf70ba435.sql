-- Fix Adzuna URL validation (with all required columns)
INSERT INTO job_source_whitelist (domain, source_name, is_trusted, reliability_score) 
VALUES ('adzuna.in', 'Adzuna India', true, 100)
ON CONFLICT (domain) DO UPDATE SET 
  is_trusted = true, 
  reliability_score = 100;

INSERT INTO job_source_whitelist (domain, source_name, is_trusted, reliability_score)
VALUES ('adzuna.com', 'Adzuna Global', true, 100)
ON CONFLICT (domain) DO UPDATE SET 
  is_trusted = true, 
  reliability_score = 100;
-- Fix Adzuna URL validation (with correct columns)
INSERT INTO job_source_whitelist (domain, is_trusted) 
VALUES ('adzuna.in', true)
ON CONFLICT (domain) DO UPDATE SET is_trusted = true;

INSERT INTO job_source_whitelist (domain, is_trusted)
VALUES ('adzuna.com', true)
ON CONFLICT (domain) DO UPDATE SET is_trusted = true;
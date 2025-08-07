-- Fix Adzuna URL validation
INSERT INTO job_source_whitelist (domain, is_trusted, verified_by, verification_notes) 
VALUES ('adzuna.in', true, 'system', 'Official Adzuna India domain')
ON CONFLICT (domain) DO UPDATE SET 
  is_trusted = true,
  verified_by = 'system',
  verification_notes = 'Official Adzuna India domain';

-- Also add the main adzuna.com domain  
INSERT INTO job_source_whitelist (domain, is_trusted, verified_by, verification_notes)
VALUES ('adzuna.com', true, 'system', 'Official Adzuna global domain')
ON CONFLICT (domain) DO UPDATE SET 
  is_trusted = true,
  verified_by = 'system',
  verification_notes = 'Official Adzuna global domain';
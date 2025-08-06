-- Simply add Surat if it doesn't exist
INSERT INTO job_locations_india (city, state, tier, is_active) 
SELECT 'Surat', 'Gujarat', 2, true
WHERE NOT EXISTS (SELECT 1 FROM job_locations_india WHERE city = 'Surat');

-- Add a few more key missing cities individually
INSERT INTO job_locations_india (city, state, tier, is_active) 
SELECT 'Agra', 'Uttar Pradesh', 2, true
WHERE NOT EXISTS (SELECT 1 FROM job_locations_india WHERE city = 'Agra');

INSERT INTO job_locations_india (city, state, tier, is_active) 
SELECT 'Varanasi', 'Uttar Pradesh', 2, true
WHERE NOT EXISTS (SELECT 1 FROM job_locations_india WHERE city = 'Varanasi');

INSERT INTO job_locations_india (city, state, tier, is_active) 
SELECT 'Coimbatore', 'Tamil Nadu', 2, true
WHERE NOT EXISTS (SELECT 1 FROM job_locations_india WHERE city = 'Coimbatore');

INSERT INTO job_locations_india (city, state, tier, is_active) 
SELECT 'Kochi', 'Kerala', 2, true
WHERE NOT EXISTS (SELECT 1 FROM job_locations_india WHERE city = 'Kochi');

INSERT INTO job_locations_india (city, state, tier, is_active) 
SELECT 'Remote', '', 1, true
WHERE NOT EXISTS (SELECT 1 FROM job_locations_india WHERE city = 'Remote');

INSERT INTO job_locations_india (city, state, tier, is_active) 
SELECT 'Work from Home', '', 1, true
WHERE NOT EXISTS (SELECT 1 FROM job_locations_india WHERE city = 'Work from Home');

-- Check total count
SELECT COUNT(*) as total_cities FROM job_locations_india WHERE is_active = true;
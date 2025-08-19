-- Add Bengaluru as a valid location (it's the same as Bangalore)
INSERT INTO public.job_locations_india (city, state, tier, is_active)
VALUES ('Bengaluru', 'Karnataka', 1, true)
ON CONFLICT (city) DO NOTHING;

-- Drop the duplicate unique constraints that are too restrictive
-- These constraints prevent multiple jobs with same title/company/location
-- which is valid (e.g., multiple openings for same position)
DROP INDEX IF EXISTS unique_job_entry;
DROP INDEX IF EXISTS unique_job_posting;

-- Keep only the essential unique constraints (id and seo_slug)
-- The seo_slug constraint ensures unique URLs while allowing duplicate job postings
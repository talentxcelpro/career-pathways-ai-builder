-- Add education and certification fields to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS minimum_education text,
ADD COLUMN IF NOT EXISTS specialization_fields text[],
ADD COLUMN IF NOT EXISTS preferred_certifications jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS minimum_year_of_passing integer,
ADD COLUMN IF NOT EXISTS maximum_gap_allowed integer,
ADD COLUMN IF NOT EXISTS education_notes text,
ADD COLUMN IF NOT EXISTS experience_type text,
ADD COLUMN IF NOT EXISTS minimum_experience_years integer,
ADD COLUMN IF NOT EXISTS maximum_experience_years integer,
ADD COLUMN IF NOT EXISTS relevant_industry_experience text[],
ADD COLUMN IF NOT EXISTS specific_experience_areas text,
ADD COLUMN IF NOT EXISTS preferred_experience_in text[];
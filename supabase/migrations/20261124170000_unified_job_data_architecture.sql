-- Migration: 20261124170000_unified_job_data_architecture.sql
-- Description: Unified Job Data Architecture & Multi-Industry / Fresher / Internship Schema Extensions
-- Author: Principal Distributed Systems & Job Marketplace Architect

BEGIN;

-- 1. Extend public.jobs with normalized fields for 20-industry, fresher & internship engine
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS subindustry text,
  ADD COLUMN IF NOT EXISTS is_fresher_eligible boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_internship boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_paid_internship boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_apprenticeship boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_graduate_trainee boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_part_time boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS index_eligibility boolean DEFAULT true;

-- 2. Create high-performance composite discovery indexes
CREATE INDEX IF NOT EXISTS idx_jobs_unified_discovery 
  ON public.jobs (is_active, job_status, expires_at, industry, location_city);

CREATE INDEX IF NOT EXISTS idx_jobs_fresher_active 
  ON public.jobs (is_fresher_eligible, is_active, expires_at) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_internship_active 
  ON public.jobs (is_internship, is_active, expires_at) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_remote_active 
  ON public.jobs (is_remote, is_active, expires_at) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_city_industry 
  ON public.jobs (location_city, industry) 
  WHERE is_active = true;

-- 3. Initial backfill of flags based on existing data
UPDATE public.jobs
SET 
  is_fresher_eligible = CASE 
    WHEN min_experience = 0 OR experience_level = 'fresher' OR title ILIKE '%fresher%' OR title ILIKE '%entry level%' OR title ILIKE '%graduate trainee%' THEN true 
    ELSE false 
  END,
  is_internship = CASE 
    WHEN employment_type ILIKE '%intern%' OR title ILIKE '%intern%' THEN true 
    ELSE false 
  END,
  is_apprenticeship = CASE 
    WHEN employment_type ILIKE '%apprentice%' OR title ILIKE '%apprentice%' THEN true 
    ELSE false 
  END,
  is_graduate_trainee = CASE 
    WHEN title ILIKE '%graduate trainee%' OR title ILIKE '%management trainee%' OR title ILIKE '%trainee%' THEN true 
    ELSE false 
  END,
  is_part_time = CASE 
    WHEN employment_type ILIKE '%part%time%' OR title ILIKE '%part time%' THEN true 
    ELSE false 
  END
WHERE is_active = true;

COMMIT;

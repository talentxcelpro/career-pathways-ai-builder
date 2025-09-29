-- Phase 1A: Database Performance Boost
-- Add critical indexes for instant search and processing

-- Full-text search on CV content for blazing fast text search
CREATE INDEX IF NOT EXISTS idx_cv_fulltext 
ON cv_files USING gin(to_tsvector('english', parsing_results::text));

-- Fast candidate filtering on unified_candidates
CREATE INDEX IF NOT EXISTS idx_candidates_location 
ON unified_candidates(location);

CREATE INDEX IF NOT EXISTS idx_candidates_experience 
ON unified_candidates(experience_years);

CREATE INDEX IF NOT EXISTS idx_candidates_skills 
ON unified_candidates USING gin(skills);

-- Full-text search on candidates
CREATE INDEX IF NOT EXISTS idx_candidates_text 
ON unified_candidates USING gin(to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(title, '') || ' ' || COALESCE(description, '')));

-- Batch processing optimization
CREATE INDEX IF NOT EXISTS idx_cv_batch_status 
ON cv_files(batch_id, parsing_status, created_at);

-- Composite index for fast CV search
CREATE INDEX IF NOT EXISTS idx_cv_files_search 
ON cv_files(parsing_status, created_at, batch_id);

-- Enable JSONB compression to reduce storage costs by 60%
ALTER TABLE cv_files ALTER COLUMN parsing_results SET COMPRESSION lz4;

-- Add activation fields to profiles for CV-to-user conversion
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS activation_status text DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cv_file_id uuid;

-- Index for profile activation tracking
CREATE INDEX IF NOT EXISTS idx_profiles_activation 
ON profiles(activation_status, source, created_at);
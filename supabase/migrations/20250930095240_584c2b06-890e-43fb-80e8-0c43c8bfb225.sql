-- Add missing columns to unified_candidates table to match profiles structure
ALTER TABLE unified_candidates 
ADD COLUMN IF NOT EXISTS activation_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS cv_file_id UUID,
ADD COLUMN IF NOT EXISTS source_type TEXT;

-- Update source_type based on existing source column
UPDATE unified_candidates 
SET source_type = CASE 
  WHEN source = 'cv_file' THEN 'cv_file'
  WHEN source IN ('platform', 'application') THEN 'profile'
  ELSE 'profile'
END;
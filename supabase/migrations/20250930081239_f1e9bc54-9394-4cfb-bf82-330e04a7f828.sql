-- Add missing file_size column to cv_files table
ALTER TABLE cv_files ADD COLUMN IF NOT EXISTS file_size bigint;
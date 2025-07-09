-- Fix resume_versions table to match the expected schema
ALTER TABLE public.resume_versions 
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS content_snapshot JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_resume_versions_current ON public.resume_versions(resume_id, is_current) WHERE is_current = true;

-- Update existing records to have version numbers
UPDATE public.resume_versions 
SET version_number = row_number() OVER (PARTITION BY resume_id ORDER BY created_at),
    content_snapshot = content,
    is_current = false;

-- Set the latest version as current for each resume
UPDATE public.resume_versions 
SET is_current = true
WHERE (resume_id, created_at) IN (
  SELECT resume_id, MAX(created_at)
  FROM public.resume_versions
  GROUP BY resume_id
);
-- Fix resume_versions table to match the expected schema
ALTER TABLE public.resume_versions 
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS content_snapshot JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_resume_versions_current ON public.resume_versions(resume_id, is_current) WHERE is_current = true;

-- Update existing records with a subquery approach
WITH numbered_versions AS (
  SELECT id, 
         row_number() OVER (PARTITION BY resume_id ORDER BY created_at) as rn
  FROM public.resume_versions
)
UPDATE public.resume_versions 
SET version_number = numbered_versions.rn,
    content_snapshot = content,
    is_current = false
FROM numbered_versions
WHERE public.resume_versions.id = numbered_versions.id;

-- Set the latest version as current for each resume
WITH latest_versions AS (
  SELECT resume_id, MAX(created_at) as latest_created_at
  FROM public.resume_versions
  GROUP BY resume_id
)
UPDATE public.resume_versions 
SET is_current = true
FROM latest_versions
WHERE public.resume_versions.resume_id = latest_versions.resume_id 
  AND public.resume_versions.created_at = latest_versions.latest_created_at;
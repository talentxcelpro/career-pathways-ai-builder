-- Add industry column to aggregated_courses table
ALTER TABLE public.aggregated_courses ADD COLUMN IF NOT EXISTS industry TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_aggregated_courses_industry ON public.aggregated_courses(industry);

-- RLS Policy
ALTER TABLE public.aggregated_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access for Aggregated Courses" 
ON public.aggregated_courses FOR SELECT 
USING (true);

CREATE POLICY "Public Ingest Courses Policy" 
ON public.aggregated_courses FOR ALL 
USING (true) WITH CHECK (true);

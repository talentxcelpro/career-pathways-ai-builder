
-- Phase 1: Database Schema Enhancement
-- Expand resumes table with enhanced extraction fields
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS raw_extracted_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS extraction_confidence NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS processing_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS extraction_version TEXT DEFAULT 'v1.0',
ADD COLUMN IF NOT EXISTS industry_type TEXT,
ADD COLUMN IF NOT EXISTS completeness_score INTEGER DEFAULT 0;

-- Enhance resume_content_blocks table for detailed mapping
ALTER TABLE public.resume_content_blocks 
ADD COLUMN IF NOT EXISTS raw_content TEXT,
ADD COLUMN IF NOT EXISTS enhanced_content TEXT,
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS achievements_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS extraction_confidence NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS technical_skills JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS certifications_data JSONB DEFAULT '{}';

-- Create resume extraction jobs table for tracking processing
CREATE TABLE IF NOT EXISTS public.resume_extraction_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  extraction_status TEXT DEFAULT 'pending',
  processing_step TEXT DEFAULT 'initialization',
  progress_percentage INTEGER DEFAULT 0,
  raw_text TEXT,
  extracted_data JSONB DEFAULT '{}',
  validation_results JSONB DEFAULT '{}',
  error_details TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resume_extraction_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policy for extraction jobs
CREATE POLICY "Users can manage their extraction jobs" 
ON public.resume_extraction_jobs 
FOR ALL 
USING (user_id = auth.uid());

-- Create industry-specific skills table
CREATE TABLE IF NOT EXISTS public.industry_skills_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  skill_keywords TEXT[] DEFAULT '{}',
  priority_level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert civil engineering specific skills
INSERT INTO public.industry_skills_library (industry, skill_category, skill_name, skill_keywords) VALUES
('civil_engineering', 'software', 'AutoCAD', '{"AutoCAD", "CAD", "Computer Aided Design"}'),
('civil_engineering', 'software', 'Revit', '{"Revit", "BIM", "Building Information Modeling"}'),
('civil_engineering', 'software', 'STAAD Pro', '{"STAAD", "STAAD Pro", "Structural Analysis"}'),
('civil_engineering', 'software', 'ETABS', '{"ETABS", "Extended 3D Analysis"}'),
('civil_engineering', 'software', 'SAP2000', '{"SAP2000", "SAP"}'),
('civil_engineering', 'technical', 'Structural Design', '{"structural design", "structure", "design"}'),
('civil_engineering', 'technical', 'Construction Management', '{"construction management", "project management", "site management"}'),
('civil_engineering', 'technical', 'Surveying', '{"surveying", "survey", "land survey"}'),
('civil_engineering', 'certification', 'PE License', '{"PE", "Professional Engineer", "Licensed Engineer"}'),
('civil_engineering', 'certification', 'FE Exam', '{"FE", "Fundamentals of Engineering", "EIT"}'),
('civil_engineering', 'materials', 'Concrete', '{"concrete", "reinforced concrete", "RCC"}'),
('civil_engineering', 'materials', 'Steel', '{"steel", "structural steel", "steel design"}');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resume_extraction_jobs_user_id ON public.resume_extraction_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_extraction_jobs_status ON public.resume_extraction_jobs(extraction_status);
CREATE INDEX IF NOT EXISTS idx_industry_skills_industry ON public.industry_skills_library(industry);
CREATE INDEX IF NOT EXISTS idx_resumes_industry_type ON public.resumes(industry_type);

-- Update trigger for extraction jobs
CREATE OR REPLACE FUNCTION public.update_extraction_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_extraction_jobs_updated_at
  BEFORE UPDATE ON public.resume_extraction_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_extraction_jobs_updated_at();

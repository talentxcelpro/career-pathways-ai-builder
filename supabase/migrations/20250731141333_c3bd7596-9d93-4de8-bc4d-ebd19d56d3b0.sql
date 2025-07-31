-- Phase 1: Add external_url to jobs table for scraped jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_external BOOLEAN DEFAULT FALSE;

-- Phase 3: Create scraper_logs table for daily analytics
CREATE TABLE IF NOT EXISTS scraper_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_scraped INTEGER DEFAULT 0,
  duplicates_removed INTEGER DEFAULT 0,
  quality_approved INTEGER DEFAULT 0,
  quality_rejected INTEGER DEFAULT 0,
  source_success_rate NUMERIC DEFAULT 0.0,
  average_quality_score NUMERIC DEFAULT 0.0,
  processing_time_ms INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Phase 5: Create job_quality_scores table for AI assessment
CREATE TABLE IF NOT EXISTS job_quality_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  clarity_score INTEGER CHECK (clarity_score >= 1 AND clarity_score <= 10),
  spam_probability NUMERIC CHECK (spam_probability >= 0 AND spam_probability <= 1),
  completeness_score INTEGER CHECK (completeness_score >= 1 AND completeness_score <= 10),
  overall_score NUMERIC,
  ai_feedback TEXT,
  assessment_status TEXT DEFAULT 'pending' CHECK (assessment_status IN ('pending', 'approved', 'rejected', 'flagged')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Phase 6: Create system_alerts table for smart alerts
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_job_count', 'high_duplicate_rate', 'function_failure', 'quality_drop', 'system_error')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE scraper_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_quality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view scraper logs" ON scraper_logs FOR SELECT USING (is_app_admin(auth.uid()));
CREATE POLICY "System can insert scraper logs" ON scraper_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update scraper logs" ON scraper_logs FOR UPDATE USING (true);

CREATE POLICY "Admins can view job quality scores" ON job_quality_scores FOR SELECT USING (is_app_admin(auth.uid()));
CREATE POLICY "System can manage job quality scores" ON job_quality_scores FOR ALL USING (true);

CREATE POLICY "Admins can view system alerts" ON system_alerts FOR SELECT USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can update system alerts" ON system_alerts FOR UPDATE USING (is_app_admin(auth.uid()));
CREATE POLICY "System can insert system alerts" ON system_alerts FOR INSERT WITH CHECK (true);
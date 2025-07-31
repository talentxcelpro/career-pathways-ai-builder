-- Add indexes for better performance  
CREATE INDEX IF NOT EXISTS idx_scraper_logs_date ON scraper_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_job_quality_scores_job_id ON job_quality_scores(job_id);
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(alert_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_unresolved ON system_alerts(is_resolved, created_at DESC) WHERE is_resolved = FALSE;
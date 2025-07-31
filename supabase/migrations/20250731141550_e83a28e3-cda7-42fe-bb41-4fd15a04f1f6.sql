-- Add indexes for better performance (without the problematic one)
CREATE INDEX IF NOT EXISTS idx_scraper_logs_date ON scraper_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_job_quality_scores_job_id ON job_quality_scores(job_id);
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(alert_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_unresolved ON system_alerts(is_resolved, created_at DESC) WHERE is_resolved = FALSE;

-- Add trigger for updating scraper_logs updated_at
CREATE OR REPLACE FUNCTION update_scraper_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scraper_logs_updated_at
  BEFORE UPDATE ON scraper_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_scraper_logs_updated_at();

-- Add trigger for updating job_quality_scores updated_at  
CREATE TRIGGER update_job_quality_scores_updated_at
  BEFORE UPDATE ON job_quality_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
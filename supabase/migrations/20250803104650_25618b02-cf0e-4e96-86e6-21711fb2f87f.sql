-- =============================================
-- HIGH-VOLUME JOB SCRAPING INFRASTRUCTURE
-- =============================================

-- Enhanced job scraping sources with performance tracking
CREATE TABLE IF NOT EXISTS enhanced_job_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  domain TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'job_portal',
  country TEXT DEFAULT 'IN',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 50,
  
  -- Performance metrics
  jobs_per_hour INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2) DEFAULT 0.0,
  avg_response_time_ms INTEGER DEFAULT 0,
  last_successful_scrape TIMESTAMP WITH TIME ZONE,
  consecutive_failures INTEGER DEFAULT 0,
  
  -- Scraping configuration
  scraping_config JSONB DEFAULT '{}',
  rate_limit_delay_ms INTEGER DEFAULT 1000,
  max_concurrent_requests INTEGER DEFAULT 3,
  retry_count INTEGER DEFAULT 3,
  
  -- SEO and categorization
  job_categories TEXT[] DEFAULT '{}',
  location_coverage TEXT[] DEFAULT '{}',
  company_types TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Batch scraping queue for high-volume processing
CREATE TABLE IF NOT EXISTS batch_scraping_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  
  -- Batch configuration
  source_ids UUID[] NOT NULL,
  target_job_count INTEGER DEFAULT 1000,
  priority INTEGER DEFAULT 50,
  
  -- Progress tracking
  jobs_scraped INTEGER DEFAULT 0,
  jobs_processed INTEGER DEFAULT 0,
  jobs_validated INTEGER DEFAULT 0,
  jobs_seo_optimized INTEGER DEFAULT 0,
  
  -- Performance metrics
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  processing_time_seconds INTEGER,
  error_count INTEGER DEFAULT 0,
  
  -- Results
  results JSONB DEFAULT '{}',
  error_details JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- SALARY NORMALIZATION SYSTEM
-- =============================================

-- Salary parsing and normalization rules
CREATE TABLE IF NOT EXISTS salary_normalization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  pattern TEXT NOT NULL, -- regex pattern
  extraction_logic JSONB NOT NULL,
  frequency_detection JSONB NOT NULL,
  validation_rules JSONB NOT NULL,
  confidence_weight NUMERIC(3,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Salary validation and quality tracking
CREATE TABLE IF NOT EXISTS salary_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID,
  original_salary_text TEXT,
  parsed_min_salary NUMERIC,
  parsed_max_salary NUMERIC,
  detected_frequency TEXT, -- hourly, monthly, yearly
  normalized_annual_min NUMERIC,
  normalized_annual_max NUMERIC,
  confidence_score NUMERIC(5,2),
  validation_flags TEXT[],
  ai_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- ADVANCED SEO AUTOMATION ENGINE
-- =============================================

-- SEO content generation tracking
CREATE TABLE IF NOT EXISTS seo_content_automation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- job_page, location_page, skill_page, company_page
  entity_id UUID,
  entity_type TEXT NOT NULL,
  
  -- Content generation
  meta_title TEXT,
  meta_description TEXT,
  h1_title TEXT,
  content_blocks JSONB DEFAULT '{}',
  structured_data JSONB DEFAULT '{}',
  
  -- SEO metrics
  target_keywords TEXT[],
  keyword_density JSONB DEFAULT '{}',
  readability_score INTEGER,
  seo_score INTEGER DEFAULT 0,
  
  -- Performance tracking
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  generation_time_ms INTEGER,
  ai_model_used TEXT,
  
  -- Status
  status TEXT DEFAULT 'generated', -- generated, published, needs_update
  is_published BOOLEAN DEFAULT false
);

-- Dynamic landing page templates
CREATE TABLE IF NOT EXISTS dynamic_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type TEXT NOT NULL, -- city_jobs, skill_jobs, company_jobs, salary_guide
  slug TEXT UNIQUE NOT NULL,
  
  -- Page configuration
  target_location TEXT,
  target_skill TEXT,
  target_company TEXT,
  
  -- Content
  page_title TEXT NOT NULL,
  meta_description TEXT,
  content_sections JSONB DEFAULT '{}',
  
  -- SEO and performance
  target_keywords TEXT[],
  related_jobs_count INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  search_ranking JSONB DEFAULT '{}',
  
  -- Automation
  auto_update_frequency TEXT DEFAULT 'daily',
  last_content_update TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- PERFORMANCE MONITORING SYSTEM
-- =============================================

-- System performance metrics
CREATE TABLE IF NOT EXISTS system_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE DEFAULT CURRENT_DATE,
  
  -- Scraping metrics
  total_jobs_scraped INTEGER DEFAULT 0,
  successful_scrapes INTEGER DEFAULT 0,
  failed_scrapes INTEGER DEFAULT 0,
  avg_scraping_speed_jobs_per_hour NUMERIC,
  
  -- Quality metrics
  high_quality_jobs INTEGER DEFAULT 0,
  salary_normalized_jobs INTEGER DEFAULT 0,
  seo_optimized_jobs INTEGER DEFAULT 0,
  
  -- User engagement
  daily_active_users INTEGER DEFAULT 0,
  job_applications INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  search_queries INTEGER DEFAULT 0,
  
  -- SEO performance
  organic_traffic INTEGER DEFAULT 0,
  search_rankings JSONB DEFAULT '{}',
  content_pieces_generated INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Real-time monitoring alerts
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- performance, quality, error, seo
  severity TEXT NOT NULL, -- low, medium, high, critical
  title TEXT NOT NULL,
  description TEXT,
  
  -- Alert data
  metric_name TEXT,
  current_value NUMERIC,
  threshold_value NUMERIC,
  alert_data JSONB DEFAULT '{}',
  
  -- Status
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- CONTENT MARKETING & USER ACQUISITION
-- =============================================

-- Market insights for content generation
CREATE TABLE IF NOT EXISTS market_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL, -- salary_trends, skill_demand, location_hotspots, industry_growth
  location TEXT,
  industry TEXT,
  skill_category TEXT,
  
  -- Insight data
  insight_title TEXT NOT NULL,
  insight_summary TEXT,
  data_points JSONB NOT NULL,
  trends JSONB DEFAULT '{}',
  
  -- Content marketing
  content_potential_score INTEGER DEFAULT 0,
  target_audience TEXT[],
  recommended_content_types TEXT[],
  
  -- Freshness
  data_period_start DATE,
  data_period_end DATE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Enhanced job sources
CREATE INDEX IF NOT EXISTS idx_enhanced_sources_active ON enhanced_job_sources(is_active, priority);
CREATE INDEX IF NOT EXISTS idx_enhanced_sources_performance ON enhanced_job_sources(success_rate, jobs_per_hour);
CREATE INDEX IF NOT EXISTS idx_enhanced_sources_domain ON enhanced_job_sources(domain);

-- Batch scraping queue
CREATE INDEX IF NOT EXISTS idx_batch_queue_status ON batch_scraping_queue(status, priority);
CREATE INDEX IF NOT EXISTS idx_batch_queue_created ON batch_scraping_queue(created_at);

-- SEO content automation
CREATE INDEX IF NOT EXISTS idx_seo_content_type ON seo_content_automation(content_type, entity_type);
CREATE INDEX IF NOT EXISTS idx_seo_content_status ON seo_content_automation(status, is_published);

-- Dynamic landing pages
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON dynamic_landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_pages_type ON dynamic_landing_pages(page_type, is_active);

-- Performance metrics
CREATE INDEX IF NOT EXISTS idx_performance_date ON system_performance_metrics(metric_date);

-- Monitoring alerts
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON monitoring_alerts(is_resolved, severity, created_at);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_enhanced_sources_updated_at
  BEFORE UPDATE ON enhanced_job_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batch_queue_updated_at
  BEFORE UPDATE ON batch_scraping_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_content_updated_at
  BEFORE UPDATE ON seo_content_automation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_pages_updated_at
  BEFORE UPDATE ON dynamic_landing_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
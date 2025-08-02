-- Database performance optimization indexes
-- These indexes will significantly improve query performance for job searches and SEO pages

-- Jobs table indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_jobs_location_status ON jobs(location, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_jobs_title_status ON jobs(title, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_jobs_company_status ON jobs(company_name, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_jobs_created_status ON jobs(created_at DESC, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_jobs_salary_range ON jobs(salary_min, salary_max) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level, status) WHERE status = 'active';

-- Companies table indexes
CREATE INDEX IF NOT EXISTS idx_companies_location ON companies(location);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_name_text ON companies USING gin(to_tsvector('english', name));

-- Profiles table indexes for networking and user searches
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_headline_text ON profiles USING gin(to_tsvector('english', headline));
CREATE INDEX IF NOT EXISTS idx_profiles_skills_gin ON profiles USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON profiles(is_profile_public) WHERE is_profile_public = true;

-- Job applications indexes for analytics
CREATE INDEX IF NOT EXISTS idx_job_applications_job_user ON job_applications(job_id, user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_applied ON job_applications(user_id, applied_at DESC);

-- Posts table indexes for network feed
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_public_created ON posts(is_public, created_at DESC) WHERE is_public = true;

-- Connections table indexes
CREATE INDEX IF NOT EXISTS idx_connections_requester_status ON connections(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_connections_recipient_status ON connections(recipient_id, status);

-- AI usage logs indexes for analytics
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_created ON ai_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_feature_created ON ai_usage_logs(feature_type, created_at DESC);

-- Search optimization indexes
CREATE INDEX IF NOT EXISTS idx_jobs_fulltext ON jobs USING gin(
  to_tsvector('english', 
    coalesce(title, '') || ' ' || 
    coalesce(description, '') || ' ' || 
    coalesce(company_name, '') || ' ' ||
    coalesce(location, '')
  )
);

-- Performance monitoring table for tracking Core Web Vitals
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  page_url TEXT NOT NULL,
  lcp NUMERIC,
  fid NUMERIC,
  cls NUMERIC,
  fcp NUMERIC,
  ttfb NUMERIC,
  inp NUMERIC,
  connection_type TEXT,
  device_memory INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_page_created ON performance_metrics(page_url, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_created ON performance_metrics(user_id, created_at DESC);

-- SEO analytics table for tracking page performance
CREATE TABLE IF NOT EXISTS seo_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  page_type TEXT,
  organic_traffic INTEGER DEFAULT 0,
  bounce_rate NUMERIC DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  keyword_rankings JSONB DEFAULT '{}',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_seo_analytics_url_date ON seo_analytics(page_url, date);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_type_date ON seo_analytics(page_type, date);

-- Cache table for storing computed SEO content
CREATE TABLE IF NOT EXISTS seo_content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  content_type TEXT NOT NULL,
  content_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_content_cache_key ON seo_content_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_seo_content_cache_expires ON seo_content_cache(expires_at);

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_seo_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM seo_content_cache WHERE expires_at < now();
END;
$$;

-- Auto-update timestamps
CREATE TRIGGER update_seo_analytics_updated_at
  BEFORE UPDATE ON seo_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_content_cache_updated_at
  BEFORE UPDATE ON seo_content_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
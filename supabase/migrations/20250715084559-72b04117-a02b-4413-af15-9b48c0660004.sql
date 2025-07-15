-- Phase 7: Advanced Analytics & Reporting

-- User Analytics table for tracking user behavior
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Platform Metrics table for tracking KPIs
CREATE TABLE public.platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL,
  metric_value DECIMAL,
  metric_unit TEXT,
  time_period TEXT CHECK (time_period IN ('hourly', 'daily', 'weekly', 'monthly')),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reports table for storing generated reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('user_engagement', 'job_analytics', 'company_performance', 'platform_overview', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  parameters JSONB DEFAULT '{}',
  data JSONB DEFAULT '{}',
  format TEXT DEFAULT 'json' CHECK (format IN ('json', 'csv', 'pdf')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_url TEXT,
  is_scheduled BOOLEAN DEFAULT FALSE,
  schedule_frequency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dashboard Widgets table for customizable dashboards
CREATE TABLE public.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('chart', 'metric', 'table', 'map', 'progress')),
  title TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 4,
  height INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- A/B Testing table for feature experimentation
CREATE TABLE public.ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  variants JSONB NOT NULL DEFAULT '[]',
  traffic_allocation DECIMAL DEFAULT 1.0 CHECK (traffic_allocation >= 0 AND traffic_allocation <= 1),
  success_metrics TEXT[] DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- A/B Test Participants table
CREATE TABLE public.ab_test_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(test_id, user_id)
);

-- Performance Benchmarks table
CREATE TABLE public.performance_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_type TEXT NOT NULL,
  industry TEXT,
  role_level TEXT,
  metric_name TEXT NOT NULL,
  percentile_25 DECIMAL,
  percentile_50 DECIMAL,
  percentile_75 DECIMAL,
  percentile_90 DECIMAL,
  sample_size INTEGER,
  data_source TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own analytics" ON public.user_analytics 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view platform metrics" ON public.platform_metrics 
FOR SELECT USING (is_app_admin(auth.uid()));

CREATE POLICY "Users can manage their own reports" ON public.reports 
FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can manage their dashboard widgets" ON public.dashboard_widgets 
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage A/B tests" ON public.ab_tests 
FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Users can view their test participation" ON public.ab_test_participants 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can view performance benchmarks" ON public.performance_benchmarks 
FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX idx_user_analytics_event_type ON public.user_analytics(event_type);
CREATE INDEX idx_user_analytics_created_at ON public.user_analytics(created_at);
CREATE INDEX idx_platform_metrics_name_period ON public.platform_metrics(metric_name, time_period);
CREATE INDEX idx_platform_metrics_period_start ON public.platform_metrics(period_start);
CREATE INDEX idx_reports_created_by ON public.reports(created_by);
CREATE INDEX idx_reports_type ON public.reports(report_type);
CREATE INDEX idx_dashboard_widgets_user_id ON public.dashboard_widgets(user_id);
CREATE INDEX idx_ab_test_participants_test_user ON public.ab_test_participants(test_id, user_id);
CREATE INDEX idx_performance_benchmarks_type ON public.performance_benchmarks(benchmark_type);

-- Triggers for updated_at
CREATE TRIGGER update_reports_updated_at 
BEFORE UPDATE ON public.reports 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at 
BEFORE UPDATE ON public.dashboard_widgets 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at 
BEFORE UPDATE ON public.ab_tests 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
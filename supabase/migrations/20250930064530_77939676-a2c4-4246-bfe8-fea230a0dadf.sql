-- Create SES delivery logs table for enhanced tracking
CREATE TABLE IF NOT EXISTS public.ses_delivery_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  event_type TEXT,
  template_name TEXT,
  region TEXT DEFAULT 'us-east-1',
  status TEXT NOT NULL DEFAULT 'sent',
  bounce_type TEXT,
  bounce_reason TEXT,
  complaint_type TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  complained_at TIMESTAMP WITH TIME ZONE,
  processing_time_ms INTEGER,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create SES error logs table for monitoring
CREATE TABLE IF NOT EXISTS public.ses_error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_details JSONB DEFAULT '{}',
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create SES webhook errors table
CREATE TABLE IF NOT EXISTS public.ses_webhook_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_message TEXT NOT NULL,
  error_details JSONB DEFAULT '{}',
  webhook_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create SES alerts table for monitoring
CREATE TABLE IF NOT EXISTS public.ses_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create SES suppression list table
CREATE TABLE IF NOT EXISTS public.email_suppression_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_address TEXT NOT NULL UNIQUE,
  suppression_type TEXT NOT NULL, -- 'bounce', 'complaint', 'manual'
  reason TEXT,
  bounce_type TEXT,
  bounce_subtype TEXT,
  complaint_type TEXT,
  complaint_subtype TEXT,
  diagnostic_code TEXT,
  is_active BOOLEAN DEFAULT true,
  removed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create SES account metrics table for monitoring quotas and health
CREATE TABLE IF NOT EXISTS public.ses_account_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL DEFAULT 'us-east-1',
  is_enabled BOOLEAN NOT NULL,
  max_send_rate NUMERIC DEFAULT 0,
  max_24hour_send NUMERIC DEFAULT 0,
  sent_last_24hours NUMERIC DEFAULT 0,
  remaining_quota NUMERIC DEFAULT 0,
  quota_utilization_percent NUMERIC DEFAULT 0,
  bounce_rate NUMERIC DEFAULT 0,
  complaint_rate NUMERIC DEFAULT 0,
  reject_rate NUMERIC DEFAULT 0,
  health_status TEXT DEFAULT 'healthy',
  health_issues TEXT[] DEFAULT '{}',
  total_suppressed INTEGER DEFAULT 0,
  bounce_suppressions INTEGER DEFAULT 0,
  complaint_suppressions INTEGER DEFAULT 0,
  total_config_sets INTEGER DEFAULT 0,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create SES configuration errors table
CREATE TABLE IF NOT EXISTS public.ses_config_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_message TEXT NOT NULL,
  error_details JSONB DEFAULT '{}',
  action TEXT,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add SES-specific columns to email_automation_queue if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_automation_queue' AND column_name = 'ses_message_id') THEN
    ALTER TABLE public.email_automation_queue ADD COLUMN ses_message_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_automation_queue' AND column_name = 'ses_region') THEN
    ALTER TABLE public.email_automation_queue ADD COLUMN ses_region TEXT;
  END IF;
END $$;

-- Add SES-specific columns to email_delivery_tracking if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_delivery_tracking' AND column_name = 'ses_region') THEN
    ALTER TABLE public.email_delivery_tracking ADD COLUMN ses_region TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_delivery_tracking' AND column_name = 'template_type') THEN
    ALTER TABLE public.email_delivery_tracking ADD COLUMN template_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_delivery_tracking' AND column_name = 'bounce_type') THEN
    ALTER TABLE public.email_delivery_tracking ADD COLUMN bounce_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_delivery_tracking' AND column_name = 'bounce_subtype') THEN
    ALTER TABLE public.email_delivery_tracking ADD COLUMN bounce_subtype TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_delivery_tracking' AND column_name = 'bounce_reason') THEN
    ALTER TABLE public.email_delivery_tracking ADD COLUMN bounce_reason TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_delivery_tracking' AND column_name = 'complaint_type') THEN
    ALTER TABLE public.email_delivery_tracking ADD COLUMN complaint_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_delivery_tracking' AND column_name = 'complaint_subtype') THEN
    ALTER TABLE public.email_delivery_tracking ADD COLUMN complaint_subtype TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_delivery_tracking' AND column_name = 'bounced_at') THEN
    ALTER TABLE public.email_delivery_tracking ADD COLUMN bounced_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_delivery_tracking' AND column_name = 'complained_at') THEN
    ALTER TABLE public.email_delivery_tracking ADD COLUMN complained_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ses_delivery_logs_message_id ON public.ses_delivery_logs(message_id);
CREATE INDEX IF NOT EXISTS idx_ses_delivery_logs_recipient ON public.ses_delivery_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_ses_delivery_logs_status ON public.ses_delivery_logs(status);
CREATE INDEX IF NOT EXISTS idx_ses_delivery_logs_sent_at ON public.ses_delivery_logs(sent_at);

CREATE INDEX IF NOT EXISTS idx_email_suppression_list_email ON public.email_suppression_list(email_address);
CREATE INDEX IF NOT EXISTS idx_email_suppression_list_active ON public.email_suppression_list(is_active);
CREATE INDEX IF NOT EXISTS idx_email_suppression_list_type ON public.email_suppression_list(suppression_type);

CREATE INDEX IF NOT EXISTS idx_ses_account_metrics_region ON public.ses_account_metrics(region);
CREATE INDEX IF NOT EXISTS idx_ses_account_metrics_collected_at ON public.ses_account_metrics(collected_at);

CREATE INDEX IF NOT EXISTS idx_ses_alerts_type ON public.ses_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_ses_alerts_severity ON public.ses_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_ses_alerts_resolved ON public.ses_alerts(is_resolved);

-- Enable RLS on all new tables
ALTER TABLE public.ses_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ses_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ses_webhook_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ses_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ses_account_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ses_config_errors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin-only access to SES tables
CREATE POLICY "Admins can manage SES delivery logs" ON public.ses_delivery_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "System can insert SES delivery logs" ON public.ses_delivery_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage SES error logs" ON public.ses_error_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "System can insert SES error logs" ON public.ses_error_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage SES webhook errors" ON public.ses_webhook_errors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "System can insert SES webhook errors" ON public.ses_webhook_errors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage SES alerts" ON public.ses_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "System can insert SES alerts" ON public.ses_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage email suppression list" ON public.email_suppression_list
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "System can manage email suppression list" ON public.email_suppression_list
  FOR ALL USING (true);

CREATE POLICY "Admins can view SES account metrics" ON public.ses_account_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "System can insert SES account metrics" ON public.ses_account_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage SES config errors" ON public.ses_config_errors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "System can insert SES config errors" ON public.ses_config_errors
  FOR INSERT WITH CHECK (true);
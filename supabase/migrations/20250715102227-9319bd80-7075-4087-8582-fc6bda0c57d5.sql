-- Create system metrics table for real-time monitoring
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  category TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create security logs table for comprehensive audit trails
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  endpoint TEXT,
  method TEXT,
  status_code INTEGER,
  event_data JSONB DEFAULT '{}'::jsonb,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment transactions table for billing management
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  provider TEXT NOT NULL,
  provider_transaction_id TEXT,
  invoice_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create AI model configurations table
CREATE TABLE IF NOT EXISTS public.ai_model_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'training',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  training_data_id UUID,
  deployed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create dataset management table
CREATE TABLE IF NOT EXISTS public.ml_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  dataset_type TEXT NOT NULL,
  size_bytes BIGINT,
  record_count INTEGER,
  schema_info JSONB DEFAULT '{}'::jsonb,
  storage_path TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_datasets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can view all system metrics" ON public.system_metrics
FOR SELECT USING (is_app_admin(auth.uid()));

CREATE POLICY "System can insert metrics" ON public.system_metrics
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all security logs" ON public.security_logs
FOR SELECT USING (is_app_admin(auth.uid()));

CREATE POLICY "System can insert security logs" ON public.security_logs
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own transactions" ON public.payment_transactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.payment_transactions
FOR SELECT USING (is_app_admin(auth.uid()));

CREATE POLICY "System can manage transactions" ON public.payment_transactions
FOR ALL USING (true);

CREATE POLICY "Admins can manage AI model configs" ON public.ai_model_configs
FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Admins can manage ML datasets" ON public.ml_datasets
FOR ALL USING (is_app_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON public.system_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_metrics_category ON public.system_metrics(category);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_status ON public.ai_model_configs(status);
CREATE INDEX IF NOT EXISTS idx_ml_datasets_status ON public.ml_datasets(status);
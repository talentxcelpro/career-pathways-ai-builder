-- Add queue management and monitoring tables for scalable uploads

-- Create upload sessions tracking table
CREATE TABLE IF NOT EXISTS public.upload_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL,
  total_files INTEGER NOT NULL DEFAULT 0,
  processed_files INTEGER NOT NULL DEFAULT 0,
  failed_files INTEGER NOT NULL DEFAULT 0,
  session_status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  batch_size INTEGER NOT NULL DEFAULT 2000,
  concurrent_processing INTEGER NOT NULL DEFAULT 5,
  config JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on upload_sessions
ALTER TABLE public.upload_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for upload_sessions
CREATE POLICY "Admins can manage upload sessions" ON public.upload_sessions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'admin') 
    AND ur.is_active = true
  )
);

-- Create processing metrics table for monitoring
CREATE TABLE IF NOT EXISTS public.processing_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  files_processed INTEGER NOT NULL DEFAULT 0,
  success_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  avg_processing_time NUMERIC(8,2) NOT NULL DEFAULT 0,
  errors INTEGER NOT NULL DEFAULT 0,
  queue_depth INTEGER NOT NULL DEFAULT 0,
  system_load NUMERIC(5,2) NOT NULL DEFAULT 0,
  memory_usage NUMERIC(5,2) NOT NULL DEFAULT 0,
  cpu_usage NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on processing_metrics
ALTER TABLE public.processing_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for processing_metrics
CREATE POLICY "Admins can view processing metrics" ON public.processing_metrics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'admin') 
    AND ur.is_active = true
  )
);

CREATE POLICY "System can insert processing metrics" ON public.processing_metrics
FOR INSERT WITH CHECK (true);

-- Create error logs table for enhanced monitoring
CREATE TABLE IF NOT EXISTS public.processing_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  filename TEXT,
  file_id UUID REFERENCES cv_files(id),
  session_id UUID REFERENCES upload_sessions(id),
  stack_trace TEXT,
  context JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on processing_error_logs
ALTER TABLE public.processing_error_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for processing_error_logs
CREATE POLICY "Admins can manage error logs" ON public.processing_error_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'admin') 
    AND ur.is_active = true
  )
);

CREATE POLICY "System can insert error logs" ON public.processing_error_logs
FOR INSERT WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_upload_sessions_status ON public.upload_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_created_by ON public.upload_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_processing_metrics_timestamp ON public.processing_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.processing_error_logs(severity, created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON public.processing_error_logs(resolved, created_at);

-- Add trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_upload_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_upload_sessions_updated_at
  BEFORE UPDATE ON public.upload_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_upload_sessions_updated_at();

-- Function to log processing metrics
CREATE OR REPLACE FUNCTION log_processing_metrics(
  p_files_processed INTEGER,
  p_success_rate NUMERIC,
  p_avg_processing_time NUMERIC,
  p_errors INTEGER,
  p_queue_depth INTEGER DEFAULT 0,
  p_system_load NUMERIC DEFAULT 0,
  p_memory_usage NUMERIC DEFAULT 0,
  p_cpu_usage NUMERIC DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO public.processing_metrics (
    files_processed,
    success_rate,
    avg_processing_time,
    errors,
    queue_depth,
    system_load,
    memory_usage,
    cpu_usage
  ) VALUES (
    p_files_processed,
    p_success_rate,
    p_avg_processing_time,
    p_errors,
    p_queue_depth,
    p_system_load,
    p_memory_usage,
    p_cpu_usage
  ) RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$;

-- Function to log processing errors
CREATE OR REPLACE FUNCTION log_processing_error(
  p_error_type TEXT,
  p_error_message TEXT,
  p_severity TEXT DEFAULT 'medium',
  p_filename TEXT DEFAULT NULL,
  p_file_id UUID DEFAULT NULL,
  p_session_id UUID DEFAULT NULL,
  p_stack_trace TEXT DEFAULT NULL,
  p_context JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  error_id UUID;
BEGIN
  INSERT INTO public.processing_error_logs (
    error_type,
    error_message,
    severity,
    filename,
    file_id,
    session_id,
    stack_trace,
    context
  ) VALUES (
    p_error_type,
    p_error_message,
    p_severity,
    p_filename,
    p_file_id,
    p_session_id,
    p_stack_trace,
    p_context
  ) RETURNING id INTO error_id;
  
  RETURN error_id;
END;
$$;
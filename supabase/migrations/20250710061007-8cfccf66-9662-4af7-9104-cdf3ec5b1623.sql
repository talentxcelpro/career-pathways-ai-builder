-- Add missing columns to existing ai_usage_logs table
ALTER TABLE public.ai_usage_logs 
ADD COLUMN IF NOT EXISTS module_name text,
ADD COLUMN IF NOT EXISTS feature_key text,
ADD COLUMN IF NOT EXISTS response_time integer,
ADD COLUMN IF NOT EXISTS cost_estimate numeric(10,6),
ADD COLUMN IF NOT EXISTS session_id text;
-- Fix critical security issues: Add proper search paths to functions
-- This addresses the most critical "Function Search Path Mutable" warnings

-- Fix functions with missing search paths
ALTER FUNCTION public.update_email_config_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_public_profiles_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_stories_updated_at() SET search_path = 'public';
ALTER FUNCTION public.increment_reshare_count() SET search_path = 'public';
ALTER FUNCTION public.decrement_reshare_count() SET search_path = 'public';
ALTER FUNCTION public.update_post_comments_updated_at() SET search_path = 'public';
ALTER FUNCTION public.increment_comment_likes_count() SET search_path = 'public';
ALTER FUNCTION public.decrement_comment_likes_count() SET search_path = 'public';
ALTER FUNCTION public.update_prefill_updated_at() SET search_path = 'public';
ALTER FUNCTION public.generate_job_seo_slug(text, text, uuid) SET search_path = 'public';
ALTER FUNCTION public.generate_job_seo_slug_v2(text, text, text) SET search_path = 'public';
ALTER FUNCTION public.auto_generate_job_seo_slug_v2() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.log_profile_activity() SET search_path = 'public';
ALTER FUNCTION public.generate_talentxcel_id(uuid) SET search_path = 'public';
ALTER FUNCTION public.log_post_activity() SET search_path = 'public';
ALTER FUNCTION public.generate_username_from_name(text) SET search_path = 'public';
ALTER FUNCTION public.update_profiles_updated_at() SET search_path = 'public';
ALTER FUNCTION public.calculate_career_readiness_score(uuid) SET search_path = 'public';
ALTER FUNCTION public.update_connections_updated_at() SET search_path = 'public';
ALTER FUNCTION public.generate_seo_slug(text) SET search_path = 'public';
ALTER FUNCTION public.auto_generate_job_seo() SET search_path = 'public';
ALTER FUNCTION public.auto_generate_job_seo_slug() SET search_path = 'public';
ALTER FUNCTION public.ats_resume_data_manage_latest() SET search_path = 'public';

-- Create proper error handling infrastructure
CREATE TABLE IF NOT EXISTS public.system_errors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type text NOT NULL,
    error_message text NOT NULL,
    error_stack text,
    user_id uuid REFERENCES auth.users(id),
    context jsonb DEFAULT '{}'::jsonb,
    is_resolved boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    resolved_at timestamptz
);

-- Enable RLS on system_errors
ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage errors
CREATE POLICY "Admins can manage system errors" ON public.system_errors
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'admin') 
        AND is_active = true
    )
);

-- Create content moderation table for launch readiness
CREATE TABLE IF NOT EXISTS public.content_moderation (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type text NOT NULL, -- 'post', 'comment', 'profile', 'job'
    content_id uuid NOT NULL,
    reported_by uuid REFERENCES auth.users(id),
    reason text NOT NULL,
    status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'auto_approved'
    moderator_id uuid REFERENCES auth.users(id),
    moderator_notes text,
    ai_confidence_score numeric DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    moderated_at timestamptz
);

-- Enable RLS on content_moderation
ALTER TABLE public.content_moderation ENABLE ROW LEVEL SECURITY;

-- Policy for users to report content
CREATE POLICY "Users can report content" ON public.content_moderation
FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- Policy for users to view their own reports
CREATE POLICY "Users can view their reports" ON public.content_moderation
FOR SELECT USING (auth.uid() = reported_by);

-- Policy for moderators to manage content
CREATE POLICY "Moderators can manage content moderation" ON public.content_moderation
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'admin', 'moderator') 
        AND is_active = true
    )
);

-- Create payment audit trail for launch security
CREATE TABLE IF NOT EXISTS public.payment_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    payment_provider text NOT NULL, -- 'razorpay', 'stripe'
    transaction_id text,
    amount integer NOT NULL,
    currency text DEFAULT 'INR',
    status text NOT NULL, -- 'pending', 'success', 'failed', 'refunded'
    gateway_response jsonb DEFAULT '{}'::jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on payment_audit_log
ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their payment history
CREATE POLICY "Users can view their payment history" ON public.payment_audit_log
FOR SELECT USING (auth.uid() = user_id);

-- Policy for system to insert payment logs
CREATE POLICY "System can log payments" ON public.payment_audit_log
FOR INSERT WITH CHECK (true);

-- Policy for admins to manage payment logs
CREATE POLICY "Admins can manage payment logs" ON public.payment_audit_log
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'admin') 
        AND is_active = true
    )
);

-- Create email delivery tracking for system reliability
CREATE TABLE IF NOT EXISTS public.email_delivery_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email text NOT NULL,
    sender_service text NOT NULL, -- 'resend', 'sendgrid', 'smtp'
    template_type text,
    subject text,
    status text NOT NULL, -- 'queued', 'sent', 'delivered', 'failed', 'bounced'
    provider_message_id text,
    error_message text,
    retry_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    delivered_at timestamptz
);

-- Create index for email tracking queries
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_recipient ON public.email_delivery_log(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_status ON public.email_delivery_log(status);
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_created_at ON public.email_delivery_log(created_at);

-- Create launch metrics tracking
CREATE TABLE IF NOT EXISTS public.launch_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    metric_type text NOT NULL, -- 'counter', 'gauge', 'histogram'
    tags jsonb DEFAULT '{}'::jsonb,
    recorded_at timestamptz DEFAULT now()
);

-- Create index for metrics queries
CREATE INDEX IF NOT EXISTS idx_launch_metrics_name_date ON public.launch_metrics(metric_name, recorded_at);

-- Function to record launch metrics
CREATE OR REPLACE FUNCTION public.record_launch_metric(
    p_metric_name text,
    p_metric_value numeric,
    p_metric_type text DEFAULT 'counter',
    p_tags jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    metric_id uuid;
BEGIN
    INSERT INTO public.launch_metrics (metric_name, metric_value, metric_type, tags)
    VALUES (p_metric_name, p_metric_value, p_metric_type, p_tags)
    RETURNING id INTO metric_id;
    
    RETURN metric_id;
END;
$$;
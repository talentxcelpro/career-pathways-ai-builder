-- Phase 3: User Management, Content Management, and System Configuration

-- Create user management tables
CREATE TABLE IF NOT EXISTS public.user_management_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.user_management_actions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage user actions" ON public.user_management_actions
FOR ALL USING (is_app_admin(auth.uid()));

-- Create content moderation table
CREATE TABLE IF NOT EXISTS public.content_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'post', 'comment', 'review', 'profile'
  content_id UUID NOT NULL,
  reported_by UUID[],
  moderator_id UUID,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, flagged
  moderation_reason TEXT,
  automated_flags JSONB DEFAULT '[]',
  severity_level INTEGER DEFAULT 1, -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_moderation ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage content moderation" ON public.content_moderation
FOR ALL USING (is_app_admin(auth.uid()));

-- Create system configuration table
CREATE TABLE IF NOT EXISTS public.system_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'general', 'features', 'security', 'notifications'
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  data_type TEXT DEFAULT 'string', -- string, number, boolean, json
  is_public BOOLEAN DEFAULT false,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(category, key)
);

-- Enable RLS
ALTER TABLE public.system_configuration ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage system configuration" ON public.system_configuration
FOR ALL USING (is_app_admin(auth.uid()));

-- Create notification templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- email, push, in_app
  subject TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- available template variables
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage notification templates" ON public.notification_templates
FOR ALL USING (is_app_admin(auth.uid()));

-- Create bulk operations queue table
CREATE TABLE IF NOT EXISTS public.bulk_operation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL, -- 'user_export', 'bulk_message', 'data_cleanup'
  target_criteria JSONB NOT NULL,
  parameters JSONB DEFAULT '{}',
  status TEXT DEFAULT 'queued', -- queued, processing, completed, failed
  progress INTEGER DEFAULT 0,
  total_items INTEGER,
  processed_items INTEGER DEFAULT 0,
  error_details TEXT,
  created_by UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bulk_operation_queue ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage bulk operations" ON public.bulk_operation_queue
FOR ALL USING (is_app_admin(auth.uid()));

-- Insert default system configurations
INSERT INTO public.system_configuration (category, key, value, description, data_type, is_public) VALUES
('general', 'site_name', '"TalentXcel"', 'Application name', 'string', true),
('general', 'maintenance_mode', 'false', 'Enable maintenance mode', 'boolean', false),
('features', 'user_registration', 'true', 'Allow new user registration', 'boolean', false),
('features', 'email_verification', 'true', 'Require email verification', 'boolean', false),
('security', 'max_login_attempts', '5', 'Maximum login attempts before lockout', 'number', false),
('security', 'session_timeout', '3600', 'Session timeout in seconds', 'number', false),
('notifications', 'welcome_email', 'true', 'Send welcome email to new users', 'boolean', false),
('notifications', 'daily_digest', 'true', 'Enable daily digest emails', 'boolean', false)
ON CONFLICT (category, key) DO NOTHING;

-- Insert default notification templates
INSERT INTO public.notification_templates (name, type, subject, content, variables) VALUES
('welcome_email', 'email', 'Welcome to {{site_name}}!', 
 'Hi {{user_name}},\n\nWelcome to {{site_name}}! We''re excited to have you on board.\n\nBest regards,\nThe {{site_name}} Team', 
 '["user_name", "site_name"]'),
('password_reset', 'email', 'Reset your password', 
 'Hi {{user_name}},\n\nClick the link below to reset your password:\n{{reset_link}}\n\nIf you didn''t request this, please ignore this email.', 
 '["user_name", "reset_link"]'),
('account_suspended', 'email', 'Account suspended', 
 'Hi {{user_name}},\n\nYour account has been suspended for the following reason:\n{{reason}}\n\nContact support if you have questions.', 
 '["user_name", "reason"]')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_management_actions_admin ON public.user_management_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_user_management_actions_target ON public.user_management_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_type_id ON public.content_moderation(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_status ON public.content_moderation(status);
CREATE INDEX IF NOT EXISTS idx_system_configuration_category ON public.system_configuration(category);
CREATE INDEX IF NOT EXISTS idx_bulk_operation_queue_status ON public.bulk_operation_queue(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_moderation_updated_at 
    BEFORE UPDATE ON public.content_moderation 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_configuration_updated_at 
    BEFORE UPDATE ON public.system_configuration 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at 
    BEFORE UPDATE ON public.notification_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
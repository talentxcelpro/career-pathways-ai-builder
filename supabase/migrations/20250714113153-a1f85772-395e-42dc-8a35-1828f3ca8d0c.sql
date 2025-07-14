-- Email automation triggers and settings table
CREATE TABLE IF NOT EXISTS public.email_automation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type text NOT NULL,
  is_enabled boolean DEFAULT true,
  template_name text NOT NULL,
  subject_template text NOT NULL,
  delay_minutes integer DEFAULT 0,
  conditions jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(trigger_type)
);

-- Enable RLS
ALTER TABLE public.email_automation_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage email automation settings" 
ON public.email_automation_settings 
FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view active email settings" 
ON public.email_automation_settings 
FOR SELECT 
USING (is_enabled = true);

-- Email automation queue table
CREATE TABLE IF NOT EXISTS public.email_automation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type text NOT NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  template_data jsonb DEFAULT '{}',
  scheduled_at timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone,
  status text DEFAULT 'pending', -- pending, sent, failed
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_automation_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "System can manage email queue" 
ON public.email_automation_queue 
FOR ALL 
USING (true);

-- Insert default email automation settings
INSERT INTO public.email_automation_settings (trigger_type, is_enabled, template_name, subject_template) VALUES
('welcome_email', true, 'welcome', 'Welcome to TalentXcel, {{name}}!'),
('connection_request', true, 'new_connection', 'New connection request from {{requester_name}}'),
('job_recommendation', false, 'job_opening', 'Perfect job match: {{job_title}} at {{company_name}}'),
('application_confirmation', true, 'application_confirmation', 'Application confirmed: {{job_title}} at {{company_name}}'),
('team_invitation', true, 'invite_member', 'You''re invited to join {{company_name}} team'),
('password_reset', true, 'password_reset', 'Reset your TalentXcel password'),
('interview_scheduled', false, 'interview_scheduled', 'Interview scheduled: {{job_title}} at {{company_name}}'),
('monthly_digest', false, 'monthly_digest', 'Your monthly TalentXcel digest')
ON CONFLICT (trigger_type) DO NOTHING;

-- Function to queue automated emails
CREATE OR REPLACE FUNCTION public.queue_automated_email(
  p_trigger_type text,
  p_recipient_email text,
  p_recipient_name text DEFAULT NULL,
  p_template_data jsonb DEFAULT '{}',
  p_delay_minutes integer DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_id uuid;
  setting_record record;
BEGIN
  -- Check if trigger is enabled
  SELECT * INTO setting_record
  FROM public.email_automation_settings
  WHERE trigger_type = p_trigger_type AND is_enabled = true;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Queue the email
  INSERT INTO public.email_automation_queue (
    trigger_type,
    recipient_email,
    recipient_name,
    template_data,
    scheduled_at
  ) VALUES (
    p_trigger_type,
    p_recipient_email,
    p_recipient_name,
    p_template_data,
    now() + (COALESCE(p_delay_minutes, setting_record.delay_minutes, 0) || ' minutes')::interval
  ) RETURNING id INTO email_id;
  
  RETURN email_id;
END;
$$;

-- Trigger function for new user welcome emails
CREATE OR REPLACE FUNCTION public.trigger_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Queue welcome email after user profile is created
  PERFORM public.queue_automated_email(
    'welcome_email',
    (SELECT email FROM auth.users WHERE id = NEW.id),
    NEW.full_name,
    jsonb_build_object(
      'name', COALESCE(NEW.full_name, 'there'),
      'user_id', NEW.id
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for welcome emails
DROP TRIGGER IF EXISTS welcome_email_trigger ON public.profiles;
CREATE TRIGGER welcome_email_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_welcome_email();

-- Trigger function for connection requests
CREATE OR REPLACE FUNCTION public.trigger_connection_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  requester_profile record;
  recipient_profile record;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- Get requester profile
    SELECT * INTO requester_profile FROM public.profiles WHERE id = NEW.requester_id;
    -- Get recipient profile
    SELECT * INTO recipient_profile FROM public.profiles WHERE id = NEW.recipient_id;
    
    -- Queue connection request email
    PERFORM public.queue_automated_email(
      'connection_request',
      (SELECT email FROM auth.users WHERE id = NEW.recipient_id),
      recipient_profile.full_name,
      jsonb_build_object(
        'recipient_name', COALESCE(recipient_profile.full_name, 'there'),
        'requester_name', COALESCE(requester_profile.full_name, 'Someone'),
        'requester_title', requester_profile.title,
        'requester_company', requester_profile.company,
        'requester_bio', requester_profile.bio
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for connection emails (assuming connections table exists)
-- DROP TRIGGER IF EXISTS connection_email_trigger ON public.connections;
-- CREATE TRIGGER connection_email_trigger
--   AFTER INSERT ON public.connections
--   FOR EACH ROW
--   EXECUTE FUNCTION public.trigger_connection_email();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_email_automation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_email_automation_settings_updated_at
  BEFORE UPDATE ON public.email_automation_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_automation_updated_at();

CREATE TRIGGER update_email_automation_queue_updated_at
  BEFORE UPDATE ON public.email_automation_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_automation_updated_at();
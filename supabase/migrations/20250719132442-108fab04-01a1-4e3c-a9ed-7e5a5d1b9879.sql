-- Update email automation settings to enable all triggers with proper subjects
UPDATE public.email_automation_settings SET 
  is_enabled = true,
  subject_template = 'Application confirmed: {{job_title}} at {{company_name}}'
WHERE trigger_type = 'application_confirmation';

UPDATE public.email_automation_settings SET 
  is_enabled = true,
  subject_template = 'New connection request from {{requester_name}}'
WHERE trigger_type = 'connection_request';

UPDATE public.email_automation_settings SET 
  is_enabled = true,
  subject_template = 'Perfect job match: {{job_title}} at {{company_name}}'
WHERE trigger_type = 'job_recommendation';

UPDATE public.email_automation_settings SET 
  is_enabled = true,
  subject_template = 'Interview scheduled: {{job_title}} at {{company_name}}'
WHERE trigger_type = 'interview_scheduled';

UPDATE public.email_automation_settings SET 
  is_enabled = true,
  subject_template = 'Your monthly TalentXcel digest'
WHERE trigger_type = 'monthly_digest';

UPDATE public.email_automation_settings SET 
  is_enabled = true,
  subject_template = 'Reset your TalentXcel password'
WHERE trigger_type = 'password_reset';

UPDATE public.email_automation_settings SET 
  is_enabled = true,
  subject_template = 'You''re invited to join {{company_name}} team'
WHERE trigger_type = 'team_invitation';

UPDATE public.email_automation_settings SET 
  is_enabled = true,
  subject_template = 'Welcome to TalentXcel, {{name}}!'
WHERE trigger_type = 'welcome_email';

-- Insert missing email automation triggers
INSERT INTO public.email_automation_settings (trigger_type, is_enabled, template_name, subject_template) VALUES
('application_notification', true, 'application_notification', 'New application for {{job_title}}')
ON CONFLICT (trigger_type) DO UPDATE SET
  is_enabled = true,
  subject_template = 'New application for {{job_title}}';

-- Add email templates and improve existing ones
UPDATE public.email_automation_settings SET 
  template_name = CASE 
    WHEN trigger_type = 'application_confirmation' THEN 'application_confirmation'
    WHEN trigger_type = 'application_notification' THEN 'application_notification'
    WHEN trigger_type = 'connection_request' THEN 'connection_request'
    WHEN trigger_type = 'job_recommendation' THEN 'job_recommendation'
    WHEN trigger_type = 'interview_scheduled' THEN 'interview_scheduled'
    WHEN trigger_type = 'monthly_digest' THEN 'monthly_digest'
    WHEN trigger_type = 'password_reset' THEN 'password_reset'
    WHEN trigger_type = 'team_invitation' THEN 'team_invitation'
    WHEN trigger_type = 'welcome_email' THEN 'welcome_email'
    ELSE template_name
  END,
  updated_at = now();
-- Create unique constraint on template_name if it doesn't exist
ALTER TABLE email_automation_settings 
ADD CONSTRAINT email_automation_settings_template_name_key 
UNIQUE (template_name);

-- Insert test email template if it doesn't exist
INSERT INTO email_automation_settings (
  template_name,
  trigger_type,
  subject_template,
  html_template,
  is_enabled
) VALUES (
  'test_email',
  'test_email',
  'Test Email from TalentXcel',
  '<h1>Hello {{recipient_name}}!</h1><p>This is a test email from TalentXcel to verify the email system is working correctly.</p><p>Email sent at: {{timestamp}}</p>',
  true
) ON CONFLICT (template_name) DO UPDATE SET
  subject_template = EXCLUDED.subject_template,
  html_template = EXCLUDED.html_template,
  is_enabled = true,
  updated_at = now();

-- Insert welcome email template if it doesn't exist  
INSERT INTO email_automation_settings (
  template_name,
  trigger_type,
  subject_template,
  html_template,
  is_enabled
) VALUES (
  'welcome',
  'welcome',
  'Welcome to TalentXcel!',
  '<h1>Welcome {{recipient_name}}!</h1><p>Thank you for joining TalentXcel. We''re excited to help you advance your career!</p><p>Get started by completing your profile and exploring job opportunities.</p>',
  true
) ON CONFLICT (template_name) DO UPDATE SET
  subject_template = EXCLUDED.subject_template,
  html_template = EXCLUDED.html_template,
  is_enabled = true,
  updated_at = now();
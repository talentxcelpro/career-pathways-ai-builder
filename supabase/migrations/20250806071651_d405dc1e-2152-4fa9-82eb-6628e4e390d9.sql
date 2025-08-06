-- Create test email template for the email test button (fixing column name)
INSERT INTO public.email_automation_settings (
  id,
  trigger_type,
  template_name,
  is_enabled,
  subject_template,
  html_template,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test_email',
  'Test Email Template',
  true,
  '{{subject}}',
  '{{content}}',
  now(),
  now()
) ON CONFLICT (trigger_type) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  subject_template = EXCLUDED.subject_template,
  html_template = EXCLUDED.html_template,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = now();
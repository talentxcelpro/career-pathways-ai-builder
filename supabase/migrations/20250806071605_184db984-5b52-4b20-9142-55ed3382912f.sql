-- Create test email template for the email test button
INSERT INTO public.email_automation_settings (
  id,
  trigger_type,
  is_enabled,
  subject_template,
  html_template,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test_email',
  true,
  '{{subject}}',
  '{{content}}',
  now(),
  now()
) ON CONFLICT (trigger_type) DO UPDATE SET
  subject_template = EXCLUDED.subject_template,
  html_template = EXCLUDED.html_template,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = now();
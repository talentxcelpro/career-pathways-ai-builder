-- Add email event definition for campaign emails
INSERT INTO public.email_event_definitions (
  event_key,
  event_name,
  description,
  module_name,
  priority,
  is_enabled
) VALUES (
  'campaign.email',
  'Campaign Email',
  'Email sent as part of a marketing campaign',
  'marketing',
  'normal',
  true
)
ON CONFLICT (event_key) DO UPDATE SET
  event_name = EXCLUDED.event_name,
  description = EXCLUDED.description,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = now();
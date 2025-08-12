
-- 1) Store event content centrally
CREATE TABLE IF NOT EXISTS public.email_event_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key TEXT UNIQUE NOT NULL, -- e.g., 'welcome_email', 'application_confirmation'
  email_title_template TEXT NOT NULL,
  email_subheader_template TEXT DEFAULT '' NOT NULL,
  email_body_html_template TEXT NOT NULL, -- can contain {{placeholders}} and triple-stash {{{}}} blocks
  cta_text_template TEXT DEFAULT '' NOT NULL,
  cta_link_template TEXT DEFAULT '' NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  version INTEGER NOT NULL DEFAULT 1,
  updated_by UUID NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Extend delivery events with event_key (if missing) and add index
ALTER TABLE IF EXISTS public.email_delivery_events
  ADD COLUMN IF NOT EXISTS event_key TEXT;

CREATE INDEX IF NOT EXISTS idx_email_delivery_events_event_key
  ON public.email_delivery_events(event_key);

-- 3) Helpful indexes for queue throughput
CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled
  ON public.email_automation_queue(status, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_email_queue_trigger_type
  ON public.email_automation_queue(trigger_type);

-- 4) Seed core event definitions (idempotent upserts)
INSERT INTO public.email_event_definitions (event_key, email_title_template, email_subheader_template, email_body_html_template, cta_text_template, cta_link_template, is_enabled)
VALUES
  ('welcome_email',
    'Welcome to TalentXcel - Your Career Journey Starts Here! 🎉',
    'Thanks for joining us',
    '<p>Hi {{candidate_name}},</p><p>Welcome to TalentXcel! Start exploring jobs, courses, and connections.</p>',
    'Get Started',
    'https://talentxcel.in/dashboard',
    TRUE
  ),
  ('application_confirmation',
    'Application confirmed: {{job_title}} at {{company_name}}',
    'We received your application',
    '<p>Hi {{candidate_name}},</p><p>Your application for {{job_title}} at {{company_name}} has been confirmed.</p>',
    'View Application Status',
    'https://talentxcel.in/applications',
    TRUE
  ),
  ('profile_completion_reminder',
    'Complete Your TalentXcel Profile to Unlock All Features',
    'Your profile is almost complete',
    '<p>Hi {{candidate_name}},</p><p>Your profile is almost complete! Finish it to unlock exclusive features and jobs.</p>',
    'Complete Profile',
    'https://talentxcel.in/profile/edit',
    TRUE
  ),
  ('job_recommendation',
    'Perfect job match: {{job_title}} at {{company_name}}',
    'Jobs that fit your profile',
    '<p>Hi {{candidate_name}},</p><p>We found a job that matches your skills: {{job_title}} at {{company_name}}.</p>',
    'Apply Now',
    'https://talentxcel.in/jobs/{{job_id}}',
    TRUE
  ),
  ('connection_request',
    'New connection request from {{requester_name}}',
    'You have a new connection invitation',
    '<p>Hi {{candidate_name}},</p><p>{{requester_name}} sent you a connection request.</p>',
    'Respond to Request',
    'https://talentxcel.in/network/requests',
    TRUE
  ),
  ('interview_scheduled',
    'Interview scheduled: {{job_title}} at {{company_name}}',
    'Get ready for your interview',
    '<p>Hi {{candidate_name}},</p><p>Your interview for {{job_title}} at {{company_name}} is scheduled. Good luck!</p>',
    'View Details',
    'https://talentxcel.in/interviews',
    TRUE
  ),
  ('monthly_digest',
    'Your monthly TalentXcel digest',
    'See what happened this month',
    '<p>Hi {{candidate_name}},</p><p>Here is your TalentXcel activity summary for this month.</p>',
    'View Digest',
    'https://talentxcel.in/dashboard',
    TRUE
  ),
  ('test_email',
    '{{subject}}',
    '',
    '<p>This is a test email.</p>',
    'Visit TalentXcel',
    'https://talentxcel.in',
    TRUE
  )
ON CONFLICT (event_key) DO UPDATE SET
  email_title_template = EXCLUDED.email_title_template,
  email_subheader_template = EXCLUDED.email_subheader_template,
  email_body_html_template = EXCLUDED.email_body_html_template,
  cta_text_template = EXCLUDED.cta_text_template,
  cta_link_template = EXCLUDED.cta_link_template,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = now();

-- 5) Helper to enqueue emails by event (single entry point)
CREATE OR REPLACE FUNCTION public.enqueue_email_event(
  p_event_key TEXT,
  p_recipient_email TEXT,
  p_recipient_name TEXT DEFAULT NULL,
  p_template_data JSONB DEFAULT '{}'::jsonb,
  p_delay_minutes INTEGER DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_exists BOOLEAN;
  v_enabled BOOLEAN;
  v_id UUID;
BEGIN
  SELECT TRUE, is_enabled
  INTO v_exists, v_enabled
  FROM public.email_event_definitions
  WHERE event_key = p_event_key;

  IF NOT FOUND OR v_enabled IS NOT TRUE THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.email_automation_queue (
    trigger_type,
    recipient_email,
    recipient_name,
    template_data,
    scheduled_at
  ) VALUES (
    p_event_key,
    p_recipient_email,
    p_recipient_name,
    p_template_data,
    now() + make_interval(mins => COALESCE(p_delay_minutes, 0))
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END
$$;

-- 6) Enable scheduling and run queue periodically
-- Note: these require the extensions to be enabled in your project. Safe to run multiple times.
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Schedule smart-email-processor every 2 minutes
-- Uses anon key; function should allow verified JWTs from anon
SELECT
  cron.schedule(
    'smart-email-processor-every-2min',
    '*/2 * * * *',
    $$
    select
      net.http_post(
        url:='https://dthlgsnakhoftinssokm.supabase.co/functions/v1/smart-email-processor',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"}'::jsonb,
        body:='{"source":"pg_cron"}'::jsonb
      );
    $$
  );

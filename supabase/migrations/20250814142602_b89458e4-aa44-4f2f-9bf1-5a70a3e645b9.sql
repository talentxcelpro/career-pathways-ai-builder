-- Create event_email_mapping table
CREATE TABLE IF NOT EXISTS public.event_email_mapping (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name text NOT NULL UNIQUE,
    template_name text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insert all event mappings
INSERT INTO public.event_email_mapping (event_name, template_name) VALUES
('career_map_ready', 'career_map_ready'),
('application_confirmation', 'application_confirmation'),
('application_notification', 'application_notification'),
('campus_job_opportunity', 'campus_job_opportunity'),
('certificate_ready', 'certificate_ready'),
('college_resume_book', 'college_resume_book'),
('company_follower', 'company_follower'),
('company_review_alert', 'company_review_alert'),
('connection_accepted', 'connection_accepted'),
('connection_request', 'connection_request'),
('course_completion', 'course_completion'),
('course_recommendation', 'course_recommendation'),
('daily_job_digest', 'daily_job_digest'),
('employer_brand_score', 'employer_brand_score'),
('employer_onboarding', 'employer_onboarding'),
('event_invite', 'event_invite'),
('inactive_user_nudge', 'inactive_user_nudge'),
('incomplete_resume_reminder', 'incomplete_resume_reminder'),
('interview_scheduled', 'interview_scheduled'),
('job_posting_expiry', 'job_posting_expiry'),
('job_recommendation', 'job_recommendation'),
('job_status_update', 'job_status_update'),
('learning_progress_reminder', 'learning_progress_reminder'),
('mention_in_post', 'mention_in_post'),
('message_notification', 'message_notification'),
('milestone_achievement', 'milestone_achievement'),
('monthly_digest', 'monthly_digest'),
('new_applicant_notification', 'new_applicant_notification'),
('new_service_alert', 'new_service_alert'),
('password_reset', 'password_reset'),
('profile_completion_reminder', 'profile_completion_reminder'),
('profile_incomplete_nudge', 'profile_incomplete_nudge'),
('resume_created', 'resume_created'),
('resume_updated', 'resume_updated'),
('resume_viewed_by_employer', 'resume_viewed_by_employer'),
('resume_writing_feedback', 'resume_writing_feedback'),
('saved_job_reminder', 'saved_job_reminder'),
('student_spotlight', 'student_spotlight'),
('team_invitation', 'team_invitation'),
('test_email', 'test_email'),
('tool_access_alert', 'tool_access_alert'),
('weekly_activity_summary', 'weekly_activity_summary'),
('welcome', 'welcome'),
('welcome_email', 'welcome_email')
ON CONFLICT (event_name) DO NOTHING;

-- Create email_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name text NOT NULL UNIQUE,
    subject text NOT NULL,
    content text NOT NULL,
    html_template text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_email_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for event_email_mapping
CREATE POLICY "Admins can manage event email mapping" ON public.event_email_mapping
FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "System can read event email mapping" ON public.event_email_mapping
FOR SELECT USING (true);

-- Create policies for email_templates
CREATE POLICY "Admins can manage email templates" ON public.email_templates
FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "System can read email templates" ON public.email_templates
FOR SELECT USING (true);
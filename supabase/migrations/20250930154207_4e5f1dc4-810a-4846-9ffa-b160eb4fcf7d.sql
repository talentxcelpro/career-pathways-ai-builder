-- Create email_event_definitions table
CREATE TABLE IF NOT EXISTS public.email_event_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key TEXT NOT NULL UNIQUE,
  event_name TEXT NOT NULL,
  description TEXT NOT NULL,
  module_name TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create email_campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'one-time' CHECK (campaign_type IN ('one-time', 'recurring', 'trigger-based')),
  module_name TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed')),
  template_id UUID REFERENCES public.email_templates_v2(id),
  target_audience JSONB DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.email_event_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_event_definitions
CREATE POLICY "Admins can manage events" ON public.email_event_definitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Anyone can view enabled events" ON public.email_event_definitions
  FOR SELECT USING (is_enabled = true OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  ));

-- RLS policies for email_campaigns
CREATE POLICY "Admins can manage campaigns" ON public.email_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

-- Insert 40+ pre-configured email events across all 17 TalentXcel modules
INSERT INTO public.email_event_definitions (event_key, event_name, description, module_name, priority, is_enabled) VALUES
-- Authentication Module (3 events)
('auth.signup.welcome', 'Welcome Email', 'Sent when user completes signup', 'Authentication', 'high', true),
('auth.login.new_device', 'New Device Login', 'Alert when login from new device detected', 'Authentication', 'high', true),
('auth.password.reset', 'Password Reset', 'Sent when user requests password reset', 'Authentication', 'high', true),

-- Profile Module (4 events)
('profile.created', 'Profile Created', 'Welcome message after profile creation', 'Profile', 'normal', true),
('profile.completed', 'Profile Completion', 'Congratulations on completing profile', 'Profile', 'normal', true),
('profile.updated', 'Profile Updated', 'Confirmation of profile changes', 'Profile', 'low', true),
('profile.incomplete_reminder', 'Complete Your Profile', 'Reminder to complete profile sections', 'Profile', 'normal', true),

-- Resume Builder Module (5 events)
('resume.created', 'Resume Created', 'First resume creation confirmation', 'Resume Builder', 'normal', true),
('resume.ats_score_low', 'Improve Your Resume', 'Tips when ATS score is low', 'Resume Builder', 'normal', true),
('resume.ats_score_high', 'Great Resume!', 'Congratulations on high ATS score', 'Resume Builder', 'low', true),
('resume.exported', 'Resume Exported', 'Download link for exported resume', 'Resume Builder', 'normal', true),
('resume.feedback_request', 'Resume Feedback Ready', 'AI feedback available notification', 'Resume Builder', 'normal', true),

-- Job Search Module (6 events)
('job.match_found', 'New Job Match', 'AI found matching jobs', 'Job Search', 'high', true),
('job.application_submitted', 'Application Submitted', 'Confirmation of job application', 'Job Search', 'normal', true),
('job.application_status_update', 'Application Status Update', 'Status change notification', 'Job Search', 'high', true),
('job.saved_job_deadline', 'Application Deadline Soon', 'Reminder for saved jobs', 'Job Search', 'high', true),
('job.new_posting_alert', 'New Job Alert', 'Jobs matching your criteria posted', 'Job Search', 'normal', true),
('job.interview_scheduled', 'Interview Scheduled', 'Interview invitation received', 'Job Search', 'high', true),

-- AI Career Coach Module (4 events)
('ai_coach.session_summary', 'Career Coach Session Summary', 'Summary after AI coaching session', 'AI Career Coach', 'normal', true),
('ai_coach.goal_reminder', 'Career Goal Reminder', 'Weekly goal progress reminder', 'AI Career Coach', 'normal', true),
('ai_coach.milestone_achieved', 'Milestone Achieved!', 'Celebration of career milestone', 'AI Career Coach', 'normal', true),
('ai_coach.recommendation_ready', 'New Career Recommendations', 'AI has new career suggestions', 'AI Career Coach', 'normal', true),

-- Learning Module (4 events)
('learning.course_enrolled', 'Course Enrollment', 'Confirmation of course enrollment', 'Learning', 'normal', true),
('learning.course_completed', 'Course Completed!', 'Congratulations on completion', 'Learning', 'normal', true),
('learning.certificate_earned', 'Certificate Earned', 'New certificate available', 'Learning', 'high', true),
('learning.course_reminder', 'Continue Learning', 'Reminder to continue course', 'Learning', 'low', true),

-- Networking Module (5 events)
('network.connection_request', 'New Connection Request', 'Someone wants to connect', 'Networking', 'normal', true),
('network.connection_accepted', 'Connection Accepted', 'Your connection request accepted', 'Networking', 'normal', true),
('network.message_received', 'New Message', 'You have a new message', 'Networking', 'high', true),
('network.profile_view', 'Profile Viewed', 'Someone viewed your profile', 'Networking', 'low', true),
('network.endorsement_received', 'New Endorsement', 'Received skill endorsement', 'Networking', 'normal', true),

-- Collaboration Module (3 events)
('collab.opportunity_posted', 'Opportunity Posted', 'Your collaboration posted', 'Collaboration', 'normal', true),
('collab.application_received', 'Application Received', 'Someone applied to your opportunity', 'Collaboration', 'high', true),
('collab.session_invite', 'Session Invitation', 'Invited to collaboration session', 'Collaboration', 'high', true),

-- Analytics Module (2 events)
('analytics.weekly_report', 'Weekly Activity Report', 'Your weekly career progress', 'Analytics', 'low', true),
('analytics.monthly_insights', 'Monthly Career Insights', 'Monthly analytics and trends', 'Analytics', 'low', true),

-- Company Portal Module (3 events)
('company.job_posted', 'Job Posted Successfully', 'Your job posting is live', 'Company Portal', 'normal', true),
('company.application_received', 'New Application', 'Candidate applied to your job', 'Company Portal', 'high', true),
('company.profile_updated', 'Company Profile Updated', 'Profile changes confirmed', 'Company Portal', 'low', true),

-- Interview Prep Module (3 events)
('interview.prep_reminder', 'Interview Prep Reminder', 'Upcoming interview preparation', 'Interview Prep', 'high', true),
('interview.mock_completed', 'Mock Interview Completed', 'Feedback on mock interview', 'Interview Prep', 'normal', true),
('interview.tips_daily', 'Daily Interview Tip', 'Interview preparation tips', 'Interview Prep', 'low', true),

-- Skills Assessment Module (2 events)
('skills.assessment_completed', 'Assessment Completed', 'Results of skills assessment', 'Skills Assessment', 'normal', true),
('skills.new_assessment', 'New Assessment Available', 'Test your skills with new assessment', 'Skills Assessment', 'normal', true),

-- Mentorship Module (3 events)
('mentor.match_found', 'Mentor Match Found', 'We found you a mentor match', 'Mentorship', 'high', true),
('mentor.session_scheduled', 'Mentorship Session Scheduled', 'Your session is confirmed', 'Mentorship', 'normal', true),
('mentor.session_reminder', 'Session Reminder', 'Your mentorship session is soon', 'Mentorship', 'high', true),

-- Gamification Module (2 events)
('gamification.badge_earned', 'Badge Earned!', 'You earned a new badge', 'Gamification', 'normal', true),
('gamification.leaderboard_update', 'Leaderboard Update', 'Your rank has changed', 'Gamification', 'low', true),

-- System Module (2 events)
('system.security_alert', 'Security Alert', 'Important security notification', 'System', 'high', true),
('system.maintenance_notice', 'Maintenance Notice', 'Scheduled system maintenance', 'System', 'high', true)
ON CONFLICT (event_key) DO NOTHING;
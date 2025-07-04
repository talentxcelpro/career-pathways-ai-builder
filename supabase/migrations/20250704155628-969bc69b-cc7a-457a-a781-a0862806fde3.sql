-- Add missing columns to existing notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS module TEXT CHECK (module IN ('network', 'jobs', 'resume', 'tools', 'companies', 'learning', 'career_map', 'employer')),
ADD COLUMN IF NOT EXISTS link TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS sound BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Update user_id to be NOT NULL if it's currently nullable
UPDATE public.notifications SET user_id = auth.uid() WHERE user_id IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_module ON public.notifications(module);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Update existing notifications with module and link data
UPDATE public.notifications 
SET 
  module = CASE 
    WHEN type IN ('connection', 'follow', 'message') THEN 'network'
    WHEN type IN ('job_match', 'interview', 'application') THEN 'jobs'
    WHEN type IN ('resume_score', 'ats_score') THEN 'resume'
    WHEN type IN ('skill_test', 'assessment') THEN 'tools'
    WHEN type IN ('company_view', 'recruiter_interest') THEN 'companies'
    WHEN type IN ('course_complete', 'certificate') THEN 'learning'
    WHEN type IN ('goal_update', 'milestone') THEN 'career_map'
    WHEN type IN ('applicant', 'hire') THEN 'employer'
    ELSE 'network'
  END,
  link = CASE 
    WHEN type IN ('connection', 'follow') THEN '/network/requests'
    WHEN type = 'message' THEN '/network/messages'
    WHEN type = 'job_match' THEN '/jobs'
    WHEN type = 'resume_score' THEN '/resume/dashboard'
    ELSE '/network/notifications'
  END,
  icon = CASE 
    WHEN type IN ('connection', 'follow') THEN 'users'
    WHEN type = 'message' THEN 'message-square'
    WHEN type = 'job_match' THEN 'briefcase'
    WHEN type = 'resume_score' THEN 'file-text'
    WHEN type = 'like' THEN 'heart'
    WHEN type = 'comment' THEN 'message-circle'
    ELSE 'bell'
  END
WHERE module IS NULL OR link IS NULL OR icon IS NULL;
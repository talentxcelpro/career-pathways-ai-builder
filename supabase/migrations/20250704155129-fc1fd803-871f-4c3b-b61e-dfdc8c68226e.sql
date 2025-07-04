-- Notifications Table Schema for TalentXcel
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    module TEXT NOT NULL CHECK (module IN ('network', 'jobs', 'resume', 'tools', 'companies', 'learning', 'career_map', 'employer')),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT NOT NULL,
    icon TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    sound BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);

-- Index for fast unread lookups
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_module ON public.notifications(module);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read only their own notifications
CREATE POLICY "Users can read their own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own notifications (for system-generated notifications)
CREATE POLICY "Users can insert their own notifications" ON public.notifications
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON public.notifications
FOR DELETE USING (auth.uid() = user_id);

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION clean_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notifications 
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample notifications for demonstration
INSERT INTO public.notifications (user_id, module, type, title, message, link, icon, priority, sound) VALUES
(auth.uid(), 'jobs', 'job_match', 'New Job Match!', 'A Frontend Developer role at TechCorp matches your profile perfectly.', '/jobs/view/123', 'briefcase', 'high', true),
(auth.uid(), 'network', 'connection_request', 'New Connection Request', 'Rajesh Kumar wants to connect with you.', '/network/requests', 'users', 'medium', true),
(auth.uid(), 'resume', 'ats_score', 'Resume Score Updated', 'Your resume ATS score improved to 85%. Great job!', '/resume/dashboard', 'file-text', 'medium', false),
(auth.uid(), 'learning', 'course_complete', 'Course Completed!', 'Congratulations! You completed "React Advanced Patterns".', '/learning/certificates', 'award', 'high', true),
(auth.uid(), 'tools', 'skill_assessment', 'Skill Test Ready', 'Your JavaScript assessment results are now available.', '/tools/profile-score', 'zap', 'low', false);
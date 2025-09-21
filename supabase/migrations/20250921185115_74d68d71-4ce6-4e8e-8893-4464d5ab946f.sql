-- Phase 3: Complete Learning Platform Database Schema

-- Smart Learning Recommendations System
CREATE TABLE public.learning_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('course', 'path', 'skill', 'career', 'content')),
  target_id UUID NOT NULL, -- References courses, paths, etc.
  title TEXT NOT NULL,
  description TEXT,
  reasoning TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.50,
  priority INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  is_viewed BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interactive Learning Content System
CREATE TABLE public.learning_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  module_type TEXT NOT NULL CHECK (module_type IN ('video', 'text', 'quiz', 'assignment', 'interactive')),
  content JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT TRUE,
  prerequisites JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_module_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id UUID NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
  progress_percentage INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  completion_date TIMESTAMP WITH TIME ZONE,
  score DECIMAL(5,2),
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Certification & Assessment System
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('quiz', 'exam', 'project', 'skill_test')),
  course_id UUID,
  questions JSONB DEFAULT '[]',
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER,
  max_attempts INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_id UUID NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  status TEXT DEFAULT 'started' CHECK (status IN ('started', 'submitted', 'graded', 'passed', 'failed')),
  score DECIMAL(5,2),
  answers JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  graded_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT
);

CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID,
  assessment_id UUID,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('completion', 'achievement', 'skill', 'professional')),
  title TEXT NOT NULL,
  description TEXT,
  issuer TEXT DEFAULT 'TalentXcel',
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  verification_code TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Community Features
CREATE TABLE public.learning_forums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'question', 'announcement', 'resource')),
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  reply_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_reply_id UUID,
  like_count INTEGER DEFAULT 0,
  is_solution BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.mentorship_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL,
  mentee_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  expertise_areas JSONB DEFAULT '[]',
  goals TEXT,
  meeting_frequency TEXT DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, mentee_id)
);

-- Mobile Learning Experience
CREATE TABLE public.offline_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('course', 'module', 'video', 'document')),
  download_status TEXT DEFAULT 'pending' CHECK (download_status IN ('pending', 'downloading', 'completed', 'failed')),
  file_size_mb DECIMAL(10,2),
  download_progress INTEGER DEFAULT 0,
  downloaded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.push_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('learning_reminder', 'achievement', 'new_content', 'community', 'assessment')),
  data JSONB DEFAULT '{}',
  is_sent BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Partnership Portal Tables
CREATE TABLE public.company_learning_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  program_name TEXT NOT NULL,
  description TEXT,
  target_skills JSONB DEFAULT '[]',
  budget DECIMAL(12,2),
  duration_weeks INTEGER,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.program_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL,
  user_id UUID NOT NULL,
  enrollment_status TEXT DEFAULT 'enrolled' CHECK (enrollment_status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
  progress_percentage INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  performance_score DECIMAL(5,2),
  UNIQUE(program_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.learning_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_learning_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Learning Recommendations
CREATE POLICY "Users can view their own recommendations" 
ON public.learning_recommendations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage recommendations" 
ON public.learning_recommendations FOR ALL 
USING (true) WITH CHECK (true);

-- RLS Policies for Learning Modules
CREATE POLICY "Everyone can view learning modules" 
ON public.learning_modules FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage learning modules" 
ON public.learning_modules FOR ALL 
USING (is_current_user_admin());

-- RLS Policies for User Module Progress
CREATE POLICY "Users can manage their own progress" 
ON public.user_module_progress FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for Assessments
CREATE POLICY "Everyone can view active assessments" 
ON public.assessments FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage assessments" 
ON public.assessments FOR ALL 
USING (is_current_user_admin());

-- RLS Policies for User Assessments
CREATE POLICY "Users can manage their own assessments" 
ON public.user_assessments FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for Certificates
CREATE POLICY "Users can view their own certificates" 
ON public.certificates FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can issue certificates" 
ON public.certificates FOR INSERT 
WITH CHECK (true);

-- RLS Policies for Learning Forums
CREATE POLICY "Everyone can view public forums" 
ON public.learning_forums FOR SELECT 
USING (is_public = true);

CREATE POLICY "Admins can manage forums" 
ON public.learning_forums FOR ALL 
USING (is_current_user_admin());

-- RLS Policies for Forum Posts
CREATE POLICY "Everyone can view forum posts" 
ON public.forum_posts FOR SELECT 
USING (true);

CREATE POLICY "Users can create and manage their own posts" 
ON public.forum_posts FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for Forum Replies
CREATE POLICY "Everyone can view forum replies" 
ON public.forum_replies FOR SELECT 
USING (true);

CREATE POLICY "Users can create and manage their own replies" 
ON public.forum_replies FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for Mentorship Connections
CREATE POLICY "Users can view their mentorship connections" 
ON public.mentorship_connections FOR SELECT 
USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Users can manage their mentorship connections" 
ON public.mentorship_connections FOR ALL 
USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- RLS Policies for Offline Content
CREATE POLICY "Users can manage their own offline content" 
ON public.offline_content FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for Push Notifications
CREATE POLICY "Users can view their own notifications" 
ON public.push_notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage notifications" 
ON public.push_notifications FOR ALL 
USING (true);

-- RLS Policies for Company Learning Programs
CREATE POLICY "Everyone can view active programs" 
ON public.company_learning_programs FOR SELECT 
USING (status = 'active');

CREATE POLICY "Companies can manage their own programs" 
ON public.company_learning_programs FOR ALL 
USING (is_current_user_admin());

-- RLS Policies for Program Enrollments
CREATE POLICY "Users can view their own enrollments" 
ON public.program_enrollments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own enrollments" 
ON public.program_enrollments FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_learning_recommendations_user_id ON public.learning_recommendations(user_id);
CREATE INDEX idx_learning_recommendations_expires_at ON public.learning_recommendations(expires_at);
CREATE INDEX idx_learning_modules_course_id ON public.learning_modules(course_id);
CREATE INDEX idx_user_module_progress_user_module ON public.user_module_progress(user_id, module_id);
CREATE INDEX idx_user_assessments_user_id ON public.user_assessments(user_id);
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_verification_code ON public.certificates(verification_code);
CREATE INDEX idx_forum_posts_forum_id ON public.forum_posts(forum_id);
CREATE INDEX idx_forum_replies_post_id ON public.forum_replies(post_id);
CREATE INDEX idx_mentorship_connections_mentor_mentee ON public.mentorship_connections(mentor_id, mentee_id);
CREATE INDEX idx_offline_content_user_id ON public.offline_content(user_id);
CREATE INDEX idx_push_notifications_user_id ON public.push_notifications(user_id);
CREATE INDEX idx_program_enrollments_program_user ON public.program_enrollments(program_id, user_id);

-- Create functions for automatic certificate generation
CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CERT-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Function to automatically generate certificates on course completion
CREATE OR REPLACE FUNCTION public.auto_generate_certificate()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.certificates (
      user_id,
      course_id,
      certificate_type,
      title,
      description,
      verification_code
    ) VALUES (
      NEW.user_id,
      (SELECT course_id FROM public.learning_modules WHERE id = NEW.module_id),
      'completion',
      'Course Completion Certificate',
      'Successfully completed all course requirements',
      public.generate_verification_code()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic certificate generation
CREATE TRIGGER trigger_auto_generate_certificate
  AFTER UPDATE ON public.user_module_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_certificate();

-- Function to track user engagement metrics
CREATE OR REPLACE FUNCTION public.track_learning_engagement(
  p_user_id UUID,
  p_activity_type TEXT,
  p_content_id UUID,
  p_duration_minutes INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  engagement_id UUID;
BEGIN
  INSERT INTO public.user_engagement_analytics (
    user_id,
    activity_type,
    content_id,
    duration_minutes,
    created_at
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_content_id,
    p_duration_minutes,
    NOW()
  ) RETURNING id INTO engagement_id;
  
  RETURN engagement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
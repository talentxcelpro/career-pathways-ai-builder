-- URGENT: Fix critical RLS policies to prevent user data exposure

-- 1. Fix profiles table RLS - currently allows viewing all profiles
DROP POLICY IF EXISTS "Public profiles are visible to everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create secure profile policies
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view public profile data only" ON public.profiles  
FOR SELECT USING (auth.uid() != id AND (full_name IS NOT NULL OR username IS NOT NULL OR profile_picture_url IS NOT NULL));

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Fix job applications - prevent viewing other users' applications
DROP POLICY IF EXISTS "Job applications are viewable by applicant and job poster" ON public.job_applications;

CREATE POLICY "Users can view own applications" ON public.job_applications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Employers can view applications to their jobs" ON public.job_applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = job_applications.job_id 
    AND jobs.posted_by = auth.uid()
  )
);

CREATE POLICY "Users can create own applications" ON public.job_applications
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON public.job_applications
FOR UPDATE USING (auth.uid() = user_id);

-- 3. Fix CV files - ensure users can only access their own files
DROP POLICY IF EXISTS "Users can manage their own CV files" ON public.cv_files;

CREATE POLICY "Users can view own CV files" ON public.cv_files
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CV files" ON public.cv_files
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CV files" ON public.cv_files
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own CV files" ON public.cv_files
FOR DELETE USING (auth.uid() = user_id);

-- 4. Fix connections table - prevent viewing all connections
DROP POLICY IF EXISTS "Users can view their connections" ON public.connections;

CREATE POLICY "Users can view own connections" ON public.connections
FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create connection requests" ON public.connections
FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update connections involving them" ON public.connections
FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- 5. Fix posts - restrict access to private posts
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;

CREATE POLICY "Public posts are viewable by everyone" ON public.posts
FOR SELECT USING (visibility = 'public' AND is_public = true);

CREATE POLICY "Users can view own posts" ON public.posts
FOR SELECT USING (auth.uid() = user_id OR auth.uid() = author_id);

CREATE POLICY "Connected users can view each other's posts" ON public.posts
FOR SELECT USING (
  visibility = 'connections' AND 
  EXISTS (
    SELECT 1 FROM public.connections 
    WHERE status = 'accepted' 
    AND ((requester_id = auth.uid() AND recipient_id = posts.user_id) 
         OR (recipient_id = auth.uid() AND requester_id = posts.user_id))
  )
);

-- 6. Fix notifications - users should only see their own
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- 7. Secure admin tables from non-admin access
DROP POLICY IF EXISTS "Admins can view admin activity logs" ON public.admin_activity_log;

CREATE POLICY "Only super admins can view admin logs" ON public.admin_activity_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

-- 8. Fix security events - only admins and affected users can view
DROP POLICY IF EXISTS "Users can view their security events" ON public.security_events;

CREATE POLICY "Users can view own security events" ON public.security_events
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all security events" ON public.security_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

-- 9. Add missing RLS to user_journey_tracking
ALTER TABLE public.user_journey_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journey tracking" ON public.user_journey_tracking
FOR SELECT USING (auth.uid() = user_id);

-- 10. Add missing RLS to user_activities  
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" ON public.user_activities
FOR SELECT USING (auth.uid() = user_id);

-- 11. Secure AI chat data
DROP POLICY IF EXISTS "Users can manage their own chat sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Users can manage their own chat messages" ON public.ai_chat_messages;

CREATE POLICY "Users can access own chat sessions" ON public.ai_chat_sessions
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own chat messages" ON public.ai_chat_messages  
FOR ALL USING (auth.uid() = user_id);
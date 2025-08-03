-- Security Fix Migration: Enable RLS and fix critical security issues

-- First, enable RLS on all tables that don't have it enabled
ALTER TABLE public.analytics_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_job_posting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_automation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_wall ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_followings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elite_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elite_service_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_job_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_external_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_locations_india ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_locations_international ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_portal_blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_scraper_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_source_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_content_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

-- Fix security definer functions by adding proper search_path
CREATE OR REPLACE FUNCTION public.log_user_activity(p_user_id uuid, p_activity_type text, p_activity_title text, p_activity_description text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb, p_related_entity_type text DEFAULT NULL::text, p_related_entity_id uuid DEFAULT NULL::uuid, p_is_public boolean DEFAULT true)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  activity_id uuid;
BEGIN
  INSERT INTO public.user_activities (
    user_id,
    activity_type,
    activity_title,
    activity_description,
    metadata,
    related_entity_type,
    related_entity_id,
    is_public
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_activity_title,
    p_activity_description,
    p_metadata,
    p_related_entity_type,
    p_related_entity_id,
    p_is_public
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_connection_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Log connection request
    PERFORM public.log_user_activity(
      NEW.requester_id,
      'connection_requested',
      'Sent a connection request',
      'Sent a connection request to ' || COALESCE((SELECT full_name FROM public.profiles WHERE id = NEW.recipient_id), 'someone'),
      jsonb_build_object('recipient_id', NEW.recipient_id),
      'connection',
      NEW.id,
      true
    );
  END IF;
  
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    -- Log successful connection for both users
    PERFORM public.log_user_activity(
      NEW.requester_id,
      'connection_made',
      'Connected with a new professional',
      'Connected with ' || COALESCE((SELECT full_name FROM public.profiles WHERE id = NEW.recipient_id), 'a professional'),
      jsonb_build_object('connected_with', NEW.recipient_id),
      'connection',
      NEW.id,
      true
    );
    
    PERFORM public.log_user_activity(
      NEW.recipient_id,
      'connection_made',
      'Connected with a new professional',
      'Connected with ' || COALESCE((SELECT full_name FROM public.profiles WHERE id = NEW.requester_id), 'a professional'),
      jsonb_build_object('connected_with', NEW.requester_id),
      'connection',
      NEW.id,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_profile_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Log profile updates (except for login tracking)
  IF TG_OP = 'UPDATE' AND (
    OLD.full_name IS DISTINCT FROM NEW.full_name OR
    OLD.headline IS DISTINCT FROM NEW.headline OR
    OLD.about IS DISTINCT FROM NEW.about OR
    OLD.location IS DISTINCT FROM NEW.location OR
    OLD.profile_photo_url IS DISTINCT FROM NEW.profile_photo_url
  ) THEN
    PERFORM public.log_user_activity(
      NEW.id,
      'profile_updated',
      'Updated profile',
      'Made updates to their profile information',
      jsonb_build_object(
        'updated_fields', CASE
          WHEN OLD.full_name IS DISTINCT FROM NEW.full_name THEN jsonb_build_array('name')
          ELSE '[]'::jsonb
        END ||
        CASE
          WHEN OLD.headline IS DISTINCT FROM NEW.headline THEN jsonb_build_array('headline')
          ELSE '[]'::jsonb
        END ||
        CASE
          WHEN OLD.about IS DISTINCT FROM NEW.about THEN jsonb_build_array('about')
          ELSE '[]'::jsonb
        END ||
        CASE
          WHEN OLD.location IS DISTINCT FROM NEW.location THEN jsonb_build_array('location')
          ELSE '[]'::jsonb
        END ||
        CASE
          WHEN OLD.profile_photo_url IS DISTINCT FROM NEW.profile_photo_url THEN jsonb_build_array('photo')
          ELSE '[]'::jsonb
        END
      ),
      'profile',
      NEW.id,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add basic RLS policies for the most critical tables
-- Analytics tables - only accessible by admin users or data owners
CREATE POLICY "analytics_admin_access" ON public.analytics_performance FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "articles_public_read" ON public.articles FOR SELECT USING (is_published = true);
CREATE POLICY "articles_author_manage" ON public.articles FOR ALL USING (author_id = auth.uid());
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs FOR ALL USING (is_app_admin(auth.uid()));

-- Companies and related tables
CREATE POLICY "companies_public_read" ON public.companies FOR SELECT USING (true);
CREATE POLICY "company_profiles_public_read" ON public.company_profiles FOR SELECT USING (true);
CREATE POLICY "company_team_admin" ON public.company_team_members FOR ALL USING (
  is_company_admin_or_owner(company_id) OR user_id = auth.uid()
);

-- Job related tables
CREATE POLICY "jobs_public_read" ON public.jobs FOR SELECT USING (status = 'active');
CREATE POLICY "job_applications_user_manage" ON public.job_applications FOR ALL USING (user_id = auth.uid());
CREATE POLICY "saved_jobs_user_manage" ON public.saved_jobs FOR ALL USING (user_id = auth.uid());

-- User data protection
CREATE POLICY "resumes_user_manage" ON public.resumes FOR ALL USING (user_id = auth.uid());
CREATE POLICY "user_activities_user_view" ON public.user_activities FOR SELECT USING (
  user_id = auth.uid() OR is_public = true
);
CREATE POLICY "user_skills_user_manage" ON public.user_skills FOR ALL USING (user_id = auth.uid());
CREATE POLICY "user_experiences_user_manage" ON public.user_experiences FOR ALL USING (user_id = auth.uid());
CREATE POLICY "user_educations_user_manage" ON public.user_educations FOR ALL USING (user_id = auth.uid());

-- Posts and social features
CREATE POLICY "posts_public_read" ON public.posts FOR SELECT USING (is_public = true OR author_id = auth.uid());
CREATE POLICY "posts_author_manage" ON public.posts FOR ALL USING (author_id = auth.uid());
CREATE POLICY "likes_user_manage" ON public.likes FOR ALL USING (user_id = auth.uid());
CREATE POLICY "follows_user_manage" ON public.follows FOR ALL USING (follower_id = auth.uid());

-- Email and communication
CREATE POLICY "email_queue_admin_only" ON public.email_queue FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "email_campaigns_admin_only" ON public.email_campaigns FOR ALL USING (is_app_admin(auth.uid()));

-- System and admin tables
CREATE POLICY "global_settings_admin_only" ON public.global_settings FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "system_alerts_admin_only" ON public.system_alerts FOR ALL USING (is_app_admin(auth.uid()));

-- Blog and content
CREATE POLICY "blog_posts_public_read" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "blog_posts_author_manage" ON public.blog_posts FOR ALL USING (author_id = auth.uid() OR is_app_admin(auth.uid()));

-- Courses and learning
CREATE POLICY "courses_public_read" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "course_enrollments_user_manage" ON public.course_enrollments FOR ALL USING (user_id = auth.uid());
CREATE POLICY "course_progress_user_manage" ON public.course_progress FOR ALL USING (user_id = auth.uid());
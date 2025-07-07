-- Create comprehensive notification functions and triggers for all TalentXcel modules

-- Notification function for post activities
CREATE OR REPLACE FUNCTION public.notify_post_activities()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- New post notification to connections
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, type, title, message, module, related_id, link, priority, icon, sound, is_read, created_at)
    SELECT 
      c.recipient_id,
      'new_post',
      'New Post from Connection',
      (SELECT full_name FROM profiles WHERE id = NEW.author_id) || ' shared a new post',
      'network',
      NEW.id,
      '/network/posts',
      'low',
      'message-square',
      true,
      false,
      now()
    FROM connections c
    WHERE (c.requester_id = NEW.author_id OR c.recipient_id = NEW.author_id)
    AND c.status = 'accepted'
    AND c.recipient_id != NEW.author_id
    UNION
    SELECT 
      c.requester_id,
      'new_post',
      'New Post from Connection',
      (SELECT full_name FROM profiles WHERE id = NEW.author_id) || ' shared a new post',
      'network',
      NEW.id,
      '/network/posts',
      'low',
      'message-square',
      true,
      false,
      now()
    FROM connections c
    WHERE c.recipient_id = NEW.author_id
    AND c.status = 'accepted';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Notification function for post reactions
CREATE OR REPLACE FUNCTION public.notify_post_reactions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify post author about likes/reactions
    PERFORM public.create_notification(
      (SELECT author_id FROM posts WHERE id = NEW.post_id),
      'post_like',
      'Your Post Got a Reaction!',
      (SELECT full_name FROM profiles WHERE id = NEW.user_id) || ' reacted to your post',
      'network',
      NEW.post_id,
      '/network/posts',
      'low',
      'heart'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Notification function for post shares
CREATE OR REPLACE FUNCTION public.notify_post_shares()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify post author about shares
    PERFORM public.create_notification(
      (SELECT author_id FROM posts WHERE id = NEW.post_id),
      'post_share',
      'Your Post Was Shared!',
      (SELECT full_name FROM profiles WHERE id = NEW.user_id) || ' shared your post',
      'network',
      NEW.post_id,
      '/network/posts',
      'medium',
      'share'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Notification function for course activities
CREATE OR REPLACE FUNCTION public.notify_learning_activities()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- New course enrollment
  IF TG_TABLE_NAME = 'course_enrollments' AND TG_OP = 'INSERT' THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'course_enrolled',
      'Course Enrollment Confirmed',
      'You have successfully enrolled in: ' || (SELECT title FROM courses WHERE id = NEW.course_id),
      'learning',
      NEW.course_id,
      '/learning/my-courses',
      'medium',
      'book-open'
    );
  END IF;
  
  -- New course created
  IF TG_TABLE_NAME = 'courses' AND TG_OP = 'INSERT' THEN
    -- Notify users with similar interests
    INSERT INTO public.notifications (user_id, type, title, message, module, related_id, link, priority, icon, sound, is_read, created_at)
    SELECT 
      p.id,
      'new_course',
      'New Course Available!',
      'New course in ' || NEW.category || ': ' || NEW.title,
      'learning',
      NEW.id,
      '/learning/courses/' || NEW.id,
      'medium',
      'graduation-cap',
      true,
      false,
      now()
    FROM profiles p
    WHERE p.user_role = 'candidate'
    LIMIT 100; -- Limit to avoid spam
  END IF;
  
  RETURN NEW;
END;
$$;

-- Notification function for job activities
CREATE OR REPLACE FUNCTION public.notify_job_activities()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- New job posted
  IF TG_OP = 'INSERT' THEN
    -- Notify matching candidates
    INSERT INTO public.notifications (user_id, type, title, message, module, related_id, link, priority, icon, sound, is_read, created_at)
    SELECT 
      p.id,
      'new_job',
      'New Job Opportunity!',
      'New ' || NEW.title || ' position available',
      'jobs',
      NEW.id,
      '/jobs/' || NEW.id,
      'medium',
      'briefcase',
      true,
      false,
      now()
    FROM profiles p
    WHERE p.user_role = 'candidate'
    AND (p.title ILIKE '%' || SPLIT_PART(NEW.title, ' ', 1) || '%' OR NEW.title ILIKE '%' || SPLIT_PART(p.title, ' ', 1) || '%')
    LIMIT 50; -- Limit notifications
  END IF;
  
  RETURN NEW;
END;
$$;

-- Notification function for career mapping activities
CREATE OR REPLACE FUNCTION public.notify_career_mapping()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'career_goal_created',
      'Career Goal Created!',
      'Your career mapping journey has started for: ' || NEW.target_role,
      'career_map',
      NEW.id,
      '/career-map/my-roadmaps',
      'high',
      'map'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Notification function for company activities
CREATE OR REPLACE FUNCTION public.notify_company_activities()  
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Company follow notifications
  IF TG_TABLE_NAME = 'company_follows' AND TG_OP = 'INSERT' THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'company_followed',
      'Following Company',
      'You are now following ' || (SELECT name FROM companies WHERE id = NEW.company_id),
      'companies',
      NEW.company_id,
      '/companies/' || (SELECT slug FROM companies WHERE id = NEW.company_id),
      'low',
      'building'
    );
  END IF;
  
  -- New company post for followers
  IF TG_TABLE_NAME = 'company_posts' AND TG_OP = 'INSERT' AND NEW.status = 'published' THEN
    INSERT INTO public.notifications (user_id, type, title, message, module, related_id, link, priority, icon, sound, is_read, created_at)
    SELECT 
      cf.user_id,
      'company_post',
      'New Update from ' || (SELECT name FROM companies WHERE id = NEW.company_id),
      NEW.title,
      'companies',
      NEW.id,
      '/companies/' || (SELECT slug FROM companies WHERE id = NEW.company_id),
      'low',
      'building',
      false,
      false,
      now()
    FROM company_follows cf
    WHERE cf.company_id = NEW.company_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for all notification functions
DROP TRIGGER IF EXISTS notify_posts_trigger ON public.posts;
CREATE TRIGGER notify_posts_trigger
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.notify_post_activities();

DROP TRIGGER IF EXISTS notify_post_reactions_trigger ON public.post_reactions;
CREATE TRIGGER notify_post_reactions_trigger
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW EXECUTE FUNCTION public.notify_post_reactions();

DROP TRIGGER IF EXISTS notify_post_shares_trigger ON public.post_shares;
CREATE TRIGGER notify_post_shares_trigger
  AFTER INSERT ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION public.notify_post_shares();

DROP TRIGGER IF EXISTS notify_courses_trigger ON public.courses;
CREATE TRIGGER notify_courses_trigger
  AFTER INSERT ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.notify_learning_activities();

DROP TRIGGER IF EXISTS notify_course_enrollments_trigger ON public.course_enrollments;
CREATE TRIGGER notify_course_enrollments_trigger
  AFTER INSERT ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.notify_learning_activities();

DROP TRIGGER IF EXISTS notify_jobs_trigger ON public.jobs;
CREATE TRIGGER notify_jobs_trigger
  AFTER INSERT ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.notify_job_activities();

DROP TRIGGER IF EXISTS notify_career_goals_trigger ON public.career_goals;
CREATE TRIGGER notify_career_goals_trigger
  AFTER INSERT ON public.career_goals
  FOR EACH ROW EXECUTE FUNCTION public.notify_career_mapping();

DROP TRIGGER IF EXISTS notify_company_follows_trigger ON public.company_follows;
CREATE TRIGGER notify_company_follows_trigger
  AFTER INSERT ON public.company_follows
  FOR EACH ROW EXECUTE FUNCTION public.notify_company_activities();

DROP TRIGGER IF EXISTS notify_company_posts_trigger ON public.company_posts;
CREATE TRIGGER notify_company_posts_trigger
  AFTER INSERT ON public.company_posts
  FOR EACH ROW EXECUTE FUNCTION public.notify_company_activities();
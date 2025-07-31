-- Fix the problematic functions that reference jobs table without proper security context

-- Fix update_job_stats function to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.update_job_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update applications count
  IF TG_TABLE_NAME = 'job_applications' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE jobs 
      SET applications_count = COALESCE(applications_count, 0) + 1 
      WHERE id = NEW.job_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE jobs 
      SET applications_count = GREATEST(COALESCE(applications_count, 0) - 1, 0) 
      WHERE id = OLD.job_id;
    END IF;
  END IF;
  
  -- Update views count
  IF TG_TABLE_NAME = 'job_views' AND TG_OP = 'INSERT' THEN
    UPDATE jobs 
    SET views_count = COALESCE(views_count, 0) + 1 
    WHERE id = NEW.job_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix notify_job_application function to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.notify_job_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  job_poster_id UUID;
  job_title TEXT;
  applicant_name TEXT;
  applicant_email TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get job details and try to find the poster
    SELECT j.posted_by, j.title INTO job_poster_id, job_title
    FROM jobs j
    WHERE j.id = NEW.job_id;
    
    -- Get applicant details  
    SELECT p.full_name, p.email INTO applicant_name, applicant_email
    FROM profiles p
    WHERE p.id = NEW.user_id;
    
    -- If we found job details, create notification
    IF job_poster_id IS NOT NULL AND job_title IS NOT NULL THEN
      BEGIN
        INSERT INTO notifications (user_id, type, title, message, module, related_id, link, priority, icon, is_read, created_at)
        VALUES (
          job_poster_id,
          'application',
          'New Job Application',
          'Someone applied for your job: ' || job_title,
          'jobs',
          NEW.id,
          '/employer/jobs/' || NEW.job_id || '/applicants',
          'medium',
          'file-text',
          false,
          now()
        );
      EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the application
        RAISE NOTICE 'Failed to create application notification: %', SQLERRM;
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
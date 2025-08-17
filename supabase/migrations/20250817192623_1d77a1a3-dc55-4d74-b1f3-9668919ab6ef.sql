-- Set up automatic email triggers for welcome emails and other events (fixed)

-- Function to automatically queue welcome emails when a profile is created
CREATE OR REPLACE FUNCTION public.auto_queue_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue welcome email if user has an email address
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    INSERT INTO public.email_automation_queue (
      trigger_type,
      recipient_email,
      recipient_name,
      template_data,
      scheduled_at
    ) VALUES (
      'welcome',
      NEW.email,
      COALESCE(NEW.full_name, 'there'),
      jsonb_build_object(
        'name', COALESCE(NEW.full_name, 'there'),
        'first_name', COALESCE(NEW.full_name, 'there'),
        'email', NEW.email
      ),
      NOW() + INTERVAL '5 minutes'  -- 5 minute delay
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic welcome emails
DROP TRIGGER IF EXISTS trigger_auto_welcome_email ON public.profiles;
CREATE TRIGGER trigger_auto_welcome_email
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_queue_welcome_email();

-- Function to automatically queue job application confirmation emails
CREATE OR REPLACE FUNCTION public.auto_queue_application_email()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
  job_info RECORD;
BEGIN
  -- Get user profile information
  SELECT email, full_name INTO user_profile
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Get job information
  SELECT title, company_name INTO job_info
  FROM public.jobs
  WHERE id = NEW.job_id;
  
  -- Queue application confirmation email if user has email
  IF user_profile.email IS NOT NULL AND user_profile.email != '' THEN
    INSERT INTO public.email_automation_queue (
      trigger_type,
      recipient_email,
      recipient_name,
      template_data,
      scheduled_at
    ) VALUES (
      'job_application_received',
      user_profile.email,
      COALESCE(user_profile.full_name, 'there'),
      jsonb_build_object(
        'name', COALESCE(user_profile.full_name, 'there'),
        'job_title', COALESCE(job_info.title, 'the position'),
        'company_name', COALESCE(job_info.company_name, 'the company'),
        'application_date', NEW.applied_at
      ),
      NOW() + INTERVAL '2 minutes'  -- 2 minute delay
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for job application emails
DROP TRIGGER IF EXISTS trigger_auto_application_email ON public.job_applications;
CREATE TRIGGER trigger_auto_application_email
  AFTER INSERT ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_queue_application_email();
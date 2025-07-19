-- Fix the notify_job_application function to properly handle job posters
CREATE OR REPLACE FUNCTION public.notify_job_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
    
    -- If job has no posted_by, try to find the company owner/admin
    IF job_poster_id IS NULL THEN
      SELECT ctm.user_id INTO job_poster_id
      FROM jobs j
      JOIN company_team_members ctm ON j.company_id = ctm.company_id
      WHERE j.id = NEW.job_id 
      AND ctm.role IN ('owner', 'admin')
      AND ctm.is_active = true
      ORDER BY 
        CASE ctm.role 
          WHEN 'owner' THEN 1 
          WHEN 'admin' THEN 2 
        END
      LIMIT 1;
    END IF;
    
    -- Notify job poster about new application (if we found a poster)
    IF job_poster_id IS NOT NULL THEN
      PERFORM public.create_notification(
        job_poster_id,
        'application',
        'New Job Application',
        'Someone applied for your job: ' || job_title,
        'jobs',
        NEW.id,
        '/employer/jobs/' || NEW.job_id || '/applicants',
        'medium',
        'file-text'
      );
      
      -- Queue email notification for job poster
      PERFORM public.queue_automated_email(
        'application_notification',
        (SELECT email FROM auth.users WHERE id = job_poster_id),
        (SELECT full_name FROM profiles WHERE id = job_poster_id),
        jsonb_build_object(
          'job_title', job_title,
          'applicant_name', COALESCE(applicant_name, 'Unknown'),
          'applicant_email', COALESCE(applicant_email, 'Unknown'),
          'job_id', NEW.job_id,
          'application_id', NEW.id
        )
      );
    END IF;
    
    -- Notify applicant about successful application
    PERFORM public.create_notification(
      NEW.user_id,
      'application_sent',
      'Application Submitted',
      'Your application for ' || job_title || ' has been submitted successfully.',
      'jobs',
      NEW.id,
      '/jobs/my-applications',
      'low',
      'check-circle'
    );
    
    -- Queue confirmation email for applicant
    PERFORM public.queue_automated_email(
      'application_confirmation',
      applicant_email,
      applicant_name,
      jsonb_build_object(
        'job_title', job_title,
        'application_id', NEW.id,
        'name', COALESCE(applicant_name, 'there')
      )
    );
  END IF;
  
  -- Notify about status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    SELECT j.title INTO job_title FROM jobs j WHERE j.id = NEW.job_id;
    
    PERFORM public.create_notification(
      NEW.user_id,
      'application_status',
      'Application Status Update',
      'Your application status for ' || job_title || ' has been updated to: ' || NEW.status,
      'jobs',
      NEW.id,
      '/jobs/my-applications',
      CASE NEW.status 
        WHEN 'accepted' THEN 'high'
        WHEN 'rejected' THEN 'medium'
        ELSE 'low'
      END,
      CASE NEW.status 
        WHEN 'accepted' THEN 'check-circle'
        WHEN 'rejected' THEN 'x-circle'
        ELSE 'clock'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add email automation setting for application notifications to job posters
INSERT INTO public.email_automation_settings (
  trigger_type,
  template_name,
  subject_template,
  html_template,
  is_enabled,
  delay_minutes
) VALUES (
  'application_notification',
  'job_application_notification',
  'New application for {{job_title}}',
  '
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">New Job Application! 📋</h1>
    <p style="color: #6b7280; margin: 5px 0;">Someone applied for your job posting</p>
  </div>
  
  <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
    <h3 style="color: #0c4a6e; margin: 0 0 15px 0;">{{applicant_name}} applied for:</h3>
    <h2 style="color: #0369a1; margin: 5px 0; font-size: 20px;">{{job_title}}</h2>
    <p style="color: #0369a1; margin: 5px 0;">📧 {{applicant_email}}</p>
  </div>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
    <h4 style="color: #1e293b; margin: 0 0 10px 0;">Next Steps:</h4>
    <ul style="color: #64748b; line-height: 1.6; padding-left: 20px; margin: 0;">
      <li>Review the candidate''s profile and resume</li>
      <li>Schedule an interview if interested</li>
      <li>Update the application status</li>
    </ul>
  </div>
  
  <div style="text-align: center; margin: 25px 0;">
    <a href="https://talentxcel.in/employer/jobs/{{job_id}}/applicants" style="background: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Review Application</a>
  </div>
  
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
    <p style="margin: 0;">This email was sent automatically by TalentXcel.</p>
    <p style="margin: 5px 0 0 0;">Need help? Contact us at <a href="mailto:support@talentxcel.in" style="color: #3b82f6;">support@talentxcel.in</a></p>
  </div>
</div>',
  true,
  0
) ON CONFLICT (trigger_type) DO UPDATE SET
  subject_template = EXCLUDED.subject_template,
  html_template = EXCLUDED.html_template,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = NOW();
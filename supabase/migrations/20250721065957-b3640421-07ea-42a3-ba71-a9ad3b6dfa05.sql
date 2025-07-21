
-- Add profile completion reminder trigger to email automation settings
INSERT INTO public.email_automation_settings (
  trigger_type, 
  is_enabled, 
  template_name, 
  subject_template, 
  delay_minutes,
  html_template
) VALUES (
  'profile_completion_reminder',
  true,
  'profile_completion_reminder',
  'Complete Your TalentXcel Profile to Unlock All Features',
  1440, -- 24 hours delay
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Profile</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">You''re Almost There — Complete Your Profile to Access Everything</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">We noticed your profile on TalentXcel is still incomplete. To access the full range of features designed to support your career growth, please take a moment to complete your profile.</p>
    
    <p style="font-size: 16px; margin-bottom: 15px; font-weight: bold;">Once your profile is complete, you''ll be able to:</p>
    
    <ul style="font-size: 16px; margin-bottom: 25px; padding-left: 20px;">
      <li style="margin-bottom: 8px;">📝 Share posts and expand your professional network</li>
      <li style="margin-bottom: 8px;">💼 Discover and apply for jobs that match your skills</li>
      <li style="margin-bottom: 8px;">🎓 Access personalized learning and upskilling resources</li>
      <li style="margin-bottom: 8px;">🛠️ Use powerful career tools built to guide your journey</li>
      <li style="margin-bottom: 8px;">🤖 Build professional resumes with AI-powered assistance</li>
      <li style="margin-bottom: 8px;">🗺️ Explore smart career mapping based on your goals</li>
    </ul>
    
    <p style="font-size: 16px; margin-bottom: 25px; font-weight: bold; color: #667eea;">It takes less than 2 minutes to complete your profile and unlock the full experience.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://talentxcel.in/profile/edit" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Complete My Profile</a>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px; font-style: italic; color: #555;">Your career deserves a strong start. Let TalentXcel help you take the next step.</p>
    
    <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
      <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Best regards,<br>The TalentXcel Team</p>
      <p style="font-size: 14px; color: #667eea; margin: 0;">
        <a href="https://talentxcel.in" style="color: #667eea; text-decoration: none;">www.talentxcel.in</a>
      </p>
    </div>
  </div>
  
  <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
    <p style="font-size: 12px; color: #666; margin: 0;">This email was sent to help you get the most out of TalentXcel. If you no longer wish to receive these emails, you can unsubscribe at any time.</p>
  </div>
</body>
</html>'
) ON CONFLICT (trigger_type) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  template_name = EXCLUDED.template_name,
  subject_template = EXCLUDED.subject_template,
  delay_minutes = EXCLUDED.delay_minutes,
  html_template = EXCLUDED.html_template,
  updated_at = now();

-- Create function to queue profile completion reminders
CREATE OR REPLACE FUNCTION queue_profile_completion_reminders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reminder_count INTEGER := 0;
  user_record RECORD;
BEGIN
  -- Find users with incomplete profiles who haven't received this reminder in the last 7 days
  FOR user_record IN
    SELECT 
      p.id,
      p.full_name,
      au.email,
      p.profile_completed
    FROM public.profiles p
    JOIN auth.users au ON p.id = au.id
    WHERE p.profile_completed = false
      AND p.created_at < now() - INTERVAL '24 hours' -- Account created at least 24 hours ago
      AND NOT EXISTS (
        SELECT 1 FROM public.email_automation_queue eaq
        WHERE eaq.trigger_type = 'profile_completion_reminder'
          AND eaq.recipient_email = au.email
          AND eaq.created_at > now() - INTERVAL '7 days'
      )
    LIMIT 100 -- Process in batches
  LOOP
    -- Queue the reminder email
    PERFORM public.queue_automated_email(
      'profile_completion_reminder',
      user_record.email,
      user_record.full_name,
      jsonb_build_object(
        'name', COALESCE(user_record.full_name, 'there'),
        'recipient_name', COALESCE(user_record.full_name, 'there'),
        'user_id', user_record.id
      ),
      0 -- Send immediately
    );
    
    reminder_count := reminder_count + 1;
  END LOOP;
  
  RETURN reminder_count;
END;
$$;

-- Create function to trigger profile completion reminder for new users
CREATE OR REPLACE FUNCTION trigger_profile_completion_reminder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only trigger for users who haven't completed their profile after 24 hours
  IF NEW.profile_completed = false THEN
    PERFORM public.queue_automated_email(
      'profile_completion_reminder',
      (SELECT email FROM auth.users WHERE id = NEW.id),
      NEW.full_name,
      jsonb_build_object(
        'name', COALESCE(NEW.full_name, 'there'),
        'recipient_name', COALESCE(NEW.full_name, 'there'),
        'user_id', NEW.id
      ),
      1440 -- 24 hours delay
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new profile creation
DROP TRIGGER IF EXISTS profile_completion_reminder_trigger ON public.profiles;
CREATE TRIGGER profile_completion_reminder_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_profile_completion_reminder();

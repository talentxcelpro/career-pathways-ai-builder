-- Fix email_delivery_events table structure
ALTER TABLE public.email_delivery_events 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS delivery_attempt INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS delivery_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS bounce_type TEXT,
ADD COLUMN IF NOT EXISTS complaint_type TEXT;

-- Create missing email templates using correct column names (including required content column)
INSERT INTO public.email_templates (name, template_type, subject, content, html_template, is_active)
VALUES 
('welcome_email', 'notification', 
 'Welcome to TalentXcel, {{candidate_name}}!',
 'Welcome to TalentXcel, {{candidate_name}}! Your journey to career success starts here.',
 '<!DOCTYPE html><html><head><title>Welcome to TalentXcel</title></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; border-radius: 8px; text-align: center;"><h1>Welcome to TalentXcel, {{candidate_name}}! 🎉</h1><p>Your journey to career success starts here.</p></div><div style="padding: 30px 0;"><h2>What''s Next?</h2><ul><li>✅ Complete your profile to get better matches</li><li>✅ Upload your resume</li><li>✅ Browse thousands of jobs</li><li>✅ Connect with professionals</li></ul><div style="text-align: center; margin: 30px 0;"><a href="https://talentxcel.in/profile" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Profile</a></div></div><div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #666; font-size: 14px;"><p>Best regards,<br>The TalentXcel Team</p><p><a href="https://talentxcel.in">talentxcel.in</a> | <a href="mailto:support@talentxcel.in">support@talentxcel.in</a></p></div></body></html>', 
 true),

('application_confirmation', 'notification',
 'Application Submitted - {{job_title}}',
 'Application Received! We''ve received your application for {{job_title}} at {{company_name}}.',
 '<!DOCTYPE html><html><head><title>Application Confirmed</title></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: #10b981; color: white; padding: 30px; border-radius: 8px; text-align: center;"><h1>Application Received! ✅</h1><p>We''ve received your application for {{job_title}} at {{company_name}}.</p></div><div style="padding: 30px 0;"><h2>What happens next?</h2><ol><li>Your application is being reviewed by the hiring team</li><li>You''ll receive updates via email</li><li>Keep exploring more opportunities on TalentXcel</li></ol><div style="text-align: center; margin: 30px 0;"><a href="https://talentxcel.in/jobs" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Find More Jobs</a></div></div><div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #666; font-size: 14px;"><p>Good luck with your application!<br>The TalentXcel Team</p></div></body></html>',
 true),

('employer_approval', 'notification',
 'Your Employer Account is Approved! 🎉',
 'Congratulations! Your employer account has been approved and is now active.',
 '<!DOCTYPE html><html><head><title>Employer Approved</title></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: #7c3aed; color: white; padding: 30px; border-radius: 8px; text-align: center;"><h1>Congratulations! 🎉</h1><p>Your employer account has been approved and is now active.</p></div><div style="padding: 30px 0;"><h2>Start Hiring Today</h2><ul><li>✅ Post unlimited job openings</li><li>✅ Access our talent pool</li><li>✅ Use advanced filtering tools</li><li>✅ Get premium employer features</li></ul><div style="text-align: center; margin: 30px 0;"><a href="https://talentxcel.in/employer/post-job" style="background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Post Your First Job</a></div></div><div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #666; font-size: 14px;"><p>Welcome to TalentXcel!<br>The TalentXcel Team</p></div></body></html>',
 true),

('profile_reminder', 'reminder',
 'Complete Your Profile - {{candidate_name}}',
 'Hi {{candidate_name}}, complete your profile to unlock all features.',
 '<!DOCTYPE html><html><head><title>Profile Reminder</title></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: #f59e0b; color: white; padding: 30px; border-radius: 8px; text-align: center;"><h1>Don''t Miss Out! ⏰</h1><p>Hi {{candidate_name}}, complete your profile to unlock all features.</p></div><div style="padding: 30px 0;"><h2>Why Complete Your Profile?</h2><ul><li>🎯 Get 3x more job matches</li><li>📈 Increase visibility to recruiters</li><li>🔓 Access exclusive opportunities</li><li>⭐ Stand out from other candidates</li></ul><div style="text-align: center; margin: 30px 0;"><a href="https://talentxcel.in/profile" style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Profile Now</a></div></div><div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #666; font-size: 14px;"><p>Best regards,<br>The TalentXcel Team</p></div></body></html>',
 true),

('job_match', 'recommendation',
 'Perfect Job Match Found - {{job_title}}',
 'Perfect Match Found! We found a job that matches your skills and preferences.',
 '<!DOCTYPE html><html><head><title>Job Match</title></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: #06b6d4; color: white; padding: 30px; border-radius: 8px; text-align: center;"><h1>Perfect Match Found! 🎯</h1><p>We found a job that matches your skills and preferences.</p></div><div style="padding: 30px 0;"><div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #06b6d4;"><h3>{{job_title}}</h3><p><strong>Company:</strong> {{company_name}}</p><p><strong>Location:</strong> {{location}}</p><p><strong>Experience:</strong> {{experience_level}}</p></div><div style="text-align: center; margin: 30px 0;"><a href="https://talentxcel.in/jobs/{{job_id}}" style="background: #06b6d4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Job Details</a></div></div><div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #666; font-size: 14px;"><p>Happy job hunting!<br>The TalentXcel Team</p></div></body></html>',
 true)

ON CONFLICT (name) DO UPDATE SET
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  html_template = EXCLUDED.html_template,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Create email analytics view
CREATE OR REPLACE VIEW public.email_analytics AS
SELECT 
  DATE(created_at) as date,
  provider,
  status,
  COUNT(*) as count,
  AVG(response_time_ms) as avg_response_time
FROM public.email_delivery_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), provider, status
ORDER BY date DESC;
-- Fix email automation template system
-- 1. Clean up corrupted email queue entries
DELETE FROM email_automation_queue 
WHERE trigger_type LIKE '<!DOCTYPE%' OR trigger_type LIKE '<html%' OR LENGTH(trigger_type) > 100;

-- 2. Create proper email template system
CREATE TABLE IF NOT EXISTS public.email_templates_v2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create email automation triggers table
CREATE TABLE IF NOT EXISTS public.email_automation_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_key TEXT NOT NULL UNIQUE,
  trigger_name TEXT NOT NULL,
  trigger_category TEXT NOT NULL,
  template_key TEXT NOT NULL,
  conditions JSONB DEFAULT '{}'::jsonb,
  frequency_limit TEXT DEFAULT 'none', -- none, daily, weekly, monthly
  is_enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5, -- 1-10, higher = more important
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (template_key) REFERENCES email_templates_v2(template_key)
);

-- 4. Enable RLS
ALTER TABLE public.email_templates_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_automation_triggers ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
CREATE POLICY "Admins can manage email templates" 
ON public.email_templates_v2 FOR ALL 
USING (is_current_user_admin());

CREATE POLICY "Anyone can view active templates" 
ON public.email_templates_v2 FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage triggers" 
ON public.email_automation_triggers FOR ALL 
USING (is_current_user_admin());

CREATE POLICY "Anyone can view enabled triggers" 
ON public.email_automation_triggers FOR SELECT 
USING (is_enabled = true);

-- 6. Insert core email templates
INSERT INTO public.email_templates_v2 (template_key, template_name, category, subject_template, html_template, variables) VALUES 
('welcome_user', 'Welcome to TalentXcel', 'onboarding', 'Welcome to TalentXcel - Your Career Journey Starts Here!', '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Welcome to TalentXcel</title></head><body style="font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px;"><div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);"><div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 40px 30px; text-align: center; color: white;"><h1 style="margin: 0; font-size: 28px;">Welcome to TalentXcel! 🚀</h1><p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your career journey starts here</p></div><div style="padding: 40px 30px;"><p style="font-size: 16px; margin-bottom: 20px; color: #374151;">Hi {{user_name}},</p><p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 25px;">Welcome to TalentXcel! We''re excited to have you join our professional community where careers flourish and connections matter.</p><div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 30px 0;"><h3 style="margin: 0 0 15px; color: #1e40af; font-size: 18px;">🎯 Here''s what you can do now:</h3><ul style="margin: 0; padding-left: 20px;"><li style="margin-bottom: 10px; color: #374151;">Complete your profile to attract recruiters</li><li style="margin-bottom: 10px; color: #374151;">Explore thousands of job opportunities</li><li style="margin-bottom: 10px; color: #374151;">Connect with industry professionals</li><li style="margin-bottom: 10px; color: #374151;">Access AI-powered career tools</li><li style="margin-bottom: 10px; color: #374151;">Join professional learning paths</li></ul></div><div style="text-align: center; margin: 35px 0;"><a href="https://talentxcel.in/onboarding" style="background: #1e40af; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Complete Your Profile</a></div><p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Need help? Reply to this email or visit our <a href="https://talentxcel.in/help" style="color: #1e40af;">Help Center</a></p></div><div style="background: #f8fafc; padding: 25px; text-align: center; color: #6b7280; font-size: 14px;">© {{current_year}} TalentXcel. Empowering careers worldwide.<br><a href="https://talentxcel.in" style="color: #1e40af; text-decoration: none;">Visit Website</a> | <a href="{{unsubscribe_url}}" style="color: #6b7280;">Unsubscribe</a></div></div></body></html>', '["user_name", "current_year", "unsubscribe_url"]'::jsonb),

('profile_reminder', 'Complete Your TalentXcel Profile', 'engagement', 'Complete Your Profile - Unlock {{completion_percentage}}% More Opportunities', '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Complete Your Profile</title></head><body style="font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px;"><div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);"><div style="background: linear-gradient(135deg, #059669, #10b981); padding: 40px 30px; text-align: center; color: white;"><h1 style="margin: 0; font-size: 28px;">Complete Your Profile ✨</h1><p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">You''re {{completion_percentage}}% there!</p></div><div style="padding: 40px 30px;"><p style="font-size: 16px; margin-bottom: 20px; color: #374151;">Hi {{user_name}},</p><p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 25px;">Your TalentXcel profile is {{completion_percentage}}% complete. Just a few more steps to unlock the full potential of our platform!</p><div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;"><p style="margin: 0; color: #92400e; font-weight: bold;">💡 Complete profiles get 3x more job matches and recruiter views!</p></div><div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 30px 0;"><h3 style="margin: 0 0 15px; color: #059669; font-size: 18px;">🚀 What you''ll unlock:</h3><ul style="margin: 0; padding-left: 20px;"><li style="margin-bottom: 10px; color: #374151;">AI-powered job recommendations</li><li style="margin-bottom: 10px; color: #374151;">Priority visibility to recruiters</li><li style="margin-bottom: 10px; color: #374151;">Professional networking features</li><li style="margin-bottom: 10px; color: #374151;">Skills verification badges</li><li style="margin-bottom: 10px; color: #374151;">Career roadmap insights</li></ul></div><div style="text-align: center; margin: 35px 0;"><a href="https://talentxcel.in/profile/edit" style="background: #059669; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Complete My Profile</a></div></div><div style="background: #f8fafc; padding: 25px; text-align: center; color: #6b7280; font-size: 14px;">© {{current_year}} TalentXcel. Empowering careers worldwide.</div></div></body></html>', '["user_name", "completion_percentage", "current_year"]'::jsonb),

('job_alert', 'New Job Match Found!', 'jobs', '{{match_count}} Perfect Job Matches for {{user_name}}', '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>New Job Matches</title></head><body style="font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px;"><div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);"><div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 40px 30px; text-align: center; color: white;"><h1 style="margin: 0; font-size: 28px;">New Job Matches! 🎯</h1><p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">{{match_count}} opportunities waiting for you</p></div><div style="padding: 40px 30px;"><p style="font-size: 16px; margin-bottom: 20px; color: #374151;">Hi {{user_name}},</p><p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 25px;">Great news! We found {{match_count}} new job opportunities that match your skills and career goals.</p><div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 30px 0;"><h3 style="margin: 0 0 15px; color: #7c3aed; font-size: 18px;">🔥 Top Match:</h3><div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: white;"><h4 style="margin: 0 0 10px; color: #1f2937;">{{top_job_title}}</h4><p style="margin: 0 0 5px; color: #6b7280;">{{top_job_company}} • {{top_job_location}}</p><p style="margin: 0 0 10px; color: #059669; font-weight: bold;">{{top_job_match_score}}% Match</p><p style="margin: 0; color: #374151; font-size: 14px;">{{top_job_snippet}}</p></div></div><div style="text-align: center; margin: 35px 0;"><a href="https://talentxcel.in/jobs/matches" style="background: #7c3aed; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">View All Matches</a></div></div><div style="background: #f8fafc; padding: 25px; text-align: center; color: #6b7280; font-size: 14px;">© {{current_year}} TalentXcel. Empowering careers worldwide.</div></div></body></html>', '["user_name", "match_count", "top_job_title", "top_job_company", "top_job_location", "top_job_match_score", "top_job_snippet", "current_year"]'::jsonb),

('security_alert', 'Security Alert - New Login Detected', 'security', 'New login to your TalentXcel account', '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Security Alert</title></head><body style="font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px;"><div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);"><div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 40px 30px; text-align: center; color: white;"><h1 style="margin: 0; font-size: 28px;">Security Alert 🔒</h1><p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">New login detected</p></div><div style="padding: 40px 30px;"><p style="font-size: 16px; margin-bottom: 20px; color: #374151;">Hi {{user_name}},</p><p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 25px;">We detected a new login to your TalentXcel account. Please review the details below:</p><div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 4px;"><h3 style="margin: 0 0 15px; color: #dc2626;">Login Details:</h3><ul style="margin: 0; padding-left: 20px; color: #374151;"><li>Time: {{login_time}}</li><li>Device: {{device_info}}</li><li>Location: {{location}}</li><li>IP Address: {{ip_address}}</li></ul></div><p style="color: #374151; margin: 25px 0;">If this was you, no action is needed. If you don''t recognize this login, please secure your account immediately.</p><div style="text-align: center; margin: 35px 0;"><a href="https://talentxcel.in/security" style="background: #dc2626; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin-right: 10px;">Secure Account</a><a href="https://talentxcel.in/sessions" style="background: transparent; color: #dc2626; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; border: 2px solid #dc2626;">View Sessions</a></div></div><div style="background: #f8fafc; padding: 25px; text-align: center; color: #6b7280; font-size: 14px;">© {{current_year}} TalentXcel. Empowering careers worldwide.</div></div></body></html>', '["user_name", "login_time", "device_info", "location", "ip_address", "current_year"]'::jsonb);

-- 7. Insert comprehensive automation triggers
INSERT INTO public.email_automation_triggers (trigger_key, trigger_name, trigger_category, template_key, conditions, frequency_limit, priority) VALUES 
('user_welcome', 'User Welcome', 'onboarding', 'welcome_user', '{"event": "user_registered"}', 'none', 10),
('profile_incomplete', 'Profile Completion Reminder', 'engagement', 'profile_reminder', '{"profile_completion": {"lt": 80}}', 'weekly', 8),
('job_match_found', 'Job Match Alert', 'jobs', 'job_alert', '{"new_matches": {"gt": 0}}', 'daily', 9),
('security_new_login', 'Security Alert - New Login', 'security', 'security_alert', '{"new_login_detected": true}', 'none', 10);

-- 8. Create updated_at triggers
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_templates_v2_updated_at
BEFORE UPDATE ON public.email_templates_v2
FOR EACH ROW
EXECUTE FUNCTION update_email_templates_updated_at();

CREATE TRIGGER update_email_automation_triggers_updated_at
BEFORE UPDATE ON public.email_automation_triggers
FOR EACH ROW
EXECUTE FUNCTION update_email_templates_updated_at();
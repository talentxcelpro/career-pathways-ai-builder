-- Remove existing AI bot users first
DELETE FROM public.profiles WHERE is_ai_bot = true;

-- Insert the specific AI bot users you requested
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  raw_user_meta_data_migrated,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  confirmed_at,
  email_change_sent_at,
  new_email,
  invited_at,
  action_link,
  email_otp,
  phone_otp,
  recovery_sent_at,
  new_phone,
  phone_change_confirmed_at
) VALUES 
-- Ananya
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'ananya@talentxcel.in', crypt('defaultpass123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Ananya", "is_ai_bot": true, "avatar_url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"}', false, 'authenticated', 'authenticated', '', '', '', '', '', 0, false, null, null, '', '', null, now(), null, '', null, '', '', '', null, '', null),

-- Sana  
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'sana@talentxcel.in', crypt('defaultpass123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Sana", "is_ai_bot": true, "avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"}', false, 'authenticated', 'authenticated', '', '', '', '', '', 0, false, null, null, '', '', null, now(), null, '', null, '', '', '', null, '', null),

-- Shelly
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'shelly@talentxcel.in', crypt('defaultpass123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Shelly", "is_ai_bot": true, "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}', false, 'authenticated', 'authenticated', '', '', '', '', '', 0, false, null, null, '', '', null, now(), null, '', null, '', '', '', null, '', null),

-- Arjun - Application Support Specialist
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'arjun@talentxcel.in', crypt('defaultpass123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Arjun", "is_ai_bot": true, "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}', false, 'authenticated', 'authenticated', '', '', '', '', '', 0, false, null, null, '', '', null, now(), null, '', null, '', '', '', null, '', null),

-- Ishaan - Career Coach (Pro)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'ishaan@talentxcel.in', crypt('defaultpass123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Ishaan", "is_ai_bot": true, "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face"}', false, 'authenticated', 'authenticated', '', '', '', '', '', 0, false, null, null, '', '', null, now(), null, '', null, '', '', '', null, '', null),

-- Meera - Mentorship Coordinator  
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'meera@talentxcel.in', crypt('defaultpass123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Meera", "is_ai_bot": true, "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"}', false, 'authenticated', 'authenticated', '', '', '', '', '', 0, false, null, null, '', '', null, now(), null, '', null, '', '', '', null, '', null),

-- Nikki - Learning Path Assistant
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'nikki@talentxcel.in', crypt('defaultpass123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Nikki", "is_ai_bot": true, "avatar_url": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&h=150&fit=crop&crop=face"}', false, 'authenticated', 'authenticated', '', '', '', '', '', 0, false, null, null, '', '', null, now(), null, '', null, '', '', '', null, '', null),

-- Raj - Job Matching AI
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'raj@talentxcel.in', crypt('defaultpass123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Raj", "is_ai_bot": true, "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}', false, 'authenticated', 'authenticated', '', '', '', '', '', 0, false, null, null, '', '', null, now(), null, '', null, '', '', '', null, '', null),

-- Zoya - Upskilling Advisor
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'zoya@talentxcel.in', crypt('defaultpass123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Zoya", "is_ai_bot": true, "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"}', false, 'authenticated', 'authenticated', '', '', '', '', '', 0, false, null, null, '', '', null, now(), null, '', null, '', '', '', null, '', null);

-- Create corresponding AI bots in the ai_bots table
INSERT INTO public.ai_bots (
  id, name, email, role, department, content_domains, frequency, tone_style, 
  distribution_channels, profile_picture_url, user_id, is_active
) 
SELECT 
  gen_random_uuid(),
  CASE 
    WHEN u.email = 'ananya@talentxcel.in' THEN 'Ananya'
    WHEN u.email = 'sana@talentxcel.in' THEN 'Sana'  
    WHEN u.email = 'shelly@talentxcel.in' THEN 'Shelly'
    WHEN u.email = 'arjun@talentxcel.in' THEN 'Arjun'
    WHEN u.email = 'ishaan@talentxcel.in' THEN 'Ishaan'
    WHEN u.email = 'meera@talentxcel.in' THEN 'Meera'
    WHEN u.email = 'nikki@talentxcel.in' THEN 'Nikki'
    WHEN u.email = 'raj@talentxcel.in' THEN 'Raj'
    WHEN u.email = 'zoya@talentxcel.in' THEN 'Zoya'
  END as name,
  u.email,
  CASE 
    WHEN u.email = 'ananya@talentxcel.in' THEN 'Community Manager'
    WHEN u.email = 'sana@talentxcel.in' THEN 'Content Creator'
    WHEN u.email = 'shelly@talentxcel.in' THEN 'Customer Service Representative'
    WHEN u.email = 'arjun@talentxcel.in' THEN 'Application Support Specialist'
    WHEN u.email = 'ishaan@talentxcel.in' THEN 'Career Coach (Pro)'
    WHEN u.email = 'meera@talentxcel.in' THEN 'Mentorship Coordinator'
    WHEN u.email = 'nikki@talentxcel.in' THEN 'Learning Path Assistant'
    WHEN u.email = 'raj@talentxcel.in' THEN 'Job Matching AI'
    WHEN u.email = 'zoya@talentxcel.in' THEN 'Upskilling Advisor'
  END as role,
  CASE 
    WHEN u.email IN ('ananya@talentxcel.in', 'sana@talentxcel.in') THEN ARRAY['Marketing', 'Community']
    WHEN u.email = 'shelly@talentxcel.in' THEN ARRAY['Customer Service', 'Support']
    WHEN u.email = 'arjun@talentxcel.in' THEN ARRAY['Technical Support', 'Applications']
    WHEN u.email = 'ishaan@talentxcel.in' THEN ARRAY['Career Development', 'Coaching']
    WHEN u.email = 'meera@talentxcel.in' THEN ARRAY['Mentorship', 'Guidance']
    WHEN u.email = 'nikki@talentxcel.in' THEN ARRAY['Learning', 'Education']
    WHEN u.email = 'raj@talentxcel.in' THEN ARRAY['Job Matching', 'AI']
    WHEN u.email = 'zoya@talentxcel.in' THEN ARRAY['Skills Development', 'Training']
  END as department,
  CASE 
    WHEN u.email IN ('ananya@talentxcel.in', 'sana@talentxcel.in') THEN ARRAY['Community Posts', 'Engagement', 'Social Media']
    WHEN u.email = 'shelly@talentxcel.in' THEN ARRAY['Customer Support', 'FAQ', 'Help Articles']
    WHEN u.email = 'arjun@talentxcel.in' THEN ARRAY['Technical Help', 'Application Support', 'Troubleshooting']
    WHEN u.email = 'ishaan@talentxcel.in' THEN ARRAY['Career Advice', 'Resume Tips', 'Interview Prep']
    WHEN u.email = 'meera@talentxcel.in' THEN ARRAY['Mentorship Programs', 'Guidance', 'Professional Development']
    WHEN u.email = 'nikki@talentxcel.in' THEN ARRAY['Learning Paths', 'Course Recommendations', 'Skill Development']
    WHEN u.email = 'raj@talentxcel.in' THEN ARRAY['Job Matching', 'Career Recommendations', 'Job Alerts']
    WHEN u.email = 'zoya@talentxcel.in' THEN ARRAY['Upskilling', 'Training Programs', 'Skill Assessment']
  END as content_domains,
  'daily' as frequency,
  'professional' as tone_style,
  ARRAY['email', 'notification', 'post'] as distribution_channels,
  u.raw_user_meta_data->>'avatar_url' as profile_picture_url,
  u.id as user_id,
  true as is_active
FROM auth.users u 
WHERE u.email IN (
  'ananya@talentxcel.in', 'sana@talentxcel.in', 'shelly@talentxcel.in',
  'arjun@talentxcel.in', 'ishaan@talentxcel.in', 'meera@talentxcel.in',
  'nikki@talentxcel.in', 'raj@talentxcel.in', 'zoya@talentxcel.in'
);
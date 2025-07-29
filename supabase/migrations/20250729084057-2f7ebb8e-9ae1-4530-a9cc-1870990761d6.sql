-- Add admin role to the TalentXcel Pro user
INSERT INTO user_roles (user_id, role, is_active) 
VALUES ('5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062', 'super_admin', true)
ON CONFLICT (user_id, role) DO UPDATE SET is_active = true;

-- Create a sample AI bot
INSERT INTO profiles (
  id, 
  full_name, 
  email, 
  is_ai_bot, 
  bot_tone, 
  content_frequency, 
  departments, 
  content_domains,
  profile_completed,
  created_at
) VALUES (
  gen_random_uuid(),
  'Shelly AI',
  'shelly@talentxcel.in',
  true,
  'authoritative',
  'weekly',
  ARRAY['Industry Expert'],
  ARRAY['Industry Trends', 'Company Analysis', 'Market Research'],
  true,
  now()
) ON CONFLICT (email) DO NOTHING;

-- Also add some regular users for the people page
INSERT INTO profiles (
  id, 
  full_name, 
  email, 
  is_ai_bot, 
  profile_completed,
  about,
  location,
  current_company,
  headline,
  created_at
) VALUES 
(
  gen_random_uuid(),
  'John Developer',
  'john@example.com',
  false,
  true,
  'Full-stack developer with 5 years of experience in React and Node.js',
  'Mumbai, India',
  'Tech Corp',
  'Senior Software Engineer',
  now()
),
(
  gen_random_uuid(),
  'Sarah Designer',
  'sarah@example.com',
  false,
  true,
  'UI/UX designer passionate about creating beautiful user experiences',
  'Bangalore, India',
  'Design Studio',
  'Lead Product Designer',
  now()
) ON CONFLICT (email) DO NOTHING;

-- Verify everything was created
SELECT 'Admin roles' as type, count(*) as count FROM user_roles WHERE is_active = true;
SELECT 'AI bots' as type, count(*) as count FROM profiles WHERE is_ai_bot = true;
SELECT 'Regular users' as type, count(*) as count FROM profiles WHERE is_ai_bot = false;
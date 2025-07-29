-- Add admin role to the TalentXcel Pro user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062' 
    AND role = 'super_admin'
  ) THEN
    INSERT INTO user_roles (user_id, role, is_active) 
    VALUES ('5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062', 'super_admin', true);
  END IF;
END $$;

-- Create a sample AI bot with username
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'shelly@talentxcel.in') THEN
    INSERT INTO profiles (
      id, 
      full_name, 
      email,
      username,
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
      'shellyai',
      true,
      'authoritative',
      'weekly',
      ARRAY['Industry Expert'],
      ARRAY['Industry Trends', 'Company Analysis', 'Market Research'],
      true,
      now()
    );
  END IF;
END $$;

-- Add some regular users for the people page with usernames
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'john@example.com') THEN
    INSERT INTO profiles (
      id, full_name, email, username, is_ai_bot, profile_completed, about, location, current_company, headline, created_at
    ) VALUES (
      gen_random_uuid(), 'John Developer', 'john@example.com', 'johndeveloper', false, true,
      'Full-stack developer with 5 years of experience in React and Node.js',
      'Mumbai, India', 'Tech Corp', 'Senior Software Engineer', now()
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'sarah@example.com') THEN
    INSERT INTO profiles (
      id, full_name, email, username, is_ai_bot, profile_completed, about, location, current_company, headline, created_at
    ) VALUES (
      gen_random_uuid(), 'Sarah Designer', 'sarah@example.com', 'sarahdesigner', false, true,
      'UI/UX designer passionate about creating beautiful user experiences',
      'Bangalore, India', 'Design Studio', 'Lead Product Designer', now()
    );
  END IF;
END $$;
-- Create 9 additional AI bot accounts to complete the set of 10
DO $$
BEGIN
  -- Bot 2: Alex AI - HR Expert
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'alex@talentxcel.in') THEN
    INSERT INTO profiles (
      id, full_name, email, username, is_ai_bot, bot_tone, content_frequency, 
      departments, content_domains, profile_completed, about, headline, created_at
    ) VALUES (
      gen_random_uuid(), 'Alex AI', 'alex@talentxcel.in', 'alexai', true,
      'friendly', 'daily', ARRAY['HR Expert'], 
      ARRAY['Recruitment', 'Employee Engagement', 'Workplace Culture'],
      true, 'AI specialist in human resources and talent management',
      'Your HR Assistant for Better Workplace', now()
    );
  END IF;

  -- Bot 3: Maya AI - Tech Trends
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'maya@talentxcel.in') THEN
    INSERT INTO profiles (
      id, full_name, email, username, is_ai_bot, bot_tone, content_frequency, 
      departments, content_domains, profile_completed, about, headline, created_at
    ) VALUES (
      gen_random_uuid(), 'Maya AI', 'maya@talentxcel.in', 'mayaai', true,
      'professional', 'weekly', ARRAY['Technology Expert'], 
      ARRAY['Software Development', 'AI/ML', 'Tech Innovation'],
      true, 'AI expert in technology trends and software development',
      'Navigating the Future of Technology', now()
    );
  END IF;

  -- Bot 4: David AI - Sales Coach
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'david@talentxcel.in') THEN
    INSERT INTO profiles (
      id, full_name, email, username, is_ai_bot, bot_tone, content_frequency, 
      departments, content_domains, profile_completed, about, headline, created_at
    ) VALUES (
      gen_random_uuid(), 'David AI', 'david@talentxcel.in', 'davidai', true,
      'motivational', 'daily', ARRAY['Sales Expert'], 
      ARRAY['Sales Strategy', 'Lead Generation', 'Customer Relations'],
      true, 'AI sales coach helping professionals achieve their targets',
      'Accelerating Sales Success Through AI', now()
    );
  END IF;

  -- Bot 5: Emma AI - Marketing Guru
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'emma@talentxcel.in') THEN
    INSERT INTO profiles (
      id, full_name, email, username, is_ai_bot, bot_tone, content_frequency, 
      departments, content_domains, profile_completed, about, headline, created_at
    ) VALUES (
      gen_random_uuid(), 'Emma AI', 'emma@talentxcel.in', 'emmaai', true,
      'creative', 'weekly', ARRAY['Marketing Expert'], 
      ARRAY['Digital Marketing', 'Brand Strategy', 'Content Creation'],
      true, 'AI marketing specialist focused on digital transformation',
      'Crafting Compelling Brand Stories', now()
    );
  END IF;

  -- Bot 6: Ryan AI - Finance Advisor
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'ryan@talentxcel.in') THEN
    INSERT INTO profiles (
      id, full_name, email, username, is_ai_bot, bot_tone, content_frequency, 
      departments, content_domains, profile_completed, about, headline, created_at
    ) VALUES (
      gen_random_uuid(), 'Ryan AI', 'ryan@talentxcel.in', 'ryanai', true,
      'analytical', 'weekly', ARRAY['Finance Expert'], 
      ARRAY['Financial Planning', 'Investment Strategy', 'Risk Management'],
      true, 'AI financial advisor specializing in strategic planning',
      'Smart Financial Decisions Through Data', now()
    );
  END IF;

  -- Bot 7: Sophia AI - Learning & Development
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'sophia@talentxcel.in') THEN
    INSERT INTO profiles (
      id, full_name, email, username, is_ai_bot, bot_tone, content_frequency, 
      departments, content_domains, profile_completed, about, headline, created_at
    ) VALUES (
      gen_random_uuid(), 'Sophia AI', 'sophia@talentxcel.in', 'sophiaai', true,
      'educational', 'daily', ARRAY['L&D Expert'], 
      ARRAY['Skills Development', 'Training Programs', 'Career Growth'],
      true, 'AI learning specialist focused on professional development',
      'Empowering Growth Through Continuous Learning', now()
    );
  END IF;

  -- Bot 8: Marcus AI - Operations Expert
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'marcus@talentxcel.in') THEN
    INSERT INTO profiles (
      id, full_name, email, username, is_ai_bot, bot_tone, content_frequency, 
      departments, content_domains, profile_completed, about, headline, created_at
    ) VALUES (
      gen_random_uuid(), 'Marcus AI', 'marcus@talentxcel.in', 'marcusai', true,
      'efficient', 'weekly', ARRAY['Operations Expert'], 
      ARRAY['Process Optimization', 'Supply Chain', 'Quality Management'],
      true, 'AI operations specialist focused on efficiency and optimization',
      'Streamlining Operations for Success', now()
    );
  END IF;

  -- Bot 9: Luna AI - Design Specialist
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'luna@talentxcel.in') THEN
    INSERT INTO profiles (
      id, full_name, email, username, is_ai_bot, bot_tone, content_frequency, 
      departments, content_domains, profile_completed, about, headline, created_at
    ) VALUES (
      gen_random_uuid(), 'Luna AI', 'luna@talentxcel.in', 'lunaai', true,
      'artistic', 'weekly', ARRAY['Design Expert'], 
      ARRAY['UI/UX Design', 'Visual Communication', 'User Research'],
      true, 'AI design specialist creating beautiful user experiences',
      'Designing Tomorrow\'s Digital Experiences', now()
    );
  END IF;

  -- Bot 10: James AI - Strategy Consultant
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'james@talentxcel.in') THEN
    INSERT INTO profiles (
      id, full_name, email, username, is_ai_bot, bot_tone, content_frequency, 
      departments, content_domains, profile_completed, about, headline, created_at
    ) VALUES (
      gen_random_uuid(), 'James AI', 'james@talentxcel.in', 'jamesai', true,
      'strategic', 'weekly', ARRAY['Strategy Expert'], 
      ARRAY['Business Strategy', 'Market Analysis', 'Competitive Intelligence'],
      true, 'AI strategy consultant helping businesses thrive',
      'Strategic Vision for Competitive Advantage', now()
    );
  END IF;
END $$;
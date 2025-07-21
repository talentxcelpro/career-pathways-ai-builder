
-- First, let's upgrade all specified users to Elite Pro status
DO $$
DECLARE
  user_emails TEXT[] := ARRAY[
    'talentxcelpro12@gmail.com',
    'viralpay2025@gmail.com', 
    'sanayah.arshid@gmail.com',
    'arsh.wani1@gmail.com',
    'arsh.wani@gmail.com',
    'talentxcelservices@gmail.com',
    'arshid.wani@icloud.com'
  ];
  user_email TEXT;
  user_id UUID;
BEGIN
  FOREACH user_email IN ARRAY user_emails
  LOOP
    -- Find user ID by email
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NOT NULL THEN
      -- Update profile to Elite Pro status
      INSERT INTO public.profiles (
        id, pro_status, pro_plan, pro_expires_at, 
        is_employer, employer_status, profile_completed
      ) VALUES (
        user_id, 'active', 'Elite', '2025-12-31 23:59:59',
        true, 'approved', true
      ) ON CONFLICT (id) DO UPDATE SET
        pro_status = 'active',
        pro_plan = 'Elite', 
        pro_expires_at = '2025-12-31 23:59:59',
        is_employer = true,
        employer_status = 'approved',
        profile_completed = true,
        updated_at = now();

      -- Create Pro subscription
      INSERT INTO public.pro_subscriptions (
        user_id, plan_name, price_amount, currency, status,
        started_at, expires_at, razorpay_payment_id, features
      ) VALUES (
        user_id, 'Elite', 1999, 'INR', 'active',
        now(), '2025-12-31 23:59:59', 
        'elite_upgrade_' || extract(epoch from now()),
        '["service_pages", "profile_boosting", "crm_tools", "analytics", "priority_support", "custom_branding", "advanced_networking", "unlimited_posts", "ai_assistance", "marketplace_listing"]'::jsonb
      ) ON CONFLICT (user_id) DO UPDATE SET
        plan_name = 'Elite',
        price_amount = 1999,
        status = 'active',
        expires_at = '2025-12-31 23:59:59',
        features = '["service_pages", "profile_boosting", "crm_tools", "analytics", "priority_support", "custom_branding", "advanced_networking", "unlimited_posts", "ai_assistance", "marketplace_listing"]'::jsonb,
        updated_at = now();

      -- Grant admin role if not exists
      INSERT INTO public.user_roles (user_id, role, is_active, granted_at)
      VALUES (user_id, 'admin', true, now())
      ON CONFLICT (user_id, role) DO UPDATE SET
        is_active = true,
        granted_at = now();
    END IF;
  END LOOP;
END $$;

-- Create service categories if they don't exist
INSERT INTO public.service_categories (name, slug, icon_emoji, description, display_order, color_theme, is_active) VALUES
('Tech & Innovation', 'tech-innovation', '💻', 'Technology consulting and digital innovation services', 1, 'blue', true),
('Finance & Legal', 'finance-legal', '💰', 'Financial consulting and legal advisory services', 2, 'green', true),
('Career & Resume', 'career-resume', '📝', 'Career coaching and professional development', 3, 'purple', true),
('Education & Academic', 'education-academic', '🎓', 'Educational consulting and academic support', 4, 'orange', true),
('Business Strategy', 'business-strategy', '📊', 'Business consulting and strategic planning', 5, 'red', true),
('Corporate Services', 'corporate-services', '🏢', 'Enterprise training and organizational development', 6, 'indigo', true),
('Wellness & Growth', 'wellness-growth', '🌱', 'Personal wellness and life coaching', 7, 'emerald', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

-- Now create showcase services for each user
DO $$
DECLARE
  service_data RECORD;
  user_id UUID;
  category_id UUID;
BEGIN
  -- Service 1: talentxcelpro12@gmail.com - Platform Expert
  SELECT id INTO user_id FROM auth.users WHERE email = 'talentxcelpro12@gmail.com';
  SELECT id INTO category_id FROM service_categories WHERE slug = 'tech-innovation';
  IF user_id IS NOT NULL AND category_id IS NOT NULL THEN
    INSERT INTO public.services (
      provider_id, title, professional_title, years_experience, location,
      description, whats_included, client_requirements, delivery_time_days,
      price, currency, payment_methods, contact_email, contact_phone, contact_website,
      website_url, phone_number, tags, portfolio_files, is_active, is_featured,
      average_rating, total_reviews, total_orders, category_id
    ) VALUES (
      user_id,
      'Complete TalentXcel Platform Setup & Optimization',
      'TalentXcel Platform Expert & Digital Strategist',
      '5+ years',
      'Mumbai, India',
      'Transform your professional presence with comprehensive TalentXcel platform optimization. I specialize in helping professionals and businesses maximize their potential on the platform through strategic setup, profile enhancement, and feature utilization.',
      ARRAY['Platform account setup and configuration', 'Professional profile optimization', 'Feature training and guidance', 'Strategic content planning', 'Network building strategies', 'Analytics setup and monitoring'],
      'Provide basic business/professional information, goals, and target audience details',
      5, 5999, 'INR',
      ARRAY['bank_transfer', 'upi', 'razorpay'],
      true, true, true,
      'https://talentxcel.pro',
      '+91-9876543210',
      ARRAY['platform-setup', 'optimization', 'training', 'strategy', 'professional-growth'],
      ARRAY[], true, true, 4.9, 47, 23, category_id
    );
  END IF;

  -- Service 2: viralpay2025@gmail.com - Fintech Specialist  
  SELECT id INTO user_id FROM auth.users WHERE email = 'viralpay2025@gmail.com';
  SELECT id INTO category_id FROM service_categories WHERE slug = 'finance-legal';
  IF user_id IS NOT NULL AND category_id IS NOT NULL THEN
    INSERT INTO public.services (
      provider_id, title, professional_title, years_experience, location,
      description, whats_included, client_requirements, delivery_time_days,
      price, currency, payment_methods, contact_email, contact_phone, contact_website,
      website_url, phone_number, tags, portfolio_files, is_active, is_featured,
      average_rating, total_reviews, total_orders, category_id
    ) VALUES (
      user_id,
      'Digital Payment Solutions & Financial Technology Consulting',
      'Fintech Consultant & Payment Systems Expert',
      '7+ years',
      'Bangalore, India',
      'Expert fintech consulting services covering digital payment solutions, financial technology strategy, and regulatory compliance. Help businesses navigate the complex fintech landscape with innovative payment solutions.',
      ARRAY['Payment system architecture design', 'Fintech strategy development', 'Regulatory compliance guidance', 'Digital wallet integration', 'Blockchain payment solutions', 'Security audit and recommendations'],
      'Business overview, current payment systems, compliance requirements, and technical specifications',
      7, 12999, 'INR',
      ARRAY['bank_transfer', 'crypto', 'international_wire'],
      true, true, true,
      'https://viralpay.tech',
      '+91-9876543211',
      ARRAY['fintech', 'payments', 'blockchain', 'compliance', 'digital-transformation'],
      ARRAY[], true, true, 4.8, 34, 18, category_id
    );
  END IF;

  -- Service 3: sanayah.arshid@gmail.com - Career Coach
  SELECT id INTO user_id FROM auth.users WHERE email = 'sanayah.arshid@gmail.com';
  SELECT id INTO category_id FROM service_categories WHERE slug = 'career-resume';
  IF user_id IS NOT NULL AND category_id IS NOT NULL THEN
    INSERT INTO public.services (
      provider_id, title, professional_title, years_experience, location,
      description, whats_included, client_requirements, delivery_time_days,
      price, currency, payment_methods, contact_email, contact_phone, contact_website,
      website_url, phone_number, tags, portfolio_files, is_active, is_featured,
      average_rating, total_reviews, total_orders, category_id
    ) VALUES (
      user_id,
      'Executive Career Transformation & Leadership Development',
      'Executive Career Coach & Leadership Mentor',
      '8+ years',
      'Delhi, India',
      'Accelerate your career with personalized executive coaching and leadership development. Specializing in helping mid to senior-level professionals achieve breakthrough career growth and leadership excellence.',
      ARRAY['Comprehensive career assessment', 'Leadership development coaching', 'Interview preparation and practice', 'Salary negotiation strategies', 'Personal branding workshops', '90-day action plan creation'],
      'Career history, current role details, career goals, and leadership challenges',
      7, 8999, 'INR',
      ARRAY['bank_transfer', 'upi', 'cheque'],
      true, true, false,
      NULL,
      '+91-9876543212',
      ARRAY['career-coaching', 'leadership', 'executive-development', 'interview-prep', 'personal-branding'],
      ARRAY[], true, true, 5.0, 52, 31, category_id
    );
  END IF;

  -- Service 4: arsh.wani1@gmail.com - Education Consultant
  SELECT id INTO user_id FROM auth.users WHERE email = 'arsh.wani1@gmail.com';
  SELECT id INTO category_id FROM service_categories WHERE slug = 'education-academic';
  IF user_id IS NOT NULL AND category_id IS NOT NULL THEN
    INSERT INTO public.services (
      provider_id, title, professional_title, years_experience, location,
      description, whats_included, client_requirements, delivery_time_days,
      price, currency, payment_methods, contact_email, contact_phone, contact_website,
      website_url, phone_number, tags, portfolio_files, is_active, is_featured,
      average_rating, total_reviews, total_orders, category_id
    ) VALUES (
      user_id,
      'College Admissions Strategy & Academic Excellence Planning',
      'Education Consultant & College Admissions Expert',
      '6+ years',
      'Srinagar, J&K',
      'Navigate the complex college admissions process with expert guidance. Comprehensive support for students seeking admission to top universities, including strategy development, application optimization, and interview preparation.',
      ARRAY['University selection and research', 'Application strategy development', 'Essay writing and review', 'Interview preparation sessions', 'Scholarship opportunity identification', 'Timeline and deadline management'],
      'Academic transcripts, standardized test scores, extracurricular activities, and career aspirations',
      7, 6999, 'INR',
      ARRAY['bank_transfer', 'upi', 'demand_draft'],
      true, true, true,
      'https://eduexpert.in',
      '+91-9876543213',
      ARRAY['college-admissions', 'education-consulting', 'academic-planning', 'university-guidance', 'scholarship'],
      ARRAY[], true, true, 4.9, 41, 28, category_id
    );
  END IF;

  -- Service 5: arsh.wani@gmail.com - Business Strategist
  SELECT id INTO user_id FROM auth.users WHERE email = 'arsh.wani@gmail.com';
  SELECT id INTO category_id FROM service_categories WHERE slug = 'business-strategy';
  IF user_id IS NOT NULL AND category_id IS NOT NULL THEN
    INSERT INTO public.services (
      provider_id, title, professional_title, years_experience, location,
      description, whats_included, client_requirements, delivery_time_days,
      price, currency, payment_methods, contact_email, contact_phone, contact_website,
      website_url, phone_number, tags, portfolio_files, is_active, is_featured,
      average_rating, total_reviews, total_orders, category_id
    ) VALUES (
      user_id,
      'Startup Strategy & Business Growth Consulting',
      'Business Strategy Consultant & Startup Advisor',
      '9+ years',
      'Gurgaon, India',
      'Accelerate your startup journey with strategic business consulting. From ideation to scaling, get expert guidance on business model development, growth strategies, and investor readiness.',
      ARRAY['Business model canvas development', 'Market research and analysis', 'Growth strategy formulation', 'Investor pitch deck creation', 'Financial modeling and projections', 'Go-to-market strategy planning'],
      'Business idea or current business overview, target market information, and growth objectives',
      10, 15999, 'INR',
      ARRAY['bank_transfer', 'upi', 'international_wire'],
      true, true, true,
      'https://bizstrategy.pro',
      '+91-9876543214',
      ARRAY['startup-consulting', 'business-strategy', 'growth-hacking', 'investor-readiness', 'market-research'],
      ARRAY[], true, true, 4.8, 29, 16, category_id
    );
  END IF;

  -- Service 6: talentxcelservices@gmail.com - Corporate Trainer
  SELECT id INTO user_id FROM auth.users WHERE email = 'talentxcelservices@gmail.com';
  SELECT id INTO category_id FROM service_categories WHERE slug = 'corporate-services';
  IF user_id IS NOT NULL AND category_id IS NOT NULL THEN
    INSERT INTO public.services (
      provider_id, title, professional_title, years_experience, location,
      description, whats_included, client_requirements, delivery_time_days,
      price, currency, payment_methods, contact_email, contact_phone, contact_website,
      website_url, phone_number, tags, portfolio_files, is_active, is_featured,
      average_rating, total_reviews, total_orders, category_id
    ) VALUES (
      user_id,
      'Enterprise Training & Organizational Development',
      'Corporate Trainer & Organizational Development Specialist',
      '10+ years',
      'Mumbai, India',
      'Transform your organization with comprehensive training programs and organizational development solutions. Specializing in leadership development, team building, and performance optimization for enterprises.',
      ARRAY['Custom training program design', 'Leadership development workshops', 'Team building sessions', 'Performance assessment tools', 'Change management consulting', 'Employee engagement strategies'],
      'Organization size, training objectives, current challenges, and preferred delivery format',
      14, 25999, 'INR',
      ARRAY['bank_transfer', 'cheque', 'international_wire'],
      true, true, true,
      'https://talentxcelservices.com',
      '+91-9876543215',
      ARRAY['corporate-training', 'leadership-development', 'team-building', 'organizational-development', 'change-management'],
      ARRAY[], true, true, 4.9, 38, 22, category_id
    );
  END IF;

  -- Service 7: arshid.wani@icloud.com - Wellness Coach
  SELECT id INTO user_id FROM auth.users WHERE email = 'arshid.wani@icloud.com';
  SELECT id INTO category_id FROM service_categories WHERE slug = 'wellness-growth';
  IF user_id IS NOT NULL AND category_id IS NOT NULL THEN
    INSERT INTO public.services (
      provider_id, title, professional_title, years_experience, location,
      description, whats_included, client_requirements, delivery_time_days,
      price, currency, payment_methods, contact_email, contact_phone, contact_website,
      website_url, phone_number, tags, portfolio_files, is_active, is_featured,
      average_rating, total_reviews, total_orders, category_id
    ) VALUES (
      user_id,
      'Holistic Wellness & Work-Life Balance Coaching',
      'Wellness Coach & Work-Life Balance Expert',
      '4+ years',
      'Pune, India',
      'Achieve optimal wellness and work-life balance with personalized coaching programs. Combining mindfulness, nutrition guidance, and lifestyle optimization to help professionals thrive both personally and professionally.',
      ARRAY['Comprehensive wellness assessment', 'Personalized wellness plan creation', 'Mindfulness and stress management techniques', 'Nutrition and lifestyle guidance', 'Work-life balance strategies', 'Progress tracking and accountability'],
      'Current lifestyle information, stress levels, health goals, and work schedule details',
      5, 4999, 'INR',
      ARRAY['bank_transfer', 'upi', 'paytm'],
      true, true, false,
      NULL,
      '+91-9876543216',
      ARRAY['wellness-coaching', 'work-life-balance', 'mindfulness', 'stress-management', 'lifestyle-optimization'],
      ARRAY[], true, true, 5.0, 45, 33, category_id
    );
  END IF;
END $$;

-- Add realistic service reviews for all services
INSERT INTO public.service_reviews (service_id, reviewer_id, rating, review_text, is_verified)
SELECT 
  s.id,
  '00000000-0000-0000-0000-000000000001'::uuid, -- Dummy reviewer ID
  (4 + random())::int, -- Random rating between 4-5
  CASE s.title 
    WHEN 'Complete TalentXcel Platform Setup & Optimization' THEN 'Excellent service! Helped me set up my profile perfectly and taught me all the platform features.'
    WHEN 'Digital Payment Solutions & Financial Technology Consulting' THEN 'Outstanding fintech expertise. The payment solution recommendations were spot-on for our business.'
    WHEN 'Executive Career Transformation & Leadership Development' THEN 'Life-changing career coaching! Got promoted within 3 months of completing the program.'
    WHEN 'College Admissions Strategy & Academic Excellence Planning' THEN 'Amazing guidance throughout the college application process. Got into my dream university!'
    WHEN 'Startup Strategy & Business Growth Consulting' THEN 'Incredible business insights. The strategy helped us secure our first round of funding.'
    WHEN 'Enterprise Training & Organizational Development' THEN 'Fantastic corporate training program. Our team productivity increased significantly.'
    WHEN 'Holistic Wellness & Work-Life Balance Coaching' THEN 'Best wellness coaching experience! Completely transformed my work-life balance and stress levels.'
  END,
  true
FROM public.services s;

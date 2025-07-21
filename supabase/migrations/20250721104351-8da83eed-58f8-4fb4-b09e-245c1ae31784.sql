-- Re-create services for the elite users (simplified version without complex logic)
-- First check if users exist
DO $$
DECLARE
  user_id_1 UUID := '00000000-0000-0000-0000-000000000001';
  user_id_2 UUID := '00000000-0000-0000-0000-000000000002';
  user_id_3 UUID := '00000000-0000-0000-0000-000000000003';
  user_id_4 UUID := '00000000-0000-0000-0000-000000000004';
  user_id_5 UUID := '00000000-0000-0000-0000-000000000005';
  user_id_6 UUID := '00000000-0000-0000-0000-000000000006';
  user_id_7 UUID := '00000000-0000-0000-0000-000000000007';
BEGIN
  -- Create showcase services directly with dummy user IDs for now
  INSERT INTO public.services (
    provider_id, title, professional_title, years_experience, location,
    description, whats_included, client_requirements, delivery_time_days,
    price, currency, payment_methods, contact_email, contact_phone, contact_website,
    website_url, phone_number, tags, portfolio_files, is_active, is_featured,
    average_rating, total_reviews, total_orders, status
  ) VALUES 
  -- Service 1: Platform Expert
  (user_id_1, 'Complete TalentXcel Platform Setup & Optimization', 'TalentXcel Platform Expert & Digital Strategist', '5+ years', 'Mumbai, India',
   'Transform your professional presence with comprehensive TalentXcel platform optimization. I specialize in helping professionals and businesses maximize their potential on the platform through strategic setup, profile enhancement, and feature utilization.',
   ARRAY['Platform account setup and configuration', 'Professional profile optimization', 'Feature training and guidance', 'Strategic content planning', 'Network building strategies', 'Analytics setup and monitoring'],
   'Provide basic business/professional information, goals, and target audience details',
   5, 5999, 'INR', ARRAY['bank_transfer', 'upi', 'razorpay'], true, true, true,
   'https://talentxcel.pro', '+91-9876543210', ARRAY['platform-setup', 'optimization', 'training', 'strategy', 'professional-growth'],
   ARRAY[]::text[], true, true, 4.9, 47, 23, 'published'),

  -- Service 2: Fintech Specialist  
  (user_id_2, 'Digital Payment Solutions & Financial Technology Consulting', 'Fintech Consultant & Payment Systems Expert', '7+ years', 'Bangalore, India',
   'Expert fintech consulting services covering digital payment solutions, financial technology strategy, and regulatory compliance. Help businesses navigate the complex fintech landscape with innovative payment solutions.',
   ARRAY['Payment system architecture design', 'Fintech strategy development', 'Regulatory compliance guidance', 'Digital wallet integration', 'Blockchain payment solutions', 'Security audit and recommendations'],
   'Business overview, current payment systems, compliance requirements, and technical specifications',
   7, 12999, 'INR', ARRAY['bank_transfer', 'crypto', 'international_wire'], true, true, true,
   'https://viralpay.tech', '+91-9876543211', ARRAY['fintech', 'payments', 'blockchain', 'compliance', 'digital-transformation'],
   ARRAY[]::text[], true, true, 4.8, 34, 18, 'published'),

  -- Service 3: Career Coach
  (user_id_3, 'Executive Career Transformation & Leadership Development', 'Executive Career Coach & Leadership Mentor', '8+ years', 'Delhi, India',
   'Accelerate your career with personalized executive coaching and leadership development. Specializing in helping mid to senior-level professionals achieve breakthrough career growth and leadership excellence.',
   ARRAY['Comprehensive career assessment', 'Leadership development coaching', 'Interview preparation and practice', 'Salary negotiation strategies', 'Personal branding workshops', '90-day action plan creation'],
   'Career history, current role details, career goals, and leadership challenges',
   7, 8999, 'INR', ARRAY['bank_transfer', 'upi', 'cheque'], true, true, false,
   NULL, '+91-9876543212', ARRAY['career-coaching', 'leadership', 'executive-development', 'interview-prep', 'personal-branding'],
   ARRAY[]::text[], true, true, 5.0, 52, 31, 'published'),

  -- Service 4: Education Consultant
  (user_id_4, 'College Admissions Strategy & Academic Excellence Planning', 'Education Consultant & College Admissions Expert', '6+ years', 'Srinagar, J&K',
   'Navigate the complex college admissions process with expert guidance. Comprehensive support for students seeking admission to top universities, including strategy development, application optimization, and interview preparation.',
   ARRAY['University selection and research', 'Application strategy development', 'Essay writing and review', 'Interview preparation sessions', 'Scholarship opportunity identification', 'Timeline and deadline management'],
   'Academic transcripts, standardized test scores, extracurricular activities, and career aspirations',
   7, 6999, 'INR', ARRAY['bank_transfer', 'upi', 'demand_draft'], true, true, true,
   'https://eduexpert.in', '+91-9876543213', ARRAY['college-admissions', 'education-consulting', 'academic-planning', 'university-guidance', 'scholarship'],
   ARRAY[]::text[], true, true, 4.9, 41, 28, 'published'),

  -- Service 5: Business Strategist
  (user_id_5, 'Startup Strategy & Business Growth Consulting', 'Business Strategy Consultant & Startup Advisor', '9+ years', 'Gurgaon, India',
   'Accelerate your startup journey with strategic business consulting. From ideation to scaling, get expert guidance on business model development, growth strategies, and investor readiness.',
   ARRAY['Business model canvas development', 'Market research and analysis', 'Growth strategy formulation', 'Investor pitch deck creation', 'Financial modeling and projections', 'Go-to-market strategy planning'],
   'Business idea or current business overview, target market information, and growth objectives',
   10, 15999, 'INR', ARRAY['bank_transfer', 'upi', 'international_wire'], true, true, true,
   'https://bizstrategy.pro', '+91-9876543214', ARRAY['startup-consulting', 'business-strategy', 'growth-hacking', 'investor-readiness', 'market-research'],
   ARRAY[]::text[], true, true, 4.8, 29, 16, 'published'),

  -- Service 6: Corporate Trainer
  (user_id_6, 'Enterprise Training & Organizational Development', 'Corporate Trainer & Organizational Development Specialist', '10+ years', 'Mumbai, India',
   'Transform your organization with comprehensive training programs and organizational development solutions. Specializing in leadership development, team building, and performance optimization for enterprises.',
   ARRAY['Custom training program design', 'Leadership development workshops', 'Team building sessions', 'Performance assessment tools', 'Change management consulting', 'Employee engagement strategies'],
   'Organization size, training objectives, current challenges, and preferred delivery format',
   14, 25999, 'INR', ARRAY['bank_transfer', 'cheque', 'international_wire'], true, true, true,
   'https://talentxcelservices.com', '+91-9876543215', ARRAY['corporate-training', 'leadership-development', 'team-building', 'organizational-development', 'change-management'],
   ARRAY[]::text[], true, true, 4.9, 38, 22, 'published'),

  -- Service 7: Wellness Coach
  (user_id_7, 'Holistic Wellness & Work-Life Balance Coaching', 'Wellness Coach & Work-Life Balance Expert', '4+ years', 'Pune, India',
   'Achieve optimal wellness and work-life balance with personalized coaching programs. Combining mindfulness, nutrition guidance, and lifestyle optimization to help professionals thrive both personally and professionally.',
   ARRAY['Comprehensive wellness assessment', 'Personalized wellness plan creation', 'Mindfulness and stress management techniques', 'Nutrition and lifestyle guidance', 'Work-life balance strategies', 'Progress tracking and accountability'],
   'Current lifestyle information, stress levels, health goals, and work schedule details',
   5, 4999, 'INR', ARRAY['bank_transfer', 'upi', 'paytm'], true, true, false,
   NULL, '+91-9876543216', ARRAY['wellness-coaching', 'work-life-balance', 'mindfulness', 'stress-management', 'lifestyle-optimization'],
   ARRAY[]::text[], true, true, 5.0, 45, 33, 'published');
END $$;
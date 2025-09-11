-- Insert 15 TalentXcel jobs with INR salaries
INSERT INTO jobs (
  title, company_name, location, salary_min, salary_max, salary_range, 
  employment_type, experience_level, skills_required, description, 
  is_remote, is_featured, posted_at, expires_at, external_url, seo_slug
) VALUES 
(
  'Senior Software Engineer - Full Stack', 'TalentXcel', 'Bangalore, India', 
  1200000, 2000000, '₹12L - ₹20L per annum',
  'full_time', 'senior', 
  ARRAY['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
  'Join TalentXcel as a Senior Full Stack Engineer and help build the future of talent acquisition. Work with cutting-edge technologies including React, Node.js, and AI-powered matching systems. We offer competitive compensation, flexible work arrangements, and opportunities for professional growth.',
  true, true, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/senior-software-engineer',
  'senior-software-engineer-full-stack-talentxcel-bangalore'
),
(
  'AI/ML Engineer - Talent Matching', 'TalentXcel', 'Mumbai, India',
  1500000, 2500000, '₹15L - ₹25L per annum',
  'full_time', 'senior',
  ARRAY['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'NLP'],
  'Lead our AI-powered talent matching initiatives at TalentXcel. Design and implement machine learning models that revolutionize how candidates and employers connect. Work with large datasets and cutting-edge AI technologies.',
  true, true, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/ai-ml-engineer',
  'ai-ml-engineer-talent-matching-talentxcel-mumbai'
),
(
  'Product Manager - Career Platform', 'TalentXcel', 'Delhi, India',
  1800000, 2800000, '₹18L - ₹28L per annum',
  'full_time', 'senior',
  ARRAY['Product Management', 'Agile', 'Data Analysis', 'User Research'],
  'Drive product strategy for TalentXcel''s career advancement platform. Lead cross-functional teams to deliver features that empower millions of job seekers and employers across India.',
  false, true, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/product-manager',
  'product-manager-career-platform-talentxcel-delhi'
),
(
  'Frontend Developer - React Specialist', 'TalentXcel', 'Hyderabad, India',
  800000, 1400000, '₹8L - ₹14L per annum',
  'full_time', 'mid_level',
  ARRAY['React', 'JavaScript', 'CSS', 'HTML', 'Git'],
  'Create stunning user interfaces for TalentXcel''s platform. Work on responsive designs, performance optimization, and user experience enhancements that serve millions of users.',
  true, false, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/frontend-developer',
  'frontend-developer-react-specialist-talentxcel-hyderabad'
),
(
  'DevOps Engineer - Cloud Infrastructure', 'TalentXcel', 'Pune, India',
  1000000, 1800000, '₹10L - ₹18L per annum',
  'full_time', 'senior',
  ARRAY['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
  'Build and maintain scalable cloud infrastructure for TalentXcel. Implement DevOps best practices, automate deployments, and ensure high availability of our talent platform.',
  true, false, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/devops-engineer',
  'devops-engineer-cloud-infrastructure-talentxcel-pune'
),
(
  'Data Scientist - HR Analytics', 'TalentXcel', 'Chennai, India',
  1200000, 2000000, '₹12L - ₹20L per annum',
  'full_time', 'senior',
  ARRAY['Python', 'SQL', 'Machine Learning', 'Statistics', 'Tableau'],
  'Unlock insights from talent data at TalentXcel. Build predictive models for hiring success, analyze market trends, and create data-driven solutions for HR challenges.',
  true, false, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/data-scientist',
  'data-scientist-hr-analytics-talentxcel-chennai'
),
(
  'UX/UI Designer - Mobile First', 'TalentXcel', 'Bangalore, India',
  900000, 1600000, '₹9L - ₹16L per annum',
  'full_time', 'mid_level',
  ARRAY['Figma', 'UI/UX Design', 'Mobile Design', 'Prototyping'],
  'Design exceptional user experiences for TalentXcel''s mobile and web platforms. Create intuitive interfaces that make job searching and hiring effortless for millions of users.',
  true, false, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/ux-ui-designer',
  'ux-ui-designer-mobile-first-talentxcel-bangalore'
),
(
  'Backend Engineer - Node.js', 'TalentXcel', 'Remote, India',
  700000, 1300000, '₹7L - ₹13L per annum',
  'full_time', 'mid_level',
  ARRAY['Node.js', 'Express', 'MongoDB', 'REST APIs', 'GraphQL'],
  'Build robust backend systems for TalentXcel. Develop scalable APIs, integrate with third-party services, and ensure data security and performance optimization.',
  true, false, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/backend-engineer',
  'backend-engineer-nodejs-talentxcel-remote'
),
(
  'Quality Assurance Engineer', 'TalentXcel', 'Gurgaon, India',
  600000, 1100000, '₹6L - ₹11L per annum',
  'full_time', 'mid_level',
  ARRAY['Manual Testing', 'Automation Testing', 'Selenium', 'API Testing'],
  'Ensure quality and reliability of TalentXcel''s platform. Design test strategies, automate testing processes, and maintain high standards for user experience.',
  false, false, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/qa-engineer',
  'quality-assurance-engineer-talentxcel-gurgaon'
),
(
  'Content Marketing Specialist', 'TalentXcel', 'Mumbai, India',
  500000, 900000, '₹5L - ₹9L per annum',
  'full_time', 'mid_level',
  ARRAY['Content Writing', 'SEO', 'Social Media', 'Content Strategy'],
  'Drive content strategy for TalentXcel. Create engaging content that educates job seekers, attracts employers, and establishes TalentXcel as a thought leader in talent acquisition.',
  true, false, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/content-marketing',
  'content-marketing-specialist-talentxcel-mumbai'
),
(
  'Business Development Associate', 'TalentXcel', 'Delhi, India',
  400000, 800000, '₹4L - ₹8L per annum',
  'full_time', 'entry_level',
  ARRAY['Sales', 'Communication', 'CRM', 'Lead Generation'],
  'Join TalentXcel''s business development team. Build relationships with employers, understand their hiring needs, and help them discover top talent through our platform.',
  false, false, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/business-development',
  'business-development-associate-talentxcel-delhi'
),
(
  'Customer Success Manager', 'TalentXcel', 'Bangalore, India',
  700000, 1200000, '₹7L - ₹12L per annum',
  'full_time', 'senior',
  ARRAY['Customer Success', 'Account Management', 'Communication', 'Analytics'],
  'Ensure customer success at TalentXcel. Work closely with enterprise clients, drive adoption of our platform, and help them achieve their hiring goals.',
  true, false, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/customer-success',
  'customer-success-manager-talentxcel-bangalore'
),
(
  'Mobile App Developer - React Native', 'TalentXcel', 'Hyderabad, India',
  800000, 1500000, '₹8L - ₹15L per annum',
  'full_time', 'mid_level',
  ARRAY['React Native', 'JavaScript', 'Mobile Development', 'iOS', 'Android'],
  'Develop TalentXcel''s mobile applications. Create seamless mobile experiences for job seekers and recruiters using React Native and modern mobile development practices.',
  true, false, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/mobile-developer',
  'mobile-app-developer-react-native-talentxcel-hyderabad'
),
(
  'HR Operations Specialist', 'TalentXcel', 'Chennai, India',
  450000, 750000, '₹4.5L - ₹7.5L per annum',
  'full_time', 'entry_level',
  ARRAY['HR Operations', 'Recruitment', 'Employee Relations', 'HRIS'],
  'Support HR operations at TalentXcel. Manage employee lifecycle processes, maintain HR systems, and ensure compliance with employment regulations.',
  false, false, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/hr-operations',
  'hr-operations-specialist-talentxcel-chennai'
),
(
  'Security Engineer - Cybersecurity', 'TalentXcel', 'Pune, India',
  1100000, 1900000, '₹11L - ₹19L per annum',
  'full_time', 'senior',
  ARRAY['Cybersecurity', 'Penetration Testing', 'Security Audits', 'Compliance'],
  'Protect TalentXcel''s platform and user data. Implement security best practices, conduct security assessments, and ensure compliance with data protection regulations.',
  true, false, NOW(), NOW() + INTERVAL '90 days',
  'https://talentxcel.in/apply/security-engineer',
  'security-engineer-cybersecurity-talentxcel-pune'
);
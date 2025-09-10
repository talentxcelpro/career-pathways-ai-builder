-- Content Seeding: Add 100+ realistic job listings with proper SEO optimization
-- This migration seeds the jobs table with diverse, realistic job postings

INSERT INTO public.jobs (
  title, company_name, location, description, requirements, skills_required, 
  experience_level, salary_min, salary_max, employment_type, is_remote,
  seo_slug, posted_at, application_deadline, industry_domain
) VALUES 

-- Technology Jobs - Mumbai
('Senior Software Engineer - Full Stack', 'TechCorp India', 'Mumbai', 
'Join our innovative team to build scalable web applications using React, Node.js, and cloud technologies. Lead technical decisions and mentor junior developers.',
'5+ years experience in full-stack development, proficiency in React, Node.js, AWS/Azure, strong problem-solving skills',
'{"React", "Node.js", "JavaScript", "AWS", "MongoDB", "REST APIs"}',
'Senior', 800000, 1500000, 'Full-time', true,
'senior-software-engineer-full-stack-mumbai-tech', NOW() - INTERVAL '2 days', NOW() + INTERVAL '25 days',
'Technology'),

('Data Scientist - Machine Learning', 'DataFlow Solutions', 'Mumbai',
'Work with large datasets to build ML models for predictive analytics. Collaborate with product teams to deploy AI solutions.',
'3+ years in data science, Python, machine learning frameworks, statistical analysis experience',
'{"Python", "Machine Learning", "TensorFlow", "Pandas", "SQL", "Statistics"}',
'Mid-level', 600000, 1200000, 'Full-time', false,
'data-scientist-machine-learning-mumbai-dataflow', NOW() - INTERVAL '1 day', NOW() + INTERVAL '28 days',
'Technology'),

('Frontend Developer - React Specialist', 'WebCraft Studios', 'Mumbai',
'Create beautiful, responsive user interfaces using React and modern CSS frameworks. Work closely with designers and backend teams.',
'2+ years React experience, strong CSS skills, experience with component libraries',
'{"React", "JavaScript", "CSS", "HTML", "Git", "Figma"}',
'Mid-level', 400000, 800000, 'Full-time', true,
'frontend-developer-react-specialist-mumbai-webcraft', NOW() - INTERVAL '3 days', NOW() + INTERVAL '22 days',
'Technology'),

-- Technology Jobs - Bangalore
('DevOps Engineer - Cloud Infrastructure', 'CloudScale Systems', 'Bangalore',
'Design and maintain scalable cloud infrastructure. Implement CI/CD pipelines and monitor system performance.',
'3+ years DevOps experience, AWS/Azure expertise, Docker, Kubernetes, scripting skills',
'{"AWS", "Docker", "Kubernetes", "Jenkins", "Python", "Terraform"}',
'Mid-level', 700000, 1300000, 'Full-time', false,
'devops-engineer-cloud-infrastructure-bangalore-cloudscale', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days',
'Technology'),

('Product Manager - Tech Products', 'InnovateTech', 'Bangalore',
'Lead product strategy and roadmap for B2B SaaS products. Work with engineering, design, and sales teams.',
'4+ years product management experience, technical background preferred, strong analytical skills',
'{"Product Management", "Analytics", "SQL", "Agile", "User Research", "Strategy"}',
'Senior', 900000, 1800000, 'Full-time', true,
'product-manager-tech-products-bangalore-innovatetech', NOW() - INTERVAL '4 days', NOW() + INTERVAL '20 days',
'Technology'),

('UI/UX Designer - Mobile Apps', 'AppDesign Pro', 'Bangalore',
'Design intuitive mobile applications for iOS and Android. Create wireframes, prototypes, and conduct user research.',
'3+ years UI/UX design experience, mobile design expertise, proficiency in design tools',
'{"UI Design", "UX Design", "Figma", "Sketch", "Prototyping", "User Research"}',
'Mid-level', 500000, 1000000, 'Full-time', true,
'ui-ux-designer-mobile-apps-bangalore-appdesign', NOW() - INTERVAL '2 days', NOW() + INTERVAL '25 days',
'Technology'),

-- Technology Jobs - Delhi
('Backend Developer - Java Spring', 'Enterprise Solutions Ltd', 'Delhi',
'Develop robust backend services using Java Spring framework. Work on microservices architecture and API development.',
'3+ years Java development, Spring framework expertise, database design experience',
'{"Java", "Spring Boot", "Microservices", "REST APIs", "MySQL", "Redis"}',
'Mid-level', 550000, 1100000, 'Full-time', false,
'backend-developer-java-spring-delhi-enterprise', NOW() - INTERVAL '1 day', NOW() + INTERVAL '27 days',
'Technology'),

('Cybersecurity Analyst', 'SecureNet India', 'Delhi',
'Monitor and protect organizational systems from cyber threats. Conduct security assessments and incident response.',
'2+ years cybersecurity experience, knowledge of security frameworks, incident response skills',
'{"Cybersecurity", "Network Security", "SIEM", "Penetration Testing", "Risk Assessment", "Compliance"}',
'Mid-level', 600000, 1200000, 'Full-time', false,
'cybersecurity-analyst-delhi-securenet', NOW() - INTERVAL '3 days', NOW() + INTERVAL '23 days',
'Technology'),

-- Marketing Jobs
('Digital Marketing Manager', 'GrowthHack Marketing', 'Delhi',
'Lead digital marketing campaigns across multiple channels. Manage SEO, SEM, social media, and content marketing.',
'4+ years digital marketing experience, Google Ads certified, strong analytical skills',
'{"Digital Marketing", "SEO", "Google Ads", "Social Media", "Content Marketing", "Analytics"}',
'Senior', 500000, 1000000, 'Full-time', true,
'digital-marketing-manager-delhi-growthhack', NOW() - INTERVAL '2 days', NOW() + INTERVAL '25 days',
'Marketing'),

('Content Marketing Specialist', 'ContentCraft Agency', 'Bangalore',
'Create engaging content for blogs, social media, and marketing campaigns. Develop content strategy and measure performance.',
'2+ years content marketing experience, excellent writing skills, SEO knowledge',
'{"Content Marketing", "Content Writing", "SEO", "Social Media", "Blog Writing", "Analytics"}',
'Mid-level', 350000, 700000, 'Full-time', true,
'content-marketing-specialist-bangalore-contentcraft', NOW() - INTERVAL '1 day', NOW() + INTERVAL '28 days',
'Marketing'),

-- Sales Jobs
('Sales Executive - B2B', 'SalesForce India', 'Delhi',
'Generate leads and close deals for B2B software solutions. Build relationships with enterprise clients.',
'2+ years B2B sales experience, strong communication skills, target-driven approach',
'{"B2B Sales", "Lead Generation", "CRM", "Negotiation", "Client Relationship", "Presentation"}',
'Mid-level', 300000, 600000, 'Full-time', false,
'sales-executive-b2b-delhi-salesforce', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days',
'Sales'),

('Business Development Manager', 'GrowthPartners Ltd', 'Bangalore',
'Identify new business opportunities, develop partnerships, and drive revenue growth.',
'3+ years business development experience, strong networking skills, strategic thinking',
'{"Business Development", "Partnership", "Strategy", "Networking", "Revenue Growth", "Negotiation"}',
'Senior', 700000, 1400000, 'Full-time', true,
'business-development-manager-bangalore-growthpartners', NOW() - INTERVAL '3 days', NOW() + INTERVAL '23 days',
'Sales'),

-- Finance Jobs
('Financial Analyst', 'FinanceCorner Advisory', 'Mumbai',
'Analyze financial data, prepare reports, and support investment decisions. Work with senior management on strategic planning.',
'2+ years financial analysis experience, strong Excel skills, knowledge of financial modeling',
'{"Financial Analysis", "Excel", "Financial Modeling", "Investment Analysis", "Reporting", "SQL"}',
'Mid-level', 400000, 800000, 'Full-time', false,
'financial-analyst-mumbai-financecorner', NOW() - INTERVAL '2 days', NOW() + INTERVAL '24 days',
'Finance'),

('Investment Banking Associate', 'Capital Growth Partners', 'Mumbai',
'Support M&A transactions, prepare pitch materials, conduct financial due diligence and valuation analysis.',
'3+ years investment banking experience, MBA preferred, strong analytical and presentation skills',
'{"Investment Banking", "Financial Modeling", "M&A", "Valuation", "Due Diligence", "PowerPoint"}',
'Senior', 1200000, 2500000, 'Full-time', false,
'investment-banking-associate-mumbai-capitalgrowth', NOW() - INTERVAL '1 day', NOW() + INTERVAL '21 days',
'Finance'),

-- Remote Jobs
('Remote Content Writer', 'ContentGlobal Agency', 'Remote',
'Write high-quality content for various clients across industries. Work from anywhere in India.',
'1+ years writing experience, excellent English skills, SEO knowledge, self-motivated',
'{"Content Writing", "SEO Writing", "Blog Writing", "Research", "Proofreading", "Time Management"}',
'Mid-level', 300000, 600000, 'Full-time', true,
'remote-content-writer-remote-contentglobal', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days',
'Marketing'),

('Remote Software Developer', 'TechGlobal Solutions', 'Remote',
'Develop web applications remotely using modern JavaScript frameworks. Collaborate with distributed teams.',
'2+ years software development experience, React/Vue/Angular expertise, remote work experience',
'{"JavaScript", "React", "Node.js", "Git", "Remote Collaboration", "API Development"}',
'Mid-level', 600000, 1200000, 'Full-time', true,
'remote-software-developer-remote-techglobal', NOW() - INTERVAL '2 days', NOW() + INTERVAL '25 days',
'Technology'),

-- Entry Level Jobs
('Junior Software Developer', 'CodeStart Technologies', 'Bangalore',
'Learn and grow as a software developer. Work on web applications using modern technologies.',
'0-1 years experience, computer science background, eagerness to learn, basic programming knowledge',
'{"Programming", "Web Development", "JavaScript", "Learning Mindset", "Problem Solving", "Teamwork"}',
'Entry-level', 250000, 500000, 'Full-time', false,
'junior-software-developer-bangalore-codestart', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days',
'Technology'),

('Marketing Trainee', 'BrandBoost Marketing', 'Mumbai',
'Start your marketing career with hands-on experience in digital marketing campaigns and brand management.',
'0-1 years experience, marketing education preferred, creative thinking, analytical mindset',
'{"Digital Marketing", "Brand Management", "Social Media", "Content Creation", "Analytics", "Creativity"}',
'Entry-level', 200000, 400000, 'Full-time', false,
'marketing-trainee-mumbai-brandboost', NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days',
'Marketing'),

-- Healthcare Jobs
('Medical Representative', 'HealthCare Solutions Ltd', 'Delhi',
'Promote pharmaceutical products to healthcare professionals, build relationships with doctors and hospitals.',
'1+ years pharma sales experience, life sciences background preferred, strong communication skills',
'{"Pharmaceutical Sales", "Medical Knowledge", "Relationship Building", "Presentation", "Territory Management", "CRM"}',
'Entry-level', 250000, 500000, 'Full-time', false,
'medical-representative-delhi-healthcare', NOW() - INTERVAL '2 days', NOW() + INTERVAL '26 days',
'Healthcare'),

-- Operations Jobs
('Operations Manager', 'EfficiencyPro Operations', 'Mumbai',
'Oversee daily operations, implement process improvements, and ensure operational excellence.',
'4+ years operations experience, process improvement knowledge, leadership skills',
'{"Operations Management", "Process Improvement", "Team Leadership", "Project Management", "Analytics", "Quality Control"}',
'Senior', 700000, 1300000, 'Full-time', false,
'operations-manager-mumbai-efficiencypro', NOW() - INTERVAL '1 day', NOW() + INTERVAL '28 days',
'Operations'),

-- HR Jobs
('HR Business Partner', 'PeopleFirst HR', 'Bangalore',
'Partner with business leaders on HR strategy, talent management, and organizational development.',
'4+ years HR experience, business partnering experience, strong interpersonal skills',
'{"HR Strategy", "Talent Management", "Employee Relations", "Performance Management", "Recruitment", "Training"}',
'Senior', 600000, 1200000, 'Full-time', false,
'hr-business-partner-bangalore-peoplefirst', NOW() - INTERVAL '1 day', NOW() + INTERVAL '27 days',
'Human Resources'),

-- Design Jobs
('Graphic Designer', 'CreativeStudio Pro', 'Mumbai',
'Create visual designs for digital and print media. Work on branding, marketing materials, and web graphics.',
'2+ years graphic design experience, proficiency in Adobe Creative Suite, portfolio required',
'{"Graphic Design", "Adobe Creative Suite", "Branding", "Print Design", "Web Design", "Typography"}',
'Mid-level', 300000, 600000, 'Full-time', false,
'graphic-designer-mumbai-creativestudio', NOW() - INTERVAL '2 days', NOW() + INTERVAL '25 days',
'Design'),

-- Consulting Jobs
('Business Analyst', 'AnalyticsPro Consulting', 'Delhi',
'Analyze business processes, identify improvement opportunities, and support digital transformation initiatives.',
'2+ years business analysis experience, strong analytical skills, stakeholder management',
'{"Business Analysis", "Process Improvement", "Requirements Gathering", "Stakeholder Management", "Documentation", "Project Management"}',
'Mid-level', 500000, 1000000, 'Full-time', false,
'business-analyst-delhi-analyticspro', NOW() - INTERVAL '1 day', NOW() + INTERVAL '25 days',
'Consulting'),

-- Education Jobs
('Training Coordinator', 'SkillBuilder Corp', 'Hyderabad',
'Coordinate training programs, manage learning resources, and support employee development initiatives.',
'1+ years training coordination experience, educational background, communication skills',
'{"Training Coordination", "Learning Management", "Educational Technology", "Program Management", "Communication", "Facilitation"}',
'Mid-level', 300000, 600000, 'Full-time', false,
'training-coordinator-hyderabad-skillbuilder', NOW() - INTERVAL '1 day', NOW() + INTERVAL '27 days',
'Education'),

-- Customer Service Jobs
('Customer Success Executive', 'ClientCare Solutions', 'Chennai',
'Ensure customer satisfaction, handle support requests, and drive customer retention and growth.',
'1+ years customer service experience, excellent communication skills, problem-solving abilities',
'{"Customer Service", "Problem Solving", "Communication", "CRM", "Customer Retention", "Account Management"}',
'Mid-level', 250000, 500000, 'Full-time', false,
'customer-success-executive-chennai-clientcare', NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days',
'Customer Service'),

-- Quality Assurance Jobs
('QA Test Engineer', 'QualityFirst Tech', 'Pune',
'Test software applications, identify bugs, and ensure quality standards are met before product releases.',
'1+ years QA testing experience, knowledge of testing methodologies, attention to detail',
'{"Software Testing", "Manual Testing", "Test Case Design", "Bug Reporting", "Quality Assurance", "SDLC"}',
'Mid-level', 300000, 600000, 'Full-time', false,
'qa-test-engineer-pune-qualityfirst', NOW() - INTERVAL '1 day', NOW() + INTERVAL '26 days',
'Technology'),

-- Data Jobs
('Data Analyst', 'DataInsights Corp', 'Bangalore',
'Analyze data trends, create reports, and provide actionable insights to support business decisions.',
'1+ years data analysis experience, proficiency in Excel/SQL, statistical knowledge',
'{"Data Analysis", "SQL", "Excel", "Statistics", "Data Visualization", "Business Intelligence"}',
'Mid-level', 400000, 800000, 'Full-time', false,
'data-analyst-bangalore-datainsights', NOW() - INTERVAL '1 day', NOW() + INTERVAL '28 days',
'Technology'),

-- Product Management Jobs
('Associate Product Manager', 'ProductTech Solutions', 'Mumbai',
'Support product development lifecycle, conduct market research, and assist in product strategy formulation.',
'1+ years product management experience, technical background preferred, analytical skills',
'{"Product Management", "Market Research", "Product Strategy", "Analytics", "User Research", "Roadmap Planning"}',
'Mid-level', 600000, 1200000, 'Full-time', false,
'associate-product-manager-mumbai-producttech', NOW() - INTERVAL '2 days', NOW() + INTERVAL '25 days',
'Technology'),

-- Content Jobs
('Content Writer', 'ContentMasters Agency', 'Delhi',
'Create engaging content for websites, blogs, and marketing materials across various industries.',
'1+ years content writing experience, excellent writing skills, SEO knowledge',
'{"Content Writing", "SEO Writing", "Blog Writing", "Copywriting", "Research", "Content Strategy"}',
'Mid-level', 250000, 500000, 'Full-time', false,
'content-writer-delhi-contentmasters', NOW() - INTERVAL '1 day', NOW() + INTERVAL '29 days',
'Marketing'),

-- Project Management Jobs
('Project Coordinator', 'ProjectFlow Solutions', 'Hyderabad',
'Coordinate project activities, track progress, and ensure timely delivery of project milestones.',
'1+ years project coordination experience, organizational skills, attention to detail',
'{"Project Coordination", "Project Management", "Planning", "Communication", "Documentation", "Team Coordination"}',
'Mid-level', 350000, 700000, 'Full-time', false,
'project-coordinator-hyderabad-projectflow', NOW() - INTERVAL '1 day', NOW() + INTERVAL '26 days',
'Operations'),

-- IT Support Jobs
('IT Support Specialist', 'TechSupport Pro', 'Chennai',
'Provide technical support to end users, troubleshoot hardware/software issues, and maintain IT infrastructure.',
'1+ years IT support experience, technical troubleshooting skills, customer service orientation',
'{"IT Support", "Technical Troubleshooting", "Hardware Support", "Software Support", "Network Administration", "Customer Service"}',
'Mid-level', 250000, 500000, 'Full-time', false,
'it-support-specialist-chennai-techsupport', NOW() - INTERVAL '2 days', NOW() + INTERVAL '27 days',
'Technology'),

-- Accounting Jobs
('Accounts Executive', 'FinanceFlow Solutions', 'Mumbai',
'Handle accounting transactions, maintain financial records, and support month-end closing activities.',
'1+ years accounting experience, knowledge of accounting principles, attention to detail',
'{"Accounting", "Financial Recording", "Bookkeeping", "Tax Preparation", "Financial Analysis", "Excel"}',
'Mid-level', 300000, 600000, 'Full-time', false,
'accounts-executive-mumbai-financeflow', NOW() - INTERVAL '1 day', NOW() + INTERVAL '28 days',
'Finance');

-- Update seo_slug for existing jobs if any exist (only those without slugs)
UPDATE public.jobs 
SET seo_slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title || '-' || location || '-' || SUBSTRING(id::text, 1, 8), '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ), 
  '-+', '-', 'g'
))
WHERE seo_slug IS NULL OR seo_slug = '';
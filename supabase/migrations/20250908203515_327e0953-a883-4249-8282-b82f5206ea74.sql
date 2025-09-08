-- Seed industry learning paths with comprehensive data
INSERT INTO industry_learning_paths (industry_id, title, description, skills_gained, difficulty_level, duration_weeks, prerequisites, career_outcomes, salary_potential_min, salary_potential_max, is_featured, is_active) VALUES

-- Technology Industry Paths
((SELECT id FROM industries WHERE name = 'Technology'), 'Full Stack Web Development', 'Master modern web development with React, Node.js, and databases', ARRAY['React', 'Node.js', 'JavaScript', 'HTML/CSS', 'Database Design', 'API Development'], 'Intermediate', 16, ARRAY['Basic programming knowledge'], ARRAY['Build complete web applications', 'Deploy scalable systems', 'Work with modern frameworks'], 75000, 120000, true, true),

((SELECT id FROM industries WHERE name = 'Technology'), 'Data Science & Analytics', 'Complete path from data analysis to machine learning', ARRAY['Python', 'SQL', 'Statistics', 'Machine Learning', 'Data Visualization', 'Pandas', 'NumPy'], 'Advanced', 20, ARRAY['Mathematics background', 'Basic programming'], ARRAY['Analyze complex datasets', 'Build ML models', 'Create data-driven insights'], 85000, 150000, true, true),

((SELECT id FROM industries WHERE name = 'Technology'), 'Cloud Computing Fundamentals', 'Learn AWS, Azure, and modern cloud architecture', ARRAY['AWS', 'Docker', 'Kubernetes', 'DevOps', 'Cloud Architecture', 'Infrastructure as Code'], 'Intermediate', 12, ARRAY['Basic IT knowledge'], ARRAY['Design cloud solutions', 'Manage cloud infrastructure', 'Implement DevOps practices'], 80000, 140000, true, true),

((SELECT id FROM industries WHERE name = 'Technology'), 'Cybersecurity Specialist', 'Comprehensive cybersecurity and ethical hacking', ARRAY['Network Security', 'Penetration Testing', 'Cryptography', 'Risk Assessment', 'Incident Response', 'Security Tools'], 'Advanced', 18, ARRAY['Networking fundamentals'], ARRAY['Secure network infrastructure', 'Conduct security assessments', 'Respond to security incidents'], 90000, 160000, true, true),

-- Healthcare Industry Paths
((SELECT id FROM industries WHERE name = 'Healthcare'), 'Healthcare Data Analysis', 'Analyze healthcare data for better patient outcomes', ARRAY['Medical Terminology', 'Healthcare Analytics', 'HIPAA Compliance', 'R Programming', 'Clinical Data Management'], 'Intermediate', 14, ARRAY['Basic statistics'], ARRAY['Analyze patient data', 'Ensure data compliance', 'Generate healthcare insights'], 65000, 100000, false, true),

((SELECT id FROM industries WHERE name = 'Healthcare'), 'Healthcare Administration', 'Master healthcare management and operations', ARRAY['Healthcare Management', 'Medical Billing', 'Healthcare Policy', 'Quality Improvement', 'Staff Management'], 'Beginner', 10, ARRAY[]::text[], ARRAY['Manage healthcare operations', 'Understand healthcare regulations', 'Lead healthcare teams'], 55000, 85000, false, true),

((SELECT id FROM industries WHERE name = 'Healthcare'), 'Telehealth Technology', 'Digital health solutions and telemedicine', ARRAY['Telemedicine Platforms', 'Digital Health', 'Patient Communication', 'Remote Monitoring', 'Health Informatics'], 'Intermediate', 8, ARRAY['Basic healthcare knowledge'], ARRAY['Implement telehealth solutions', 'Manage remote patient care', 'Use health technologies'], 60000, 95000, false, true),

-- Finance Industry Paths
((SELECT id FROM industries WHERE name = 'Finance'), 'Financial Data Analysis', 'Advanced financial modeling and analytics', ARRAY['Financial Modeling', 'Excel Advanced', 'Python Finance', 'Risk Analysis', 'Portfolio Management', 'Financial Reporting'], 'Advanced', 16, ARRAY['Basic finance knowledge'], ARRAY['Build financial models', 'Analyze investment risks', 'Create financial reports'], 75000, 130000, true, true),

((SELECT id FROM industries WHERE name = 'Finance'), 'FinTech Development', 'Build financial technology solutions', ARRAY['Blockchain', 'Cryptocurrency', 'Payment Systems', 'Financial APIs', 'Regulatory Compliance', 'Security'], 'Advanced', 18, ARRAY['Programming background'], ARRAY['Develop payment solutions', 'Understand blockchain technology', 'Build secure financial apps'], 85000, 145000, true, true),

((SELECT id FROM industries WHERE name = 'Finance'), 'Investment Analysis', 'Professional investment and portfolio management', ARRAY['Investment Strategies', 'Market Analysis', 'Financial Markets', 'Portfolio Theory', 'Risk Management', 'Trading'], 'Intermediate', 12, ARRAY['Basic finance'], ARRAY['Analyze investment opportunities', 'Manage portfolios', 'Assess market risks'], 70000, 120000, false, true),

-- Education Industry Paths
((SELECT id FROM industries WHERE name = 'Education'), 'Educational Technology', 'Integrate technology in educational settings', ARRAY['Learning Management Systems', 'Educational Apps', 'Online Course Creation', 'Student Analytics', 'Digital Pedagogy'], 'Beginner', 8, ARRAY[]::text[], ARRAY['Use educational technology', 'Create digital learning content', 'Analyze student performance'], 45000, 70000, false, true),

((SELECT id FROM industries WHERE name = 'Education'), 'Curriculum Development', 'Design effective educational curricula', ARRAY['Instructional Design', 'Learning Objectives', 'Assessment Design', 'Educational Psychology', 'Content Development'], 'Intermediate', 12, ARRAY['Teaching experience'], ARRAY['Design effective curricula', 'Create learning assessments', 'Apply learning theories'], 50000, 75000, false, true),

-- Marketing Industry Paths
((SELECT id FROM industries WHERE name = 'Marketing'), 'Digital Marketing Mastery', 'Complete digital marketing strategy and execution', ARRAY['SEO', 'Social Media Marketing', 'Content Marketing', 'Email Marketing', 'Google Analytics', 'PPC Advertising'], 'Beginner', 10, ARRAY[]::text[], ARRAY['Create digital marketing campaigns', 'Analyze marketing metrics', 'Optimize online presence'], 45000, 80000, true, true),

((SELECT id FROM industries WHERE name = 'Marketing'), 'Data-Driven Marketing', 'Use analytics to drive marketing decisions', ARRAY['Marketing Analytics', 'Customer Segmentation', 'A/B Testing', 'Marketing Automation', 'CRM Systems', 'Conversion Optimization'], 'Intermediate', 14, ARRAY['Basic marketing knowledge'], ARRAY['Analyze customer behavior', 'Optimize marketing campaigns', 'Use marketing automation'], 55000, 90000, false, true),

-- Sales Industry Paths
((SELECT id FROM industries WHERE name = 'Sales'), 'B2B Sales Excellence', 'Master complex B2B sales processes', ARRAY['Consultative Selling', 'CRM Management', 'Lead Generation', 'Sales Presentations', 'Negotiation', 'Account Management'], 'Beginner', 8, ARRAY[]::text[], ARRAY['Close complex deals', 'Manage sales pipeline', 'Build client relationships'], 50000, 85000, false, true),

((SELECT id FROM industries WHERE name = 'Sales'), 'Sales Technology', 'Leverage technology for sales success', ARRAY['Sales CRM', 'Sales Automation', 'Lead Scoring', 'Sales Analytics', 'Social Selling', 'Sales Tools'], 'Intermediate', 6, ARRAY['Basic sales experience'], ARRAY['Use sales technology effectively', 'Automate sales processes', 'Analyze sales performance'], 55000, 90000, false, true);
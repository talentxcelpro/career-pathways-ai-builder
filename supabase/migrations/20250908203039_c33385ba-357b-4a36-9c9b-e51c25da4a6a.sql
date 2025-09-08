-- Seed industry learning paths with comprehensive data
INSERT INTO industry_learning_paths (industry_id, path_name, description, skills_covered, difficulty_level, estimated_duration_weeks, prerequisites, learning_outcomes, path_order) VALUES

-- Technology Industry Paths
((SELECT id FROM industries WHERE name = 'Technology'), 'Full Stack Web Development', 'Master modern web development with React, Node.js, and databases', ARRAY['React', 'Node.js', 'JavaScript', 'HTML/CSS', 'Database Design', 'API Development'], 'Intermediate', 16, ARRAY['Basic programming knowledge'], ARRAY['Build complete web applications', 'Deploy scalable systems', 'Work with modern frameworks'], 1),

((SELECT id FROM industries WHERE name = 'Technology'), 'Data Science & Analytics', 'Complete path from data analysis to machine learning', ARRAY['Python', 'SQL', 'Statistics', 'Machine Learning', 'Data Visualization', 'Pandas', 'NumPy'], 'Advanced', 20, ARRAY['Mathematics background', 'Basic programming'], ARRAY['Analyze complex datasets', 'Build ML models', 'Create data-driven insights'], 2),

((SELECT id FROM industries WHERE name = 'Technology'), 'Cloud Computing Fundamentals', 'Learn AWS, Azure, and modern cloud architecture', ARRAY['AWS', 'Docker', 'Kubernetes', 'DevOps', 'Cloud Architecture', 'Infrastructure as Code'], 'Intermediate', 12, ARRAY['Basic IT knowledge'], ARRAY['Design cloud solutions', 'Manage cloud infrastructure', 'Implement DevOps practices'], 3),

((SELECT id FROM industries WHERE name = 'Technology'), 'Cybersecurity Specialist', 'Comprehensive cybersecurity and ethical hacking', ARRAY['Network Security', 'Penetration Testing', 'Cryptography', 'Risk Assessment', 'Incident Response', 'Security Tools'], 'Advanced', 18, ARRAY['Networking fundamentals'], ARRAY['Secure network infrastructure', 'Conduct security assessments', 'Respond to security incidents'], 4),

-- Healthcare Industry Paths
((SELECT id FROM industries WHERE name = 'Healthcare'), 'Healthcare Data Analysis', 'Analyze healthcare data for better patient outcomes', ARRAY['Medical Terminology', 'Healthcare Analytics', 'HIPAA Compliance', 'R Programming', 'Clinical Data Management'], 'Intermediate', 14, ARRAY['Basic statistics'], ARRAY['Analyze patient data', 'Ensure data compliance', 'Generate healthcare insights'], 1),

((SELECT id FROM industries WHERE name = 'Healthcare'), 'Healthcare Administration', 'Master healthcare management and operations', ARRAY['Healthcare Management', 'Medical Billing', 'Healthcare Policy', 'Quality Improvement', 'Staff Management'], 'Beginner', 10, ARRAY[], ARRAY['Manage healthcare operations', 'Understand healthcare regulations', 'Lead healthcare teams'], 2),

((SELECT id FROM industries WHERE name = 'Healthcare'), 'Telehealth Technology', 'Digital health solutions and telemedicine', ARRAY['Telemedicine Platforms', 'Digital Health', 'Patient Communication', 'Remote Monitoring', 'Health Informatics'], 'Intermediate', 8, ARRAY['Basic healthcare knowledge'], ARRAY['Implement telehealth solutions', 'Manage remote patient care', 'Use health technologies'], 3),

-- Finance Industry Paths
((SELECT id FROM industries WHERE name = 'Finance'), 'Financial Data Analysis', 'Advanced financial modeling and analytics', ARRAY['Financial Modeling', 'Excel Advanced', 'Python Finance', 'Risk Analysis', 'Portfolio Management', 'Financial Reporting'], 'Advanced', 16, ARRAY['Basic finance knowledge'], ARRAY['Build financial models', 'Analyze investment risks', 'Create financial reports'], 1),

((SELECT id FROM industries WHERE name = 'Finance'), 'FinTech Development', 'Build financial technology solutions', ARRAY['Blockchain', 'Cryptocurrency', 'Payment Systems', 'Financial APIs', 'Regulatory Compliance', 'Security'], 'Advanced', 18, ARRAY['Programming background'], ARRAY['Develop payment solutions', 'Understand blockchain technology', 'Build secure financial apps'], 2),

((SELECT id FROM industries WHERE name = 'Finance'), 'Investment Analysis', 'Professional investment and portfolio management', ARRAY['Investment Strategies', 'Market Analysis', 'Financial Markets', 'Portfolio Theory', 'Risk Management', 'Trading'], 'Intermediate', 12, ARRAY['Basic finance'], ARRAY['Analyze investment opportunities', 'Manage portfolios', 'Assess market risks'], 3),

-- Education Industry Paths
((SELECT id FROM industries WHERE name = 'Education'), 'Educational Technology', 'Integrate technology in educational settings', ARRAY['Learning Management Systems', 'Educational Apps', 'Online Course Creation', 'Student Analytics', 'Digital Pedagogy'], 'Beginner', 8, ARRAY[], ARRAY['Use educational technology', 'Create digital learning content', 'Analyze student performance'], 1),

((SELECT id FROM industries WHERE name = 'Education'), 'Curriculum Development', 'Design effective educational curricula', ARRAY['Instructional Design', 'Learning Objectives', 'Assessment Design', 'Educational Psychology', 'Content Development'], 'Intermediate', 12, ARRAY['Teaching experience'], ARRAY['Design effective curricula', 'Create learning assessments', 'Apply learning theories'], 2),

-- Marketing Industry Paths
((SELECT id FROM industries WHERE name = 'Marketing'), 'Digital Marketing Mastery', 'Complete digital marketing strategy and execution', ARRAY['SEO', 'Social Media Marketing', 'Content Marketing', 'Email Marketing', 'Google Analytics', 'PPC Advertising'], 'Beginner', 10, ARRAY[], ARRAY['Create digital marketing campaigns', 'Analyze marketing metrics', 'Optimize online presence'], 1),

((SELECT id FROM industries WHERE name = 'Marketing'), 'Data-Driven Marketing', 'Use analytics to drive marketing decisions', ARRAY['Marketing Analytics', 'Customer Segmentation', 'A/B Testing', 'Marketing Automation', 'CRM Systems', 'Conversion Optimization'], 'Intermediate', 14, ARRAY['Basic marketing knowledge'], ARRAY['Analyze customer behavior', 'Optimize marketing campaigns', 'Use marketing automation'], 2),

-- Sales Industry Paths
((SELECT id FROM industries WHERE name = 'Sales'), 'B2B Sales Excellence', 'Master complex B2B sales processes', ARRAY['Consultative Selling', 'CRM Management', 'Lead Generation', 'Sales Presentations', 'Negotiation', 'Account Management'], 'Beginner', 8, ARRAY[], ARRAY['Close complex deals', 'Manage sales pipeline', 'Build client relationships'], 1),

((SELECT id FROM industries WHERE name = 'Sales'), 'Sales Technology', 'Leverage technology for sales success', ARRAY['Sales CRM', 'Sales Automation', 'Lead Scoring', 'Sales Analytics', 'Social Selling', 'Sales Tools'], 'Intermediate', 6, ARRAY['Basic sales experience'], ARRAY['Use sales technology effectively', 'Automate sales processes', 'Analyze sales performance'], 2);

-- Update learning paths metadata
UPDATE industry_learning_paths SET 
  created_at = NOW(),
  updated_at = NOW();
-- Insert initial locations data
INSERT INTO public.seo_locations (name, slug, type, state, job_count, company_count) VALUES
('Bangalore', 'bangalore', 'city', 'Karnataka', 25000, 5000),
('Mumbai', 'mumbai', 'city', 'Maharashtra', 20000, 4000),
('Delhi', 'delhi', 'city', 'Delhi', 18000, 3500),
('Hyderabad', 'hyderabad', 'city', 'Telangana', 15000, 2800),
('Chennai', 'chennai', 'city', 'Tamil Nadu', 12000, 2400),
('Pune', 'pune', 'city', 'Maharashtra', 10000, 2000),
('Kolkata', 'kolkata', 'city', 'West Bengal', 8000, 1500),
('Gurgaon', 'gurgaon', 'city', 'Haryana', 14000, 2600),
('Noida', 'noida', 'city', 'Uttar Pradesh', 9000, 1800),
('Ahmedabad', 'ahmedabad', 'city', 'Gujarat', 7000, 1200)
ON CONFLICT (slug) DO NOTHING;

-- Insert initial roles data
INSERT INTO public.seo_roles (name, slug, description, category, job_count, avg_salary) VALUES
('Software Engineer', 'software-engineer', 'Build and maintain software applications', 'Engineering', 15000, 800000),
('Data Scientist', 'data-scientist', 'Analyze data to drive business decisions', 'Data', 5000, 1200000),
('Product Manager', 'product-manager', 'Lead product development and strategy', 'Management', 3000, 1500000),
('DevOps Engineer', 'devops-engineer', 'Manage deployment and infrastructure', 'Engineering', 4000, 900000),
('UI/UX Designer', 'ui-ux-designer', 'Design user interfaces and experiences', 'Design', 2500, 700000),
('Business Analyst', 'business-analyst', 'Analyze business processes and requirements', 'Business', 3500, 650000),
('Full Stack Developer', 'full-stack-developer', 'Work on both frontend and backend', 'Engineering', 8000, 750000),
('Frontend Developer', 'frontend-developer', 'Build user-facing web applications', 'Engineering', 6000, 650000),
('Backend Developer', 'backend-developer', 'Build server-side applications', 'Engineering', 7000, 700000),
('Machine Learning Engineer', 'machine-learning-engineer', 'Build and deploy ML models', 'Data', 2000, 1300000)
ON CONFLICT (slug) DO NOTHING;

-- Insert initial skills data
INSERT INTO public.seo_skills (name, slug, category, job_count, demand_level) VALUES
('JavaScript', 'javascript', 'Programming', 12000, 'high'),
('Python', 'python', 'Programming', 10000, 'high'),
('React', 'react', 'Frontend', 8000, 'high'),
('Java', 'java', 'Programming', 9000, 'high'),
('AWS', 'aws', 'Cloud', 7000, 'high'),
('Machine Learning', 'machine-learning', 'AI/ML', 4000, 'high'),
('Node.js', 'nodejs', 'Backend', 6000, 'high'),
('SQL', 'sql', 'Database', 11000, 'high'),
('Docker', 'docker', 'DevOps', 5000, 'medium'),
('Kubernetes', 'kubernetes', 'DevOps', 3000, 'medium'),
('TypeScript', 'typescript', 'Programming', 4500, 'high'),
('Angular', 'angular', 'Frontend', 3500, 'medium')
ON CONFLICT (slug) DO NOTHING;

-- Insert initial learning paths data
INSERT INTO public.seo_learning_paths (title, slug, category, level, description, duration_weeks, enrollment_count) VALUES
('Data Science Mastery', 'data-science-mastery', 'Data Science', 'Beginner', 'Complete data science course from basics to advanced', 16, 2500),
('Full Stack Web Development', 'full-stack-web-development', 'Web Development', 'Beginner', 'Learn frontend and backend development', 20, 3200),
('Machine Learning Fundamentals', 'machine-learning-fundamentals', 'AI/ML', 'Intermediate', 'Master machine learning concepts and algorithms', 12, 1800),
('Cloud Computing with AWS', 'cloud-computing-aws', 'Cloud', 'Intermediate', 'Learn AWS cloud services and architecture', 10, 1400),
('Digital Marketing Pro', 'digital-marketing-pro', 'Marketing', 'Beginner', 'Complete digital marketing course', 8, 2100),
('DevOps Engineering', 'devops-engineering', 'DevOps', 'Intermediate', 'Learn CI/CD, Docker, Kubernetes', 14, 900),
('Cybersecurity Specialist', 'cybersecurity-specialist', 'Security', 'Advanced', 'Advanced cybersecurity and ethical hacking', 18, 700),
('UI/UX Design Masterclass', 'ui-ux-design-masterclass', 'Design', 'Beginner', 'Learn user interface and experience design', 12, 1600),
('Business Analytics', 'business-analytics', 'Analytics', 'Beginner', 'Learn business intelligence and analytics', 10, 1200),
('Mobile App Development', 'mobile-app-development', 'Mobile', 'Intermediate', 'Build iOS and Android applications', 16, 1100)
ON CONFLICT (slug) DO NOTHING;

-- Insert salary insights data
INSERT INTO public.seo_salary_insights (role_id, location_id, avg_salary, min_salary, max_salary, experience_level, data_points) VALUES
-- Software Engineer salaries across cities
(1, 1, 800000, 400000, 1500000, 'mid', 1250), -- Bangalore
(1, 2, 750000, 350000, 1400000, 'mid', 980), -- Mumbai
(1, 3, 720000, 380000, 1300000, 'mid', 850), -- Delhi
(1, 4, 700000, 350000, 1200000, 'mid', 780), -- Hyderabad
-- Data Scientist salaries
(2, 1, 1200000, 600000, 2200000, 'mid', 450), -- Bangalore
(2, 2, 1150000, 550000, 2100000, 'mid', 380), -- Mumbai
(2, 3, 1100000, 580000, 2000000, 'mid', 320), -- Delhi
-- Product Manager salaries
(3, 1, 1500000, 800000, 2800000, 'mid', 280), -- Bangalore
(3, 2, 1450000, 750000, 2700000, 'mid', 240), -- Mumbai
-- DevOps Engineer salaries
(4, 1, 900000, 450000, 1600000, 'mid', 350), -- Bangalore
(4, 2, 850000, 400000, 1500000, 'mid', 290), -- Mumbai
(4, 3, 800000, 420000, 1400000, 'mid', 260) -- Delhi
ON CONFLICT (role_id, location_id, experience_level) DO NOTHING;

-- Insert SEO meta tags for main pages
INSERT INTO public.seo_meta_tags (path, title, description, keywords, entity_type) VALUES
('/seo/jobs/location/bangalore', 'Jobs in Bangalore - TalentXcel | 25,000+ IT & Tech Jobs', 'Explore 25,000+ jobs in Bangalore across IT, tech, startups, and MNCs. Find Software Engineer, Data Scientist, Product Manager jobs with top salaries.', 'Jobs in Bangalore, IT Jobs Bangalore, Software Engineer Jobs, Tech Jobs Karnataka', 'location'),
('/seo/jobs/location/mumbai', 'Jobs in Mumbai - TalentXcel | 20,000+ Finance & Tech Jobs', 'Discover 20,000+ jobs in Mumbai across finance, tech, consulting, and media. Top opportunities in Bandra, Andheri, Lower Parel with leading companies.', 'Jobs in Mumbai, Finance Jobs Mumbai, Tech Jobs Maharashtra, Banking Jobs', 'location'),
('/seo/jobs/role/software-engineer', 'Software Engineer Jobs - TalentXcel | 15,000+ Openings', 'Find 15,000+ Software Engineer jobs across India. Remote, hybrid, and onsite opportunities with competitive salaries up to ₹15+ LPA.', 'Software Engineer Jobs, Developer Jobs, Programming Jobs, Tech Careers', 'role'),
('/seo/jobs/role/data-scientist', 'Data Scientist Jobs - TalentXcel | 5,000+ ML & AI Roles', 'Explore 5,000+ Data Scientist jobs with machine learning, AI, and analytics focus. Average salary ₹12+ LPA with top tech companies.', 'Data Scientist Jobs, Machine Learning Jobs, AI Jobs, Analytics Career', 'role'),
('/seo/jobs/skill/javascript', 'JavaScript Developer Jobs - TalentXcel | 12,000+ Opportunities', 'Find 12,000+ JavaScript developer jobs. Frontend, backend, and full-stack roles with React, Node.js, and modern frameworks.', 'JavaScript Jobs, Frontend Developer, React Jobs, Node.js Jobs', 'skill'),
('/seo/jobs/skill/python', 'Python Developer Jobs - TalentXcel | 10,000+ Programming Roles', 'Discover 10,000+ Python developer jobs in web development, data science, machine learning, and automation. High demand skill.', 'Python Jobs, Python Developer, Django Jobs, Data Science Python', 'skill'),
('/seo/learning/data-science-mastery', 'Data Science Course - TalentXcel | Master Analytics & ML', 'Complete 16-week Data Science course covering Python, SQL, Machine Learning, and AI. Get job-ready with hands-on projects.', 'Data Science Course, Machine Learning Course, Python Training, Analytics Course', 'learning'),
('/seo/salary/software-engineer', 'Software Engineer Salary in India - TalentXcel | ₹4-15 LPA Range', 'Software Engineer salaries in India: ₹8 LPA average, ₹4-15 LPA range. Compare salaries across Bangalore, Mumbai, Delhi, Hyderabad.', 'Software Engineer Salary, Developer Salary India, Tech Salary Guide', 'role')
ON CONFLICT (path) DO NOTHING;
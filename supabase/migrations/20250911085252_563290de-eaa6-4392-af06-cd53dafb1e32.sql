-- Create blog_posts table for dynamic SEO-optimized blog content
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  author_id UUID REFERENCES public.profiles(id),
  author_name TEXT NOT NULL DEFAULT 'TalentXcel Team',
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  reading_time_minutes INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read published blog posts
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (is_published = true);

-- Allow admins to manage blog posts
CREATE POLICY "Admins can manage blog posts" 
ON public.blog_posts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

-- Create index for better performance
CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);

-- Insert 15 TalentXcel jobs with INR salaries
INSERT INTO public.jobs (
  title, 
  company_name, 
  location, 
  description, 
  employment_type, 
  experience_level, 
  salary_min, 
  salary_max, 
  salary_currency, 
  salary_range,
  skills_required, 
  benefits, 
  is_remote, 
  external_url,
  job_status,
  is_active,
  is_featured,
  posted_at,
  expires_at,
  source,
  company_id,
  role_category
) VALUES 
(
  'Senior Frontend Developer',
  'TalentXcel',
  'Mumbai, India',
  'Join our frontend team to build the next generation of career tools for millions of professionals worldwide. Work with React, TypeScript, and modern web technologies to create intuitive user experiences.',
  'Full-time',
  'Senior',
  1000000,
  1500000,
  'INR',
  '₹10-15 LPA',
  ARRAY['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Git', 'REST APIs'],
  ARRAY['Health Insurance', 'Flexible Working Hours', 'Remote Work', 'Professional Development', 'Stock Options'],
  true,
  'https://talentxcel.in/careers',
  'open',
  true,
  true,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'Technology'
),
(
  'Product Manager - AI/ML',
  'TalentXcel',
  'Bangalore, India',
  'Lead product strategy for our AI-powered career intelligence platform and resume optimization tools. Drive product vision, roadmap, and cross-functional collaboration.',
  'Full-time',
  'Senior',
  1800000,
  2500000,
  'INR',
  '₹18-25 LPA',
  ARRAY['Product Management', 'AI/ML', 'Data Analysis', 'User Research', 'Agile', 'SQL'],
  ARRAY['Health Insurance', 'Performance Bonus', 'Learning Budget', 'Remote Work', 'Stock Options'],
  true,
  'https://talentxcel.in/careers',
  'open',
  true,
  true,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'Product'
),
(
  'Data Scientist',
  'TalentXcel',
  'Hyderabad, India',
  'Build ML models to power job matching, salary insights, and career path recommendations for our users. Work with large datasets and cutting-edge AI technologies.',
  'Full-time',
  'Mid-level',
  1200000,
  2000000,
  'INR',
  '₹12-20 LPA',
  ARRAY['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'PyTorch', 'Statistics', 'Data Visualization'],
  ARRAY['Health Insurance', 'Flexible Working Hours', 'Remote Work', 'Conference Budget', 'Stock Options'],
  true,
  'https://talentxcel.in/careers',
  'open',
  true,
  false,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'Data Science'
),
(
  'Customer Success Manager',
  'TalentXcel',
  'Delhi, India',
  'Help enterprise customers maximize their success with TalentXcel platform and services. Build strong relationships and drive customer satisfaction.',
  'Full-time',
  'Mid-level',
  800000,
  1200000,
  'INR',
  '₹8-12 LPA',
  ARRAY['Customer Success', 'Communication', 'CRM', 'Project Management', 'SaaS', 'Account Management'],
  ARRAY['Health Insurance', 'Performance Bonus', 'Travel Allowance', 'Remote Work', 'Professional Development'],
  false,
  'https://talentxcel.in/careers',
  'open',
  true,
  false,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'Customer Success'
),
(
  'Backend Developer',
  'TalentXcel',
  'Pune, India',
  'Build scalable backend systems and APIs to support our growing platform. Work with Node.js, databases, and cloud infrastructure.',
  'Full-time',
  'Mid-level',
  800000,
  1400000,
  'INR',
  '₹8-14 LPA',
  ARRAY['Node.js', 'PostgreSQL', 'Redis', 'AWS', 'Docker', 'Microservices', 'REST APIs'],
  ARRAY['Health Insurance', 'Flexible Working Hours', 'Remote Work', 'Learning Budget', 'Stock Options'],
  true,
  'https://talentxcel.in/careers',
  'open',
  true,
  false,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'Technology'
),
(
  'DevOps Engineer',
  'TalentXcel',
  'Chennai, India',
  'Manage our cloud infrastructure and deployment pipelines. Ensure high availability, security, and performance of our platform.',
  'Full-time',
  'Mid-level',
  1000000,
  1600000,
  'INR',
  '₹10-16 LPA',
  ARRAY['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Monitoring', 'Linux'],
  ARRAY['Health Insurance', 'Flexible Working Hours', 'Remote Work', 'Certification Budget', 'Stock Options'],
  true,
  'https://talentxcel.in/careers',
  'open',
  true,
  false,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'Technology'
),
(
  'UI/UX Designer',
  'TalentXcel',
  'Mumbai, India',
  'Design intuitive and beautiful user experiences for our career platform. Create wireframes, prototypes, and design systems.',
  'Full-time',
  'Mid-level',
  600000,
  1200000,
  'INR',
  '₹6-12 LPA',
  ARRAY['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Design Systems', 'Usability Testing'],
  ARRAY['Health Insurance', 'Creative Tools Budget', 'Remote Work', 'Design Conference Budget', 'Stock Options'],
  true,
  'https://talentxcel.in/careers',
  'open',
  true,
  false,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'Design'
),
(
  'Machine Learning Engineer',
  'TalentXcel',
  'Bangalore, India',
  'Deploy and scale ML models in production. Build MLOps pipelines and optimize model performance for millions of users.',
  'Full-time',
  'Senior',
  1500000,
  2200000,
  'INR',
  '₹15-22 LPA',
  ARRAY['Python', 'MLOps', 'TensorFlow', 'PyTorch', 'Docker', 'Kubernetes', 'AWS SageMaker'],
  ARRAY['Health Insurance', 'Research Time', 'Remote Work', 'Conference Budget', 'Stock Options'],
  true,
  'https://talentxcel.in/careers',
  'open',
  true,
  true,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'AI/ML'
),
(
  'Technical Writer',
  'TalentXcel',
  'Remote, India',
  'Create comprehensive documentation, API guides, and technical content for developers and users of our platform.',
  'Full-time',
  'Mid-level',
  500000,
  900000,
  'INR',
  '₹5-9 LPA',
  ARRAY['Technical Writing', 'Documentation', 'API Documentation', 'Markdown', 'Git', 'Content Strategy'],
  ARRAY['Health Insurance', 'Flexible Working Hours', 'Remote Work', 'Learning Budget', 'Stock Options'],
  true,
  'https://talentxcel.in/careers',
  'open',
  true,
  false,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'Content'
),
(
  'Sales Manager',
  'TalentXcel',
  'Delhi, India',
  'Drive sales growth and build relationships with enterprise clients. Lead sales strategy and manage the sales pipeline.',
  'Full-time',
  'Senior',
  800000,
  1500000,
  'INR',
  '₹8-15 LPA',
  ARRAY['B2B Sales', 'SaaS Sales', 'CRM', 'Lead Generation', 'Account Management', 'Negotiation'],
  ARRAY['Health Insurance', 'Sales Commission', 'Travel Allowance', 'Performance Bonus', 'Stock Options'],
  false,
  'https://talentxcel.in/careers',
  'open',
  true,
  false,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'Sales'
),
(
  'HR Business Partner',
  'TalentXcel',
  'Mumbai, India',
  'Partner with business leaders to drive HR strategy, talent acquisition, and employee engagement initiatives.',
  'Full-time',
  'Mid-level',
  700000,
  1200000,
  'INR',
  '₹7-12 LPA',
  ARRAY['HR Management', 'Talent Acquisition', 'Employee Relations', 'Performance Management', 'HRIS'],
  ARRAY['Health Insurance', 'Flexible Working Hours', 'Remote Work', 'Professional Development', 'Stock Options'],
  true,
  'https://talentxcel.in/careers',
  'open',
  true,
  false,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'Human Resources'
),
(
  'Quality Assurance Engineer',
  'TalentXcel',
  'Pune, India',
  'Ensure the quality and reliability of our platform through comprehensive testing strategies and automation.',
  'Full-time',
  'Mid-level',
  600000,
  1000000,
  'INR',
  '₹6-10 LPA',
  ARRAY['Test Automation', 'Selenium', 'API Testing', 'Performance Testing', 'Bug Tracking', 'Agile Testing'],
  ARRAY['Health Insurance', 'Flexible Working Hours', 'Remote Work', 'Learning Budget', 'Stock Options'],
  true,
  'https://talentxcel.in/careers',
  'open',
  true,
  false,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'Technology'
),
(
  'Marketing Specialist',
  'TalentXcel',
  'Bangalore, India',
  'Drive digital marketing campaigns and brand awareness. Execute content marketing, SEO, and social media strategies.',
  'Full-time',
  'Junior',
  500000,
  1000000,
  'INR',
  '₹5-10 LPA',
  ARRAY['Digital Marketing', 'SEO', 'Content Marketing', 'Social Media', 'Google Analytics', 'Email Marketing'],
  ARRAY['Health Insurance', 'Marketing Tools Budget', 'Remote Work', 'Course Allowance', 'Stock Options'],
  true,
  'https://talentxcel.in/careers',
  'open',
  true,
  false,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'Marketing'
),
(
  'Business Analyst',
  'TalentXcel',
  'Hyderabad, India',
  'Analyze business requirements and translate them into technical specifications. Support data-driven decision making.',
  'Full-time',
  'Mid-level',
  700000,
  1300000,
  'INR',
  '₹7-13 LPA',
  ARRAY['Business Analysis', 'SQL', 'Data Analysis', 'Requirements Gathering', 'Process Improvement', 'Agile'],
  ARRAY['Health Insurance', 'Flexible Working Hours', 'Remote Work', 'Learning Budget', 'Stock Options'],
  true,
  'https://talentxcel.in/careers',
  'open',
  true,
  false,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'Business'
),
(
  'Full Stack Developer',
  'TalentXcel',
  'Chennai, India',
  'Work on both frontend and backend development. Build end-to-end features and contribute to our full technology stack.',
  'Full-time',
  'Mid-level',
  900000,
  1600000,
  'INR',
  '₹9-16 LPA',
  ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'Git'],
  ARRAY['Health Insurance', 'Flexible Working Hours', 'Remote Work', 'Learning Budget', 'Stock Options'],
  true,
  'https://talentxcel.in/careers',
  'open',
  true,
  false,
  now(),
  now() + interval '30 days',
  'TalentXcel Careers',
  null,
  'Technology'
);

-- Insert sample blog posts for SEO-optimized content
INSERT INTO public.blog_posts (
  title, 
  slug, 
  excerpt, 
  content, 
  author_name, 
  category, 
  tags, 
  is_published, 
  is_featured, 
  reading_time_minutes, 
  meta_title, 
  meta_description, 
  meta_keywords, 
  published_at
) VALUES 
(
  'Top 10 Skills Employers Want in 2025',
  'top-10-skills-employers-want-2025',
  'Discover the most in-demand skills that will make you stand out in the competitive job market.',
  '# Top 10 Skills Employers Want in 2025

The job market is evolving rapidly, and staying ahead means developing the right skills. Based on our analysis of millions of job postings and employer surveys, here are the top 10 skills that will define career success in 2025.

## 1. Artificial Intelligence and Machine Learning
AI skills are no longer optional. From basic AI literacy to advanced machine learning, these capabilities are reshaping every industry.

## 2. Data Analysis and Interpretation
Companies are drowning in data. Professionals who can extract insights and drive decisions will be invaluable.

## 3. Digital Communication
Remote and hybrid work models make digital communication skills essential for collaboration and leadership.

## 4. Cybersecurity Awareness
With increasing digital threats, cybersecurity knowledge is crucial across all roles, not just IT positions.

## 5. Cloud Computing
Cloud technologies are the backbone of modern business operations. Understanding platforms like AWS, Azure, and Google Cloud is vital.

## 6. Emotional Intelligence
As automation handles routine tasks, human skills like empathy, leadership, and team collaboration become more valuable.

## 7. Problem-Solving and Critical Thinking
Complex challenges require creative solutions. Employers value professionals who can think beyond conventional approaches.

## 8. Adaptability and Learning Agility
The pace of change demands professionals who can quickly adapt and continuously learn new technologies and methods.

## 9. Project Management
Even non-managers need project management skills to handle complex initiatives and coordinate cross-functional teams.

## 10. Industry-Specific Technical Skills
While soft skills matter, deep technical expertise in your field remains fundamental for career advancement.

Start developing these skills today to position yourself for success in 2025 and beyond.',
  'Sarah Johnson',
  'Career Tips',
  ARRAY['skills', 'career development', '2025 trends', 'job market', 'professional growth'],
  true,
  true,
  8,
  'Top 10 Skills Employers Want in 2025 | TalentXcel Career Guide',
  'Discover the most in-demand skills for 2025. Learn what employers are looking for and how to develop these crucial abilities for career success.',
  ARRAY['skills 2025', 'employer requirements', 'career skills', 'job market trends', 'professional development'],
  now()
),
(
  'How AI is Transforming the Job Market in India',
  'ai-transforming-job-market-india',
  'Explore how artificial intelligence is reshaping employment opportunities and creating new career paths in India.',
  '# How AI is Transforming the Job Market in India

Artificial Intelligence is revolutionizing the Indian job market, creating new opportunities while transforming traditional roles. This comprehensive analysis explores the current trends and future implications.

## The Current Landscape

India AI market is projected to reach $7.8 billion by 2025, creating unprecedented demand for AI-skilled professionals across sectors.

## Industries Leading the Transformation

### Technology Sector
- Software development roles evolving to include AI/ML expertise
- New positions in AI engineering, data science, and ML operations

### Healthcare
- AI-powered diagnostics creating new medical technology roles
- Telemedicine platforms requiring AI integration specialists

### Finance
- Algorithmic trading and risk assessment driving fintech innovation
- Demand for AI ethics and compliance specialists

### Manufacturing
- Industry 4.0 initiatives creating smart factory roles
- Predictive maintenance and quality control positions

## Skills in High Demand

1. **Machine Learning Engineering**
2. **Natural Language Processing**
3. **Computer Vision**
4. **AI Ethics and Governance**
5. **Data Engineering**

## Preparing for the AI-Driven Future

### For Job Seekers
- Invest in AI and data science education
- Develop domain expertise combined with AI knowledge
- Build portfolios showcasing AI project experience

### For Employers
- Reskill existing workforce in AI fundamentals
- Create AI-human collaboration frameworks
- Establish ethical AI practices

The key to success in this AI-transformed landscape is continuous learning and adaptability.',
  'Michael Chen',
  'AI in Hiring',
  ARRAY['artificial intelligence', 'job market', 'India', 'career trends', 'technology'],
  true,
  true,
  10,
  'How AI is Transforming the Job Market in India | TalentXcel Insights',
  'Discover how AI is reshaping employment in India. Learn about new opportunities, required skills, and career preparation strategies.',
  ARRAY['AI jobs India', 'artificial intelligence careers', 'job market transformation', 'AI skills'],
  now() - interval '3 days'
),
(
  'Complete Guide to Remote Job Applications',
  'complete-guide-remote-job-applications',
  'Master the art of applying for remote positions with proven strategies and insider tips.',
  '# Complete Guide to Remote Job Applications

Remote work has become the new normal, but landing remote positions requires a different approach than traditional job applications.

## Understanding Remote Work Culture

Remote employers look for specific qualities:
- Self-motivation and discipline
- Strong communication skills
- Tech-savviness
- Results-oriented mindset

## Optimizing Your Remote Job Application

### Resume Optimization
- Highlight remote work experience
- Emphasize digital collaboration tools
- Showcase measurable achievements
- Include time zone information

### Cover Letter Strategy
- Address remote work specifically
- Demonstrate understanding of remote culture
- Explain your home office setup
- Show enthusiasm for distributed teams

### Portfolio Preparation
- Create a professional online presence
- Document remote project experiences
- Include video introductions
- Showcase digital collaboration examples

## Top Remote Job Platforms

1. **RemoteOK**
2. **We Work Remotely**
3. **AngelList (Remote)**
4. **FlexJobs**
5. **TalentXcel Remote Jobs**

## Interview Preparation

### Technical Setup
- Test your internet connection
- Prepare backup communication methods
- Ensure proper lighting and audio
- Have a professional background

### Common Remote Interview Questions
- How do you manage time zones?
- Describe your ideal remote work setup
- How do you handle isolation?
- What remote collaboration tools do you use?

## Post-Application Follow-up

- Send personalized thank-you notes
- Connect on professional networks
- Share relevant industry insights
- Maintain consistent communication

Success in remote job applications comes from demonstrating that you understand and thrive in distributed work environments.',
  'Emily Rodriguez',
  'Job Trends',
  ARRAY['remote work', 'job applications', 'work from home', 'career advice', 'job search'],
  true,
  false,
  12,
  'Complete Guide to Remote Job Applications | TalentXcel Career Tips',
  'Master remote job applications with our comprehensive guide. Learn strategies, platforms, and interview tips for remote work success.',
  ARRAY['remote job applications', 'work from home jobs', 'remote work tips', 'job search guide'],
  now() - interval '5 days'
);
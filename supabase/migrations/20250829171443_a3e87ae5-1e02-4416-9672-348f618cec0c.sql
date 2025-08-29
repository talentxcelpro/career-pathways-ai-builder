-- First, let's add some sample course modules and lessons for existing courses
INSERT INTO course_modules (course_id, title, description, module_order, duration_minutes) VALUES
-- Full Stack Web Development modules
('03954cb2-0890-4b88-a8f7-7d7bafdf429a', 'Frontend Fundamentals', 'Learn HTML, CSS, and JavaScript basics', 1, 480),
('03954cb2-0890-4b88-a8f7-7d7bafdf429a', 'React Development', 'Master React components, hooks, and state management', 2, 720),
('03954cb2-0890-4b88-a8f7-7d7bafdf429a', 'Backend with Node.js', 'Build APIs with Node.js and Express', 3, 600),
('03954cb2-0890-4b88-a8f7-7d7bafdf429a', 'Database & Deployment', 'MongoDB integration and production deployment', 4, 480),

-- Data Science modules  
('c77c8d35-2288-484f-867c-ca979784a05b', 'Python for Data Science', 'Python fundamentals and data manipulation', 1, 480),
('c77c8d35-2288-484f-867c-ca979784a05b', 'Data Analysis & Visualization', 'Pandas, NumPy, and data visualization libraries', 2, 600),
('c77c8d35-2288-484f-867c-ca979784a05b', 'Machine Learning Fundamentals', 'ML algorithms and implementation', 3, 720),
('c77c8d35-2288-484f-867c-ca979784a05b', 'AI & Deep Learning', 'Neural networks and TensorFlow', 4, 600),

-- Digital Marketing modules
('c3482cd8-39d2-43ab-ba6a-575285e53fd7', 'Marketing Strategy', 'Digital marketing fundamentals and strategy', 1, 360),
('c3482cd8-39d2-43ab-ba6a-575285e53fd7', 'SEO & Content Marketing', 'Search optimization and content creation', 2, 480),
('c3482cd8-39d2-43ab-ba6a-575285e53fd7', 'Social Media & PPC', 'Social media marketing and paid advertising', 3, 480),
('c3482cd8-39d2-43ab-ba6a-575285e53fd7', 'Analytics & Optimization', 'Performance tracking and optimization', 4, 360);

-- Now let's add sample lessons for the first module of each course
INSERT INTO course_lessons (module_id, title, description, lesson_type, duration_minutes, lesson_order, video_url, is_free) 
SELECT 
  m.id,
  CASE 
    WHEN m.title = 'Frontend Fundamentals' THEN 
      CASE row_number() OVER (PARTITION BY m.id ORDER BY generate_series)
        WHEN 1 THEN 'Introduction to Web Development'
        WHEN 2 THEN 'HTML Fundamentals'  
        WHEN 3 THEN 'CSS Styling Basics'
        WHEN 4 THEN 'JavaScript Essentials'
        WHEN 5 THEN 'DOM Manipulation'
      END
    WHEN m.title = 'Python for Data Science' THEN
      CASE row_number() OVER (PARTITION BY m.id ORDER BY generate_series)
        WHEN 1 THEN 'Python Setup & Environment'
        WHEN 2 THEN 'Python Syntax & Variables'
        WHEN 3 THEN 'Data Types & Structures'  
        WHEN 4 THEN 'Functions & Modules'
        WHEN 5 THEN 'Working with Libraries'
      END
    WHEN m.title = 'Marketing Strategy' THEN
      CASE row_number() OVER (PARTITION BY m.id ORDER BY generate_series)
        WHEN 1 THEN 'Digital Marketing Overview'
        WHEN 2 THEN 'Target Audience Analysis'
        WHEN 3 THEN 'Marketing Funnel Basics'
        WHEN 4 THEN 'Channel Strategy'
        WHEN 5 THEN 'Campaign Planning'
      END
  END as title,
  CASE 
    WHEN m.title = 'Frontend Fundamentals' THEN 
      CASE row_number() OVER (PARTITION BY m.id ORDER BY generate_series)
        WHEN 1 THEN 'Overview of web development and technologies used'
        WHEN 2 THEN 'Learn HTML structure and semantic elements'
        WHEN 3 THEN 'Master CSS selectors, properties, and layouts'
        WHEN 4 THEN 'JavaScript fundamentals and ES6 features'
        WHEN 5 THEN 'Manipulating DOM elements with JavaScript'
      END
    WHEN m.title = 'Python for Data Science' THEN
      CASE row_number() OVER (PARTITION BY m.id ORDER BY generate_series)
        WHEN 1 THEN 'Setting up Python environment for data science'
        WHEN 2 THEN 'Basic Python syntax, variables, and operators'
        WHEN 3 THEN 'Lists, dictionaries, sets, and tuples'
        WHEN 4 THEN 'Creating and using functions and modules'
        WHEN 5 THEN 'Introduction to NumPy and Pandas'
      END
    WHEN m.title = 'Marketing Strategy' THEN
      CASE row_number() OVER (PARTITION BY m.id ORDER BY generate_series)
        WHEN 1 THEN 'Introduction to digital marketing landscape'
        WHEN 2 THEN 'Identifying and understanding your target audience'
        WHEN 3 THEN 'Understanding awareness, consideration, and conversion'
        WHEN 4 THEN 'Choosing the right marketing channels'
        WHEN 5 THEN 'Creating effective marketing campaigns'
      END
  END as description,
  'video' as lesson_type,
  CASE row_number() OVER (PARTITION BY m.id ORDER BY generate_series)
    WHEN 1 THEN 15
    WHEN 2 THEN 25  
    WHEN 3 THEN 30
    WHEN 4 THEN 35
    WHEN 5 THEN 20
  END as duration_minutes,
  row_number() OVER (PARTITION BY m.id ORDER BY generate_series) as lesson_order,
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ' as video_url,
  CASE row_number() OVER (PARTITION BY m.id ORDER BY generate_series)
    WHEN 1 THEN true
    ELSE false
  END as is_free
FROM course_modules m
CROSS JOIN generate_series(1, 5)
WHERE m.title IN ('Frontend Fundamentals', 'Python for Data Science', 'Marketing Strategy');

-- Create learning paths
INSERT INTO learning_paths (title, description, target_role, difficulty_level, estimated_duration_weeks, course_ids, skills_gained) VALUES
('Full-Stack Developer Journey', 'Complete path to become a professional full-stack developer', 'Full-Stack Developer', 'intermediate', 16, ARRAY['03954cb2-0890-4b88-a8f7-7d7bafdf429a'], ARRAY['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express', 'Git']),
('Data Science Career Path', 'Comprehensive data science learning journey', 'Data Scientist', 'intermediate', 14, ARRAY['c77c8d35-2288-484f-867c-ca979784a05b'], ARRAY['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow', 'Statistics']),
('Digital Marketing Professional', 'Master digital marketing and grow online presence', 'Digital Marketing Manager', 'beginner', 10, ARRAY['c3482cd8-39d2-43ab-ba6a-575285e53fd7'], ARRAY['SEO', 'Social Media', 'Content Marketing', 'Analytics', 'PPC']);

-- Add some assessment data
INSERT INTO course_assessments (course_id, title, description, assessment_type, questions, passing_score, time_limit_minutes) VALUES
('03954cb2-0890-4b88-a8f7-7d7bafdf429a', 'React Fundamentals Quiz', 'Test your knowledge of React basics', 'quiz', 20, 70, 30),
('c77c8d35-2288-484f-867c-ca979784a05b', 'Python Data Analysis Project', 'Build a data analysis project using real datasets', 'project', 1, 80, 180),
('c3482cd8-39d2-43ab-ba6a-575285e53fd7', 'Marketing Campaign Planning', 'Create a complete marketing campaign strategy', 'assignment', 1, 75, 120);
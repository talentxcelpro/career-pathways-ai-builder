-- Add missing columns to tables
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT 0;
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS learning_objectives TEXT[] DEFAULT '{}';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[] DEFAULT '{}';

-- Add course modules for existing courses
INSERT INTO course_modules (course_id, title, description, module_order) VALUES 
('a9fa2428-7a38-4ef1-bcf0-30bd2a11761b', 'Frontend Foundations with React', 'Master React fundamentals and build dynamic user interfaces', 1),
('a9fa2428-7a38-4ef1-bcf0-30bd2a11761b', 'Backend Development with Node.js', 'Build robust backend APIs with Node.js and Express', 2),
('a9fa2428-7a38-4ef1-bcf0-30bd2a11761b', 'Full Stack Integration & Deployment', 'Connect frontend to backend and deploy to production', 3),
('365d548f-695e-41f4-9bd5-96f153318700', 'Building Your Personal Brand Foundation', 'Establish your unique professional identity', 1),
('365d548f-695e-41f4-9bd5-96f153318700', 'LinkedIn Optimization & Networking', 'Maximize your LinkedIn presence and connections', 2)
ON CONFLICT (course_id, module_order) DO NOTHING;

-- Add sample lessons for Full Stack course
INSERT INTO course_lessons (module_id, title, content, lesson_order, duration_minutes, lesson_type, video_url, is_free) 
SELECT 
  cm.id,
  lessons.title,
  lessons.content,
  lessons.lesson_order,
  lessons.duration_minutes,
  lessons.lesson_type,
  lessons.video_url,
  lessons.is_free
FROM course_modules cm
CROSS JOIN (
  VALUES 
    ('React Fundamentals & JSX', '<h2>Welcome to React Development</h2><p>Learn React fundamentals, Virtual DOM, and JSX syntax.</p>', 1, 45, 'video', 'https://www.youtube.com/embed/bMknfKXIFA8', true),
    ('Components & Props', '<h2>Building Reusable Components</h2><p>Learn to create functional components and use props.</p>', 2, 60, 'video', 'https://www.youtube.com/embed/f2mMOiCSj5c', false),
    ('State & Event Handling', '<h2>Interactive Components</h2><p>Master useState hook and event handling.</p>', 3, 75, 'video', 'https://www.youtube.com/embed/4pO-HcG2igk', false),
    ('React Hooks Deep Dive', '<h2>Advanced Hooks</h2><p>Learn useEffect, useContext, and custom hooks.</p>', 4, 90, 'video', 'https://www.youtube.com/embed/TNhaISOUy6Q', false)
) AS lessons(title, content, lesson_order, duration_minutes, lesson_type, video_url, is_free)
WHERE cm.course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND cm.module_order = 1
ON CONFLICT (module_id, lesson_order) DO NOTHING;

-- Add backend lessons
INSERT INTO course_lessons (module_id, title, content, lesson_order, duration_minutes, lesson_type, video_url, is_free) 
SELECT 
  cm.id,
  lessons.title,
  lessons.content,
  lessons.lesson_order,
  lessons.duration_minutes,
  lessons.lesson_type,
  lessons.video_url,
  lessons.is_free
FROM course_modules cm
CROSS JOIN (
  VALUES 
    ('Node.js Fundamentals', '<h2>Introduction to Node.js</h2><p>Learn server-side JavaScript and NPM.</p>', 1, 60, 'video', 'https://www.youtube.com/embed/TlB_eWDSMt4', false),
    ('Express.js Framework', '<h2>Building Web Servers</h2><p>Master routing, middleware, and REST APIs.</p>', 2, 75, 'video', 'https://www.youtube.com/embed/L72fhGm1tfE', false),
    ('MongoDB Integration', '<h2>Database Operations</h2><p>Learn database operations and schema design.</p>', 3, 90, 'video', 'https://www.youtube.com/embed/ofme2o29ngU', false)
) AS lessons(title, content, lesson_order, duration_minutes, lesson_type, video_url, is_free)
WHERE cm.course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND cm.module_order = 2
ON CONFLICT (module_id, lesson_order) DO NOTHING;

-- Add Personal Branding lessons
INSERT INTO course_lessons (module_id, title, content, lesson_order, duration_minutes, lesson_type, video_url, is_free) 
SELECT 
  cm.id,
  lessons.title,
  lessons.content,
  lessons.lesson_order,
  lessons.duration_minutes,
  lessons.lesson_type,
  lessons.video_url,
  lessons.is_free
FROM course_modules cm
CROSS JOIN (
  VALUES 
    ('What Is Personal Branding?', '<h2>Understanding Personal Branding</h2><p>Learn the importance of personal branding.</p>', 1, 30, 'video', 'https://www.youtube.com/embed/DIsmPyGN6S4', true),
    ('Your Unique Value Proposition', '<h2>Define What Makes You Special</h2><p>Identify your strengths and value.</p>', 2, 45, 'video', 'https://www.youtube.com/embed/2Nt9Z9ZnNZ8', false)
) AS lessons(title, content, lesson_order, duration_minutes, lesson_type, video_url, is_free)
WHERE cm.course_id = '365d548f-695e-41f4-9bd5-96f153318700' AND cm.module_order = 1
ON CONFLICT (module_id, lesson_order) DO NOTHING;

-- Update courses with learning outcomes
UPDATE courses 
SET learning_outcomes = ARRAY[
  'Build modern web applications with React and Node.js',
  'Create responsive user interfaces with React components',
  'Develop secure REST APIs with Express and MongoDB',
  'Deploy full-stack applications to production'
]
WHERE id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b';

UPDATE courses 
SET learning_outcomes = ARRAY[
  'Define your unique value proposition',
  'Optimize your LinkedIn profile for maximum impact',
  'Build strategic professional relationships',
  'Develop a consistent online presence'
]
WHERE id = '365d548f-695e-41f4-9bd5-96f153318700';
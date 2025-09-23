-- Add missing columns to course_modules table
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT 0;
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS learning_objectives TEXT[] DEFAULT '{}';

-- Now add the modules and lessons with simpler structure
INSERT INTO course_modules (
  course_id,
  title,
  description,
  module_order
) VALUES 
  (
    'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b',
    'Frontend Foundations with React',
    'Master React fundamentals and build dynamic user interfaces',
    1
  ),
  (
    'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b',
    'Backend Development with Node.js',
    'Build robust backend APIs with Node.js and Express',
    2
  ),
  (
    'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b',
    'Full Stack Integration & Deployment',
    'Connect frontend to backend and deploy to production',
    3
  );

-- Add lessons for Module 1: Frontend Foundations
INSERT INTO course_lessons (
  module_id,
  title,
  content,
  lesson_order,
  duration_minutes,
  lesson_type,
  video_url,
  is_free
) VALUES 
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 1 LIMIT 1),
    'React Fundamentals & JSX',
    '<h2>Welcome to React Development</h2><p>Learn React fundamentals, Virtual DOM, and JSX syntax.</p>',
    1,
    45,
    'video',
    'https://www.youtube.com/embed/bMknfKXIFA8',
    true
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 1 LIMIT 1),
    'Components & Props',
    '<h2>Building Reusable Components</h2><p>Learn to create functional components and use props effectively.</p>',
    2,
    60,
    'video',
    'https://www.youtube.com/embed/f2mMOiCSj5c',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 1 LIMIT 1),
    'State & Event Handling',
    '<h2>Interactive React Components</h2><p>Master useState hook and event handling patterns.</p>',
    3,
    75,
    'video',
    'https://www.youtube.com/embed/4pO-HcG2igk',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 1 LIMIT 1),
    'React Hooks Deep Dive',
    '<h2>Advanced React Hooks</h2><p>Learn useEffect, useContext, and custom hooks.</p>',
    4,
    90,
    'video',
    'https://www.youtube.com/embed/TNhaISOUy6Q',
    false
  );

-- Add lessons for Module 2: Backend Development
INSERT INTO course_lessons (
  module_id,
  title,
  content,
  lesson_order,
  duration_minutes,
  lesson_type,
  video_url,
  is_free
) VALUES 
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 2 LIMIT 1),
    'Node.js Fundamentals',
    '<h2>Introduction to Node.js</h2><p>Learn server-side JavaScript and NPM package management.</p>',
    1,
    60,
    'video',
    'https://www.youtube.com/embed/TlB_eWDSMt4',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 2 LIMIT 1),
    'Express.js Framework',
    '<h2>Building Web Servers with Express</h2><p>Master routing, middleware, and REST APIs.</p>',
    2,
    75,
    'video',
    'https://www.youtube.com/embed/L72fhGm1tfE',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 2 LIMIT 1),
    'Database Integration with MongoDB',
    '<h2>Working with MongoDB and Mongoose</h2><p>Learn database operations and schema design.</p>',
    3,
    120,
    'video',
    'https://www.youtube.com/embed/ofme2o29ngU',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 2 LIMIT 1),
    'Authentication & Security',
    '<h2>Secure API Development</h2><p>Implement JWT authentication and security best practices.</p>',
    4,
    105,
    'video',
    'https://www.youtube.com/embed/mbsmsi7l3r4',
    false
  );

-- Add lessons for Module 3: Full Stack Integration
INSERT INTO course_lessons (
  module_id,
  title,
  content,
  lesson_order,
  duration_minutes,
  lesson_type,
  video_url,
  is_free
) VALUES 
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 3 LIMIT 1),
    'Connecting React to Express API',
    '<h2>Full Stack Integration</h2><p>Connect frontend and backend with HTTP requests and state management.</p>',
    1,
    90,
    'video',
    'https://www.youtube.com/embed/cuHDQhDhvPE',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 3 LIMIT 1),
    'Advanced State Management',
    '<h2>Scaling React Applications</h2><p>Master Context API, Redux, and performance optimization.</p>',
    2,
    75,
    'video',
    'https://www.youtube.com/embed/5LrDIWkK_Bc',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 3 LIMIT 1),
    'Testing & Deployment',
    '<h2>Production Ready Applications</h2><p>Implement testing strategies and deploy to production.</p>',
    3,
    80,
    'video',
    'https://www.youtube.com/embed/8vfQ6SWBZ-U',
    false
  );

-- Add modules and lessons for the Personal Branding course
INSERT INTO course_modules (
  course_id,
  title,
  description,
  module_order
) VALUES 
  (
    '365d548f-695e-41f4-9bd5-96f153318700',
    'Building Your Personal Brand Foundation',
    'Establish your unique professional identity and value proposition',
    1
  ),
  (
    '365d548f-695e-41f4-9bd5-96f153318700',
    'LinkedIn Optimization & Professional Networking',
    'Maximize your LinkedIn presence and build meaningful connections',
    2
  );

-- Add lessons for Personal Branding Module 1
INSERT INTO course_lessons (
  module_id,
  title,
  content,
  lesson_order,
  duration_minutes,
  lesson_type,
  video_url,
  is_free
) VALUES 
  (
    (SELECT id FROM course_modules WHERE course_id = '365d548f-695e-41f4-9bd5-96f153318700' AND module_order = 1 LIMIT 1),
    'What Is Personal Branding?',
    '<h2>Understanding Personal Branding</h2><p>Learn the importance of personal branding and how it impacts your career.</p>',
    1,
    30,
    'video',
    'https://www.youtube.com/embed/DIsmPyGN6S4',
    true
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = '365d548f-695e-41f4-9bd5-96f153318700' AND module_order = 1 LIMIT 1),
    'Discovering Your Unique Value Proposition',
    '<h2>Define What Makes You Special</h2><p>Identify your strengths and craft a compelling value statement.</p>',
    2,
    45,
    'video',
    'https://www.youtube.com/embed/2Nt9Z9ZnNZ8',
    false
  );

-- Add lessons for Personal Branding Module 2
INSERT INTO course_lessons (
  module_id,
  title,
  content,
  lesson_order,
  duration_minutes,
  lesson_type,
  video_url,
  is_free
) VALUES 
  (
    (SELECT id FROM course_modules WHERE course_id = '365d548f-695e-41f4-9bd5-96f153318700' AND module_order = 2 LIMIT 1),
    'LinkedIn Profile Optimization',
    '<h2>Create a Powerful LinkedIn Presence</h2><p>Learn to optimize every section of your LinkedIn profile.</p>',
    1,
    60,
    'video',
    'https://www.youtube.com/embed/KOgF1m2EAFI',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = '365d548f-695e-41f4-9bd5-96f153318700' AND module_order = 2 LIMIT 1),
    'Strategic Networking',
    '<h2>Build Meaningful Professional Relationships</h2><p>Master networking strategies and follow-up techniques.</p>',
    2,
    45,
    'video',
    'https://www.youtube.com/embed/W65dTikwJWA',
    false
  );

-- Update courses with learning outcomes
UPDATE courses 
SET learning_outcomes = ARRAY[
  'Build modern web applications with React and Node.js',
  'Create responsive user interfaces with React components',
  'Develop secure REST APIs with Express and MongoDB',
  'Implement user authentication and authorization',
  'Deploy full-stack applications to production',
  'Apply best practices for code quality and testing'
]
WHERE id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b';

UPDATE courses 
SET learning_outcomes = ARRAY[
  'Define and articulate your unique value proposition',
  'Create a professional brand identity and messaging',
  'Optimize your LinkedIn profile for maximum impact',
  'Build and maintain strategic professional relationships',
  'Develop a consistent online presence across platforms',
  'Measure and improve your personal brand effectiveness'
]
WHERE id = '365d548f-695e-41f4-9bd5-96f153318700';
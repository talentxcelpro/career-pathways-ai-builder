-- Create a complete "Full Stack Web Development with React & Node.js" course
INSERT INTO courses (
  title,
  description,
  instructor_name,
  category,
  difficulty_level,
  duration_hours,
  price,
  is_free,
  skills_taught,
  learning_objectives,
  prerequisites,
  target_audience,
  curriculum,
  thumbnail_url,
  status,
  created_at,
  updated_at
) VALUES (
  'Full Stack Web Development with React & Node.js',
  'Master modern web development by building real-world applications from frontend to backend. Learn React, Node.js, Express, MongoDB, and deploy to production.',
  'TalentXcel Academy',
  'Web Development',
  'intermediate',
  25,
  2999,
  false,
  ARRAY['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript ES6+', 'RESTful APIs', 'Authentication', 'Deployment'],
  ARRAY[
    'Build complete full-stack web applications from scratch',
    'Master React hooks, state management, and component architecture',
    'Create secure REST APIs with Node.js and Express',
    'Implement user authentication and authorization',
    'Work with MongoDB and database design',
    'Deploy applications to production platforms',
    'Follow industry best practices and modern development workflows'
  ],
  ARRAY[
    'Basic HTML, CSS, and JavaScript knowledge',
    'Understanding of programming fundamentals',
    'Familiarity with command line interface',
    'Git and version control basics'
  ],
  ARRAY[
    'Aspiring full-stack developers',
    'Frontend developers wanting backend skills',
    'Backend developers learning modern frontend',
    'Computer science students',
    'Career changers into tech'
  ],
  '[
    {
      "id": "module-1",
      "title": "Frontend Foundations with React",
      "description": "Master React fundamentals and build dynamic user interfaces",
      "duration_hours": 8,
      "order": 1,
      "lessons": [
        {
          "id": "lesson-1-1",
          "title": "React Fundamentals & JSX",
          "duration_minutes": 45,
          "type": "video",
          "content": "Introduction to React, virtual DOM, and JSX syntax",
          "video_url": "https://example.com/react-fundamentals",
          "order": 1
        },
        {
          "id": "lesson-1-2", 
          "title": "Components & Props",
          "duration_minutes": 60,
          "type": "video",
          "content": "Creating reusable components and passing data with props",
          "video_url": "https://example.com/components-props",
          "order": 2
        },
        {
          "id": "lesson-1-3",
          "title": "State & Event Handling",
          "duration_minutes": 75,
          "type": "video", 
          "content": "Managing component state and handling user interactions",
          "video_url": "https://example.com/state-events",
          "order": 3
        },
        {
          "id": "lesson-1-4",
          "title": "React Hooks Deep Dive",
          "duration_minutes": 90,
          "type": "video",
          "content": "useState, useEffect, useContext, and custom hooks",
          "video_url": "https://example.com/react-hooks",
          "order": 4
        },
        {
          "id": "assessment-1",
          "title": "React Fundamentals Quiz",
          "duration_minutes": 30,
          "type": "quiz",
          "content": "Test your understanding of React core concepts",
          "questions": [
            {
              "question": "What is the Virtual DOM in React?",
              "type": "multiple_choice",
              "options": ["A virtual representation of the real DOM", "A database", "A CSS framework", "A testing tool"],
              "correct_answer": 0,
              "explanation": "The Virtual DOM is a programming concept where a virtual representation of the UI is kept in memory and synced with the real DOM."
            },
            {
              "question": "Which hook is used for side effects in React?",
              "type": "multiple_choice", 
              "options": ["useState", "useEffect", "useContext", "useReducer"],
              "correct_answer": 1,
              "explanation": "useEffect is the hook used for performing side effects in functional components."
            }
          ],
          "order": 5
        }
      ]
    },
    {
      "id": "module-2",
      "title": "Backend Development with Node.js",
      "description": "Build robust backend APIs with Node.js and Express",
      "duration_hours": 10,
      "order": 2,
      "lessons": [
        {
          "id": "lesson-2-1",
          "title": "Node.js Fundamentals",
          "duration_minutes": 60,
          "type": "video",
          "content": "Understanding Node.js runtime, modules, and npm",
          "video_url": "https://example.com/nodejs-fundamentals",
          "order": 1
        },
        {
          "id": "lesson-2-2",
          "title": "Express.js Framework",
          "duration_minutes": 75,
          "type": "video",
          "content": "Building web servers and APIs with Express",
          "video_url": "https://example.com/express-framework",
          "order": 2
        },
        {
          "id": "lesson-2-3",
          "title": "RESTful API Design",
          "duration_minutes": 90,
          "type": "video",
          "content": "Creating RESTful endpoints and handling HTTP methods",
          "video_url": "https://example.com/restful-apis",
          "order": 3
        },
        {
          "id": "lesson-2-4",
          "title": "Database Integration with MongoDB",
          "duration_minutes": 120,
          "type": "video",
          "content": "Connecting to MongoDB and performing CRUD operations",
          "video_url": "https://example.com/mongodb-integration",
          "order": 4
        },
        {
          "id": "lesson-2-5",
          "title": "Authentication & Authorization",
          "duration_minutes": 105,
          "type": "video",
          "content": "Implementing JWT authentication and protecting routes",
          "video_url": "https://example.com/auth-jwt",
          "order": 5
        },
        {
          "id": "assessment-2",
          "title": "Backend Development Assessment",
          "duration_minutes": 45,
          "type": "quiz",
          "content": "Comprehensive test on Node.js and API development",
          "questions": [
            {
              "question": "What is middleware in Express.js?",
              "type": "multiple_choice",
              "options": ["Database connection", "Functions that execute during request-response cycle", "Frontend framework", "Testing library"],
              "correct_answer": 1,
              "explanation": "Middleware functions are functions that have access to the request object, response object, and the next middleware function in the applications request-response cycle."
            }
          ],
          "order": 6
        }
      ]
    },
    {
      "id": "module-3",
      "title": "Full Stack Integration & Deployment",
      "description": "Connect frontend and backend, and deploy to production",
      "duration_hours": 7,
      "order": 3,
      "lessons": [
        {
          "id": "lesson-3-1",
          "title": "Connecting React to Express API",
          "duration_minutes": 90,
          "type": "video",
          "content": "Making HTTP requests from React to your backend API",
          "video_url": "https://example.com/connect-frontend-backend",
          "order": 1
        },
        {
          "id": "lesson-3-2",
          "title": "State Management with Context API",
          "duration_minutes": 75,
          "type": "video",
          "content": "Managing application state across components",
          "video_url": "https://example.com/state-management",
          "order": 2
        },
        {
          "id": "lesson-3-3",
          "title": "Error Handling & Validation",
          "duration_minutes": 60,
          "type": "video",
          "content": "Implementing robust error handling on both frontend and backend",
          "video_url": "https://example.com/error-handling",
          "order": 3
        },
        {
          "id": "lesson-3-4",
          "title": "Deployment to Production",
          "duration_minutes": 90,
          "type": "video",
          "content": "Deploying your full-stack application to cloud platforms",
          "video_url": "https://example.com/deployment",
          "order": 4
        },
        {
          "id": "project-final",
          "title": "Final Project: Social Media Dashboard",
          "duration_minutes": 105,
          "type": "project",
          "content": "Build a complete social media dashboard with user authentication, posts, comments, and real-time updates",
          "requirements": [
            "User registration and login",
            "Create, read, update, delete posts",
            "Comment system",
            "User profiles",
            "Responsive design",
            "Deploy to production"
          ],
          "order": 5
        }
      ]
    }
  ]'::jsonb,
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
  'published',
  now(),
  now()
);

-- Create course lessons from the curriculum
WITH course_data AS (
  SELECT id as course_id, curriculum
  FROM courses 
  WHERE title = 'Full Stack Web Development with React & Node.js'
),
lessons_data AS (
  SELECT 
    course_id,
    jsonb_array_elements(curriculum) as module,
    generate_random_uuid() as lesson_id
  FROM course_data
),
expanded_lessons AS (
  SELECT 
    course_id,
    lesson_id,
    (module->>'id') as module_id,
    (module->>'title') as module_title,
    jsonb_array_elements(module->'lessons') as lesson
  FROM lessons_data
)
INSERT INTO course_lessons (
  id,
  course_id,
  title,
  content,
  lesson_type,
  duration_minutes,
  video_url,
  order_index,
  is_free,
  created_at
)
SELECT 
  gen_random_uuid(),
  course_id,
  lesson->>'title',
  lesson->>'content',
  lesson->>'type',
  (lesson->>'duration_minutes')::integer,
  lesson->>'video_url',
  (lesson->>'order')::integer,
  false,
  now()
FROM expanded_lessons
WHERE lesson->>'type' IN ('video', 'project');

-- Create course assessments
WITH course_data AS (
  SELECT id as course_id, curriculum
  FROM courses 
  WHERE title = 'Full Stack Web Development with React & Node.js'
),
assessments_data AS (
  SELECT 
    course_id,
    jsonb_array_elements(curriculum) as module
  FROM course_data
),
expanded_assessments AS (
  SELECT 
    course_id,
    jsonb_array_elements(module->'lessons') as lesson
  FROM assessments_data
)
INSERT INTO course_assessments (
  id,
  course_id,
  title,
  description,
  assessment_type,
  questions,
  duration_minutes,
  passing_score,
  max_attempts,
  is_required,
  order_index,
  created_at
)
SELECT 
  gen_random_uuid(),
  course_id,
  lesson->>'title',
  lesson->>'content',
  'quiz',
  lesson->'questions',
  (lesson->>'duration_minutes')::integer,
  70,
  3,
  true,
  (lesson->>'order')::integer,
  now()
FROM expanded_assessments
WHERE lesson->>'type' = 'quiz';
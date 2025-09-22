-- Create a complete "Full Stack Web Development with React & Node.js" course
INSERT INTO courses (
  title,
  description,
  instructor_name,
  instructor_bio,
  category,
  difficulty_level,
  duration_hours,
  price,
  is_free,
  skills_taught,
  curriculum,
  thumbnail_url,
  is_active,
  published,
  rating,
  enrolled_count,
  created_at,
  updated_at
) VALUES (
  'Full Stack Web Development with React & Node.js',
  'Master modern web development by building real-world applications from frontend to backend. Learn React, Node.js, Express, MongoDB, and deploy to production. This comprehensive 25-hour course includes hands-on projects, quizzes, and a final capstone project.',
  'TalentXcel Academy',
  'Expert instructors with 10+ years in full-stack development, having worked at top tech companies and trained thousands of developers worldwide.',
  'Web Development',
  'intermediate',
  25,
  2999,
  false,
  ARRAY['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript ES6+', 'RESTful APIs', 'Authentication', 'Deployment', 'State Management', 'Database Design'],
  '{
    "modules": [
      {
        "id": "module-1",
        "title": "Frontend Foundations with React",
        "description": "Master React fundamentals and build dynamic user interfaces",
        "duration_hours": 8,
        "order": 1,
        "learning_objectives": [
          "Understand React fundamentals and virtual DOM",
          "Build reusable components with props and state",
          "Master React hooks and lifecycle methods",
          "Implement event handling and form management"
        ],
        "lessons": [
          {
            "id": "lesson-1-1",
            "title": "React Fundamentals & JSX",
            "duration_minutes": 45,
            "type": "video",
            "content": "Introduction to React, virtual DOM, and JSX syntax. Learn why React is the most popular frontend framework and how to create your first React application.",
            "video_url": "https://www.youtube.com/watch?v=bMknfKXIFA8",
            "order": 1,
            "resources": ["React Documentation", "JSX Cheatsheet", "Practice Exercises"]
          },
          {
            "id": "lesson-1-2", 
            "title": "Components & Props",
            "duration_minutes": 60,
            "type": "video",
            "content": "Creating reusable components and passing data with props. Build a component library from scratch.",
            "video_url": "https://www.youtube.com/watch?v=f2mMOiCSj5c",
            "order": 2,
            "project": "Build a Product Card Component"
          },
          {
            "id": "lesson-1-3",
            "title": "State & Event Handling",
            "duration_minutes": 75,
            "type": "video", 
            "content": "Managing component state and handling user interactions. Build interactive UIs with forms and buttons.",
            "video_url": "https://www.youtube.com/watch?v=4pO-HcG2igk",
            "order": 3,
            "project": "Interactive To-Do List"
          },
          {
            "id": "lesson-1-4",
            "title": "React Hooks Deep Dive",
            "duration_minutes": 90,
            "type": "video",
            "content": "Master useState, useEffect, useContext, and custom hooks. Learn advanced patterns and best practices.",
            "video_url": "https://www.youtube.com/watch?v=TNhaISOUy6Q",
            "order": 4,
            "project": "Custom Hook Library"
          },
          {
            "id": "assessment-1",
            "title": "React Fundamentals Quiz",
            "duration_minutes": 30,
            "type": "quiz",
            "content": "Test your understanding of React core concepts with 15 comprehensive questions.",
            "questions": [
              {
                "question": "What is the Virtual DOM in React?",
                "type": "multiple_choice",
                "options": ["A virtual representation of the real DOM", "A database", "A CSS framework", "A testing tool"],
                "correct_answer": 0,
                "explanation": "The Virtual DOM is a programming concept where a virtual representation of the UI is kept in memory and synced with the real DOM for optimal performance."
              },
              {
                "question": "Which hook is used for side effects in React?",
                "type": "multiple_choice", 
                "options": ["useState", "useEffect", "useContext", "useReducer"],
                "correct_answer": 1,
                "explanation": "useEffect is the hook used for performing side effects in functional components, such as data fetching, subscriptions, or DOM manipulation."
              },
              {
                "question": "What is the purpose of the key prop in React lists?",
                "type": "multiple_choice",
                "options": ["Styling", "Unique identification for efficient re-rendering", "Data storage", "Event handling"],
                "correct_answer": 1,
                "explanation": "The key prop helps React identify which items have changed, are added, or removed, enabling efficient re-rendering of lists."
              }
            ],
            "order": 5,
            "passing_score": 70
          }
        ]
      },
      {
        "id": "module-2",
        "title": "Backend Development with Node.js",
        "description": "Build robust backend APIs with Node.js and Express",
        "duration_hours": 10,
        "order": 2,
        "learning_objectives": [
          "Set up Node.js development environment",
          "Build RESTful APIs with Express.js",
          "Integrate MongoDB database",
          "Implement authentication and security"
        ],
        "lessons": [
          {
            "id": "lesson-2-1",
            "title": "Node.js Fundamentals",
            "duration_minutes": 60,
            "type": "video",
            "content": "Understanding Node.js runtime, modules, npm package management, and building your first server.",
            "video_url": "https://www.youtube.com/watch?v=TlB_eWDSMt4",
            "order": 1,
            "project": "Simple HTTP Server"
          },
          {
            "id": "lesson-2-2",
            "title": "Express.js Framework",
            "duration_minutes": 75,
            "type": "video",
            "content": "Building web servers and APIs with Express. Learn routing, middleware, and best practices.",
            "video_url": "https://www.youtube.com/watch?v=L72fhGm1tfE",
            "order": 2,
            "project": "REST API with CRUD Operations"
          },
          {
            "id": "lesson-2-3",
            "title": "Database Integration with MongoDB",
            "duration_minutes": 120,
            "type": "video",
            "content": "Connecting to MongoDB, designing schemas with Mongoose, and performing database operations.",
            "video_url": "https://www.youtube.com/watch?v=ofme2o29ngU",
            "order": 3,
            "project": "User Management System"
          },
          {
            "id": "lesson-2-4",
            "title": "Authentication & Security",
            "duration_minutes": 105,
            "type": "video",
            "content": "Implementing JWT authentication, password hashing, and API security best practices.",
            "video_url": "https://www.youtube.com/watch?v=mbsmsi7l3r4",
            "order": 4,
            "project": "Secure Authentication System"
          },
          {
            "id": "assessment-2",
            "title": "Backend Development Assessment",
            "duration_minutes": 45,
            "type": "quiz",
            "content": "Comprehensive test on Node.js, Express, and backend development concepts.",
            "questions": [
              {
                "question": "What is middleware in Express.js?",
                "type": "multiple_choice",
                "options": ["Database connection", "Functions that execute during request-response cycle", "Frontend framework", "Testing library"],
                "correct_answer": 1,
                "explanation": "Middleware functions have access to the request object, response object, and the next middleware function in the request-response cycle."
              },
              {
                "question": "Which HTTP status code indicates successful resource creation?",
                "type": "multiple_choice",
                "options": ["200", "201", "204", "404"],
                "correct_answer": 1,
                "explanation": "Status code 201 (Created) indicates that the request has been fulfilled and resulted in a new resource being created."
              }
            ],
            "order": 5,
            "passing_score": 75
          }
        ]
      },
      {
        "id": "module-3",
        "title": "Full Stack Integration & Deployment",
        "description": "Connect frontend and backend, and deploy to production",
        "duration_hours": 7,
        "order": 3,
        "learning_objectives": [
          "Connect React frontend to Express backend",
          "Implement advanced state management",
          "Handle errors and edge cases",
          "Deploy full-stack applications to production"
        ],
        "lessons": [
          {
            "id": "lesson-3-1",
            "title": "Connecting React to Express API",
            "duration_minutes": 90,
            "type": "video",
            "content": "Making HTTP requests from React using fetch and axios, handling async operations, and managing loading states.",
            "video_url": "https://www.youtube.com/watch?v=cuHDQhDhvPE",
            "order": 1,
            "project": "Full Stack Task Manager"
          },
          {
            "id": "lesson-3-2",
            "title": "Advanced State Management",
            "duration_minutes": 75,
            "type": "video",
            "content": "Context API, Redux fundamentals, and choosing the right state management solution for your app.",
            "video_url": "https://www.youtube.com/watch?v=5LrDIWkK_Bc",
            "order": 2,
            "project": "Shopping Cart with Context API"
          },
          {
            "id": "lesson-3-3",
            "title": "Error Handling & Testing",
            "duration_minutes": 60,
            "type": "video",
            "content": "Implementing robust error handling, input validation, and testing strategies for full-stack applications.",
            "video_url": "https://www.youtube.com/watch?v=qLy1QdZw2o4",
            "order": 3,
            "project": "Error Boundary Implementation"
          },
          {
            "id": "lesson-3-4",
            "title": "Production Deployment",
            "duration_minutes": 90,
            "type": "video",
            "content": "Deploying React apps to Vercel/Netlify and Node.js APIs to Heroku/Railway. Environment variables and CI/CD.",
            "video_url": "https://www.youtube.com/watch?v=IOWbeFP7XZg",
            "order": 4,
            "project": "Deploy to Production"
          },
          {
            "id": "final-project",
            "title": "Capstone: Social Media Dashboard",
            "duration_minutes": 180,
            "type": "project",
            "content": "Build a complete social media dashboard with user authentication, real-time posts, comments, likes, and user profiles. This project combines everything you have learned.",
            "requirements": [
              "User registration and login with JWT",
              "Create, read, update, delete posts",
              "Real-time comment system",
              "User profiles with image upload",
              "Like/unlike functionality",
              "Responsive design for mobile and desktop",
              "Deploy to production with custom domain"
            ],
            "order": 5,
            "github_template": "https://github.com/talentxcel/social-dashboard-starter"
          }
        ]
      }
    ],
    "prerequisites": [
      "Basic HTML, CSS, and JavaScript knowledge",
      "Understanding of programming fundamentals",
      "Familiarity with command line interface",
      "Git and version control basics"
    ],
    "target_audience": [
      "Aspiring full-stack developers",
      "Frontend developers wanting backend skills", 
      "Backend developers learning modern frontend",
      "Computer science students",
      "Career changers into tech"
    ],
    "certification": {
      "available": true,
      "requirements": ["Complete all modules", "Pass all assessments with 70%+", "Submit final project"],
      "skills_verified": ["React Development", "Node.js Backend", "Full Stack Integration", "Database Management", "API Development"]
    }
  }'::jsonb,
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
  true,
  true,
  4.8,
  0,
  now(),
  now()
);
-- Insert sample course modules and lessons for the Full Stack Web Development course
INSERT INTO course_modules (id, course_id, title, description, module_order, created_at, updated_at) VALUES
('mod-1-intro', '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270', 'Introduction to Full Stack Development', 'Learn the fundamentals of full stack web development and set up your development environment', 1, now(), now()),
('mod-2-react', '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270', 'React.js Fundamentals', 'Master React components, state management, and hooks', 2, now(), now()),
('mod-3-nodejs', '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270', 'Node.js & Express', 'Build backend APIs with Node.js and Express framework', 3, now(), now()),
('mod-4-database', '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270', 'Database & MongoDB', 'Work with databases and MongoDB for data persistence', 4, now(), now()),
('mod-5-deployment', '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270', 'Deployment & Production', 'Deploy your applications to production environments', 5, now(), now());

-- Insert sample lessons for each module
INSERT INTO course_lessons (id, module_id, title, description, lesson_order, duration_minutes, video_url, created_at, updated_at) VALUES
-- Module 1 lessons
('lesson-1-1', 'mod-1-intro', 'Course Overview', 'Introduction to the course structure and learning objectives', 1, 15, 'https://example.com/video1', now(), now()),
('lesson-1-2', 'mod-1-intro', 'Development Environment Setup', 'Setting up Node.js, VS Code, and essential tools', 2, 25, 'https://example.com/video2', now(), now()),
('lesson-1-3', 'mod-1-intro', 'HTML & CSS Review', 'Quick review of HTML and CSS fundamentals', 3, 30, 'https://example.com/video3', now(), now()),

-- Module 2 lessons  
('lesson-2-1', 'mod-2-react', 'React Components', 'Understanding React components and JSX', 1, 35, 'https://example.com/video4', now(), now()),
('lesson-2-2', 'mod-2-react', 'Props and State', 'Working with props and state in React', 2, 40, 'https://example.com/video5', now(), now()),
('lesson-2-3', 'mod-2-react', 'React Hooks', 'Using useState, useEffect, and custom hooks', 3, 45, 'https://example.com/video6', now(), now()),

-- Module 3 lessons
('lesson-3-1', 'mod-3-nodejs', 'Node.js Basics', 'Introduction to Node.js and npm', 1, 30, 'https://example.com/video7', now(), now()),
('lesson-3-2', 'mod-3-nodejs', 'Express Server', 'Creating REST APIs with Express', 2, 50, 'https://example.com/video8', now(), now()),
('lesson-3-3', 'mod-3-nodejs', 'Middleware & Authentication', 'Working with middleware and user authentication', 3, 45, 'https://example.com/video9', now(), now()),

-- Module 4 lessons
('lesson-4-1', 'mod-4-database', 'Database Fundamentals', 'Understanding databases and data modeling', 1, 35, 'https://example.com/video10', now(), now()),
('lesson-4-2', 'mod-4-database', 'MongoDB Operations', 'CRUD operations with MongoDB', 2, 40, 'https://example.com/video11', now(), now()),
('lesson-4-3', 'mod-4-database', 'Mongoose ODM', 'Using Mongoose for MongoDB operations', 3, 35, 'https://example.com/video12', now(), now()),

-- Module 5 lessons
('lesson-5-1', 'mod-5-deployment', 'Production Basics', 'Preparing applications for production', 1, 25, 'https://example.com/video13', now(), now()),
('lesson-5-2', 'mod-5-deployment', 'Cloud Deployment', 'Deploying to cloud platforms like Heroku', 2, 40, 'https://example.com/video14', now(), now()),
('lesson-5-3', 'mod-5-deployment', 'Monitoring & Scaling', 'Application monitoring and scaling strategies', 3, 30, 'https://example.com/video15', now(), now());
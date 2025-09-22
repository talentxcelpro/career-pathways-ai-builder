-- Insert sample course modules and lessons for the Full Stack Web Development course
INSERT INTO course_modules (id, course_id, title, description, module_order, created_at, updated_at) VALUES
(gen_random_uuid(), '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270', 'Introduction to Full Stack Development', 'Learn the fundamentals of full stack web development and set up your development environment', 1, now(), now()),
(gen_random_uuid(), '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270', 'React.js Fundamentals', 'Master React components, state management, and hooks', 2, now(), now()),
(gen_random_uuid(), '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270', 'Node.js & Express', 'Build backend APIs with Node.js and Express framework', 3, now(), now()),
(gen_random_uuid(), '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270', 'Database & MongoDB', 'Work with databases and MongoDB for data persistence', 4, now(), now()),
(gen_random_uuid(), '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270', 'Deployment & Production', 'Deploy your applications to production environments', 5, now(), now());

-- Get the module IDs to use for lessons
DO $$
DECLARE
    mod1_id uuid;
    mod2_id uuid;
    mod3_id uuid;
    mod4_id uuid;
    mod5_id uuid;
BEGIN
    -- Get module IDs
    SELECT id INTO mod1_id FROM course_modules WHERE course_id = '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270' AND module_order = 1;
    SELECT id INTO mod2_id FROM course_modules WHERE course_id = '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270' AND module_order = 2;
    SELECT id INTO mod3_id FROM course_modules WHERE course_id = '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270' AND module_order = 3;
    SELECT id INTO mod4_id FROM course_modules WHERE course_id = '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270' AND module_order = 4;
    SELECT id INTO mod5_id FROM course_modules WHERE course_id = '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270' AND module_order = 5;

    -- Insert lessons for Module 1
    INSERT INTO course_lessons (id, module_id, title, description, lesson_order, duration_minutes, video_url, created_at, updated_at) VALUES
    (gen_random_uuid(), mod1_id, 'Course Overview', 'Introduction to the course structure and learning objectives', 1, 15, 'https://example.com/video1', now(), now()),
    (gen_random_uuid(), mod1_id, 'Development Environment Setup', 'Setting up Node.js, VS Code, and essential tools', 2, 25, 'https://example.com/video2', now(), now()),
    (gen_random_uuid(), mod1_id, 'HTML & CSS Review', 'Quick review of HTML and CSS fundamentals', 3, 30, 'https://example.com/video3', now(), now());

    -- Insert lessons for Module 2
    INSERT INTO course_lessons (id, module_id, title, description, lesson_order, duration_minutes, video_url, created_at, updated_at) VALUES
    (gen_random_uuid(), mod2_id, 'React Components', 'Understanding React components and JSX', 1, 35, 'https://example.com/video4', now(), now()),
    (gen_random_uuid(), mod2_id, 'Props and State', 'Working with props and state in React', 2, 40, 'https://example.com/video5', now(), now()),
    (gen_random_uuid(), mod2_id, 'React Hooks', 'Using useState, useEffect, and custom hooks', 3, 45, 'https://example.com/video6', now(), now());

    -- Insert lessons for Module 3
    INSERT INTO course_lessons (id, module_id, title, description, lesson_order, duration_minutes, video_url, created_at, updated_at) VALUES
    (gen_random_uuid(), mod3_id, 'Node.js Basics', 'Introduction to Node.js and npm', 1, 30, 'https://example.com/video7', now(), now()),
    (gen_random_uuid(), mod3_id, 'Express Server', 'Creating REST APIs with Express', 2, 50, 'https://example.com/video8', now(), now()),
    (gen_random_uuid(), mod3_id, 'Middleware & Authentication', 'Working with middleware and user authentication', 3, 45, 'https://example.com/video9', now(), now());

    -- Insert lessons for Module 4
    INSERT INTO course_lessons (id, module_id, title, description, lesson_order, duration_minutes, video_url, created_at, updated_at) VALUES
    (gen_random_uuid(), mod4_id, 'Database Fundamentals', 'Understanding databases and data modeling', 1, 35, 'https://example.com/video10', now(), now()),
    (gen_random_uuid(), mod4_id, 'MongoDB Operations', 'CRUD operations with MongoDB', 2, 40, 'https://example.com/video11', now(), now()),
    (gen_random_uuid(), mod4_id, 'Mongoose ODM', 'Using Mongoose for MongoDB operations', 3, 35, 'https://example.com/video12', now(), now());

    -- Insert lessons for Module 5
    INSERT INTO course_lessons (id, module_id, title, description, lesson_order, duration_minutes, video_url, created_at, updated_at) VALUES
    (gen_random_uuid(), mod5_id, 'Production Basics', 'Preparing applications for production', 1, 25, 'https://example.com/video13', now(), now()),
    (gen_random_uuid(), mod5_id, 'Cloud Deployment', 'Deploying to cloud platforms like Heroku', 2, 40, 'https://example.com/video14', now(), now()),
    (gen_random_uuid(), mod5_id, 'Monitoring & Scaling', 'Application monitoring and scaling strategies', 3, 30, 'https://example.com/video15', now(), now());
END $$;
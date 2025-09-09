-- Insert sample courses
INSERT INTO public.courses (title, description, instructor_name, difficulty_level, duration_hours, rating, enrolled_count, price, is_free, skills_taught, category, thumbnail_url) VALUES
('React Advanced Patterns', 'Master advanced React patterns including HOCs, render props, and custom hooks for building scalable applications.', 'Sarah Johnson', 'advanced', 25, 4.8, 1250, 99.99, false, ARRAY['React', 'JavaScript', 'Frontend'], 'Frontend Development', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500'),
('Python for Data Science', 'Complete guide to Python programming for data analysis, visualization, and machine learning.', 'Dr. Michael Chen', 'intermediate', 40, 4.9, 2100, 149.99, false, ARRAY['Python', 'Data Analysis', 'Machine Learning'], 'Data Science', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=500'),
('JavaScript Fundamentals', 'Learn JavaScript from scratch with hands-on projects and real-world examples.', 'Alex Rivera', 'beginner', 30, 4.7, 3200, 0, true, ARRAY['JavaScript', 'Web Development', 'Programming'], 'Programming', 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500'),
('UI/UX Design Mastery', 'Complete course on user interface and user experience design principles and tools.', 'Emma Watson', 'intermediate', 35, 4.6, 850, 129.99, false, ARRAY['UI Design', 'UX Design', 'Figma'], 'Design', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500'),
('Node.js Backend Development', 'Build robust backend applications with Node.js, Express, and MongoDB.', 'James Wilson', 'intermediate', 45, 4.8, 1800, 179.99, false, ARRAY['Node.js', 'Express', 'MongoDB', 'Backend'], 'Backend Development', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500'),
('Machine Learning with TensorFlow', 'Deep dive into machine learning algorithms and implementation with TensorFlow.', 'Dr. Lisa Zhang', 'advanced', 60, 4.9, 950, 299.99, false, ARRAY['Machine Learning', 'TensorFlow', 'Python', 'AI'], 'Artificial Intelligence', 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=500');

-- Insert sample learning paths
INSERT INTO public.learning_paths (title, description, difficulty_level, estimated_duration_weeks, course_ids, skills_gained, target_role) VALUES
('Full Stack Web Developer', 'Complete pathway to become a full-stack web developer with modern technologies.', 'intermediate', 24, ARRAY[], ARRAY['React', 'Node.js', 'JavaScript', 'Database Design'], 'Full Stack Developer'),
('Data Science Professional', 'Comprehensive learning path for aspiring data scientists and analysts.', 'intermediate', 32, ARRAY[], ARRAY['Python', 'Machine Learning', 'Data Analysis', 'Statistics'], 'Data Scientist'),
('Frontend Specialist', 'Master frontend development with React, JavaScript, and modern design principles.', 'beginner', 16, ARRAY[], ARRAY['React', 'JavaScript', 'CSS', 'UI/UX'], 'Frontend Developer'),
('AI/ML Engineer', 'Advanced pathway for machine learning and artificial intelligence specialization.', 'advanced', 40, ARRAY[], ARRAY['Machine Learning', 'TensorFlow', 'Python', 'Deep Learning'], 'AI Engineer');

-- Update learning paths with actual course IDs
UPDATE public.learning_paths 
SET course_ids = ARRAY[
  (SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals'),
  (SELECT id FROM public.courses WHERE title = 'React Advanced Patterns'),
  (SELECT id FROM public.courses WHERE title = 'Node.js Backend Development')
]
WHERE title = 'Full Stack Web Developer';

UPDATE public.learning_paths 
SET course_ids = ARRAY[
  (SELECT id FROM public.courses WHERE title = 'Python for Data Science'),
  (SELECT id FROM public.courses WHERE title = 'Machine Learning with TensorFlow')
]
WHERE title = 'Data Science Professional';

UPDATE public.learning_paths 
SET course_ids = ARRAY[
  (SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals'),
  (SELECT id FROM public.courses WHERE title = 'React Advanced Patterns'),
  (SELECT id FROM public.courses WHERE title = 'UI/UX Design Mastery')
]
WHERE title = 'Frontend Specialist';

UPDATE public.learning_paths 
SET course_ids = ARRAY[
  (SELECT id FROM public.courses WHERE title = 'Python for Data Science'),
  (SELECT id FROM public.courses WHERE title = 'Machine Learning with TensorFlow')
]
WHERE title = 'AI/ML Engineer';
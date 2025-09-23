-- Insert sample course data with correct columns
INSERT INTO public.courses (id, title, description, category, duration_hours, instructor_name, thumbnail_url, is_published)
VALUES (
  '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270',
  'Introduction to Full Stack Development',
  'Learn the fundamentals of full stack web development including frontend, backend, and database technologies.',
  'Web Development',
  15,
  'Sarah Johnson',
  'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&h=600&fit=crop',
  true
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_published = EXCLUDED.is_published;

-- Insert sample modules
INSERT INTO public.modules (id, course_id, title, description, order_index)
VALUES 
  ('module-1', '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270', 'Getting Started', 'Introduction to web development concepts', 0),
  ('module-2', '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270', 'Frontend Fundamentals', 'HTML, CSS, and JavaScript basics', 1),
  ('module-3', '28cd818d-ff9b-44c0-8ca8-c0ce6d42b270', 'Backend Development', 'Server-side programming and APIs', 2)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- Insert sample lessons with working video URLs
INSERT INTO public.lessons (id, module_id, title, content, video_url, duration_minutes, order_index, is_preview)
VALUES 
  (
    '2018be29-271c-44db-9efe-45f9f822f6a1',
    'module-1', 
    'Course Overview',
    '<h2>Welcome to Full Stack Development</h2><p>In this comprehensive course, you will learn the fundamentals of full stack web development. We will cover frontend technologies like HTML, CSS, and JavaScript, as well as backend development with modern frameworks and databases.</p><h3>What You Will Learn:</h3><ul><li>Frontend development with modern frameworks</li><li>Backend API development</li><li>Database design and management</li><li>Deployment and DevOps basics</li></ul>',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    15,
    0,
    true
  ),
  (
    'lesson-intro-2',
    'module-1',
    'Development Environment Setup',
    '<h2>Setting Up Your Development Environment</h2><p>Before we start coding, let''s set up a proper development environment. This includes installing necessary tools, configuring your code editor, and understanding the project structure.</p>',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    12,
    1,
    false
  ),
  (
    'lesson-html-1',
    'module-2',
    'HTML Fundamentals',
    '<h2>Introduction to HTML</h2><p>HTML (HyperText Markup Language) is the foundation of web development. Learn how to structure web content with semantic HTML elements.</p>',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    18,
    0,
    false
  ),
  (
    'lesson-css-1',
    'module-2',
    'CSS Styling Basics',
    '<h2>Styling with CSS</h2><p>CSS (Cascading Style Sheets) is used to style and layout web pages. Learn how to make your HTML content look beautiful and responsive.</p>',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    20,
    1,
    false
  ),
  (
    'lesson-js-1',
    'module-2',
    'JavaScript Introduction',
    '<h2>Programming with JavaScript</h2><p>JavaScript adds interactivity to web pages. Learn the basics of programming and how to manipulate the DOM.</p>',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    25,
    2,
    false
  ),
  (
    'lesson-backend-1',
    'module-3',
    'Server-Side Programming',
    '<h2>Introduction to Backend Development</h2><p>Learn how to build server-side applications that handle data, authentication, and business logic.</p>',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    22,
    0,
    false
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  video_url = EXCLUDED.video_url,
  duration_minutes = EXCLUDED.duration_minutes;
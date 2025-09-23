-- Add proper thumbnail images and YouTube content to courses
UPDATE courses 
SET 
  thumbnail_url = CASE 
    WHEN title ILIKE '%Full Stack Web Development%' THEN 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=300&fit=crop'
    WHEN title ILIKE '%Personal Branding%' THEN 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop'
    WHEN title ILIKE '%React%' THEN 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=300&fit=crop'
    WHEN title ILIKE '%JavaScript%' THEN 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=500&h=300&fit=crop'
    WHEN title ILIKE '%Python%' THEN 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=500&h=300&fit=crop'
    WHEN title ILIKE '%Node%' THEN 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=300&fit=crop'
    WHEN title ILIKE '%Design%' THEN 'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=500&h=300&fit=crop'
    WHEN title ILIKE '%Marketing%' THEN 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop'
    WHEN title ILIKE '%Data%' THEN 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop'
    WHEN title ILIKE '%AI%' OR title ILIKE '%Machine Learning%' THEN 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=300&fit=crop'
    ELSE 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop'
  END
WHERE thumbnail_url IS NULL OR thumbnail_url = '';

-- Update existing courses with YouTube video IDs and enhance data
UPDATE courses 
SET 
  youtube_video_id = CASE 
    WHEN title ILIKE '%Full Stack Web Development%' THEN 'nu_pCVPKzTk'
    WHEN title ILIKE '%Personal Branding%' THEN 'RVKofRN1dyI'
    ELSE NULL
  END,
  content_type = 'video',
  youtube_channel_name = CASE 
    WHEN title ILIKE '%Full Stack Web Development%' THEN 'freeCodeCamp.org'
    WHEN title ILIKE '%Personal Branding%' THEN 'TED'
    ELSE instructor_name
  END,
  view_count = CASE 
    WHEN title ILIKE '%Full Stack Web Development%' THEN 4200000
    WHEN title ILIKE '%Personal Branding%' THEN 850000
    ELSE FLOOR(RANDOM() * 500000 + 50000)::int
  END,
  like_count = CASE 
    WHEN title ILIKE '%Full Stack Web Development%' THEN 180000
    WHEN title ILIKE '%Personal Branding%' THEN 42000
    ELSE FLOOR(RANDOM() * 25000 + 5000)::int
  END,
  video_duration = CASE 
    WHEN title ILIKE '%Full Stack Web Development%' THEN 'PT4H30M15S'
    WHEN title ILIKE '%Personal Branding%' THEN 'PT18M42S'
    ELSE 'PT' || (FLOOR(RANDOM() * 3 + 1))::text || 'H' || (FLOOR(RANDOM() * 60))::text || 'M' || (FLOOR(RANDOM() * 60))::text || 'S'
  END,
  language = 'en',
  external_url = CASE 
    WHEN youtube_video_id IS NOT NULL THEN 'https://www.youtube.com/watch?v=' || youtube_video_id
    ELSE NULL
  END
WHERE id IN (
  SELECT id FROM courses LIMIT 10
);

-- Insert more sample courses with proper images and YouTube content
INSERT INTO courses (
  title, description, instructor_name, category, difficulty_level, duration_hours, 
  price, is_free, skills_taught, thumbnail_url, rating, enrolled_count,
  youtube_video_id, content_type, youtube_channel_name, view_count, like_count,
  video_duration, language, external_url, is_active
) VALUES 
(
  'Complete React Tutorial for Beginners',
  'Master React from scratch with this comprehensive tutorial covering components, hooks, state management, and modern React patterns.',
  'Maximilian Schwarzmüller',
  'Web Development',
  'beginner',
  8,
  0,
  true,
  ARRAY['React', 'JavaScript', 'JSX', 'Hooks', 'State Management'],
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=300&fit=crop',
  4.8,
  125000,
  'Ke90Tje7VS0',
  'video',
  'Programming with Mosh',
  2100000,
  95000,
  'PT5H45M30S',
  'en',
  'https://www.youtube.com/watch?v=Ke90Tje7VS0',
  true
),
(
  'JavaScript Crash Course 2024',
  'Learn JavaScript fundamentals including ES6+, DOM manipulation, async programming, and modern JavaScript development.',
  'Brad Traversy',
  'Web Development',
  'beginner',
  6,
  0,
  true,
  ARRAY['JavaScript', 'ES6+', 'DOM', 'Async/Await', 'Promises'],
  'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=500&h=300&fit=crop',
  4.7,
  98000,
  'hdI2bqOjy3c',
  'video',
  'Traversy Media',
  1800000,
  78000,
  'PT3H15M45S',
  'en',
  'https://www.youtube.com/watch?v=hdI2bqOjy3c',
  true
),
(
  'Python for Everybody - Complete Course',
  'Comprehensive Python programming course covering basics, data structures, web scraping, databases, and data visualization.',
  'Dr. Charles Severance',
  'Programming',
  'beginner',
  12,
  0,
  true,
  ARRAY['Python', 'Data Structures', 'Web Scraping', 'SQLite', 'Data Visualization'],
  'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=500&h=300&fit=crop',
  4.9,
  250000,
  'RFjDeF1bKX0',
  'video',
  'freeCodeCamp.org',
  3200000,
  145000,
  'PT13H45M20S',
  'en',
  'https://www.youtube.com/watch?v=RFjDeF1bKX0',
  true
),
(
  'UI/UX Design Fundamentals',
  'Learn the principles of user interface and user experience design, including wireframing, prototyping, and design systems.',
  'Sarah Johnson',
  'Design',
  'beginner',
  4,
  0,
  true,
  ARRAY['UI Design', 'UX Research', 'Figma', 'Wireframing', 'Prototyping'],
  'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=500&h=300&fit=crop',
  4.6,
  67000,
  '9xPOdKJgUEE',
  'video',
  'DesignCourse',
  890000,
  38000,
  'PT2H30M15S',
  'en',
  'https://www.youtube.com/watch?v=9xPOdKJgUEE',
  true
),
(
  'Digital Marketing Masterclass',
  'Complete guide to digital marketing including SEO, social media marketing, content marketing, and analytics.',
  'Neil Patel',
  'Marketing',
  'intermediate',
  10,
  0,
  true,
  ARRAY['SEO', 'Social Media Marketing', 'Content Marketing', 'Google Analytics', 'PPC'],
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop',
  4.5,
  89000,
  'nU-IIXBWlS4',
  'video',
  'Neil Patel',
  1200000,
  52000,
  'PT6H20M40S',
  'en',
  'https://www.youtube.com/watch?v=nU-IIXBWlS4',
  true
),
(
  'Data Science with Python',
  'Learn data science from scratch using Python, pandas, matplotlib, and machine learning libraries.',
  'Jose Portilla',
  'Data Science',
  'intermediate',
  15,
  0,
  true,
  ARRAY['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Machine Learning', 'Jupyter'],
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop',
  4.8,
  156000,
  'LHBE6Q9XlzI',
  'video',
  'freeCodeCamp.org',
  2800000,
  125000,
  'PT12H15M30S',
  'en',
  'https://www.youtube.com/watch?v=LHBE6Q9XlzI',
  true
);

-- Update course_lessons with YouTube video URLs for sample lessons
UPDATE course_lessons 
SET video_url = CASE 
  WHEN title ILIKE '%Introduction%' AND module_id IN (
    SELECT id FROM course_modules WHERE course_id IN (
      SELECT id FROM courses WHERE youtube_video_id IS NOT NULL
    )
  ) THEN 'https://www.youtube.com/embed/' || (
    SELECT youtube_video_id FROM courses 
    WHERE id = (SELECT course_id FROM course_modules WHERE course_modules.id = course_lessons.module_id)
  ) || '?start=0&end=600'
  WHEN title ILIKE '%HTML%' THEN 'https://www.youtube.com/embed/qz0aGYrrlhU'
  WHEN title ILIKE '%CSS%' THEN 'https://www.youtube.com/embed/1Rs2ND1ryYc'
  WHEN title ILIKE '%JavaScript%' THEN 'https://www.youtube.com/embed/PkZNo7MFNFg'
  WHEN title ILIKE '%React%' THEN 'https://www.youtube.com/embed/SqcY0GlETPk'
  WHEN title ILIKE '%Node%' THEN 'https://www.youtube.com/embed/TlB_eWDSMt4'
  WHEN title ILIKE '%Database%' THEN 'https://www.youtube.com/embed/HXV3zeQKqGY'
  ELSE 'https://www.youtube.com/embed/nu_pCVPKzTk?start=' || (FLOOR(RANDOM() * 3600))::text
END
WHERE video_url IS NULL OR video_url = '';
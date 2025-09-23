-- Add YouTube video content to courses that are missing it
UPDATE courses 
SET youtube_video_id = CASE 
    WHEN title = 'Advanced React Patterns' THEN 'Ke90Tje7VS0'
    WHEN title = 'Node.js Backend Development' THEN 'TlB_eWDSMt4'
    WHEN title = 'Python for Data Science' THEN 'rfscVS0vtbw'
    WHEN title = 'Machine Learning Fundamentals' THEN '7eh4d6sabA0'
    WHEN title = 'AWS Cloud Architecture' THEN 'NmM9HA2MQGI'
    WHEN title = 'Docker & Kubernetes' THEN 'X48VuDVv0do'
    WHEN title = 'GraphQL Complete Guide' THEN 'ed8SzALpx1Q'
    WHEN title = 'Vue.js 3 Masterclass' THEN 'YrxBCBibVo0'
    WHEN title = 'SQL Database Design' THEN 'ztHopE5Wnpc'
    WHEN title = 'Cybersecurity Essentials' THEN '4J0xFAEs5_0'
    WHEN title = 'Digital Marketing Strategy' THEN 'nU-IIXBWlS4'
    WHEN title = 'Leadership Development' THEN 'xlE-2rfHUHM'
END
WHERE youtube_video_id IS NULL OR youtube_video_id = '';

-- First, create course modules for all courses (needed as parent for lessons)
INSERT INTO course_modules (id, course_id, title, description, module_order, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    c.id,
    'Module 1: Introduction',
    'Get started with the fundamentals',
    1,
    NOW(),
    NOW()
FROM courses c 
WHERE NOT EXISTS (
    SELECT 1 FROM course_modules cm 
    WHERE cm.course_id = c.id
);

-- Add introductory lesson for each course that has YouTube video
INSERT INTO course_lessons (id, module_id, title, content, lesson_type, video_url, duration_minutes, lesson_order, is_free, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    cm.id,
    'Introduction to ' || c.title,
    'Welcome to this comprehensive course on ' || c.title || '. In this lesson, we''ll cover the fundamentals and what you can expect to learn throughout this course.',
    'video',
    'https://www.youtube.com/watch?v=' || c.youtube_video_id,
    15,
    1,
    true,
    true,
    NOW(),
    NOW()
FROM courses c 
JOIN course_modules cm ON cm.course_id = c.id AND cm.module_order = 1
WHERE c.youtube_video_id IS NOT NULL 
AND NOT EXISTS (
    SELECT 1 FROM course_lessons cl 
    WHERE cl.module_id = cm.id AND cl.lesson_order = 1
);

-- Add second lesson for core concepts
INSERT INTO course_lessons (id, module_id, title, content, lesson_type, video_url, duration_minutes, lesson_order, is_free, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    cm.id,
    'Core Concepts and Fundamentals',
    'In this lesson, we dive deeper into the core concepts and practical applications. You''ll learn the essential principles that form the foundation of this subject.',
    'video',
    'https://www.youtube.com/watch?v=' || c.youtube_video_id,
    25,
    2,
    false,
    true,
    NOW(),
    NOW()
FROM courses c 
JOIN course_modules cm ON cm.course_id = c.id AND cm.module_order = 1
WHERE c.youtube_video_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM course_lessons cl 
    WHERE cl.module_id = cm.id AND cl.lesson_order = 2
);
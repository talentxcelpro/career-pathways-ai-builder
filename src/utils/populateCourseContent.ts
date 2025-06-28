
import { supabase } from '@/integrations/supabase/client';

export const populateCourseContent = async () => {
  try {
    // Get all courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .limit(10);

    if (!courses) return;

    for (const course of courses) {
      // Create modules for each course
      const moduleData = getCourseModules(course.title);
      
      for (const moduleInfo of moduleData) {
        const { data: module } = await supabase
          .from('course_modules')
          .insert({
            course_id: course.id,
            title: moduleInfo.title,
            description: moduleInfo.description,
            module_order: moduleInfo.order,
            duration_minutes: moduleInfo.duration
          })
          .select()
          .single();

        if (module) {
          // Create lessons for each module
          for (const lessonInfo of moduleInfo.lessons) {
            await supabase
              .from('course_lessons')
              .insert({
                module_id: module.id,
                title: lessonInfo.title,
                content: lessonInfo.content,
                lesson_type: lessonInfo.type,
                video_url: lessonInfo.video_url, // Fixed property name
                duration_minutes: lessonInfo.duration,
                lesson_order: lessonInfo.order,
                is_free: lessonInfo.isFree
              });
          }
        }
      }

      // Create assessment for each course
      const assessmentData = getCourseAssessment(course.title);
      await supabase
        .from('course_assessments')
        .insert({
          course_id: course.id,
          title: assessmentData.title,
          description: assessmentData.description,
          questions: assessmentData.questions,
          passing_score: assessmentData.passingScore,
          time_limit_minutes: assessmentData.timeLimit,
          max_attempts: 3
        });
    }

    console.log('Course content populated successfully!');
  } catch (error) {
    console.error('Error populating course content:', error);
  }
};

const getCourseModules = (courseTitle: string) => {
  const commonModules = {
    'Full Stack Web Development with React & Node.js': [
      {
        title: 'Introduction to Web Development',
        description: 'Overview of modern web development and tools',
        order: 1,
        duration: 120,
        lessons: [
          {
            title: 'Course Introduction',
            content: 'Welcome to Full Stack Web Development! In this comprehensive course, you will learn...',
            type: 'video',
            video_url: 'https://example.com/intro-video',
            duration: 15,
            order: 1,
            isFree: true
          },
          {
            title: 'Setting Up Your Development Environment',
            content: 'Learn how to set up Node.js, VS Code, and other essential tools...',
            type: 'text',
            video_url: null,
            duration: 30,
            order: 2,
            isFree: true
          }
        ]
      },
      {
        title: 'JavaScript Fundamentals',
        description: 'Master modern JavaScript ES6+ features',
        order: 2,
        duration: 180,
        lessons: [
          {
            title: 'ES6+ Features',
            content: 'Explore arrow functions, destructuring, spread operator, and more...',
            type: 'video',
            video_url: 'https://example.com/js-video',
            duration: 45,
            order: 1,
            isFree: false
          },
          {
            title: 'Asynchronous JavaScript',
            content: 'Understanding Promises, async/await, and handling API calls...',
            type: 'video',
            video_url: 'https://example.com/async-video',
            duration: 60,
            order: 2,
            isFree: false
          }
        ]
      }
    ],
    'Data Science & Machine Learning with Python': [
      {
        title: 'Python for Data Science',
        description: 'Introduction to Python libraries for data analysis',
        order: 1,
        duration: 150,
        lessons: [
          {
            title: 'Course Overview',
            content: 'Welcome to Data Science & Machine Learning with Python...',
            type: 'video',
            video_url: 'https://example.com/python-intro',
            duration: 20,
            order: 1,
            isFree: true
          },
          {
            title: 'NumPy Fundamentals',
            content: 'Learn array operations, broadcasting, and numerical computing...',
            type: 'text',
            video_url: null,
            duration: 45,
            order: 2,
            isFree: false
          }
        ]
      }
    ]
  };

  return commonModules[courseTitle as keyof typeof commonModules] || [
    {
      title: 'Introduction',
      description: 'Course introduction and overview',
      order: 1,
      duration: 60,
      lessons: [
        {
          title: 'Welcome to the Course',
          content: 'Course introduction and what you will learn...',
          type: 'video',
          video_url: 'https://example.com/welcome',
          duration: 15,
          order: 1,
          isFree: true
        }
      ]
    }
  ];
};

const getCourseAssessment = (courseTitle: string) => {
  const assessments = {
    'Full Stack Web Development with React & Node.js': {
      title: 'Full Stack Development Assessment',
      description: 'Test your knowledge of React, Node.js, and web development concepts',
      passingScore: 75,
      timeLimit: 60,
      questions: [
        {
          id: '1',
          question: 'Which of the following is a React Hook for managing state?',
          type: 'single',
          options: ['useState', 'componentDidMount', 'render', 'constructor'],
          correct_answers: [0],
          points: 10
        },
        {
          id: '2',
          question: 'Select all valid HTTP methods: (Multiple answers)',
          type: 'multiple',
          options: ['GET', 'POST', 'DELETE', 'FETCH'],
          correct_answers: [0, 1, 2],
          points: 15
        }
      ]
    }
  };

  return assessments[courseTitle as keyof typeof assessments] || {
    title: 'Course Assessment',
    description: 'Test your knowledge from this course',
    passingScore: 70,
    timeLimit: 45,
    questions: [
      {
        id: '1',
        question: 'What is the main topic of this course?',
        type: 'single',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answers: [0],
        points: 20
      }
    ]
  };
};

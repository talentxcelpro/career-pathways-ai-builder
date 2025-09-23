import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CourseContentTemplate {
  modules: {
    title: string;
    description: string;
    order: number;
    duration: number;
    lessons: {
      title: string;
      content: string;
      type: 'video' | 'text' | 'quiz' | 'exercise';
      duration: number;
      order: number;
      isFree: boolean;
      video_url?: string;
    }[];
  }[];
}

// YouTube video database by category and topic
const youtubeVideoLibrary: Record<string, string[]> = {
  'Web Development': [
    'https://www.youtube.com/watch?v=W6NZfCO5SIk', // JavaScript Variables
    'https://www.youtube.com/watch?v=h33Srr5J9nY', // Functions
    'https://www.youtube.com/watch?v=6ThXsUwLWvc', // React Hooks
    'https://www.youtube.com/watch?v=Ke90Tje7VS0', // React Tutorial
    'https://www.youtube.com/watch?v=fJEqVoravOE', // Node.js Tutorial
    'https://www.youtube.com/watch?v=L72fhGm1tfE', // Express.js
    'https://www.youtube.com/watch?v=7CqJlxBYj-M', // MongoDB
    'https://www.youtube.com/watch?v=AT_y4mGHdLM', // CSS Grid
    'https://www.youtube.com/watch?v=tAuRQs_d9F8', // HTML5
    'https://www.youtube.com/watch?v=UB1O30fR-EE', // Responsive Design
  ],
  'Data Science': [
    'https://www.youtube.com/watch?v=YYXdXT2l-Gg', // Python Setup
    'https://www.youtube.com/watch?v=_uQrJ0TkZlc', // Pandas Tutorial
    'https://www.youtube.com/watch?v=ZyhVh-qRZPA', // NumPy
    'https://www.youtube.com/watch?v=3Xc3CA655Y4', // Matplotlib
    'https://www.youtube.com/watch?v=a9UrKTVEeZA', // Data Analysis
    'https://www.youtube.com/watch?v=airArVXt9MI', // Machine Learning
    'https://www.youtube.com/watch?v=7eh4d6sabA0', // Statistics
    'https://www.youtube.com/watch?v=ukzFI9rgwfU', // ML Basics
    'https://www.youtube.com/watch?v=aircArVXt9MI', // Data Visualization
    'https://www.youtube.com/watch?v=ota_L4BUriM', // Scikit-learn
  ],
  'Machine Learning': [
    'https://www.youtube.com/watch?v=ukzFI9rgwfU', // ML Introduction
    'https://www.youtube.com/watch?v=aircArVXt9MI', // Supervised Learning
    'https://www.youtube.com/watch?v=ota_L4BUriM', // Linear Regression
    'https://www.youtube.com/watch?v=zM4VZR0px8E', // Neural Networks
    'https://www.youtube.com/watch?v=MPU2HistivI', // TensorFlow
    'https://www.youtube.com/watch?v=tPYj3fFJGjk', // Deep Learning
    'https://www.youtube.com/watch?v=ZftI2fEz0Fw', // Classification
    'https://www.youtube.com/watch?v=4b5d3muPQmA', // Clustering
    'https://www.youtube.com/watch?v=EuBBz3bI-aA', // Feature Engineering
    'https://www.youtube.com/watch?v=j7VZsCCnptM', // Model Evaluation
  ],
  'UI/UX Design': [
    'https://www.youtube.com/watch?v=YiLUYf4HDh4', // UI/UX Basics
    'https://www.youtube.com/watch?v=68w2VwalD5w', // Figma Tutorial
    'https://www.youtube.com/watch?v=Cls87wyZ7Ss', // Design Principles
    'https://www.youtube.com/watch?v=BIoNyPpGfVs', // User Research
    'https://www.youtube.com/watch?v=Ovj4hFxko7c', // Wireframing
    'https://www.youtube.com/watch?v=wIuVvCuiJhU', // Prototyping
    'https://www.youtube.com/watch?v=6Ko3BXHDhQE', // Color Theory
    'https://www.youtube.com/watch?v=sByzHoiYFX0', // Typography
    'https://www.youtube.com/watch?v=YqQx75OPRa0', // User Testing
    'https://www.youtube.com/watch?v=QwSN4n2sjR8', // Mobile Design
  ],
  'Digital Marketing': [
    'https://www.youtube.com/watch?v=hF515-0Tduk', // Digital Marketing Basics
    'https://www.youtube.com/watch?v=lyHQt9AFwWo', // SEO Tutorial
    'https://www.youtube.com/watch?v=9kR-T6W5ULs', // Google Ads
    'https://www.youtube.com/watch?v=0ABg4YAQ6Ao', // Social Media Marketing
    'https://www.youtube.com/watch?v=wDhe1mICjK8', // Content Marketing
    'https://www.youtube.com/watch?v=aX_Bsg4_2CQ', // Email Marketing
    'https://www.youtube.com/watch?v=d7QTr2_yNQo', // Analytics
    'https://www.youtube.com/watch?v=uGGZd-4q0aI', // Facebook Ads
    'https://www.youtube.com/watch?v=aXCqUF0seLY', // Marketing Strategy
    'https://www.youtube.com/watch?v=kz4t_FeZr8Q', // Conversion Optimization
  ]
};

// Generate comprehensive course content based on category
function generateCourseContent(category: string, title: string): CourseContentTemplate {
  const videoUrls = youtubeVideoLibrary[category] || youtubeVideoLibrary['Web Development'];
  
  // Base module structure that works for most courses
  const modules = [
    {
      title: 'Introduction and Fundamentals',
      description: `Get started with the basics of ${title}`,
      order: 1,
      duration: 180,
      lessons: [
        {
          title: 'Course Introduction',
          content: `Welcome to ${title}! This comprehensive course will take you from beginner to advanced level.`,
          type: 'video' as const,
          duration: 15,
          order: 1,
          isFree: true,
          video_url: videoUrls[0]
        },
        {
          title: 'Setting Up Your Environment',
          content: 'Learn how to set up your development environment and required tools.',
          type: 'video' as const,
          duration: 25,
          order: 2,
          isFree: true,
          video_url: videoUrls[1]
        },
        {
          title: 'Core Concepts Overview',
          content: 'Understanding the fundamental concepts and terminology.',
          type: 'video' as const,
          duration: 35,
          order: 3,
          isFree: false,
          video_url: videoUrls[2]
        },
        {
          title: 'Getting Started Exercise',
          content: 'Practice what you\'ve learned with hands-on exercises.',
          type: 'exercise' as const,
          duration: 30,
          order: 4,
          isFree: false
        }
      ]
    },
    {
      title: 'Core Skills Development',
      description: 'Build essential skills and understanding',
      order: 2,
      duration: 240,
      lessons: [
        {
          title: 'Essential Techniques',
          content: 'Master the core techniques used by professionals.',
          type: 'video' as const,
          duration: 45,
          order: 1,
          isFree: false,
          video_url: videoUrls[3]
        },
        {
          title: 'Best Practices',
          content: 'Learn industry best practices and common patterns.',
          type: 'video' as const,
          duration: 40,
          order: 2,
          isFree: false,
          video_url: videoUrls[4]
        },
        {
          title: 'Common Challenges',
          content: 'Identify and solve common problems in this field.',
          type: 'video' as const,
          duration: 35,
          order: 3,
          isFree: false,
          video_url: videoUrls[5]
        },
        {
          title: 'Practical Application',
          content: 'Apply your knowledge to real-world scenarios.',
          type: 'exercise' as const,
          duration: 60,
          order: 4,
          isFree: false
        },
        {
          title: 'Knowledge Check',
          content: 'Test your understanding with a comprehensive quiz.',
          type: 'quiz' as const,
          duration: 20,
          order: 5,
          isFree: false
        }
      ]
    },
    {
      title: 'Advanced Concepts',
      description: 'Master advanced techniques and strategies',
      order: 3,
      duration: 200,
      lessons: [
        {
          title: 'Advanced Techniques',
          content: 'Explore advanced techniques used by experts.',
          type: 'video' as const,
          duration: 50,
          order: 1,
          isFree: false,
          video_url: videoUrls[6]
        },
        {
          title: 'Performance Optimization',
          content: 'Learn how to optimize for better performance.',
          type: 'video' as const,
          duration: 45,
          order: 2,
          isFree: false,
          video_url: videoUrls[7]
        },
        {
          title: 'Advanced Tools',
          content: 'Master advanced tools and frameworks.',
          type: 'video' as const,
          duration: 40,
          order: 3,
          isFree: false,
          video_url: videoUrls[8]
        },
        {
          title: 'Complex Project',
          content: 'Build a complex project using advanced concepts.',
          type: 'exercise' as const,
          duration: 90,
          order: 4,
          isFree: false
        }
      ]
    },
    {
      title: 'Professional Application',
      description: 'Apply skills in professional contexts',
      order: 4,
      duration: 180,
      lessons: [
        {
          title: 'Industry Standards',
          content: 'Learn current industry standards and practices.',
          type: 'video' as const,
          duration: 35,
          order: 1,
          isFree: false,
          video_url: videoUrls[9]
        },
        {
          title: 'Professional Workflow',
          content: 'Understand professional workflows and processes.',
          type: 'video' as const,
          duration: 40,
          order: 2,
          isFree: false,
          video_url: videoUrls[0] // Cycle back if needed
        },
        {
          title: 'Capstone Project',
          content: 'Complete a comprehensive capstone project.',
          type: 'exercise' as const,
          duration: 120,
          order: 3,
          isFree: false
        },
        {
          title: 'Final Assessment',
          content: 'Demonstrate mastery with a final assessment.',
          type: 'quiz' as const,
          duration: 30,
          order: 4,
          isFree: false
        }
      ]
    }
  ];

  return { modules };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { action, course_limit = 50 } = await req.json();

    if (action === 'complete_existing_courses') {
      console.log(`Starting completion process for up to ${course_limit} courses...`);

      // Get courses that don't have modules yet
      const { data: courses, error: coursesError } = await supabaseClient
        .from('courses')
        .select(`
          id, 
          title, 
          category
        `)
        .eq('is_active', true)
        .limit(course_limit);

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        throw coursesError;
      }

      if (!courses || courses.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'All courses already have content!',
            courses_processed: 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Found ${courses.length} courses to process`);

      // Check which courses already have modules to avoid duplicates
      const courseIds = courses.map(c => c.id);
      const { data: existingModules } = await supabaseClient
        .from('course_modules')
        .select('course_id')
        .in('course_id', courseIds);
      
      const coursesWithModules = new Set(existingModules?.map(m => m.course_id) || []);
      const coursesToProcess = courses.filter(c => !coursesWithModules.has(c.id));
      
      console.log(`${coursesToProcess.length} courses need modules (${coursesWithModules.size} already have modules)`);

      if (coursesToProcess.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'All courses already have content!',
            courses_processed: 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let completedCourses = 0;
      let totalModulesCreated = 0;
      let totalLessonsCreated = 0;

      // Process each course
      for (const course of coursesToProcess) {
        try {
          console.log(`Processing course: ${course.title}`);
          
          const courseContent = generateCourseContent(course.category || 'Web Development', course.title);
          
          // Create modules for this course
          for (const moduleData of courseContent.modules) {
            const { data: module, error: moduleError } = await supabaseClient
              .from('course_modules')
              .insert({
                course_id: course.id,
                title: moduleData.title,
                description: moduleData.description,
                module_order: moduleData.order,
                duration_minutes: moduleData.duration,
              })
              .select()
              .single();

            if (moduleError) {
              console.error(`Error creating module for course ${course.title}:`, moduleError);
              continue;
            }

            totalModulesCreated++;

            // Create lessons for this module
            for (const lessonData of moduleData.lessons) {
              const { error: lessonError } = await supabaseClient
                .from('course_lessons')
                .insert({
                  module_id: module.id,
                  title: lessonData.title,
                  content: lessonData.content,
                  lesson_type: lessonData.type,
                  video_url: lessonData.video_url,
                  duration_minutes: lessonData.duration,
                  lesson_order: lessonData.order,
                  is_free: lessonData.isFree,
                });

              if (lessonError) {
                console.error(`Error creating lesson for course ${course.title}:`, lessonError);
              } else {
                totalLessonsCreated++;
              }
            }
          }

          completedCourses++;
          console.log(`Completed course: ${course.title} (${completedCourses}/${courses.length})`);

        } catch (error) {
          console.error(`Error processing course ${course.title}:`, error);
        }
      }

      // Create course assessments for completed courses
      console.log('Creating assessments...');
      let assessmentsCreated = 0;
      
      for (const course of coursesToProcess.slice(0, completedCourses)) {
        try {
          const { error: assessmentError } = await supabaseClient
            .from('course_assessments')
            .insert({
              course_id: course.id,
              title: `${course.title} - Final Assessment`,
              description: `Comprehensive assessment for ${course.title}`,
              questions: [
                {
                  id: '1',
                  question: `What is the most important concept in ${course.title}?`,
                  type: 'single',
                  options: ['Fundamentals', 'Advanced Techniques', 'Best Practices', 'Real-world Application'],
                  correct_answers: [2],
                  points: 25
                },
                {
                  id: '2', 
                  question: `Which skills are essential for ${course.title}? (Select all that apply)`,
                  type: 'multiple',
                  options: ['Core Concepts', 'Practical Application', 'Problem Solving', 'Industry Knowledge'],
                  correct_answers: [0, 1, 2, 3],
                  points: 25
                }
              ],
              passing_score: 70,
              time_limit_minutes: 45,
              max_attempts: 3
            });

          if (!assessmentError) {
            assessmentsCreated++;
          }
        } catch (error) {
          console.error(`Error creating assessment for course ${course.title}:`, error);
        }
      }

      const response = {
        success: true,
        courses_processed: completedCourses,
        modules_created: totalModulesCreated,
        lessons_created: totalLessonsCreated,
        assessments_created: assessmentsCreated,
        youtube_videos_integrated: totalLessonsCreated,
        message: `Successfully completed ${completedCourses} courses with ${totalModulesCreated} modules, ${totalLessonsCreated} lessons, and ${assessmentsCreated} assessments!`
      };

      console.log('Completion process finished:', response);

      return new Response(
        JSON.stringify(response),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );

  } catch (error) {
    console.error('Error in complete-course-content function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check edge function logs for more details'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
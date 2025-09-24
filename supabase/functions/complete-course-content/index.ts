import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  level: string;
  duration: string;
  category: string;
  subcategory: string;
}

// Educational YouTube videos for different course topics
const getEducationalVideos = (courseTitle: string): string[] => {
  const videoLibrary = {
    'webdev': [
      'https://www.youtube.com/embed/Ke90Tje7VS0', // React Tutorial for Beginners
      'https://www.youtube.com/embed/w7ejDZ8SWv8', // React Hooks Explained
      'https://www.youtube.com/embed/hQAHSlTtcmY', // React State Management
      'https://www.youtube.com/embed/TlB_eWDSMt4', // Node.js Tutorial
      'https://www.youtube.com/embed/fBNz5xF-Kx4', // Express Framework
      'https://www.youtube.com/embed/L72fhGm1tfE', // Node.js Best Practices
      'https://www.youtube.com/embed/SccSCuHhOw0', // JavaScript ES6+
      'https://www.youtube.com/embed/hdI2bqOjy3c'  // TypeScript Tutorial
    ],
    'healthcare': [
      'https://www.youtube.com/embed/YXPyB4XeYLA', // Healthcare Data Analytics
      'https://www.youtube.com/embed/f7c-LgSN6u4', // Medical Informatics
      'https://www.youtube.com/embed/QvHPsd8faY4', // HIPAA Compliance
      'https://www.youtube.com/embed/BHwVBzn5fdA', // Healthcare Systems
      'https://www.youtube.com/embed/tKXSx5PjgBo', // Medical Data Analysis
      'https://www.youtube.com/embed/7eh4d6sabA0', // Healthcare Analytics
      'https://www.youtube.com/embed/CWRTqMGvdpo', // Electronic Health Records
      'https://www.youtube.com/embed/Y-mY7gRbHBQ'  // Healthcare Technology
    ],
    'design': [
      'https://www.youtube.com/embed/c9Wg6Cb_YlU', // UI/UX Design Principles
      'https://www.youtube.com/embed/68w2VwalD5w', // Figma Tutorial
      'https://www.youtube.com/embed/YiLUYf4HDh4', // Design Systems
      'https://www.youtube.com/embed/KYmqVesPAnU', // User Experience Design
      'https://www.youtube.com/embed/TMe0WnkF1Lc', // Adobe Creative Suite
      'https://www.youtube.com/embed/9z2tgqIqByU', // Prototyping
      'https://www.youtube.com/embed/ZbrzdMaumNk', // User Interface Design
      'https://www.youtube.com/embed/a9mJN8BK1cI'  // Design Thinking
    ],
    'business': [
      'https://www.youtube.com/embed/rJgjgSjyzzU', // Business Intelligence
      'https://www.youtube.com/embed/nv7eJkXO6DQ', // Data Analytics
      'https://www.youtube.com/embed/9z84K7Y9g7E', // Power BI Tutorial
      'https://www.youtube.com/embed/TPMlZxRRaBQ', // Tableau Tutorial
      'https://www.youtube.com/embed/7S_tz1z_5bA', // SQL for Business
      'https://www.youtube.com/embed/airArVXyr44', // Machine Learning for Business
      'https://www.youtube.com/embed/M4CXOocovZ4', // Data Visualization
      'https://www.youtube.com/embed/l_C9E2Gkmtk'  // Business Analytics
    ]
  };
  
  if (courseTitle.toLowerCase().includes('web development') || courseTitle.toLowerCase().includes('react') || courseTitle.toLowerCase().includes('node')) {
    return videoLibrary.webdev;
  }
  if (courseTitle.toLowerCase().includes('healthcare') || courseTitle.toLowerCase().includes('medical')) {
    return videoLibrary.healthcare;
  }
  if (courseTitle.toLowerCase().includes('design') || courseTitle.toLowerCase().includes('ui/ux')) {
    return videoLibrary.design;
  }
  if (courseTitle.toLowerCase().includes('business') || courseTitle.toLowerCase().includes('analytics')) {
    return videoLibrary.business;
  }
  
  return videoLibrary.webdev; // Default fallback
};

// Helper function to get appropriate video URL based on course and lesson content
function getAppropriateVideoUrl(course: Course, lesson: any): string {
  const educationalVideos = getEducationalVideos(course.title);
  const videoIndex = Math.floor(Math.random() * educationalVideos.length);
  return educationalVideos[videoIndex];
}

async function completeCourseContent(supabaseClient: any, courseLimit: number = 50) {
  console.log(`Starting completion process for up to ${courseLimit} courses...`);
  
  let processedCourses = 0;
  let createdModules = 0;
  let createdLessons = 0;
  let integratedVideos = 0;
  
  try {
    // Get courses that need completion
    const { data: courses, error: coursesError } = await supabaseClient
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .limit(courseLimit);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      throw new Error(`Failed to fetch courses: ${coursesError.message}`);
    }

    if (!courses || courses.length === 0) {
      console.log('No active courses found to process');
      return {
        success: true,
        message: 'No active courses found to process',
        stats: {
          courses_processed: 0,
          modules_created: 0,
          lessons_created: 0,
          videos_integrated: 0
        }
      };
    }

    console.log(`Found ${courses.length} courses to process`);

    for (const course of courses) {
      try {
        console.log(`Processing course: ${course.title}`);
        
        // Check if course already has modules
        const { data: existingModules } = await supabaseClient
          .from('course_modules')
          .select('id, course_lessons(id)')
          .eq('course_id', course.id);

        // Skip if course already has modules with lessons
        if (existingModules && existingModules.length > 0) {
          console.log(`Course ${course.title} already has modules, skipping...`);
          processedCourses++;
          continue;
        }

        // Create a basic module structure for each course
        const modules = [
          {
            title: 'Introduction & Fundamentals',
            description: `Core concepts and introduction to ${course.title}`,
            duration: 120,
            lessons: [
              { title: 'Course Overview', type: 'video', duration: 20, isFree: true },
              { title: 'Getting Started', type: 'text', duration: 30, isFree: true },
              { title: 'Fundamentals', type: 'video', duration: 45, isFree: false },
              { title: 'Practice Exercise', type: 'assignment', duration: 25, isFree: false }
            ]
          },
          {
            title: 'Intermediate Concepts',
            description: `Building on the fundamentals of ${course.title}`,
            duration: 150,
            lessons: [
              { title: 'Core Techniques', type: 'video', duration: 50, isFree: false },
              { title: 'Best Practices', type: 'text', duration: 40, isFree: false },
              { title: 'Hands-on Project', type: 'assignment', duration: 60, isFree: false }
            ]
          },
          {
            title: 'Advanced Applications',
            description: `Advanced topics and real-world applications`,
            duration: 180,
            lessons: [
              { title: 'Advanced Concepts', type: 'video', duration: 60, isFree: false },
              { title: 'Industry Applications', type: 'text', duration: 45, isFree: false },
              { title: 'Capstone Project', type: 'assignment', duration: 75, isFree: false }
            ]
          }
        ];

        // Create modules and lessons for this course
        for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
          const moduleData = modules[moduleIndex];
          
          // Create the module
          const { data: newModule, error: moduleError } = await supabaseClient
            .from('course_modules')
            .insert({
              course_id: course.id,
              title: moduleData.title,
              description: moduleData.description,
              module_order: moduleIndex + 1,
              duration_minutes: moduleData.duration
            })
            .select()
            .single();

          if (moduleError) {
            console.error('Error creating module:', moduleError);
            continue;
          }

          createdModules++;
          console.log(`Created module: ${moduleData.title}`);

          // Create lessons for this module
          for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
            const lessonData = moduleData.lessons[lessonIndex];
            
            let videoUrl = null;
            if (lessonData.type === 'video') {
              videoUrl = getAppropriateVideoUrl(course, lessonData);
              integratedVideos++;
            }

            const { error: lessonError } = await supabaseClient
              .from('course_lessons')
              .insert({
                module_id: newModule.id,
                title: lessonData.title,
                content: `Learn about ${lessonData.title.toLowerCase()} in the context of ${course.title}. This lesson covers essential concepts and practical applications.`,
                lesson_type: lessonData.type,
                video_url: videoUrl,
                duration_minutes: lessonData.duration,
                lesson_order: lessonIndex + 1,
                is_free: lessonData.isFree
              });

            if (lessonError) {
              console.error('Error creating lesson:', lessonError);
              continue;
            }

            createdLessons++;
            console.log(`Created lesson: ${lessonData.title}`);
          }
        }

        processedCourses++;
        console.log(`Completed processing course: ${course.title}`);

      } catch (courseError) {
        console.error(`Error processing course ${course.title}:`, courseError);
        continue; // Continue with next course
      }
    }

    const result = {
      success: true,
      message: `Successfully processed ${processedCourses} courses`,
      stats: {
        courses_processed: processedCourses,
        modules_created: createdModules,
        lessons_created: createdLessons,
        videos_integrated: integratedVideos
      }
    };

    console.log('Course completion process finished:', result);
    return result;

  } catch (error) {
    console.error('Error in completeCourseContent:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('Complete-course-content function called');

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { action, course_limit = 50 } = await req.json();
    console.log('Processing action:', action, 'with course limit:', course_limit);

    if (action === 'complete_existing_courses') {
      const result = await completeCourseContent(supabaseClient, course_limit);
      
      return new Response(
        JSON.stringify(result),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid action',
          message: 'Action must be "complete_existing_courses"'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }

  } catch (error) {
    console.error('Error in complete-course-content function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: 'Check edge function logs for more details'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
})
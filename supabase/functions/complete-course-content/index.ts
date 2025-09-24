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

// Educational YouTube videos for different course topics with better matching
const getEducationalVideos = (courseTitle: string, courseCategory?: string): string[] => {
  const title = courseTitle.toLowerCase();
  const category = courseCategory?.toLowerCase() || '';
  
  const videoLibrary = {
    'react': [
      'https://www.youtube.com/embed/Ke90Tje7VS0', // React Tutorial for Beginners
      'https://www.youtube.com/embed/SccSCuHhOw0', // JavaScript ES6+
      'https://www.youtube.com/embed/hdI2bqOjy3c', // TypeScript Tutorial
      'https://www.youtube.com/embed/w7ejDZ8SWv8'  // React Hooks Explained
    ],
    'python': [
      'https://www.youtube.com/embed/_uQrJ0TkZlc', // Python Tutorial for Beginners
      'https://www.youtube.com/embed/kqtD5dpn9C8', // Python for Data Science
      'https://www.youtube.com/embed/YYXdXT2l-Gg', // Python Machine Learning
      'https://www.youtube.com/embed/Z1Yd7upQsXY'  // Python Advanced Concepts
    ],
    'webdev': [
      'https://www.youtube.com/embed/pQN-pnXPaVg', // HTML, CSS, JS in 1 Hour
      'https://www.youtube.com/embed/TlB_eWDSMt4', // Node.js Tutorial
      'https://www.youtube.com/embed/fBNz5xF-Kx4', // Express Framework
      'https://www.youtube.com/embed/L72fhGm1tfE'  // Node.js Best Practices
    ],
    'design': [
      'https://www.youtube.com/embed/ByYP60zz3F4', // UI/UX Design Tutorial
      'https://www.youtube.com/embed/68w2VwalD5w', // Figma Tutorial
      'https://www.youtube.com/embed/YiLUYf4HDh4', // Design Systems
      'https://www.youtube.com/embed/KYmqVesPAnU'  // User Experience Design
    ],
    'business': [
      'https://www.youtube.com/embed/ua-CiDNNj30', // Data Science Course
      'https://www.youtube.com/embed/M4CXOocovZ4', // Data Visualization
      'https://www.youtube.com/embed/l_C9E2Gkmtk', // Business Analytics
      'https://www.youtube.com/embed/7S_tz1z_5bA'  // SQL for Business
    ],
    'marketing': [
      'https://www.youtube.com/embed/bFOKONpVDAQ', // Digital Marketing Course
      'https://www.youtube.com/embed/vnVuqfXohxc', // Content Writing Tutorial
      'https://www.youtube.com/embed/gvTNl8HhcWc', // Social Media Marketing
      'https://www.youtube.com/embed/hnUjzVoditc'  // SEO Tutorial
    ],
    'leadership': [
      'https://www.youtube.com/embed/llKvV8_T95M', // Leadership Training
      'https://www.youtube.com/embed/WEDIj9JBTC8', // Finance Basics
      'https://www.youtube.com/embed/gqOzc7r0L_g', // Management Skills
      'https://www.youtube.com/embed/VDiyQub6vpw'  // Communication Skills
    ],
    'tech': [
      'https://www.youtube.com/embed/JMUxmLyrhSk', // Machine Learning Explained
      'https://www.youtube.com/embed/SSo_EIwHSd4', // Blockchain Explained
      'https://www.youtube.com/embed/aircArVXyr44', // AI Fundamentals
      'https://www.youtube.com/embed/rfscVS0vtbw'  // Learn JavaScript in 1 Hour
    ]
  };
  
  // Enhanced matching logic
  if (title.includes('react') || title.includes('javascript') && title.includes('bootcamp')) {
    return videoLibrary.react;
  }
  if (title.includes('python') || title.includes('data science')) {
    return videoLibrary.python;
  }
  if (title.includes('web development') || title.includes('full stack') || title.includes('node')) {
    return videoLibrary.webdev;
  }
  if (title.includes('design') || title.includes('ui/ux') || title.includes('creative')) {
    return videoLibrary.design;
  }
  if (title.includes('marketing') || title.includes('digital marketing') || title.includes('content writing')) {
    return videoLibrary.marketing;
  }
  if (title.includes('leadership') || title.includes('management') || title.includes('project management')) {
    return videoLibrary.leadership;
  }
  if (title.includes('business') || title.includes('analytics') || title.includes('intelligence')) {
    return videoLibrary.business;
  }
  if (title.includes('machine learning') || title.includes('tensorflow') || title.includes('blockchain') || title.includes('cybersecurity') || title.includes('cloud')) {
    return videoLibrary.tech;
  }
  
  // Category-based fallback
  if (category.includes('technology')) return videoLibrary.tech;
  if (category.includes('business')) return videoLibrary.business;
  if (category.includes('design')) return videoLibrary.design;
  if (category.includes('marketing')) return videoLibrary.marketing;
  
  return videoLibrary.tech; // Default fallback to tech videos
};

// Helper function to get appropriate video URL based on course and lesson content
function getAppropriateVideoUrl(course: Course, lesson: any, lessonIndex: number): string {
  const educationalVideos = getEducationalVideos(course.title, course.category);
  // Use lesson index to get consistent video assignment instead of random
  const videoIndex = lessonIndex % educationalVideos.length;
  const selectedVideo = educationalVideos[videoIndex];
  
  console.log(`Assigning video for course "${course.title}", lesson "${lesson.title}": ${selectedVideo}`);
  return selectedVideo;
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
              videoUrl = getAppropriateVideoUrl(course, lessonData, lessonIndex);
              integratedVideos++;
              console.log(`Video integrated for lesson "${lessonData.title}": ${videoUrl}`);
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
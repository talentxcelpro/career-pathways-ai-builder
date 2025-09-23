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
  instructor: string;
  level: string;
  duration: string;
  category: string;
  subcategory: string;
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
          .select('id')
          .eq('course_id', course.id);

        if (existingModules && existingModules.length > 0) {
          console.log(`Course ${course.title} already has modules, skipping`);
          continue;
        }

        // Generate course structure
        const modules = [
          {
            title: `Introduction to ${course.title}`,
            description: `Get started with the fundamentals of ${course.title}. Learn core concepts and terminology.`
          },
          {
            title: `Core Concepts and Principles`,
            description: `Deep dive into the essential principles that form the foundation of ${course.title}.`
          },
          {
            title: `Practical Applications`,
            description: `Apply your knowledge through hands-on exercises and real-world scenarios.`
          },
          {
            title: `Advanced Techniques`,
            description: `Master advanced strategies and techniques for ${course.title}.`
          }
        ];
        
        for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
          const module = modules[moduleIndex];
          
          // Create module
          const { data: newModule, error: moduleError } = await supabaseClient
            .from('course_modules')
            .insert({
              course_id: course.id,
              title: module.title,
              description: module.description,
              order_number: moduleIndex + 1,
              duration_hours: 2,
              is_published: true
            })
            .select()
            .single();

          if (moduleError) {
            console.error(`Error creating module for course ${course.title}:`, moduleError);
            continue;
          }

          createdModules++;
          console.log(`Created module: ${module.title}`);

          // Create lessons for this module
          const lessons = [
            { title: `${module.title} - Overview`, type: 'text' },
            { title: `${module.title} - Video Tutorial`, type: 'video' },
            { title: `${module.title} - Practice Exercise`, type: 'assignment' },
            { title: `${module.title} - Quiz`, type: 'quiz' }
          ];
          
          for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
            const lesson = lessons[lessonIndex];
            
            // Create lesson
            const { data: newLesson, error: lessonError } = await supabaseClient
              .from('course_lessons')
              .insert({
                module_id: newModule.id,
                title: lesson.title,
                content: `# ${lesson.title}\n\nThis lesson covers important concepts in ${module.title}.\n\n## Learning Objectives\n- Understand key principles\n- Apply practical skills\n- Master core concepts\n\n## Content\nDetailed lesson content goes here.`,
                order_number: lessonIndex + 1,
                lesson_type: lesson.type,
                duration_minutes: 15,
                is_published: true
              })
              .select()
              .single();

            if (lessonError) {
              console.error(`Error creating lesson for module ${module.title}:`, lessonError);
              continue;
            }

            createdLessons++;
            console.log(`Created lesson: ${lesson.title}`);

            // Add video for video lessons
            if (lesson.type === 'video') {
              const { error: videoError } = await supabaseClient
                .from('course_videos')
                .insert({
                  lesson_id: newLesson.id,
                  title: `${lesson.title} - Video`,
                  video_url: `https://example.com/videos/${course.id}-${newModule.id}-${newLesson.id}`,
                  duration: 900, // 15 minutes
                  video_type: 'mp4',
                  is_public: true
                });

              if (!videoError) {
                integratedVideos++;
                console.log(`Integrated video for lesson: ${lesson.title}`);
              }
            }
          }
        }

        processedCourses++;
        console.log(`Completed course: ${course.title}`);
        
      } catch (courseError) {
        console.error(`Error processing course ${course.title}:`, courseError);
        continue;
      }
    }

    const result = {
      success: true,
      message: `Successfully completed ${processedCourses} courses`,
      stats: {
        courses_processed: processedCourses,
        modules_created: createdModules,
        lessons_created: createdLessons,
        videos_integrated: integratedVideos
      }
    };

    console.log('Course completion summary:', result);
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
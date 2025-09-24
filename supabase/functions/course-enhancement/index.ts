import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Validate environment variables
    if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
      throw new Error('Missing required environment variables');
    }

    const { 
      action, 
      courseId, 
      include_youtube_videos = false,
      include_exercises = false,
      include_projects = false 
    } = await req.json();

    if (action === 'enhance_existing_course') {
      let enhanced = 0;

      if (include_youtube_videos) {
        // Get lessons without video URLs
        const { data: lessons, error } = await supabaseClient
          .from('course_lessons')
          .select('id, title, lesson_type')
          .is('video_url', null)
          .eq('lesson_type', 'video');

        if (!error && lessons) {
          for (const lesson of lessons) {
            const { error: updateError } = await supabaseClient
              .from('course_lessons')
              .update({
                video_url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`, // Placeholder
                updated_at: new Date().toISOString()
              })
              .eq('id', lesson.id);

            if (!updateError) enhanced++;
          }
        }
      }

      if (include_exercises) {
        // Add interactive exercises to courses
        const { data: modules, error } = await supabaseClient
          .from('course_modules')
          .select('id, title, course_id');

        if (!error && modules) {
          for (const module of modules.slice(0, 10)) { // Limit to first 10 modules
            await supabaseClient
              .from('course_lessons')
              .insert([{
                module_id: module.id,
                title: `Interactive Exercise: ${module.title}`,
                content: 'Practice what you\'ve learned with hands-on exercises and coding challenges.',
                lesson_type: 'exercise',
                duration_minutes: 45,
                lesson_order: 999, // Put at end
                is_free: false,
              }]);
            enhanced++;
          }
        }
      }

      if (include_projects) {
        // Add capstone projects
        const { data: courses, error } = await supabaseClient
          .from('courses')
          .select('id, title')
          .limit(5);

        if (!error && courses) {
          for (const course of courses) {
            // Get last module for this course
            const { data: lastModule } = await supabaseClient
              .from('course_modules')
              .select('id')
              .eq('course_id', course.id)
              .order('module_order', { ascending: false })
              .limit(1)
              .single();

            if (lastModule) {
              await supabaseClient
                .from('course_lessons')
                .insert([{
                  module_id: lastModule.id,
                  title: `Capstone Project: ${course.title}`,
                  content: 'Apply everything you\'ve learned in this comprehensive capstone project.',
                  lesson_type: 'project',
                  duration_minutes: 180,
                  lesson_order: 1000, // Put at very end
                  is_free: false,
                }]);
              enhanced++;
            }
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          items_enhanced: enhanced,
          enhancements_applied: {
            youtube_videos: include_youtube_videos,
            exercises: include_exercises,
            projects: include_projects
          },
          message: `Successfully enhanced ${enhanced} course items`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (action === 'create_interactive_exercises') {
      // Create interactive coding exercises
      const { data: modules, error } = await supabaseClient
        .from('course_modules')
        .select('id, title, course_id')
        .limit(20);

      if (error) throw error;

      let created = 0;
      for (const module of modules || []) {
        const { error: insertError } = await supabaseClient
          .from('course_lessons')
          .insert([{
            module_id: module.id,
            title: `Coding Challenge: ${module.title}`,
            content: 'Test your skills with interactive coding challenges and real-world scenarios.',
            lesson_type: 'exercise',
            duration_minutes: 60,
            lesson_order: 500,
            is_free: false,
          }]);

        if (!insertError) created++;
      }

      return new Response(
        JSON.stringify({
          success: true,
          exercises_created: created,
          message: `Created ${created} interactive exercises`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // NEW ACTION: Generate comprehensive course
    if (action === 'generate_comprehensive_course') {
      const { topic, difficulty_level = 'intermediate', duration_hours = 40 } = await req.json();
      
      console.log(`🎯 Generating comprehensive course for: ${topic}`);
      
      // Create a comprehensive course with modules and lessons
      const courseData = {
        title: `Complete ${topic} Mastery`,
        description: `Comprehensive ${topic} course covering fundamentals to advanced concepts`,
        category: 'Technology',
        difficulty_level,
        duration_hours,
        instructor_name: 'Expert Instructor',
        rating: 4.8,
        price: 599,
        is_free: false,
        skills_taught: [topic, 'Best Practices', 'Real-world Applications'],
        learning_outcomes: [`Master ${topic}`, 'Build projects', 'Industry expertise'],
        is_active: true
      };

      const { data: course, error: courseError } = await supabaseClient
        .from('courses')
        .insert([courseData])
        .select()
        .single();

      if (courseError) throw courseError;

      // Create modules for the course
      const modules = [
        { title: 'Fundamentals', order: 1 },
        { title: 'Intermediate Concepts', order: 2 },
        { title: 'Advanced Techniques', order: 3 },
        { title: 'Real-world Projects', order: 4 }
      ];

      let modulesCreated = 0;
      for (const moduleData of modules) {
        const { data: module, error: moduleError } = await supabaseClient
          .from('course_modules')
          .insert([{
            course_id: course.id,
            title: moduleData.title,
            module_order: moduleData.order,
            is_published: true
          }])
          .select()
          .single();

        if (!moduleError) {
          modulesCreated++;
          
          // Add lessons to each module
          for (let i = 1; i <= 3; i++) {
            await supabaseClient
              .from('course_lessons')
              .insert([{
                module_id: module.id,
                title: `${moduleData.title} - Lesson ${i}`,
                content: `Detailed content for ${moduleData.title} lesson ${i}`,
                lesson_type: 'video',
                duration_minutes: 30,
                lesson_order: i,
                is_free: i === 1,
              }]);
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          course_created: true,
          modules_created: modulesCreated,
          course_id: course.id,
          message: `Generated comprehensive ${topic} course with ${modulesCreated} modules`
        }),
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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
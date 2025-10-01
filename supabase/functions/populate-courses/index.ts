import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Function invoked successfully');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const body = await req.json().catch(() => ({ batchSize: 5, skipExisting: true }));
    const { batchSize = 5, skipExisting = true } = body;
    
    console.log(`📊 Processing with batchSize: ${batchSize}, skipExisting: ${skipExisting}`);

    // Get courses without modules
    let coursesQuery = supabaseClient
      .from('courses')
      .select('id, title, category, difficulty_level')
      .order('title')
      .limit(batchSize);

    if (skipExisting) {
      const { data: modulesData } = await supabaseClient
        .from('course_modules')
        .select('course_id');
      
      const courseIdsWithModules = [...new Set(modulesData?.map(m => m.course_id) || [])];
      
      if (courseIdsWithModules.length > 0) {
        coursesQuery = coursesQuery.not('id', 'in', `(${courseIdsWithModules.join(',')})`);
      }
    }

    const { data: courses, error: coursesError } = await coursesQuery;

    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError);
      throw coursesError;
    }

    if (!courses || courses.length === 0) {
      console.log('✅ All courses already populated');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'All courses already populated',
          coursesPopulated: 0,
          modulesCreated: 0,
          lessonsCreated: 0,
          assessmentsCreated: 0,
          remaining: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📚 Processing ${courses.length} courses`);

    let totalModules = 0;
    let totalLessons = 0;
    let totalAssessments = 0;
    const errors: any[] = [];

    // Process each course
    for (const course of courses) {
      console.log(`📖 Processing: ${course.title}`);
      
      try {
        const modules = getCourseModules(course.title, course.difficulty_level);
        
        for (let i = 0; i < modules.length; i++) {
          const moduleInfo = modules[i];
          
          const { data: module, error: moduleError } = await supabaseClient
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

          if (moduleError) {
            console.error(`❌ Module error for ${course.title}:`, moduleError);
            errors.push({ course: course.title, error: moduleError.message });
            continue;
          }

          totalModules++;

          // Insert lessons
          if (module && moduleInfo.lessons) {
            for (const lessonInfo of moduleInfo.lessons) {
              const { error: lessonError } = await supabaseClient
                .from('course_lessons')
                .insert({
                  module_id: module.id,
                  title: lessonInfo.title,
                  content: lessonInfo.content,
                  lesson_type: lessonInfo.type,
                  video_url: null,
                  duration_minutes: lessonInfo.duration,
                  lesson_order: lessonInfo.order,
                  is_free: lessonInfo.isFree
                });

              if (!lessonError) {
                totalLessons++;
              } else {
                errors.push({ course: course.title, lesson: lessonInfo.title, error: lessonError.message });
              }
            }
          }
        }

        // Create assessment
        const { error: assessmentError } = await supabaseClient
          .from('course_assessments')
          .insert({
            course_id: course.id,
            title: `${course.title} - Final Assessment`,
            description: `Comprehensive assessment covering all modules`,
            questions: getCourseAssessment(course.title),
            passing_score: 75,
            time_limit_minutes: 90,
            max_attempts: 3
          });
        
        if (!assessmentError) {
          totalAssessments++;
        } else {
          errors.push({ course: course.title, type: 'assessment', error: assessmentError.message });
        }
      } catch (error) {
        console.error(`❌ Error processing ${course.title}:`, error);
        errors.push({ course: course.title, error: String(error) });
      }
    }

    // Get remaining count
    const { count: remainingCount } = await supabaseClient
      .from('courses')
      .select('*', { count: 'exact', head: true });

    const processedIds = courses.map(c => c.id);
    const remaining = (remainingCount || 0) - processedIds.length;

    console.log(`✅ Completed: ${totalModules} modules, ${totalLessons} lessons, ${totalAssessments} assessments`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${courses.length} courses`,
        coursesPopulated: courses.length,
        modulesCreated: totalModules,
        lessonsCreated: totalLessons,
        assessmentsCreated: totalAssessments,
        remaining: Math.max(0, remaining),
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getCourseModules(courseTitle: string, level: string) {
  return [
    {
      title: 'Introduction & Fundamentals',
      description: `Welcome to ${courseTitle}! Learn the foundations.`,
      order: 1,
      duration: 240,
      lessons: [
        { title: 'Course Overview', content: `Welcome to ${courseTitle} (${level})`, type: 'text', duration: 20, order: 1, isFree: true },
        { title: 'Setup Guide', content: 'Complete setup instructions', type: 'text', duration: 30, order: 2, isFree: true },
        { title: 'Key Concepts', content: 'Fundamental concepts explained', type: 'text', duration: 45, order: 3, isFree: false },
        { title: 'Best Practices', content: 'Industry best practices', type: 'text', duration: 30, order: 4, isFree: false },
        { title: 'Quiz', content: 'Test your knowledge', type: 'quiz', duration: 15, order: 5, isFree: false }
      ]
    },
    {
      title: 'Core Skills',
      description: 'Build essential professional skills',
      order: 2,
      duration: 300,
      lessons: [
        { title: 'Techniques Part 1', content: 'Core techniques', type: 'text', duration: 50, order: 1, isFree: false },
        { title: 'Techniques Part 2', content: 'Advanced techniques', type: 'text', duration: 50, order: 2, isFree: false },
        { title: 'Practice Session', content: 'Hands-on exercises', type: 'text', duration: 60, order: 3, isFree: false },
        { title: 'Common Mistakes', content: 'Learn from errors', type: 'text', duration: 40, order: 4, isFree: false },
        { title: 'Project', content: 'Apply your skills', type: 'quiz', duration: 100, order: 5, isFree: false }
      ]
    },
    {
      title: 'Advanced Concepts',
      description: 'Master advanced methodologies',
      order: 3,
      duration: 320,
      lessons: [
        { title: 'Advanced Introduction', content: 'Professional approaches', type: 'text', duration: 45, order: 1, isFree: false },
        { title: 'Technique 1', content: 'Expert techniques', type: 'text', duration: 60, order: 2, isFree: false },
        { title: 'Technique 2', content: 'Complex problem solving', type: 'text', duration: 60, order: 3, isFree: false },
        { title: 'Optimization', content: 'Workflow optimization', type: 'text', duration: 55, order: 4, isFree: false },
        { title: 'Case Studies', content: 'Real-world examples', type: 'text', duration: 60, order: 5, isFree: false },
        { title: 'Advanced Project', content: 'Comprehensive project', type: 'quiz', duration: 40, order: 6, isFree: false }
      ]
    },
    {
      title: 'Professional Tools',
      description: 'Master industry-standard tools',
      order: 4,
      duration: 280,
      lessons: [
        { title: 'Tool Overview', content: 'Professional tools survey', type: 'text', duration: 40, order: 1, isFree: false },
        { title: 'Primary Tool', content: 'Essential tool training', type: 'text', duration: 70, order: 2, isFree: false },
        { title: 'Tool Integration', content: 'Complementary tools', type: 'text', duration: 60, order: 3, isFree: false },
        { title: 'Automation', content: 'Process automation', type: 'text', duration: 50, order: 4, isFree: false },
        { title: 'Tool Project', content: 'Tools in action', type: 'quiz', duration: 60, order: 5, isFree: false }
      ]
    },
    {
      title: 'Real-World Projects',
      description: 'Industry-style projects',
      order: 5,
      duration: 360,
      lessons: [
        { title: 'Project Planning', content: 'Professional planning', type: 'text', duration: 50, order: 1, isFree: false },
        { title: 'Implementation Phase 1', content: 'Build your project', type: 'text', duration: 80, order: 2, isFree: false },
        { title: 'Implementation Phase 2', content: 'Advanced features', type: 'text', duration: 80, order: 3, isFree: false },
        { title: 'Testing & QA', content: 'Quality assurance', type: 'text', duration: 50, order: 4, isFree: false },
        { title: 'Optimization', content: 'Polish your work', type: 'text', duration: 60, order: 5, isFree: false },
        { title: 'Project Review', content: 'Final feedback', type: 'quiz', duration: 40, order: 6, isFree: false }
      ]
    },
    {
      title: 'Best Practices',
      description: 'Professional standards',
      order: 6,
      duration: 260,
      lessons: [
        { title: 'Standards Overview', content: 'Industry standards', type: 'text', duration: 40, order: 1, isFree: false },
        { title: 'Ethics', content: 'Professional conduct', type: 'text', duration: 45, order: 2, isFree: false },
        { title: 'Documentation', content: 'Best practices', type: 'text', duration: 50, order: 3, isFree: false },
        { title: 'Teamwork', content: 'Collaboration skills', type: 'text', duration: 45, order: 4, isFree: false },
        { title: 'Growth', content: 'Continuous learning', type: 'text', duration: 40, order: 5, isFree: false },
        { title: 'Assessment', content: 'Standards quiz', type: 'quiz', duration: 40, order: 6, isFree: false }
      ]
    },
    {
      title: 'Capstone Project',
      description: 'Portfolio-worthy project',
      order: 7,
      duration: 480,
      lessons: [
        { title: 'Project Brief', content: 'Requirements overview', type: 'text', duration: 30, order: 1, isFree: false },
        { title: 'Research Phase', content: 'Planning your project', type: 'text', duration: 60, order: 2, isFree: false },
        { title: 'Design', content: 'Architecture design', type: 'text', duration: 70, order: 3, isFree: false },
        { title: 'Core Build', content: 'Main functionality', type: 'text', duration: 120, order: 4, isFree: false },
        { title: 'Polish', content: 'Advanced features', type: 'text', duration: 100, order: 5, isFree: false },
        { title: 'Deployment', content: 'Launch your project', type: 'text', duration: 60, order: 6, isFree: false },
        { title: 'Presentation', content: 'Portfolio showcase', type: 'quiz', duration: 40, order: 7, isFree: false }
      ]
    }
  ];
}

function getCourseAssessment(courseTitle: string) {
  return [
    {
      id: '1',
      question: `Which concept is fundamental to ${courseTitle}?`,
      type: 'single',
      options: ['Core Principle A', 'Core Principle B', 'Core Principle C', 'Core Principle D'],
      correct_answers: [0],
      points: 10
    },
    {
      id: '2',
      question: 'What are the key benefits of applying best practices?',
      type: 'multiple',
      options: ['Improved quality', 'Better efficiency', 'Enhanced collaboration', 'Reduced errors'],
      correct_answers: [0, 1, 2, 3],
      points: 15
    },
    {
      id: '3',
      question: 'In professional settings, which approach is most effective?',
      type: 'single',
      options: ['Quick solutions', 'Systematic approach', 'Trial and error', 'Copying others'],
      correct_answers: [1],
      points: 10
    },
    {
      id: '4',
      question: 'Which tools are essential for this field?',
      type: 'multiple',
      options: ['Primary Tool', 'Supporting Tool A', 'Supporting Tool B', 'Optional Tool'],
      correct_answers: [0, 1, 2],
      points: 15
    },
    {
      id: '5',
      question: 'What is the correct order of project phases?',
      type: 'single',
      options: ['Planning → Implementation → Testing → Deployment', 'Implementation → Planning → Testing → Deployment', 'Testing → Planning → Implementation → Deployment', 'Deployment → Planning → Implementation → Testing'],
      correct_answers: [0],
      points: 10
    }
  ];
}

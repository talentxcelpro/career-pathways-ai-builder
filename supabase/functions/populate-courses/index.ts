import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batchSize = 5, skipExisting = true } = await req.json().catch(() => ({}));
    
    console.log(`Starting course population with batch size: ${batchSize}, skipExisting: ${skipExisting}`);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get courses that need population
    let coursesQuery = supabaseClient
      .from('courses')
      .select('id, title, category, difficulty_level')
      .order('title');

    if (skipExisting) {
      // Only get courses without modules
      const { data: coursesWithModules } = await supabaseClient
        .from('course_modules')
        .select('course_id');
      
      const courseIdsWithModules = coursesWithModules?.map(m => m.course_id) || [];
      
      if (courseIdsWithModules.length > 0) {
        coursesQuery = coursesQuery.not('id', 'in', `(${courseIdsWithModules.join(',')})`);
      }
    }

    const { data: courses, error: coursesError } = await coursesQuery.limit(batchSize);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      throw coursesError;
    }
    
    if (!courses || courses.length === 0) {
      console.log('No courses found to populate');
      return new Response(JSON.stringify({ 
        success: true,
        message: 'All courses already populated',
        coursesPopulated: 0,
        modulesCreated: 0,
        lessonsCreated: 0,
        assessmentsCreated: 0,
        remaining: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing ${courses.length} courses`);
    let totalModules = 0;
    let totalLessons = 0;
    let totalAssessments = 0;
    const errors: any[] = [];

    // Process each course
    for (const course of courses) {
      try {
        console.log(`Processing course: ${course.title}`);
        const modules = getCourseModules(course.title, course.category, course.difficulty_level);
        
        for (const moduleInfo of modules) {
          try {
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
              console.error('Module error:', moduleError);
              errors.push({ course: course.title, module: moduleInfo.title, error: moduleError.message });
              continue;
            }

            totalModules++;

            if (module && moduleInfo.lessons) {
              for (const lessonInfo of moduleInfo.lessons) {
                try {
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
                    console.error('Lesson error:', lessonError);
                    errors.push({ course: course.title, lesson: lessonInfo.title, error: lessonError.message });
                  }
                } catch (lessonException) {
                  console.error('Lesson exception:', lessonException);
                  errors.push({ course: course.title, lesson: lessonInfo.title, error: String(lessonException) });
                }
              }
            }
          } catch (moduleException) {
            console.error('Module exception:', moduleException);
            errors.push({ course: course.title, module: moduleInfo.title, error: String(moduleException) });
          }
        }

        // Create assessment for each course
        try {
          const { error: assessmentError } = await supabaseClient
            .from('course_assessments')
            .insert({
              course_id: course.id,
              title: `${course.title} - Final Assessment`,
              description: `Comprehensive assessment covering all modules of ${course.title}`,
              questions: getCourseAssessment(course.title),
              passing_score: 75,
              time_limit_minutes: 90,
              max_attempts: 3
            });
          
          if (!assessmentError) {
            totalAssessments++;
          } else {
            console.error('Assessment error:', assessmentError);
            errors.push({ course: course.title, type: 'assessment', error: assessmentError.message });
          }
        } catch (assessmentException) {
          console.error('Assessment exception:', assessmentException);
          errors.push({ course: course.title, type: 'assessment', error: String(assessmentException) });
        }
      } catch (courseException) {
        console.error('Course exception:', courseException);
        errors.push({ course: course.title, error: String(courseException) });
      }
    }

    // Get remaining courses count
    const { count: remainingCount } = await supabaseClient
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .not('id', 'in', `(${courses.map(c => c.id).join(',')})`);

    console.log(`Completed! Modules: ${totalModules}, Lessons: ${totalLessons}, Assessments: ${totalAssessments}`);
    if (errors.length > 0) {
      console.error('Errors encountered:', errors);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Populated ${courses.length} courses with ${totalModules} modules, ${totalLessons} lessons, and ${totalAssessments} assessments`,
        coursesPopulated: courses.length,
        modulesCreated: totalModules,
        lessonsCreated: totalLessons,
        assessmentsCreated: totalAssessments,
        remaining: remainingCount || 0,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getCourseModules(courseTitle: string, category: string, level: string) {
  const baseModules = [
    {
      title: 'Course Introduction & Fundamentals',
      description: 'Welcome to the course! Learn the foundations and what you\'ll accomplish.',
      order: 1,
      duration: 240,
      lessons: [
        { title: 'Welcome & Course Overview', content: `Welcome to ${courseTitle}! This comprehensive course will take you from ${level} level to mastery. You'll learn industry-standard practices and complete real-world projects.`, type: 'text', video_url: null, duration: 20, order: 1, isFree: true },
        { title: 'Setting Up Your Environment', content: 'Complete setup guide for all tools, software, and resources you\'ll need throughout this course.', type: 'text', video_url: null, duration: 30, order: 2, isFree: true },
        { title: 'Understanding Key Concepts', content: 'Deep dive into the fundamental concepts that form the foundation of this subject.', type: 'text', video_url: null, duration: 45, order: 3, isFree: false },
        { title: 'Industry Best Practices', content: 'Learn the standards and best practices used by professionals in the field.', type: 'text', video_url: null, duration: 30, order: 4, isFree: false },
        { title: 'Module Assessment', content: 'Test your understanding of the fundamental concepts.', type: 'quiz', video_url: null, duration: 15, order: 5, isFree: false }
      ]
    },
    {
      title: 'Core Skills Development',
      description: 'Build essential skills and techniques used daily by professionals.',
      order: 2,
      duration: 300,
      lessons: [
        { title: 'Essential Techniques - Part 1', content: 'Master the first set of core techniques and workflows.', type: 'text', video_url: null, duration: 50, order: 1, isFree: false },
        { title: 'Essential Techniques - Part 2', content: 'Continue building your core skill set with advanced techniques.', type: 'text', video_url: null, duration: 50, order: 2, isFree: false },
        { title: 'Hands-On Practice Session', content: 'Apply what you\'ve learned through guided practice exercises.', type: 'text', video_url: null, duration: 60, order: 3, isFree: false },
        { title: 'Common Mistakes & Solutions', content: 'Learn from common errors and how to avoid them.', type: 'text', video_url: null, duration: 40, order: 4, isFree: false },
        { title: 'Skill Development Project', content: 'Complete your first project applying core skills.', type: 'quiz', video_url: null, duration: 100, order: 5, isFree: false }
      ]
    },
    {
      title: 'Advanced Concepts & Techniques',
      description: 'Take your skills to the next level with advanced methodologies.',
      order: 3,
      duration: 320,
      lessons: [
        { title: 'Advanced Methodology Introduction', content: 'Introduction to professional-level approaches and frameworks.', type: 'text', video_url: null, duration: 45, order: 1, isFree: false },
        { title: 'Deep Dive - Advanced Technique 1', content: 'Master advanced techniques used by industry experts.', type: 'text', video_url: null, duration: 60, order: 2, isFree: false },
        { title: 'Deep Dive - Advanced Technique 2', content: 'Continue exploring sophisticated approaches to complex problems.', type: 'text', video_url: null, duration: 60, order: 3, isFree: false },
        { title: 'Integration & Optimization', content: 'Learn how to integrate techniques and optimize your workflow.', type: 'text', video_url: null, duration: 55, order: 4, isFree: false },
        { title: 'Case Studies & Real-World Applications', content: 'Analyze real-world case studies and learn from industry examples.', type: 'text', video_url: null, duration: 60, order: 5, isFree: false },
        { title: 'Advanced Project Assignment', content: 'Apply advanced concepts in a comprehensive project.', type: 'quiz', video_url: null, duration: 40, order: 6, isFree: false }
      ]
    },
    {
      title: 'Professional Tools & Frameworks',
      description: 'Master industry-standard tools and frameworks used by professionals.',
      order: 4,
      duration: 280,
      lessons: [
        { title: 'Tool Overview & Selection', content: 'Survey of professional tools and when to use each one.', type: 'text', video_url: null, duration: 40, order: 1, isFree: false },
        { title: 'Primary Tool Deep Dive', content: 'Comprehensive training on the most essential tool in the field.', type: 'text', video_url: null, duration: 70, order: 2, isFree: false },
        { title: 'Supporting Tools & Integration', content: 'Learn complementary tools and how they work together.', type: 'text', video_url: null, duration: 60, order: 3, isFree: false },
        { title: 'Workflow Automation', content: 'Streamline your processes with automation techniques.', type: 'text', video_url: null, duration: 50, order: 4, isFree: false },
        { title: 'Tool Mastery Project', content: 'Build a project using professional tools and frameworks.', type: 'quiz', video_url: null, duration: 60, order: 5, isFree: false }
      ]
    },
    {
      title: 'Real-World Applications & Projects',
      description: 'Apply everything you\'ve learned to realistic, industry-style projects.',
      order: 5,
      duration: 360,
      lessons: [
        { title: 'Project Planning & Requirements', content: 'Learn how to scope and plan professional projects.', type: 'text', video_url: null, duration: 50, order: 1, isFree: false },
        { title: 'Implementation Phase 1', content: 'Begin building your comprehensive project.', type: 'text', video_url: null, duration: 80, order: 2, isFree: false },
        { title: 'Implementation Phase 2', content: 'Continue development with advanced features.', type: 'text', video_url: null, duration: 80, order: 3, isFree: false },
        { title: 'Testing & Quality Assurance', content: 'Ensure your project meets professional standards.', type: 'text', video_url: null, duration: 50, order: 4, isFree: false },
        { title: 'Refinement & Optimization', content: 'Polish and optimize your project for production.', type: 'text', video_url: null, duration: 60, order: 5, isFree: false },
        { title: 'Project Completion & Review', content: 'Final review and feedback on your project.', type: 'quiz', video_url: null, duration: 40, order: 6, isFree: false }
      ]
    },
    {
      title: 'Industry Best Practices & Standards',
      description: 'Learn professional standards, ethics, and industry conventions.',
      order: 6,
      duration: 260,
      lessons: [
        { title: 'Professional Standards Overview', content: 'Understanding industry standards and why they matter.', type: 'text', video_url: null, duration: 40, order: 1, isFree: false },
        { title: 'Code of Ethics & Professionalism', content: 'Professional conduct and ethical considerations in the field.', type: 'text', video_url: null, duration: 45, order: 2, isFree: false },
        { title: 'Documentation & Communication', content: 'Professional documentation and communication best practices.', type: 'text', video_url: null, duration: 50, order: 3, isFree: false },
        { title: 'Collaboration & Teamwork', content: 'Working effectively in professional team environments.', type: 'text', video_url: null, duration: 45, order: 4, isFree: false },
        { title: 'Continuous Learning & Growth', content: 'Staying current in a rapidly evolving field.', type: 'text', video_url: null, duration: 40, order: 5, isFree: false },
        { title: 'Professional Practice Assessment', content: 'Evaluate your understanding of professional standards.', type: 'quiz', video_url: null, duration: 40, order: 6, isFree: false }
      ]
    },
    {
      title: 'Capstone Project',
      description: 'Demonstrate mastery through a comprehensive, portfolio-worthy project.',
      order: 7,
      duration: 480,
      lessons: [
        { title: 'Capstone Project Brief', content: 'Understanding the capstone project requirements and expectations.', type: 'text', video_url: null, duration: 30, order: 1, isFree: false },
        { title: 'Research & Planning Phase', content: 'Conduct research and create a detailed project plan.', type: 'text', video_url: null, duration: 60, order: 2, isFree: false },
        { title: 'Design & Architecture', content: 'Design your project architecture and create wireframes/mockups.', type: 'text', video_url: null, duration: 70, order: 3, isFree: false },
        { title: 'Core Implementation', content: 'Build the core functionality of your capstone project.', type: 'text', video_url: null, duration: 120, order: 4, isFree: false },
        { title: 'Advanced Features & Polish', content: 'Add advanced features and professional polish.', type: 'text', video_url: null, duration: 100, order: 5, isFree: false },
        { title: 'Testing & Deployment', content: 'Test thoroughly and deploy your project.', type: 'text', video_url: null, duration: 60, order: 6, isFree: false },
        { title: 'Project Presentation & Portfolio', content: 'Present your project and add it to your portfolio.', type: 'quiz', video_url: null, duration: 40, order: 7, isFree: false }
      ]
    }
  ];

  return baseModules;
}

function getCourseAssessment(courseTitle: string) {
  return [
    {
      id: '1',
      question: 'Which concept is fundamental to understanding ' + courseTitle + '?',
      type: 'single',
      options: ['Core Principle A', 'Core Principle B', 'Core Principle C', 'Core Principle D'],
      correct_answers: [0],
      points: 10
    },
    {
      id: '2',
      question: 'What are the key benefits of applying best practices? (Select all that apply)',
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
      question: 'Which tools are essential for this field? (Multiple answers)',
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
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
    console.log('Starting course population...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all courses
    console.log('Fetching courses...');
    const { data: courses, error: coursesError } = await supabaseClient
      .from('courses')
      .select('id, title, category, difficulty_level')
      .order('title');

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      throw coursesError;
    }
    
    if (!courses || courses.length === 0) {
      console.log('No courses found');
      return new Response(JSON.stringify({ error: 'No courses found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${courses.length} courses to populate`);
    let totalModules = 0;
    let totalLessons = 0;
    let totalAssessments = 0;

    // Populate each course with modules and lessons
    for (const course of courses) {
      console.log(`Processing course: ${course.title}`);
      const modules = getCourseModules(course.title, course.category, course.difficulty_level);
      
      for (const moduleInfo of modules) {
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
          continue;
        }

        totalModules++;

        if (module && moduleInfo.lessons) {
          for (const lessonInfo of moduleInfo.lessons) {
            const { error: lessonError } = await supabaseClient
              .from('course_lessons')
              .insert({
                module_id: module.id,
                title: lessonInfo.title,
                content: lessonInfo.content,
                lesson_type: lessonInfo.type,
                video_url: lessonInfo.video_url,
                duration_minutes: lessonInfo.duration,
                lesson_order: lessonInfo.order,
                is_free: lessonInfo.isFree
              });

            if (!lessonError) {
              totalLessons++;
            } else {
              console.error('Lesson error:', lessonError);
            }
          }
        }
      }

      // Create ONE assessment per course (outside the module loop)
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
      }
    }

    console.log(`Completed! Modules: ${totalModules}, Lessons: ${totalLessons}, Assessments: ${totalAssessments}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Populated ${courses.length} courses with ${totalModules} modules, ${totalLessons} lessons, and ${totalAssessments} assessments`,
        coursesPopulated: courses.length,
        modulesCreated: totalModules,
        lessonsCreated: totalLessons,
        assessmentsCreated: totalAssessments
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getCourseModules(courseTitle: string, category: string, level: string) {
  // Return 7-9 comprehensive modules based on course
  const baseModules = [
    {
      title: 'Course Introduction & Fundamentals',
      description: 'Welcome to the course! Learn the foundations and what you\'ll accomplish.',
      order: 1,
      duration: 240,
      lessons: [
        { title: 'Welcome & Course Overview', content: `Welcome to ${courseTitle}! This comprehensive course will take you from ${level} level to mastery. You'll learn industry-standard practices and complete real-world projects.`, type: 'video', video_url: 'https://example.com/intro', duration: 20, order: 1, isFree: true },
        { title: 'Setting Up Your Environment', content: 'Complete setup guide for all tools, software, and resources you\'ll need throughout this course.', type: 'video', video_url: 'https://example.com/setup', duration: 30, order: 2, isFree: true },
        { title: 'Understanding Key Concepts', content: 'Deep dive into the fundamental concepts that form the foundation of this subject.', type: 'video', video_url: 'https://example.com/concepts', duration: 45, order: 3, isFree: false },
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
        { title: 'Essential Techniques - Part 1', content: 'Master the first set of core techniques and workflows.', type: 'video', video_url: 'https://example.com/tech1', duration: 50, order: 1, isFree: false },
        { title: 'Essential Techniques - Part 2', content: 'Continue building your core skill set with advanced techniques.', type: 'video', video_url: 'https://example.com/tech2', duration: 50, order: 2, isFree: false },
        { title: 'Hands-On Practice Session', content: 'Apply what you\'ve learned through guided practice exercises.', type: 'video', video_url: 'https://example.com/practice', duration: 60, order: 3, isFree: false },
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
        { title: 'Advanced Methodology Introduction', content: 'Introduction to professional-level approaches and frameworks.', type: 'video', video_url: 'https://example.com/adv-intro', duration: 45, order: 1, isFree: false },
        { title: 'Deep Dive - Advanced Technique 1', content: 'Master advanced techniques used by industry experts.', type: 'video', video_url: 'https://example.com/adv1', duration: 60, order: 2, isFree: false },
        { title: 'Deep Dive - Advanced Technique 2', content: 'Continue exploring sophisticated approaches to complex problems.', type: 'video', video_url: 'https://example.com/adv2', duration: 60, order: 3, isFree: false },
        { title: 'Integration & Optimization', content: 'Learn how to integrate techniques and optimize your workflow.', type: 'video', video_url: 'https://example.com/optimize', duration: 55, order: 4, isFree: false },
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
        { title: 'Tool Overview & Selection', content: 'Survey of professional tools and when to use each one.', type: 'video', video_url: 'https://example.com/tools', duration: 40, order: 1, isFree: false },
        { title: 'Primary Tool Deep Dive', content: 'Comprehensive training on the most essential tool in the field.', type: 'video', video_url: 'https://example.com/primary-tool', duration: 70, order: 2, isFree: false },
        { title: 'Supporting Tools & Integration', content: 'Learn complementary tools and how they work together.', type: 'video', video_url: 'https://example.com/integration', duration: 60, order: 3, isFree: false },
        { title: 'Workflow Automation', content: 'Streamline your processes with automation techniques.', type: 'video', video_url: 'https://example.com/automation', duration: 50, order: 4, isFree: false },
        { title: 'Tool Mastery Project', content: 'Build a project using professional tools and frameworks.', type: 'quiz', video_url: null, duration: 60, order: 5, isFree: false }
      ]
    },
    {
      title: 'Real-World Applications & Projects',
      description: 'Apply everything you\'ve learned to realistic, industry-style projects.',
      order: 5,
      duration: 360,
      lessons: [
        { title: 'Project Planning & Requirements', content: 'Learn how to scope and plan professional projects.', type: 'video', video_url: 'https://example.com/planning', duration: 50, order: 1, isFree: false },
        { title: 'Implementation Phase 1', content: 'Begin building your comprehensive project.', type: 'video', video_url: 'https://example.com/impl1', duration: 80, order: 2, isFree: false },
        { title: 'Implementation Phase 2', content: 'Continue development with advanced features.', type: 'video', video_url: 'https://example.com/impl2', duration: 80, order: 3, isFree: false },
        { title: 'Testing & Quality Assurance', content: 'Ensure your project meets professional standards.', type: 'video', video_url: 'https://example.com/testing', duration: 50, order: 4, isFree: false },
        { title: 'Refinement & Optimization', content: 'Polish and optimize your project for production.', type: 'video', video_url: 'https://example.com/refine', duration: 60, order: 5, isFree: false },
        { title: 'Project Completion & Review', content: 'Final review and feedback on your project.', type: 'quiz', video_url: null, duration: 40, order: 6, isFree: false }
      ]
    },
    {
      title: 'Industry Best Practices & Standards',
      description: 'Learn professional standards, ethics, and industry conventions.',
      order: 6,
      duration: 260,
      lessons: [
        { title: 'Professional Standards Overview', content: 'Understanding industry standards and why they matter.', type: 'video', video_url: 'https://example.com/standards', duration: 40, order: 1, isFree: false },
        { title: 'Code of Ethics & Professionalism', content: 'Professional conduct and ethical considerations in the field.', type: 'video', video_url: 'https://example.com/ethics', duration: 45, order: 2, isFree: false },
        { title: 'Documentation & Communication', content: 'Professional documentation and communication best practices.', type: 'video', video_url: 'https://example.com/docs', duration: 50, order: 3, isFree: false },
        { title: 'Collaboration & Teamwork', content: 'Working effectively in professional team environments.', type: 'video', video_url: 'https://example.com/team', duration: 45, order: 4, isFree: false },
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
        { title: 'Capstone Project Brief', content: 'Understanding the capstone project requirements and expectations.', type: 'video', video_url: 'https://example.com/capstone-intro', duration: 30, order: 1, isFree: false },
        { title: 'Research & Planning Phase', content: 'Conduct research and create a detailed project plan.', type: 'video', video_url: 'https://example.com/research', duration: 60, order: 2, isFree: false },
        { title: 'Design & Architecture', content: 'Design your project architecture and create wireframes/mockups.', type: 'video', video_url: 'https://example.com/design', duration: 70, order: 3, isFree: false },
        { title: 'Core Implementation', content: 'Build the core functionality of your capstone project.', type: 'video', video_url: 'https://example.com/core-impl', duration: 120, order: 4, isFree: false },
        { title: 'Advanced Features & Polish', content: 'Add advanced features and professional polish.', type: 'video', video_url: 'https://example.com/advanced-impl', duration: 100, order: 5, isFree: false },
        { title: 'Testing & Deployment', content: 'Test thoroughly and deploy your project.', type: 'video', video_url: 'https://example.com/deploy', duration: 60, order: 6, isFree: false },
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

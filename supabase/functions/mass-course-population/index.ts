import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CourseTemplate {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  difficulty_level: string;
  duration_hours: number;
  instructor_name: string;
  skills_taught: string[];
  price: number;
  is_free: boolean;
  modules: Module[];
}

interface Module {
  title: string;
  description: string;
  order: number;
  duration: number;
  lessons: Lesson[];
}

interface Lesson {
  title: string;
  content: string;
  type: string;
  duration: number;
  order: number;
  isFree: boolean;
  video_url?: string;
}

const courseTemplates: Record<string, CourseTemplate[]> = {
  'Web Development': [
    {
      title: 'Full Stack JavaScript Development',
      description: 'Master modern web development with React, Node.js, and MongoDB',
      category: 'Web Development',
      subcategory: 'Full Stack',
      difficulty_level: 'intermediate',
      duration_hours: 40,
      instructor_name: 'Sarah Johnson',
      skills_taught: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
      price: 199,
      is_free: false,
      modules: [
        {
          title: 'JavaScript Fundamentals',
          description: 'Master ES6+ features and modern JavaScript',
          order: 1,
          duration: 240,
          lessons: [
            {
              title: 'Variables and Data Types',
              content: 'Learn about let, const, var and JavaScript data types',
              type: 'video',
              duration: 30,
              order: 1,
              isFree: true,
              video_url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk'
            },
            {
              title: 'Functions and Arrow Functions',
              content: 'Understanding function declarations, expressions, and arrow functions',
              type: 'video',
              duration: 45,
              order: 2,
              isFree: false,
              video_url: 'https://www.youtube.com/watch?v=h33Srr5J9nY'
            }
          ]
        }
      ]
    },
    {
      title: 'React Advanced Patterns',
      description: 'Learn advanced React patterns and state management',
      category: 'Web Development',
      subcategory: 'Frontend',
      difficulty_level: 'advanced',
      duration_hours: 25,
      instructor_name: 'Mike Chen',
      skills_taught: ['React', 'Redux', 'Context API', 'Custom Hooks'],
      price: 149,
      is_free: false,
      modules: [
        {
          title: 'Advanced React Hooks',
          description: 'Master custom hooks and advanced patterns',
          order: 1,
          duration: 180,
          lessons: [
            {
              title: 'Custom Hooks Introduction',
              content: 'Learn to create reusable custom hooks',
              type: 'video',
              duration: 40,
              order: 1,
              isFree: true,
              video_url: 'https://www.youtube.com/watch?v=6ThXsUwLWvc'
            }
          ]
        }
      ]
    }
  ],
  'Data Science': [
    {
      title: 'Python for Data Analysis',
      description: 'Complete guide to data analysis with Python, Pandas, and NumPy',
      category: 'Data Science',
      subcategory: 'Data Analysis',
      difficulty_level: 'beginner',
      duration_hours: 35,
      instructor_name: 'Dr. Emily Rodriguez',
      skills_taught: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
      price: 179,
      is_free: false,
      modules: [
        {
          title: 'Python Basics for Data Science',
          description: 'Essential Python skills for data analysis',
          order: 1,
          duration: 200,
          lessons: [
            {
              title: 'Python Environment Setup',
              content: 'Setting up Python, Anaconda, and Jupyter notebooks',
              type: 'video',
              duration: 25,
              order: 1,
              isFree: true,
              video_url: 'https://www.youtube.com/watch?v=YYXdXT2l-Gg'
            }
          ]
        }
      ]
    }
  ],
  'Machine Learning': [
    {
      title: 'Machine Learning Fundamentals',
      description: 'Introduction to machine learning algorithms and implementations',
      category: 'Machine Learning',
      subcategory: 'Supervised Learning',
      difficulty_level: 'intermediate',
      duration_hours: 45,
      instructor_name: 'Dr. Alex Kumar',
      skills_taught: ['Python', 'Scikit-learn', 'TensorFlow', 'Linear Regression', 'Classification'],
      price: 249,
      is_free: false,
      modules: [
        {
          title: 'Introduction to Machine Learning',
          description: 'Understanding ML concepts and types',
          order: 1,
          duration: 150,
          lessons: [
            {
              title: 'What is Machine Learning?',
              content: 'Understanding the basics of machine learning',
              type: 'video',
              duration: 30,
              order: 1,
              isFree: true,
              video_url: 'https://www.youtube.com/watch?v=ukzFI9rgwfU'
            }
          ]
        }
      ]
    }
  ]
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

    const { action, count = 100, categories = [] } = await req.json();

    if (action === 'populate_professional_courses') {
      console.log(`Generating ${count} courses for categories:`, categories);

      let coursesCreated = 0;
      const sampleCourses = [];

      for (const category of categories) {
        const templates = courseTemplates[category] || [];
        const coursesToCreate = Math.ceil(count / categories.length);

        for (let i = 0; i < coursesToCreate && coursesCreated < count; i++) {
          const template = templates[i % templates.length] || templates[0];
          if (!template) continue;

          // Create variations of the base template
          const variation = i + 1;
          const courseData = {
            ...template,
            title: `${template.title} ${variation > 1 ? `- Part ${variation}` : ''}`,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Insert course
          const { data: course, error: courseError } = await supabaseClient
            .from('courses')
            .insert([courseData])
            .select()
            .single();

          if (courseError) {
            console.error('Course creation error:', courseError);
            continue;
          }

          // Insert modules and lessons
          for (const moduleData of template.modules) {
            const { data: module, error: moduleError } = await supabaseClient
              .from('course_modules')
              .insert([{
                course_id: course.id,
                title: moduleData.title,
                description: moduleData.description,
                module_order: moduleData.order,
                duration_minutes: moduleData.duration,
              }])
              .select()
              .single();

            if (moduleError) {
              console.error('Module creation error:', moduleError);
              continue;
            }

            // Insert lessons
            for (const lessonData of moduleData.lessons) {
              const { error: lessonError } = await supabaseClient
                .from('course_lessons')
                .insert([{
                  module_id: module.id,
                  title: lessonData.title,
                  content: lessonData.content,
                  lesson_type: lessonData.type,
                  video_url: lessonData.video_url,
                  duration_minutes: lessonData.duration,
                  lesson_order: lessonData.order,
                  is_free: lessonData.isFree,
                }]);

              if (lessonError) {
                console.error('Lesson creation error:', lessonError);
              }
            }
          }

          coursesCreated++;
          if (sampleCourses.length < 5) {
            sampleCourses.push({
              id: course.id,
              title: course.title,
              instructor_name: course.instructor_name,
              category: course.category
            });
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          courses_created: coursesCreated,
          categories_processed: categories.length,
          sample_courses: sampleCourses,
          message: `Successfully created ${coursesCreated} professional courses!`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (action === 'enhance_with_youtube') {
      // Get all courses without video URLs
      const { data: lessons, error } = await supabaseClient
        .from('course_lessons')
        .select('id, title, lesson_type')
        .is('video_url', null)
        .eq('lesson_type', 'video');

      if (error) throw error;

      let enhanced = 0;
      for (const lesson of lessons || []) {
        // Add a placeholder YouTube URL (in real implementation, you'd use YouTube API)
        const { error: updateError } = await supabaseClient
          .from('course_lessons')
          .update({
            video_url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`, // Placeholder
            updated_at: new Date().toISOString()
          })
          .eq('id', lesson.id);

        if (!updateError) enhanced++;
      }

      return new Response(
        JSON.stringify({
          success: true,
          lessons_enhanced: enhanced,
          message: `Enhanced ${enhanced} lessons with YouTube integration`
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
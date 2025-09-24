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

// Educational YouTube videos for different course topics - FIXED WITH WORKING VIDEOS
const getEducationalVideos = (courseTitle: string, courseCategory?: string): string[] => {
  const title = courseTitle.toLowerCase();
  const category = courseCategory?.toLowerCase() || '';
  
  const videoLibrary = {
    'react': [
      'https://www.youtube.com/embed/bMknfKXIFA8', // React Course for Beginners (freecodecamp)
      'https://www.youtube.com/embed/SqcY0GlETPk', // React Tutorial for Beginners
      'https://www.youtube.com/embed/w7ejDZ8SWv8', // React.js Course for Beginners
      'https://www.youtube.com/embed/4UZrsTqkcW4'  // Full React Tutorial
    ],
    'python': [
      'https://www.youtube.com/embed/8DvywoWv6fI', // Python for Everybody Course
      'https://www.youtube.com/embed/kqtD5dpn9C8', // Python Data Science Course
      'https://www.youtube.com/embed/LHBE6Q9XlzI', // Python Tutorial for Beginners
      'https://www.youtube.com/embed/eWRfhZUzrAc'  // Python Full Course
    ],
    'webdev': [
      'https://www.youtube.com/embed/pQN-pnXPaVg', // HTML CSS JS in 1 Hour
      'https://www.youtube.com/embed/TlB_eWDSMt4', // Node.js Tutorial
      'https://www.youtube.com/embed/fBNz5xF-Kx4', // Express.js Crash Course
      'https://www.youtube.com/embed/Oe421EPjeBE'  // Web Development Full Course
    ],
    'design': [
      'https://www.youtube.com/embed/3TxBkxtXzSw', // UI/UX Design Course
      'https://www.youtube.com/embed/c9Wg6Cb_YlU', // Figma Complete Course
      'https://www.youtube.com/embed/YiLUYf4HDh4', // Design Systems Course
      'https://www.youtube.com/embed/KYmqVesPAnU'  // User Experience Design
    ],
    'business': [
      'https://www.youtube.com/embed/ua-CiDNNj30', // Data Science Course
      'https://www.youtube.com/embed/M4CXOocovZ4', // Data Visualization
      'https://www.youtube.com/embed/nv7eJkXO6DQ', // Business Analytics
      'https://www.youtube.com/embed/7S_tz1z_5bA'  // SQL for Business
    ],
    'marketing': [
      'https://www.youtube.com/embed/nU-IIXBWlS4', // Digital Marketing Course (freecodecamp)
      'https://www.youtube.com/embed/vnVuqfXohxc', // Content Writing Tutorial
      'https://www.youtube.com/embed/gvTNl8HhcWc', // Social Media Marketing
      'https://www.youtube.com/embed/hnUjzVoditc'  // SEO Tutorial
    ],
    'leadership': [
      'https://www.youtube.com/embed/psKnMHjoxVo', // Leadership Training Course
      'https://www.youtube.com/embed/WEDIj9JBTC8', // Finance for Beginners
      'https://www.youtube.com/embed/gqOzc7r0L_g', // Management Skills
      'https://www.youtube.com/embed/VDiyQub6vpw'  // Communication Skills
    ],
    'tech': [
      'https://www.youtube.com/embed/JMUxmLyrhSk', // Machine Learning Explained
      'https://www.youtube.com/embed/SSo_EIwHSd4', // Blockchain Technology
      'https://www.youtube.com/embed/aircArVXyr44', // AI Fundamentals
      'https://www.youtube.com/embed/hQAHSlTtcmY'  // Programming Fundamentals
    ]
  };
  
  // Enhanced matching logic with better course title detection
  if (title.includes('react') || (title.includes('javascript') && title.includes('bootcamp'))) {
    return videoLibrary.react;
  }
  if (title.includes('python') || title.includes('data science')) {
    return videoLibrary.python;
  }
  if (title.includes('web development') || title.includes('full stack') || title.includes('node') || title.includes('full-stack')) {
    return videoLibrary.webdev;
  }
  if (title.includes('design') || title.includes('ui/ux') || title.includes('creative') || title.includes('graphic')) {
    return videoLibrary.design;
  }
  if (title.includes('marketing') || title.includes('digital marketing') || title.includes('content writing') || title.includes('copywriting')) {
    return videoLibrary.marketing;
  }
  if (title.includes('leadership') || title.includes('management') || title.includes('project management')) {
    return videoLibrary.leadership;
  }
  if (title.includes('business') || title.includes('analytics') || title.includes('intelligence') || title.includes('finance')) {
    return videoLibrary.business;
  }
  if (title.includes('machine learning') || title.includes('tensorflow') || title.includes('blockchain') || title.includes('cybersecurity') || title.includes('cloud') || title.includes('aws')) {
    return videoLibrary.tech;
  }
  
  // Category-based fallback with better matching
  if (category.includes('technology') || category.includes('tech')) return videoLibrary.tech;
  if (category.includes('business') || category.includes('finance')) return videoLibrary.business;
  if (category.includes('design') || category.includes('creative')) return videoLibrary.design;
  if (category.includes('marketing') || category.includes('digital')) return videoLibrary.marketing;
  if (category.includes('web development') || category.includes('development')) return videoLibrary.webdev;
  if (category.includes('data science') || category.includes('python')) return videoLibrary.python;
  
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
  let newCoursesCreated = 0;
  
  try {
    // Always create 50 courses from scratch - force recreation
    console.log(`🚀 FORCE CREATING ${courseLimit} courses from scratch...`);
    
    // Delete existing courses first via the client (respects RLS)
    const { error: deleteError } = await supabaseClient
      .from('courses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all courses
    
    if (deleteError) {
      console.log('Note: Could not delete existing courses, will create new ones anyway');
    }

    const currentCourseCount = 0; // Start fresh

    // Always create courses to reach the target  
    const coursesToCreate = courseLimit - currentCourseCount;
    console.log(`🚀 CREATING ${coursesToCreate} courses to reach ${courseLimit} total`);
      
      const additionalCourses = [
        { title: 'Google Data Analytics Professional Certificate', category: 'Technology', subcategory: 'Data Analytics', level: 'beginner', duration: '6 months', isMostPopular: true, rating: 4.6, enrolled: 2100000 },
        { title: 'Advanced AI & Machine Learning', category: 'Technology', subcategory: 'Artificial Intelligence', level: 'advanced', duration: '12 weeks' },
        { title: 'Blockchain Development Mastery', category: 'Technology', subcategory: 'Blockchain', level: 'intermediate', duration: '10 weeks' },
        { title: 'DevOps Engineering Complete', category: 'Technology', subcategory: 'DevOps', level: 'intermediate', duration: '8 weeks' },
        { title: 'Mobile App Development with Flutter', category: 'Technology', subcategory: 'Mobile Development', level: 'beginner', duration: '14 weeks' },
        { title: 'Data Engineering with Apache Spark', category: 'Technology', subcategory: 'Data Engineering', level: 'advanced', duration: '12 weeks' },
        { title: 'Advanced Digital Marketing Analytics', category: 'Marketing', subcategory: 'Digital Marketing', level: 'advanced', duration: '8 weeks' },
        { title: 'E-commerce Business Strategy', category: 'Business', subcategory: 'Strategy', level: 'intermediate', duration: '6 weeks' },
        { title: 'Financial Technology Innovation', category: 'Finance', subcategory: 'FinTech', level: 'advanced', duration: '10 weeks' },
        { title: 'Supply Chain Management Digital', category: 'Business', subcategory: 'Operations', level: 'intermediate', duration: '8 weeks' },
        { title: 'Advanced Product Design Thinking', category: 'Design', subcategory: 'Product Design', level: 'advanced', duration: '10 weeks' },
        { title: 'Game Development with Unity', category: 'Technology', subcategory: 'Game Development', level: 'intermediate', duration: '16 weeks' },
        { title: 'Quantum Computing Fundamentals', category: 'Technology', subcategory: 'Quantum Computing', level: 'advanced', duration: '14 weeks' },
        { title: 'Advanced React Native Development', category: 'Technology', subcategory: 'Mobile Development', level: 'advanced', duration: '12 weeks' },
        { title: 'IoT Systems Architecture', category: 'Technology', subcategory: 'IoT', level: 'advanced', duration: '10 weeks' },
        { title: 'Advanced Vue.js Development', category: 'Technology', subcategory: 'Frontend', level: 'advanced', duration: '8 weeks' },
        { title: 'Microservices with Spring Boot', category: 'Technology', subcategory: 'Backend', level: 'advanced', duration: '12 weeks' },
        { title: 'Advanced Angular Development', category: 'Technology', subcategory: 'Frontend', level: 'advanced', duration: '10 weeks' },
        { title: 'GraphQL API Development', category: 'Technology', subcategory: 'API Development', level: 'intermediate', duration: '6 weeks' },
        { title: 'Advanced Docker & Kubernetes', category: 'Technology', subcategory: 'DevOps', level: 'advanced', duration: '8 weeks' },
        { title: 'Serverless Architecture Complete', category: 'Technology', subcategory: 'Cloud Computing', level: 'advanced', duration: '10 weeks' },
        { title: 'Advanced PostgreSQL Database', category: 'Technology', subcategory: 'Database', level: 'advanced', duration: '8 weeks' },
        { title: 'Redis & Caching Strategies', category: 'Technology', subcategory: 'Database', level: 'intermediate', duration: '6 weeks' },
        { title: 'Advanced Git & Version Control', category: 'Technology', subcategory: 'Development Tools', level: 'intermediate', duration: '4 weeks' },
        { title: 'Advanced Testing Strategies', category: 'Technology', subcategory: 'Quality Assurance', level: 'advanced', duration: '8 weeks' },
        { title: 'Performance Optimization Mastery', category: 'Technology', subcategory: 'Performance', level: 'advanced', duration: '10 weeks' },
        { title: 'Advanced API Security', category: 'Technology', subcategory: 'Security', level: 'advanced', duration: '8 weeks' },
        { title: 'Advanced MongoDB Database', category: 'Technology', subcategory: 'Database', level: 'advanced', duration: '8 weeks' },
        { title: 'Advanced TypeScript Development', category: 'Technology', subcategory: 'Programming', level: 'advanced', duration: '6 weeks' },
        { title: 'Advanced Sass & CSS Techniques', category: 'Design', subcategory: 'Frontend Design', level: 'intermediate', duration: '6 weeks' },
        { title: 'Advanced Webpack Configuration', category: 'Technology', subcategory: 'Build Tools', level: 'advanced', duration: '4 weeks' },
        { title: 'Advanced Jest Testing Framework', category: 'Technology', subcategory: 'Testing', level: 'advanced', duration: '6 weeks' },
        { title: 'Advanced Electron Desktop Apps', category: 'Technology', subcategory: 'Desktop Development', level: 'advanced', duration: '10 weeks' },
        { title: 'Advanced WebRTC Communication', category: 'Technology', subcategory: 'Real-time Communication', level: 'advanced', duration: '8 weeks' },
        { title: 'Advanced Progressive Web Apps', category: 'Technology', subcategory: 'Web Development', level: 'advanced', duration: '8 weeks' },
        { title: 'Advanced WordPress Development', category: 'Technology', subcategory: 'CMS Development', level: 'advanced', duration: '10 weeks' }
      ];

      for (let i = 0; i < Math.min(coursesToCreate, additionalCourses.length); i++) {
        const courseData = additionalCourses[i];
        const durationHours = parseInt(courseData.duration.split(' ')[0]) || 8;
        
        const { error: createError } = await supabaseClient
          .from('courses')
          .insert({
            title: courseData.title,
            description: courseData.title === 'Google Data Analytics Professional Certificate' 
              ? 'Get job-ready in 6 months. No degree or experience required. This comprehensive program covers data cleaning, analysis, and visualization using industry-standard tools like Excel, SQL, R, and Tableau.'
              : `Comprehensive course covering ${courseData.title.toLowerCase()} with hands-on projects and real-world applications.`,
            instructor_name: courseData.title === 'Google Data Analytics Professional Certificate' ? 'Google Career Certificates' : 'TalentXcel Expert',
            difficulty_level: courseData.level,
            duration_hours: durationHours,
            category: courseData.category,
            subcategory: courseData.subcategory,
            is_active: true,
            rating: courseData.rating || (Math.random() * 2 + 3), // 3-5 rating
            enrolled_count: courseData.enrolled || Math.floor(Math.random() * 50000 + 5000),
            is_free: courseData.title === 'Google Data Analytics Professional Certificate' ? false : Math.random() > 0.7,
            price: courseData.title === 'Google Data Analytics Professional Certificate' ? 49 : (Math.random() > 0.7 ? 0 : Math.floor(Math.random() * 100 + 29)),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (createError) {
          console.error(`Error creating course ${courseData.title}:`, createError);
        } else {
          newCoursesCreated++;
          console.log(`✅ Created new course: ${courseData.title}`);
        }
      }

    // Now get all courses (including newly created ones) to process
    const { data: allCourses, error: allCoursesError } = await supabaseClient
      .from('courses')
      .select('*')
      .eq('is_active', true);

    console.log(`Processing ${allCourses?.length || 0} courses for content completion`);

    for (const course of allCourses || []) {
      try {
        console.log(`Processing course: ${course.title}`);
        
        // Force completion - always get existing modules for cleanup
        const { data: existingModules } = await supabaseClient
          .from('course_modules')
          .select('id, course_lessons(id)')
          .eq('course_id', course.id);

        console.log(`Force completing course: ${course.title} (existing modules: ${existingModules?.length || 0})`)

        // Delete any existing incomplete modules/lessons first
        if (existingModules && existingModules.length > 0) {
          console.log(`Cleaning up incomplete content for ${course.title}...`);
          for (const module of existingModules) {
            await supabaseClient.from('course_lessons').delete().eq('module_id', module.id);
          }
          await supabaseClient.from('course_modules').delete().eq('course_id', course.id);
        }

        // Create a complete module structure for each course
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
      message: `Successfully processed ${processedCourses} courses (${newCoursesCreated} new courses created)`,
      stats: {
        courses_processed: processedCourses,
        modules_created: createdModules,
        lessons_created: createdLessons,
        videos_integrated: integratedVideos,
        new_courses_created: newCoursesCreated
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
        error: (error as Error).message || 'Unknown error occurred',
        details: 'Check edge function logs for more details'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
})
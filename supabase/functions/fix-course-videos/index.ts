import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Known broken video IDs that need to be replaced
const BROKEN_VIDEO_IDS = [
  'rfscVS0vtbw', 'llKvV8_T95M', 'bFOKONpVDAQ', 'ByYP60zz3F4', 'dQw4w9WgXcQ'
];

// Fixed video library with working educational videos
const getWorkingVideos = (courseTitle: string, courseCategory?: string): string[] => {
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
  
  // Enhanced matching logic
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
  
  // Category-based fallback
  if (category.includes('technology') || category.includes('tech')) return videoLibrary.tech;
  if (category.includes('business') || category.includes('finance')) return videoLibrary.business;
  if (category.includes('design') || category.includes('creative')) return videoLibrary.design;
  if (category.includes('marketing') || category.includes('digital')) return videoLibrary.marketing;
  if (category.includes('web development') || category.includes('development')) return videoLibrary.webdev;
  if (category.includes('data science') || category.includes('python')) return videoLibrary.python;
  
  return videoLibrary.tech; // Default fallback
};

// Check if video URL contains broken video ID
const isVideoUrlBroken = (url: string): boolean => {
  if (!url) return false;
  return BROKEN_VIDEO_IDS.some(brokenId => url.includes(brokenId));
};

// Get appropriate video URL based on course content and lesson index
const getAppropriateVideoUrl = (course: any, lessonIndex: number): string => {
  const workingVideos = getWorkingVideos(course.title, course.category);
  const videoIndex = lessonIndex % workingVideos.length;
  return workingVideos[videoIndex];
};

async function fixCourseVideos(supabaseClient: any) {
  console.log('Starting video fix process...');
  
  let fixedVideos = 0;
  let totalChecked = 0;
  
  try {
    // Get all courses with their lessons that have video URLs
    const { data: coursesWithLessons, error: fetchError } = await supabaseClient
      .from('courses')
      .select(`
        id,
        title,
        category,
        course_modules!inner (
          id,
          title,
          course_lessons!inner (
            id,
            title,
            video_url,
            lesson_order,
            lesson_type
          )
        )
      `)
      .eq('is_active', true);

    if (fetchError) {
      console.error('Error fetching courses:', fetchError);
      throw new Error(`Failed to fetch courses: ${fetchError.message}`);
    }

    if (!coursesWithLessons || coursesWithLessons.length === 0) {
      return {
        success: true,
        message: 'No courses found to process',
        stats: { videos_checked: 0, videos_fixed: 0 }
      };
    }

    console.log(`Found ${coursesWithLessons.length} courses to check`);

    for (const course of coursesWithLessons) {
      console.log(`Processing course: ${course.title}`);
      
      for (const module of course.course_modules) {
        for (const lesson of module.course_lessons) {
          totalChecked++;
          
          if (lesson.video_url && lesson.lesson_type === 'video') {
            // Check if video URL is broken or needs fixing
            const needsFixing = isVideoUrlBroken(lesson.video_url) || 
                               !lesson.video_url.includes('youtube.com/embed/');
            
            if (needsFixing) {
              console.log(`Fixing broken video for lesson: ${lesson.title}`);
              
              // Get appropriate replacement video
              const newVideoUrl = getAppropriateVideoUrl(course, lesson.lesson_order - 1);
              
              // Update the lesson with the new video URL
              const { error: updateError } = await supabaseClient
                .from('course_lessons')
                .update({ video_url: newVideoUrl })
                .eq('id', lesson.id);

              if (updateError) {
                console.error(`Error updating lesson ${lesson.id}:`, updateError);
                continue;
              }

              fixedVideos++;
              console.log(`Fixed video for "${lesson.title}": ${newVideoUrl}`);
            }
          }
        }
      }
    }

    const result = {
      success: true,
      message: `Successfully checked ${totalChecked} videos and fixed ${fixedVideos} broken videos`,
      stats: {
        videos_checked: totalChecked,
        videos_fixed: fixedVideos
      }
    };

    console.log('Video fix process completed:', result);
    return result;

  } catch (error) {
    console.error('Error in fixCourseVideos:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('Fix-course-videos function called');

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { action } = await req.json();
    console.log('Processing action:', action);

    if (action === 'fix_broken_videos') {
      const result = await fixCourseVideos(supabaseClient);
      
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
          message: 'Action must be "fix_broken_videos"'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }

  } catch (error) {
    console.error('Error in fix-course-videos function:', error);
    
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
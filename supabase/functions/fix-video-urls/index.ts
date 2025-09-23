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

    console.log('Starting to fix video URLs...');

    // Get all video lessons with Rick Astley URLs, including course information
    const { data: lessons, error: fetchError } = await supabaseClient
      .from('course_lessons')
      .select(`
        id, 
        title,
        course_modules!inner (
          courses!inner (
            title,
            category
          )
        )
      `)
      .eq('lesson_type', 'video')
      .or('video_url.eq.https://www.youtube.com/watch?v=dQw4w9WgXcQ,video_url.like.%dQw4w9WgXcQ%');

    if (fetchError) {
      console.error('Error fetching lessons:', fetchError);
      throw fetchError;
    }

    if (!lessons || lessons.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No Rick Astley videos found to update' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${lessons.length} Rick Astley videos to update`);

    let updatedCount = 0;

    for (const lesson of lessons) {
      let videoUrl = 'https://www.youtube.com/embed/rfscVS0vtbw'; // Default: Learn JavaScript in 1 Hour
      
      const lessonTitle = lesson.title.toLowerCase();
      const courseTitle = lesson.course_modules.courses.title.toLowerCase();
      const category = lesson.course_modules.courses.category?.toLowerCase() || '';
      
      // Combine all text for keyword matching
      const allText = `${lessonTitle} ${courseTitle} ${category}`;
      
      console.log(`Processing lesson: ${lesson.title} from course: ${lesson.course_modules.courses.title}`);
      
      if (allText.includes('python') || allText.includes('programming')) {
        videoUrl = 'https://www.youtube.com/embed/_uQrJ0TkZlc'; // Python Tutorial for Beginners
      } else if (allText.includes('web development') || allText.includes('html') || allText.includes('css') || allText.includes('frontend') || allText.includes('javascript')) {
        videoUrl = 'https://www.youtube.com/embed/pQN-pnXPaVg'; // HTML, CSS, JS in 1 Hour
      } else if (allText.includes('data science') || allText.includes('data') || allText.includes('analytics') || allText.includes('business analytics')) {
        videoUrl = 'https://www.youtube.com/embed/ua-CiDNNj30'; // Data Science Course
      } else if (allText.includes('react') || allText.includes('frontend framework')) {
        videoUrl = 'https://www.youtube.com/embed/Ke90Tje7VS0'; // React Tutorial for Beginners
      } else if (allText.includes('marketing') || allText.includes('digital marketing') || allText.includes('social media') || allText.includes('brand')) {
        videoUrl = 'https://www.youtube.com/embed/bFOKONpVDAQ'; // Digital Marketing Course
      } else if (allText.includes('leadership') || allText.includes('management') || allText.includes('business') || allText.includes('communication')) {
        videoUrl = 'https://www.youtube.com/embed/llKvV8_T95M'; // Leadership Training
      } else if (allText.includes('design') || allText.includes('ui') || allText.includes('ux') || allText.includes('graphic')) {
        videoUrl = 'https://www.youtube.com/embed/ByYP60zz3F4'; // UI/UX Design Tutorial
      } else if (allText.includes('ai') || allText.includes('artificial intelligence') || allText.includes('machine learning') || allText.includes('ml')) {
        videoUrl = 'https://www.youtube.com/embed/JMUxmLyrhSk'; // Machine Learning Explained
      } else if (allText.includes('blockchain') || allText.includes('cryptocurrency') || allText.includes('crypto')) {
        videoUrl = 'https://www.youtube.com/embed/SSo_EIwHSd4'; // Blockchain Explained
      } else if (allText.includes('finance') || allText.includes('accounting') || allText.includes('investment')) {
        videoUrl = 'https://www.youtube.com/embed/WEDIj9JBTC8'; // Finance Basics
      } else if (allText.includes('writing') || allText.includes('content') || allText.includes('copywriting')) {
        videoUrl = 'https://www.youtube.com/embed/vnVuqfXohxc'; // Content Writing Tutorial
      }

      console.log(`Updating lesson: ${lesson.title} (Course: ${lesson.course_modules.courses.title}) with video: ${videoUrl}`);

      const { error: updateError } = await supabaseClient
        .from('course_lessons')
        .update({ video_url: videoUrl })
        .eq('id', lesson.id);

      if (updateError) {
        console.error(`Error updating lesson ${lesson.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully updated ${updatedCount} video URLs`,
        updated_count: updatedCount,
        total_found: lessons.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
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
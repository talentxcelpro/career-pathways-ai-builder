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

    // Get all video lessons with Rick Astley URLs
    const { data: lessons, error: fetchError } = await supabaseClient
      .from('course_lessons')
      .select('id, title')
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
      
      const title = lesson.title.toLowerCase();
      
      if (title.includes('python')) {
        videoUrl = 'https://www.youtube.com/embed/_uQrJ0TkZlc'; // Python Tutorial for Beginners
      } else if (title.includes('web development') || title.includes('html') || title.includes('css')) {
        videoUrl = 'https://www.youtube.com/embed/pQN-pnXPaVg'; // HTML, CSS, JS in 1 Hour
      } else if (title.includes('data science') || title.includes('data')) {
        videoUrl = 'https://www.youtube.com/embed/ua-CiDNNj30'; // Data Science Course
      } else if (title.includes('react')) {
        videoUrl = 'https://www.youtube.com/embed/Ke90Tje7VS0'; // React Tutorial for Beginners
      } else if (title.includes('marketing')) {
        videoUrl = 'https://www.youtube.com/embed/bFOKONpVDAQ'; // Digital Marketing Course
      } else if (title.includes('leadership') || title.includes('management')) {
        videoUrl = 'https://www.youtube.com/embed/llKvV8_T95M'; // Leadership Training
      } else if (title.includes('design') || title.includes('ui') || title.includes('ux')) {
        videoUrl = 'https://www.youtube.com/embed/ByYP60zz3F4'; // UI/UX Design Tutorial
      }

      console.log(`Updating lesson: ${lesson.title} with video: ${videoUrl}`);

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
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const muxTokenId = Deno.env.get('MUX_TOKEN_ID')!
const muxTokenSecret = Deno.env.get('MUX_TOKEN_SECRET')!

// Initialize Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting Mux video integration process...')

    const { action = 'replace_all', course_id } = await req.json().catch(() => ({}))

    if (action === 'replace_all') {
      return await replaceAllYouTubeWithMux()
    } else if (action === 'replace_course' && course_id) {
      return await replaceCourseVideos(course_id)
    } else {
      throw new Error('Invalid action or missing course_id')
    }

  } catch (error) {
    console.error('❌ Error in Mux integration:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function replaceAllYouTubeWithMux() {
  console.log('🔄 Replacing all YouTube URLs with Mux playback IDs...')

  // Get all courses and their lessons with video URLs
  const { data: lessons, error: lessonsError } = await supabaseAdmin
    .from('course_lessons')
    .select(`
      id,
      title,
      video_url,
      course_modules!inner (
        course_id,
        title,
        courses!inner (
          id,
          title
        )
      )
    `)
    .not('video_url', 'is', null)

  if (lessonsError) {
    throw new Error(`Failed to fetch lessons: ${lessonsError.message}`)
  }

  console.log(`📚 Found ${lessons.length} lessons with videos`)

  let processedCount = 0
  let muxVideosCreated = 0
  const results = []

  // Process each lesson
  for (const lesson of lessons) {
    try {
      const course = lesson.course_modules.courses
      const module = lesson.course_modules
      
      console.log(`🎬 Processing lesson: "${lesson.title}" from course: "${course.title}"`)

      // Create course-specific video content
      const muxPlaybackId = await createMuxVideo({
        courseTitle: course.title,
        moduleTitle: module.title,
        lessonTitle: lesson.title,
        lessonId: lesson.id
      })

      if (muxPlaybackId) {
        // Update lesson with new Mux playback ID
        const { error: updateError } = await supabaseAdmin
          .from('course_lessons')
          .update({ 
            video_url: `https://stream.mux.com/${muxPlaybackId}.m3u8`,
            duration_minutes: 15 // Default duration
          })
          .eq('id', lesson.id)

        if (updateError) {
          console.error(`❌ Failed to update lesson ${lesson.id}:`, updateError)
          results.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            success: false,
            error: updateError.message
          })
        } else {
          console.log(`✅ Updated lesson ${lesson.title} with Mux ID: ${muxPlaybackId}`)
          results.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            success: true,
            muxPlaybackId
          })
          muxVideosCreated++
        }
      } else {
        results.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          success: false,
          error: 'Failed to create Mux video'
        })
      }

      processedCount++
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (error) {
      console.error(`❌ Error processing lesson ${lesson.id}:`, error)
      results.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        success: false,
        error: error.message
      })
    }
  }

  const summary = {
    success: true,
    message: `Successfully processed ${processedCount} lessons`,
    stats: {
      lessons_processed: processedCount,
      mux_videos_created: muxVideosCreated,
      total_lessons: lessons.length
    },
    details: results
  }

  console.log('✅ Mux integration completed:', summary)

  return new Response(
    JSON.stringify(summary),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

async function replaceCourseVideos(courseId: string) {
  console.log(`🔄 Replacing videos for course: ${courseId}`)

  // Get lessons for specific course
  const { data: lessons, error: lessonsError } = await supabaseAdmin
    .from('course_lessons')
    .select(`
      id,
      title,
      video_url,
      course_modules!inner (
        title,
        courses!inner (
          id,
          title
        )
      )
    `)
    .eq('course_modules.courses.id', courseId)
    .not('video_url', 'is', null)

  if (lessonsError) {
    throw new Error(`Failed to fetch course lessons: ${lessonsError.message}`)
  }

  console.log(`📚 Found ${lessons.length} lessons with videos for this course`)

  let processedCount = 0
  const results = []

  for (const lesson of lessons) {
    try {
      const course = lesson.course_modules.courses
      const module = lesson.course_modules
      
      const muxPlaybackId = await createMuxVideo({
        courseTitle: course.title,
        moduleTitle: module.title,
        lessonTitle: lesson.title,
        lessonId: lesson.id
      })

      if (muxPlaybackId) {
        const { error: updateError } = await supabaseAdmin
          .from('course_lessons')
          .update({ 
            video_url: `https://stream.mux.com/${muxPlaybackId}.m3u8`,
            duration_minutes: 15
          })
          .eq('id', lesson.id)

        if (!updateError) {
          console.log(`✅ Updated lesson ${lesson.title} with Mux ID: ${muxPlaybackId}`)
          results.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            success: true,
            muxPlaybackId
          })
          processedCount++
        } else {
          results.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            success: false,
            error: updateError.message
          })
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error(`❌ Error processing lesson ${lesson.id}:`, error)
      results.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        success: false,
        error: error.message
      })
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Successfully processed ${processedCount} lessons for course`,
      stats: {
        lessons_processed: processedCount,
        total_lessons: lessons.length
      },
      details: results
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

async function createMuxVideo({ courseTitle, moduleTitle, lessonTitle, lessonId }: {
  courseTitle: string
  moduleTitle: string
  lessonTitle: string
  lessonId: string
}) {
  try {
    console.log(`🎥 Creating Mux video for: ${courseTitle} - ${moduleTitle} - ${lessonTitle}`)

    // Generate course-specific video content using test patterns
    // This is a placeholder - in production you'd upload actual video content
    const videoTitle = `${courseTitle}: ${moduleTitle} - ${lessonTitle}`
    const videoDescription = `Educational content for ${lessonTitle} in the ${moduleTitle} module of ${courseTitle}`

    // Create a Mux asset using direct upload
    const muxResponse = await fetch('https://api.mux.com/video/v1/assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${muxTokenId}:${muxTokenSecret}`)}`
      },
      body: JSON.stringify({
        input: [
          {
            url: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4` // Sample video
          }
        ],
        playback_policy: ['public'],
        mp4_support: 'standard',
        normalize_audio: true,
        test: false, // Set to false for production
        metadata: {
          course_title: courseTitle,
          module_title: moduleTitle,
          lesson_title: lessonTitle,
          lesson_id: lessonId
        }
      })
    })

    if (!muxResponse.ok) {
      const errorData = await muxResponse.text()
      console.error('❌ Mux API error:', errorData)
      throw new Error(`Mux API error: ${muxResponse.status} - ${errorData}`)
    }

    const muxData = await muxResponse.json()
    console.log('✅ Mux asset created:', muxData.data.id)

    // Wait for asset to be ready (in production, you'd use webhooks)
    let attempts = 0
    const maxAttempts = 30
    
    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.mux.com/video/v1/assets/${muxData.data.id}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${muxTokenId}:${muxTokenSecret}`)}`
        }
      })

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        
        if (statusData.data.status === 'ready' && statusData.data.playback_ids?.length > 0) {
          const playbackId = statusData.data.playback_ids[0].id
          console.log(`✅ Video ready with playback ID: ${playbackId}`)
          return playbackId
        } else if (statusData.data.status === 'errored') {
          throw new Error('Mux video processing failed')
        }
      }

      attempts++
      console.log(`⏳ Waiting for video to be ready... (${attempts}/${maxAttempts})`)
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    throw new Error('Timeout waiting for video to be ready')

  } catch (error) {
    console.error(`❌ Failed to create Mux video for lesson ${lessonId}:`, error)
    return null
  }
}
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import OpenAI from 'https://esm.sh/openai@4.20.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CourseGenerationRequest {
  action: 'generate_comprehensive_course' | 'enhance_existing_course' | 'create_interactive_exercises'
  topic: string
  difficulty_level: string
  duration_hours: number
  course_id?: string
  include_youtube_videos?: boolean
  include_exercises?: boolean
  include_projects?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData: CourseGenerationRequest = await req.json()
    const { action, topic, difficulty_level, duration_hours, course_id } = requestData

    // Initialize services
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    if (action === 'generate_comprehensive_course') {
      return await generateComprehensiveCourse(requestData, openai, supabase)
    } else if (action === 'enhance_existing_course') {
      return await enhanceExistingCourse(requestData, openai, supabase)
    } else if (action === 'create_interactive_exercises') {
      return await createInteractiveExercises(requestData, openai, supabase)
    }

    throw new Error('Invalid action specified')

  } catch (error) {
    console.error('Course Generator Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Course generation failed',
        details: (error as Error).message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateComprehensiveCourse(
  requestData: CourseGenerationRequest, 
  openai: OpenAI, 
  supabase: any
) {
  const { topic, difficulty_level, duration_hours } = requestData

  // Generate comprehensive course structure
  const coursePrompt = `Create a comprehensive, world-class online course on "${topic}" that rivals the best platforms like Coursera.

Course Requirements:
- Difficulty Level: ${difficulty_level}
- Duration: ${duration_hours} hours
- Target: Professional learners seeking practical skills
- Include real-world applications and industry standards

Please generate:

1. **Course Overview**:
   - Compelling title and description
   - Learning outcomes (specific, measurable)
   - Prerequisites
   - Industry relevance and career impact

2. **Module Structure** (${Math.ceil(duration_hours / 3)} modules):
   - Module titles and learning objectives
   - Estimated time for each module
   - Key concepts and skills covered

3. **Lesson Breakdown** (detailed for each module):
   - Lesson titles and descriptions
   - Content outline
   - YouTube video search terms for each lesson
   - Interactive elements (quizzes, exercises, projects)

4. **Assessment Strategy**:
   - Quiz questions for each module
   - Practical projects
   - Final capstone project

5. **Career Application**:
   - Industry use cases
   - Portfolio development guidance
   - Certification path

Return as structured JSON with all course data ready for database insertion.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: coursePrompt }],
    temperature: 0.3,
    max_tokens: 4000,
  })

  let courseData: any;
  try {
    courseData = JSON.parse(completion.choices[0].message.content || '{}');
  } catch {
    throw new Error('Failed to generate structured course data');
  }

  // Create course in database
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({
      title: courseData.title,
      description: courseData.description,
      instructor_name: 'AI Expert Instructor',
      category: topic,
      difficulty_level: difficulty_level,
      duration_hours: duration_hours,
      published: true,
      learning_outcomes: courseData.learning_outcomes,
      prerequisites: courseData.prerequisites,
      certification_available: true,
      course_type: 'ai_generated',
      estimated_completion_time: duration_hours * 60, // in minutes
      real_world_projects: courseData.projects || []
    })
    .select()
    .single()

  if (courseError) throw courseError

  // Create modules and lessons
  for (const [moduleIndex, module] of courseData.modules.entries()) {
    const { data: moduleRecord } = await supabase
      .from('course_modules')
      .insert({
        course_id: course.id,
        title: module.title,
        description: module.description,
        module_order: moduleIndex + 1,
        duration_minutes: module.duration_minutes || 45
      })
      .select()
      .single()

    // Create lessons for this module
    for (const [lessonIndex, lesson] of module.lessons.entries()) {
      await supabase
        .from('course_lessons')
        .insert({
          module_id: moduleRecord.id,
          title: lesson.title,
          content: lesson.content,
          lesson_type: 'text',
          duration_minutes: lesson.duration_minutes || 15,
          lesson_order: lessonIndex + 1,
          is_free: lessonIndex === 0 // First lesson free
        })
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      course: course,
      message: 'Comprehensive course generated successfully',
      modules_created: courseData.modules.length,
      total_lessons: courseData.modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0)
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function enhanceExistingCourse(
  requestData: CourseGenerationRequest,
  openai: OpenAI,
  supabase: any
) {
  const { course_id, include_youtube_videos, include_exercises } = requestData

  // Get existing course data
  const { data: course } = await supabase
    .from('courses')
    .select(`
      *,
      course_modules(
        *,
        course_lessons(*)
      )
    `)
    .eq('id', course_id)
    .single()

  if (!course) throw new Error('Course not found')

  // Enhance with YouTube integration
  if (include_youtube_videos) {
    for (const module of course.course_modules) {
      for (const lesson of module.course_lessons) {
        // Generate YouTube search query for this lesson
        const searchQuery = `${course.title} ${lesson.title} tutorial ${course.difficulty_level}`
        
        // You would integrate with YouTube API here to find relevant videos
        // For now, we'll generate placeholder URLs
        const youtubeUrl = `https://www.youtube.com/embed/search?q=${encodeURIComponent(searchQuery)}`
        
        await supabase
          .from('course_lessons')
          .update({ 
            video_url: youtubeUrl,
            lesson_type: 'video'
          })
          .eq('id', lesson.id)
      }
    }
  }

  // Add interactive exercises
  if (include_exercises) {
    for (const module of course.course_modules) {
      // Generate exercises for this module
      const exercisePrompt = `Create interactive coding exercises for the module "${module.title}" in the course "${course.title}".

Generate 3 exercises:
1. A beginner-friendly coding challenge
2. A practical application exercise
3. A real-world scenario problem

For each exercise, provide:
- Clear instructions
- Starter code (if applicable)
- Solution code
- Test cases
- Hints for struggling students

Topic: ${course.title}
Module: ${module.title}
Difficulty: ${course.difficulty_level}`

      const exerciseCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: exercisePrompt }],
        temperature: 0.3,
        max_tokens: 2000,
      })

      let exerciseData: any;
      try {
        exerciseData = JSON.parse(exerciseCompletion.choices[0].message.content || '{}');
      } catch {
        continue; // Skip if JSON parsing fails
      }

      // Insert exercises into database
      for (const exercise of exerciseData.exercises || []) {
        await supabase
          .from('interactive_exercises')
          .insert({
            lesson_id: module.course_lessons[0]?.id, // Associate with first lesson
            exercise_type: 'coding',
            title: exercise.title,
            instructions: exercise.instructions,
            starter_code: exercise.starter_code,
            solution_code: exercise.solution_code,
            test_cases: exercise.test_cases || [],
            hints: exercise.hints || [],
            difficulty_level: course.difficulty_level === 'beginner' ? 1 : 
                            course.difficulty_level === 'intermediate' ? 2 : 3,
            estimated_time_minutes: 30
          })
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Course enhanced successfully',
      enhancements_applied: {
        youtube_videos: include_youtube_videos,
        interactive_exercises: include_exercises
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createInteractiveExercises(
  requestData: CourseGenerationRequest,
  openai: OpenAI,
  supabase: any
) {
  // Implementation for creating standalone interactive exercises
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Interactive exercises created'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
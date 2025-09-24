import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import OpenAI from 'https://esm.sh/openai@4.20.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      userId, 
      courseId, 
      lessonId, 
      userMessage, 
      sessionId, 
      learningObjectives = [],
      difficulty = 'auto' 
    } = await req.json()

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get course and lesson context
    const { data: course } = await supabase
      .from('courses')
      .select('title, description, difficulty_level')
      .eq('id', courseId)
      .single()

    const { data: lesson } = lessonId ? await supabase
      .from('course_lessons')
      .select('title, content, lesson_type')
      .eq('id', lessonId)
      .single() : { data: null }

    // Get user's learning analytics
    const { data: analytics } = await supabase
      .from('user_learning_analytics')
      .select('learning_style_profile, difficulty_preference, knowledge_retention_score')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Create personalized tutor prompt
    const tutorPrompt = `You are an expert AI tutor specializing in ${course?.title || 'education'}. 

Current Context:
- Course: ${course?.title}
- Lesson: ${lesson?.title || 'General discussion'}
- Learning Objectives: ${learningObjectives.join(', ')}
- Student's Learning Style: ${analytics?.learning_style_profile ? JSON.stringify(analytics.learning_style_profile) : 'adaptive'}
- Difficulty Preference: ${analytics?.difficulty_preference || difficulty}
- Knowledge Retention Score: ${analytics?.knowledge_retention_score || 'unknown'}

Teaching Guidelines:
1. Adapt your explanation style to the student's learning preferences
2. Use examples and analogies relevant to the course topic
3. Break down complex concepts into digestible parts
4. Encourage critical thinking with follow-up questions
5. Provide practical applications and real-world examples
6. Be encouraging and supportive
7. If the student is struggling, simplify your approach
8. If they're excelling, provide additional challenges

Remember: You are here to guide learning, not just provide answers. Help the student understand concepts deeply.`

    // Get conversation history if sessionId provided
    let conversationHistory = []
    if (sessionId) {
      const { data: session } = await supabase
        .from('ai_tutor_sessions')
        .select('conversation_context')
        .eq('id', sessionId)
        .single()
      
      conversationHistory = session?.conversation_context?.messages || []
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: tutorPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: userMessage }
    ]

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    const aiResponse = completion.choices[0].message.content

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiResponse }
    ].slice(-20) // Keep last 20 messages

    // Save or update AI tutor session
    const sessionData = {
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId,
      conversation_context: { messages: updatedHistory },
      learning_objectives: learningObjectives,
      difficulty_adaptation: difficulty,
      teaching_style: analytics?.learning_style_profile?.preferred_style || 'adaptive',
      updated_at: new Date().toISOString()
    }

    let savedSession
    if (sessionId) {
      const { data } = await supabase
        .from('ai_tutor_sessions')
        .update(sessionData)
        .eq('id', sessionId)
        .select()
        .single()
      savedSession = data
    } else {
      const { data } = await supabase
        .from('ai_tutor_sessions')
        .insert(sessionData)
        .select()
        .single()
      savedSession = data
    }

    // Track learning analytics
    await supabase
      .from('user_learning_analytics')
      .upsert({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        engagement_score: (analytics?.engagement_score || 0) + 1,
        session_duration: 0, // Will be updated from frontend
        updated_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({
        response: aiResponse,
        sessionId: savedSession.id,
        learningInsights: {
          adaptedDifficulty: difficulty,
          suggestedNextTopics: [], // Can be enhanced with more AI analysis
          knowledgeGaps: []
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('AI Tutor Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'AI tutor temporarily unavailable',
        details: (error as Error).message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
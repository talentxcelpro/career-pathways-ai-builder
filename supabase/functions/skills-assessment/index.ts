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
    const { userId, skillArea, assessmentType = 'comprehensive' } = await req.json()

    // Initialize services
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get user's current skill data
    const { data: userSkills } = await supabase
      .from('user_skills')
      .select(`
        *,
        skills(name, category, difficulty_level, market_demand_score)
      `)
      .eq('user_id', userId)

    // Get learning analytics
    const { data: analytics } = await supabase
      .from('user_learning_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Generate AI-powered skill assessment
    const assessmentPrompt = `You are an expert career advisor and skills analyst. 

User's Current Skills:
${userSkills?.map(skill => `- ${skill.skills.name}: ${skill.proficiency_level}% proficiency, ${skill.total_practice_hours} hours practiced`).join('\n') || 'No recorded skills yet'}

User's Learning Analytics:
${analytics?.map(a => `- Course: ${a.course_id}, Engagement: ${a.engagement_score}, Retention: ${a.knowledge_retention_score}`).join('\n') || 'No learning history yet'}

Focus Area: ${skillArea || 'General skills assessment'}
Assessment Type: ${assessmentType}

Please provide a comprehensive skills assessment including:

1. **Current Skill Level Analysis**: Rate current proficiency in key areas (0-100)
2. **Skill Gaps Identification**: What skills are missing or need improvement
3. **Market Relevance**: How current skills align with industry demands
4. **Learning Path Recommendations**: Specific courses or skills to focus on next
5. **Career Progression Insights**: How skills align with career goals
6. **Timeline Estimates**: How long to reach next proficiency levels
7. **Industry Benchmark**: How skills compare to industry standards

Return as a structured JSON object with specific scores, recommendations, and actionable insights.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: assessmentPrompt }],
      temperature: 0.3,
      max_tokens: 2000,
    })

    let assessmentData
    try {
      // Try to parse as JSON first
      assessmentData = JSON.parse(completion.choices[0].message.content!)
    } catch {
      // If not valid JSON, structure the response
      assessmentData = {
        overall_score: 65,
        assessment_text: completion.choices[0].message.content,
        recommendations: []
      }
    }

    // Calculate dynamic recommendations based on market data
    const { data: marketSkills } = await supabase
      .from('skills')
      .select('*')
      .order('market_demand_score', { ascending: false })
      .limit(20)

    // Generate personalized learning path
    const learningPath = {
      immediate_focus: [],
      three_month_goals: [],
      six_month_goals: [],
      market_opportunities: marketSkills?.slice(0, 5).map(skill => ({
        skill: skill.name,
        demand_score: skill.market_demand_score,
        average_salary: skill.average_salary
      })) || []
    }

    // Update user's skill assessment data
    const skillAssessmentResult = {
      user_id: userId,
      skill_area: skillArea,
      assessment_data: {
        ...assessmentData,
        learning_path: learningPath,
        assessment_date: new Date().toISOString(),
        next_assessment_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      },
      confidence_level: 'high',
      created_at: new Date().toISOString()
    }

    // Store assessment results
    await supabase
      .from('ai_career_insights')
      .insert({
        user_id: userId,
        insight_type: 'skills_assessment',
        industry: skillArea,
        data: skillAssessmentResult.assessment_data,
        confidence_level: 'high'
      })

    return new Response(
      JSON.stringify({
        success: true,
        assessment: skillAssessmentResult,
        recommendations: learningPath,
        market_insights: marketSkills?.slice(0, 10) || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Skills Assessment Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Skills assessment failed',
        details: (error as Error).message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
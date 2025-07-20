
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

console.log('🤖 TalentXcel AI Agent initializing...')

interface AIModule {
  name: string;
  capabilities: string[];
  prompts: string[];
}

const AI_MODULES: Record<string, AIModule> = {
  network: {
    name: "Network AI",
    capabilities: ["connection_suggestions", "profile_analysis", "message_generation", "community_recommendations"],
    prompts: [
      "Who are 5 professionals I should connect with in {field}?",
      "Write a smart connection message for a {role}.",
      "Show trending communities for {industry}.",
      "Analyze my influence score and how to improve it.",
      "Summarize {person}'s profile."
    ]
  },
  jobs: {
    name: "Jobs AI", 
    capabilities: ["job_recommendations", "resume_tailoring", "interview_prep", "salary_benchmarking"],
    prompts: [
      "Find jobs matching my profile in {location} with {mode} mode.",
      "Analyze this JD and tell how I can tailor my resume.",
      "Prepare me for an interview for this job.",
      "What's the average salary for {role} in {location}?"
    ]
  },
  employer: {
    name: "Employer AI",
    capabilities: ["jd_generation", "applicant_ranking", "interview_questions", "branding_advice"],
    prompts: [
      "Write a job post for {role}, {experience} experience, {skills}, {mode}.",
      "Rank these applicants based on JD fit.",
      "Create interview questions for a {role} role.",
      "What's the ideal employer branding strategy for a {company_type}?"
    ]
  },
  companies: {
    name: "Companies AI",
    capabilities: ["company_analysis", "culture_insights", "company_comparison", "hiring_trends"],
    prompts: [
      "Summarize company profile of {company}.",
      "Compare {company1} and {company2} on job satisfaction and pay.",
      "What's the hiring trend in {company} over last 6 months?"
    ]
  },
  resume: {
    name: "Resume Builder AI",
    capabilities: ["resume_enhancement", "ats_optimization", "tailoring", "formatting"],
    prompts: [
      "Enhance this resume section for a {role}.",
      "Create a resume for an {qualification} interested in {field}.",
      "Analyze and optimize my resume for {company}'s {role} JD.",
      "Convert this text into a structured modern resume format."
    ]
  },
  tools: {
    name: "Tools AI",
    capabilities: ["career_assessment", "swot_analysis", "role_fitting", "skill_analysis"],
    prompts: [
      "Run a career SWOT analysis for me.",
      "What career roles suit a {background} with {additional_qualification}?",
      "Run a resume checker for ATS compliance.",
      "Simulate an interview for {role} role."
    ]
  },
  services: {
    name: "Services AI",
    capabilities: ["service_recommendations", "booking_assistance", "mentor_matching", "reviews_analysis"],
    prompts: [
      "Suggest a mentor for {field} career switch.",
      "Book {service} service for ₹{price} plan.",
      "Who are the top-rated {service_type} on TalentXcel?"
    ]
  },
  learning: {
    name: "Learning AI",
    capabilities: ["learning_roadmaps", "course_recommendations", "certification_guidance", "skill_gap_analysis"],
    prompts: [
      "Create a {duration} learning roadmap to become a {role}.",
      "Recommend top free courses on {skill} for beginners.",
      "What skills am I missing for {role}?",
      "What certifications should I get for {career_path}?"
    ]
  },
  colleges: {
    name: "Colleges AI", 
    capabilities: ["college_search", "course_comparison", "admission_prep", "alumni_analysis"],
    prompts: [
      "List top colleges for {course} in {country} with placements above {percentage}%.",
      "Compare {college1} and {college2} for {specialization}.",
      "Show top alumni from {college} in {field}."
    ]
  },
  career_map: {
    name: "Career Map AI",
    capabilities: ["career_roadmaps", "role_transitions", "progress_analysis", "career_fit"],
    prompts: [
      "Show me a 5-year career roadmap for a {role}.",
      "What roles can I transition to from a {current_role}?",
      "Evaluate my career fit for {target_role}."
    ]
  }
}

Deno.serve(async (req) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID().substring(0, 8)
  
  console.log(`[${requestId}] 🤖 TalentXcel AI Agent request`)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ 
        status: 'healthy',
        agent: 'TalentXcel AI',
        modules: Object.keys(AI_MODULES),
        timestamp: new Date().toISOString(),
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const { message, userId, module, context, conversationHistory } = await req.json()
    
    console.log(`[${requestId}] Processing message for module: ${module || 'general'}`)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get user profile for context
    let userProfile = null
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      userProfile = profile
    }

    // Determine which module to use
    const activeModule = module && AI_MODULES[module] ? AI_MODULES[module] : null
    
    // Build system message based on module
    let systemMessage = `You are TalentXcel AI, an intelligent career assistant integrated with the TalentXcel platform. You help users with career guidance, job searching, resume building, networking, and professional development.

Platform Context:
- TalentXcel is a comprehensive career platform with modules for networking, jobs, employers, companies, resume building, tools, services, learning, colleges, and career mapping.
- You have access to user profiles, job listings, company data, learning resources, and career tools.
- Provide actionable, specific advice tailored to the user's career goals and current situation.

User Profile: ${userProfile ? JSON.stringify(userProfile, null, 2) : 'No profile data available'}

Current Context: ${context || 'General career guidance'}

Response Guidelines:
- Be conversational but professional
- Provide specific, actionable advice
- Reference TalentXcel features when relevant
- Ask clarifying questions when needed
- Use emojis sparingly and appropriately
- Keep responses concise but comprehensive`

    if (activeModule) {
      systemMessage += `\n\nActive Module: ${activeModule.name}
Module Capabilities: ${activeModule.capabilities.join(', ')}
Focus your response on ${activeModule.name.toLowerCase()} related guidance and recommendations.`
    }

    // Prepare conversation context
    const messages = [
      { role: 'system', content: systemMessage }
    ]

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.slice(-10).forEach((msg: any) => {
        messages.push({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        })
      })
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    console.log(`[${requestId}] Calling OpenAI with ${messages.length} messages`)

    // Call OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    })

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error(`[${requestId}] OpenAI API error:`, errorText)
      throw new Error(`OpenAI API error: ${openAIResponse.status}`)
    }

    const openAIData = await openAIResponse.json()
    const aiResponse = openAIData.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response generated by AI')
    }

    const tokensUsed = openAIData.usage?.total_tokens || 0
    const responseTime = Date.now() - startTime

    // Log usage
    try {
      await supabase.from('ai_usage_logs').insert({
        user_id: userId,
        tool_slug: 'talentxcel-ai-agent',
        feature_type: module || 'general',
        request_type: 'chat_message',
        request_data: { message, module, context },
        response_data: { response: aiResponse },
        success: true,
        tokens_used: tokensUsed,
        cost_estimate: (tokensUsed / 1000) * 0.002,
        response_time: responseTime
      })
    } catch (logError) {
      console.warn(`[${requestId}] Failed to log usage:`, logError)
    }

    console.log(`[${requestId}] ✅ AI response generated in ${responseTime}ms`)

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        module: module || 'general',
        tokensUsed,
        responseTime,
        requestId,
        suggestions: activeModule ? activeModule.prompts.slice(0, 3) : []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    const totalTime = Date.now() - startTime
    console.error(`[${requestId}] ❌ Error after ${totalTime}ms:`, error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'AI processing failed',
        requestId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

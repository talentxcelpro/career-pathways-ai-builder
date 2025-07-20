import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

console.log('🚀 AI Gateway function initializing...')
console.log('OpenAI API Key configured:', !!openAIApiKey)
console.log('Supabase URL configured:', !!supabaseUrl)
console.log('Service Key configured:', !!supabaseServiceKey)

Deno.serve(async (req) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID().substring(0, 8)
  
  console.log(`[${requestId}] 📨 Incoming ${req.method} request to AI Gateway`)
  console.log(`[${requestId}] 🔗 Request URL: ${req.url}`)
  console.log(`[${requestId}] 📋 Request headers:`, Object.fromEntries(req.headers.entries()))
  
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] ✅ Handling CORS preflight request`)
    return new Response(null, { headers: corsHeaders })
  }

  // Health check endpoint
  if (req.method === 'GET') {
    console.log(`[${requestId}] 🏥 Health check requested`)
    return new Response(
      JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        requestId: requestId,
        openAI: !!openAIApiKey,
        supabase: !!supabaseUrl,
        processingTime: Date.now() - startTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    console.log(`[${requestId}] 🚀 Processing AI Gateway request`)
    
    if (!openAIApiKey) {
      console.error(`[${requestId}] ❌ OpenAI API key not configured`)
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    let requestBody;
    try {
      const rawBody = await req.text()
      console.log(`[${requestId}] 📝 Raw request body:`, rawBody)
      
      requestBody = JSON.parse(rawBody)
      console.log(`[${requestId}] 📋 Parsed request body:`, { toolSlug: requestBody.toolSlug, hasInputData: !!requestBody.inputData })
    } catch (error) {
      console.error(`[${requestId}] ❌ Failed to parse request body:`, error)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { toolSlug, inputData, requestMetadata } = requestBody
    console.log(`[${requestId}] 🔧 Processing tool: ${toolSlug}`)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get tool configuration
    console.log(`[${requestId}] 🔍 Fetching tool configuration...`)
    const { data: toolConfig, error: configError } = await supabase
      .from('ai_tools_config')
      .select('*')
      .eq('tool_slug', toolSlug)
      .eq('is_enabled', true)
      .single()

    if (configError || !toolConfig) {
      console.error(`[${requestId}] ❌ Tool ${toolSlug} not found or disabled:`, configError)
      return new Response(
        JSON.stringify({ success: false, error: `AI tool ${toolSlug} not found or disabled` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    console.log(`[${requestId}] ✅ Tool config found: ${toolConfig.tool_name}`)

    // Prepare the prompt based on tool type
    let prompt = ''
    let systemMessage = toolConfig.system_message || 'You are a helpful AI assistant.'

    switch (toolSlug) {
      case 'resume-enhancer':
        prompt = `${toolConfig.prompt_template}

Resume Content:
Summary: ${inputData.summary || 'Not provided'}
Experience: ${inputData.experience || 'Not provided'}
Skills: ${inputData.skills || 'Not provided'}
Education: ${inputData.education || 'Not provided'}

Please enhance this resume content to be more professional, ATS-friendly, and impactful.`
        break

      case 'ats-optimizer':
        prompt = `${toolConfig.prompt_template}

Resume to optimize: ${JSON.stringify(inputData.resumeContent)}
${inputData.jobDescription ? `Job Description: ${inputData.jobDescription}` : ''}

Please optimize this resume for ATS compatibility.`
        break

      case 'career-advisor':
        // Handle TalentXcel Agent chat requests with enhanced module-specific functionality
        if (inputData.query && inputData.module) {
          const modulePrompts: Record<string, string> = {
            'network': `You are TalentXcel's Network AI Assistant. Your core responsibilities:
- Smart feed curation and content generation suggestions
- Connection recommendations based on mutual interests and career goals
- Post sentiment analysis and engagement optimization
- Profile optimization tips for better networking
- LinkedIn strategy and networking event preparation

Provide actionable networking advice with specific, measurable suggestions.`,

            'jobs': `You are TalentXcel's Jobs AI Assistant. Your core responsibilities:
- Intelligent job matching based on skills, experience, and preferences
- Smart Apply suggestions with success probability
- Job description parsing and resume tailoring recommendations
- Interview Q&A preparation with role-specific questions
- Salary negotiation guidance and market insights

Focus on practical job search strategies and concrete next steps.`,

            'employer': `You are TalentXcel's Employer AI Assistant. Your core responsibilities:
- Job description generation with industry best practices
- Candidate ranking and screening recommendations
- Interview questions generator based on role requirements
- Hiring process optimization and employer branding
- Team building and talent acquisition strategies

Provide strategic hiring insights and actionable recruitment guidance.`,

            'companies': `You are TalentXcel's Company Intelligence AI Assistant. Your core responsibilities:
- AI-powered company insights and market analysis
- Culture match analysis and workplace compatibility
- Role recommendations within target companies
- Company reviews summarization and sentiment analysis
- Competitive landscape and growth trend analysis

Deliver comprehensive company intelligence with strategic insights.`,

            'resume-builder': `You are TalentXcel's Resume Builder AI Assistant. Your core responsibilities:
- Resume feedback and optimization recommendations
- Auto-generation of content from user profiles or job descriptions
- ATS optimization with keyword and formatting guidance
- AI-enhanced summary writing and achievement quantification
- Industry-specific resume customization

Provide specific, actionable resume improvement strategies.`,

            'tools': `You are TalentXcel's Career Tools AI Assistant. Your core responsibilities:
- AI-enhanced skill assessments and gap analysis
- Psychometric interpretation and career guidance
- AI-powered document generation (CV, Cover Letters, Portfolios)
- Career assessment tools and decision frameworks
- Performance optimization and professional development planning

Focus on analytical insights and strategic career development.`,

            'services': `You are TalentXcel's Services AI Assistant. Your core responsibilities:
- Personalized service recommendations (resume writing, mock interviews, coaching)
- Intelligent upsell suggestions based on user activity and needs
- Service matching based on career goals and current challenges
- ROI analysis for professional development investments
- Custom service packages for specific career situations

Provide tailored service recommendations with clear value propositions.`,

            'learning': `You are TalentXcel's Learning AI Assistant. Your core responsibilities:
- Career path planning with skill development roadmaps
- Skill gap analysis based on target roles and market demands
- Course recommendations with personalized learning paths
- Certification suggestions for career advancement
- Learning progress tracking and milestone setting

Create structured learning strategies with measurable outcomes.`,

            'colleges': `You are TalentXcel's College Advisory AI Assistant. Your core responsibilities:
- Suggest top institutions based on career goals and preferences
- Compare programs with detailed analysis and rankings
- Help with Statement of Purpose (SOP) writing and application strategies
- Application Q&A and admission guidance
- Scholarship and funding opportunity identification

Provide comprehensive educational guidance with strategic insights.`,

            'career-map': `You are TalentXcel's Career Map AI Assistant. Your core responsibilities:
- Generate detailed 5-year career roadmaps with milestones
- Recommend skills and roles for career progression
- Milestone tracking and progress assessment
- Career diagnostics and strategic planning
- Future skills prediction and market trend analysis

Focus on long-term strategic career planning with actionable steps.`,

            'general': `You are TalentXcel's General AI Assistant. Provide comprehensive career guidance across all platform modules. Help users navigate the platform, understand features, and get started with their career development journey.`
          };
          
          systemMessage = modulePrompts[inputData.module] || modulePrompts['general'];
          
          let contextPrompt = '';
          if (inputData.conversationHistory && inputData.conversationHistory.length > 0) {
            contextPrompt = '\n\nConversation History:\n' + 
              inputData.conversationHistory
                .slice(-3)
                .map((msg: any) => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
                .join('\n');
          }
          
          // Add user context if available
          let userContext = '';
          if (inputData.context && inputData.context.userProfile) {
            userContext = `\n\nUser Context:
- Role: ${inputData.context.userProfile.user_role || 'Not specified'}
- Experience: ${inputData.context.userProfile.experience_level || 'Not specified'}
- Industry: ${inputData.context.userProfile.industry || 'Not specified'}
- Goals: ${inputData.context.userProfile.career_goals || 'Not specified'}`;
          }
          
          prompt = `User Query (${inputData.module} module): "${inputData.query}"

Provide helpful, actionable advice that's:
- Specific and practical with concrete next steps
- Professional and encouraging
- Tailored to their ${inputData.module} needs
- Includes relevant examples or templates when appropriate
- Considers their subscription tier for feature recommendations

Keep responses comprehensive but well-structured (3-5 paragraphs max with bullet points for actions).${userContext}${contextPrompt}`;
        } else {
          // Legacy career advisor functionality
          prompt = `${toolConfig.prompt_template}

User Profile: ${JSON.stringify(inputData.userProfile)}
${inputData.targetRole ? `Target Role: ${inputData.targetRole}` : ''}

Please provide career guidance and recommendations.`;
        }
        break

      case 'salary-analyzer':
        prompt = `${toolConfig.prompt_template}

Role: ${inputData.role}
Location: ${inputData.location}
Experience Level: ${inputData.experience} years

Please provide salary analysis and market insights.`
        break

      default:
        prompt = `${toolConfig.prompt_template}\n\nInput: ${JSON.stringify(inputData)}`
    }

    console.log(`[${requestId}] 🤖 Calling OpenAI API...`)
    const openAIStartTime = Date.now()

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: toolConfig.model_name || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    const responseTime = Date.now() - openAIStartTime
    console.log(`[${requestId}] ⏱️ OpenAI response time: ${responseTime}ms`)

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error(`[${requestId}] ❌ OpenAI API error:`, errorText)
      throw new Error(`OpenAI API error: ${openAIResponse.status} ${errorText}`)
    }

    const openAIData = await openAIResponse.json()
    const generatedContent = openAIData.choices[0]?.message?.content

    if (!generatedContent) {
      throw new Error('No content generated by OpenAI')
    }

    console.log(`[${requestId}] ✅ AI content generated successfully`)

    // Calculate usage metrics
    const tokensUsed = openAIData.usage?.total_tokens || 0
    const estimatedCost = (tokensUsed / 1000) * 0.01 // Rough estimate

    // Prepare response data based on tool type
    let responseData: any = generatedContent

    if (toolSlug === 'resume-enhancer') {
      try {
        const parsed = JSON.parse(generatedContent)
        responseData = parsed
      } catch {
        responseData = {
          summary: generatedContent.includes('Summary:') ? 
            generatedContent.split('Summary:')[1]?.split('Experience:')[0]?.trim() : inputData.summary,
          experience: generatedContent.includes('Experience:') ? 
            generatedContent.split('Experience:')[1]?.split('Skills:')[0]?.trim() : inputData.experience,
          skills: generatedContent.includes('Skills:') ? 
            generatedContent.split('Skills:')[1]?.split('Education:')[0]?.trim() : inputData.skills,
          education: generatedContent.includes('Education:') ? 
            generatedContent.split('Education:')[1]?.trim() : inputData.education,
          enhanced_content: generatedContent
        }
      }
    }

    // Log usage to database
    try {
      await supabase.from('ai_usage_logs').insert({
        tool_slug: toolSlug,
        feature_type: requestMetadata?.category || 'general',
        request_type: 'ai_tool_invocation',
        request_data: inputData,
        response_data: responseData,
        success: true,
        tokens_used: tokensUsed,
        cost_estimate: estimatedCost,
        response_time: responseTime
      })
    } catch (logError) {
      console.warn(`[${requestId}] ⚠️ Failed to log usage:`, logError)
    }

    const totalTime = Date.now() - startTime
    console.log(`[${requestId}] 🎉 AI Gateway processing completed successfully in ${totalTime}ms`)

    return new Response(
      JSON.stringify({
        success: true,
        data: responseData,
        tokensUsed,
        cost: estimatedCost,
        responseTime,
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    const totalTime = Date.now() - startTime
    console.error(`[${requestId}] ❌ AI Gateway error after ${totalTime}ms:`, error)
    
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

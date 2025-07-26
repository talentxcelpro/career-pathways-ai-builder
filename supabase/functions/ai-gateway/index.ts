import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Enhanced AI prompt templates
const ENHANCED_PROMPTS = {
  'professional-summary': `You are a professional resume writer. Write a concise, high-impact professional summary for a resume.

Context:
- Job Title: {{job_title}}
- Years of Experience: {{years_experience}}
- Core Skills: {{skills}}
- Industry: {{industry}}
- Career Goal: {{goal}}

Instructions:
- Keep it 2–4 sentences
- Focus on achievements and value
- Use active, confident language
- Include relevant keywords for ATS optimization

Return response in JSON format: {"summary": "your generated summary"}`,

  'experience-enhancer': `You are an expert resume coach. Convert the following job role into 3–5 impactful resume bullet points.

Job Title: {{job_title}}
Company: {{company}}
Duration: {{duration}}
Key Responsibilities: {{responsibilities}}
Key Achievements: {{achievements}}

Instructions:
- Use strong action verbs (Led, Implemented, Optimized, etc.)
- Quantify results whenever possible (e.g., "Improved X by Y%")
- Match keywords for {{target_industry}} roles
- Focus on impact and results

Return response in JSON format: {"bulletPoints": ["bullet 1", "bullet 2", "bullet 3"]}`,

  'skills-optimizer': `You are a resume expert. Based on the following resume and job description, suggest a list of 10–12 hard and soft skills that should be included to maximize job compatibility.

Resume Content: {{resume_text}}
Job Description: {{job_description}}
Target Role: {{target_role}}

Instructions:
- Separate into Technical Skills and Soft Skills
- Include industry-specific keywords
- Prioritize skills mentioned in the job description
- Suggest trending skills in the industry

Return response in JSON format: {"technicalSkills": ["skill1", "skill2"], "softSkills": ["skill1", "skill2"], "recommendations": ["reason1", "reason2"]}`,

  'ats-analyzer': `You are an ATS optimization expert. Compare this resume with the job description and provide detailed analysis.

Resume: {{resume_text}}
Job Description: {{job_description}}

Analyze and return a detailed compatibility report with:
- Compatibility score out of 100
- List of missing keywords
- Formatting issues
- 5 actionable suggestions to improve ATS score

Return response in JSON format: {
  "score": 75,
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}`
}

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

    // Enhanced prompt processing with template substitution
    let prompt = ''
    let systemMessage = toolConfig.system_message || 'You are a helpful AI assistant.'
    
    // Helper function to substitute template variables
    const substituteTemplate = (template: string, data: any): string => {
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || match;
      });
    };

    // Use enhanced prompts for better AI responses
    switch (toolSlug) {
      case 'professional-summary':
        prompt = substituteTemplate(ENHANCED_PROMPTS['professional-summary'], inputData);
        break;
        
      case 'experience-enhancer':
        prompt = substituteTemplate(ENHANCED_PROMPTS['experience-enhancer'], inputData);
        break;
        
      case 'skills-optimizer':
        prompt = substituteTemplate(ENHANCED_PROMPTS['skills-optimizer'], inputData);
        break;
        
      case 'ats-analyzer':
        prompt = substituteTemplate(ENHANCED_PROMPTS['ats-analyzer'], inputData);
        break;

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
        prompt = `${toolConfig.prompt_template}

User Profile: ${JSON.stringify(inputData.userProfile)}
${inputData.targetRole ? `Target Role: ${inputData.targetRole}` : ''}

Please provide career guidance and recommendations.`
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

    // Enhanced response processing for structured output
    let responseData: any = generatedContent

    // Parse JSON responses from enhanced prompts
    const jsonResponseTools = ['professional-summary', 'experience-enhancer', 'skills-optimizer', 'ats-analyzer'];
    
    if (jsonResponseTools.includes(toolSlug)) {
      try {
        // Extract JSON from AI response (handles cases where AI adds extra text)
        const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          responseData = JSON.parse(jsonMatch[0]);
        } else {
          responseData = JSON.parse(generatedContent);
        }
      } catch (parseError) {
        console.warn(`[${requestId}] ⚠️ Failed to parse JSON response, using raw content`);
        responseData = {
          content: generatedContent,
          parseError: 'Failed to parse structured response'
        };
      }
    } else if (toolSlug === 'resume-enhancer') {
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

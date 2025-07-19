import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIToolRequest {
  toolSlug: string;
  inputData: any;
  toolConfig?: any;
  adminInputs?: any[];
  requestMetadata?: any;
}

interface AdminInput {
  id: string;
  title: string;
  input_type: string;
  content: any;
  category: string;
  tool_slug: string;
  priority: number;
}

interface ToolConfig {
  tool_slug: string;
  tool_name: string;
  model_name: string;
  system_message: string;
  prompt_template: string;
  temperature: number;
  max_tokens: number;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody: AIToolRequest = await req.json()
    const { toolSlug, inputData, requestMetadata } = requestBody

    console.log(`Processing AI request for tool: ${toolSlug}`)

    // Get tool configuration if not provided
    let toolConfig = requestBody.toolConfig
    if (!toolConfig) {
      const { data: configData, error: configError } = await supabase
        .from('ai_tools_config')
        .select('*')
        .eq('tool_slug', toolSlug)
        .eq('is_enabled', true)
        .single()

      if (configError || !configData) {
        throw new Error(`AI tool ${toolSlug} not found or disabled`)
      }
      toolConfig = configData
    }

    // Get admin inputs if not provided
    let adminInputs = requestBody.adminInputs
    if (!adminInputs) {
      const { data: inputsData, error: inputsError } = await supabase
        .from('ai_admin_inputs')
        .select('*')
        .eq('tool_slug', toolSlug)
        .eq('is_active', true)
        .order('priority', { ascending: false })

      adminInputs = inputsData || []
    }

    // Get OpenAI API key
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Build prompt from admin inputs and tool config
    const systemPrompt = buildSystemPrompt(toolConfig, adminInputs)
    const userPrompt = buildUserPrompt(toolSlug, inputData, adminInputs)

    console.log(`System prompt: ${systemPrompt.substring(0, 200)}...`)
    console.log(`User prompt: ${userPrompt.substring(0, 200)}...`)

    // Call OpenAI API
    const startTime = Date.now()
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: toolConfig.model_name || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: toolConfig.temperature || 0.7,
        max_tokens: toolConfig.max_tokens || 2000,
      }),
    })

    const endTime = Date.now()
    const responseTime = endTime - startTime

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const openAIData = await response.json()
    
    if (!openAIData.choices || !openAIData.choices[0]) {
      throw new Error('Invalid response from OpenAI API')
    }

    const content = openAIData.choices[0].message.content
    const tokensUsed = openAIData.usage?.total_tokens || 0
    const cost = calculateCost(tokensUsed, toolConfig.model_name)

    // Parse the AI response based on tool type
    const parsedData = parseAIResponse(toolSlug, content)

    // Update AI features status
    await supabase.rpc('update_ai_feature_status', {
      p_module_name: toolConfig.category || 'general',
      p_feature_key: toolSlug,
      p_success: true,
      p_response_time: responseTime
    })

    console.log(`AI request completed successfully for ${toolSlug}`)

    return new Response(JSON.stringify({
      success: true,
      data: parsedData,
      metadata: {
        tokensUsed,
        cost,
        responseTime,
        model: toolConfig.model_name,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('AI Gateway error:', error)

    // Try to update status on error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      const body = await req.clone().json()
      if (body.toolSlug) {
        await supabase.rpc('update_ai_feature_status', {
          p_module_name: body.requestMetadata?.category || 'general',
          p_feature_key: body.toolSlug,
          p_success: false,
          p_error_message: error.message
        })
      }
    } catch (statusError) {
      console.warn('Failed to update error status:', statusError)
    }

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'AI processing failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function buildSystemPrompt(toolConfig: ToolConfig, adminInputs: AdminInput[]): string {
  let systemPrompt = toolConfig.system_message || 'You are a helpful AI assistant.'

  // Add system prompts from admin inputs
  const systemInputs = adminInputs.filter(input => input.input_type === 'system_prompt')
  for (const input of systemInputs) {
    if (input.content.system_message) {
      systemPrompt += '\n\n' + input.content.system_message
    }
  }

  return systemPrompt
}

function buildUserPrompt(toolSlug: string, inputData: any, adminInputs: AdminInput[]): string {
  let userPrompt = ''

  // Get template inputs
  const templateInputs = adminInputs.filter(input => 
    input.input_type.includes('template') || input.input_type.includes('criteria')
  )

  // Build prompt based on tool type
  switch (toolSlug) {
    case 'resume-enhancer':
      userPrompt = buildResumeEnhancementPrompt(inputData, templateInputs)
      break
    case 'ats-optimizer':
      userPrompt = buildATSOptimizationPrompt(inputData, templateInputs)
      break
    case 'cover-letter-generator':
      userPrompt = buildCoverLetterPrompt(inputData, templateInputs)
      break
    case 'career-advisor':
      userPrompt = buildCareerAdvisorPrompt(inputData, templateInputs)
      break
    case 'interview-prep':
      userPrompt = buildInterviewPrepPrompt(inputData, templateInputs)
      break
    case 'salary-analyzer':
      userPrompt = buildSalaryAnalysisPrompt(inputData, templateInputs)
      break
    default:
      userPrompt = JSON.stringify(inputData)
  }

  return userPrompt
}

function buildResumeEnhancementPrompt(inputData: any, templates: AdminInput[]): string {
  const sectionTemplate = templates.find(t => t.input_type === 'section_template')
  
  let prompt = 'Please enhance the following resume content:\n\n'
  
  if (inputData.summary) prompt += `Summary: ${inputData.summary}\n\n`
  if (inputData.experience) prompt += `Experience: ${inputData.experience}\n\n`
  if (inputData.skills) prompt += `Skills: ${inputData.skills}\n\n`
  if (inputData.education) prompt += `Education: ${inputData.education}\n\n`

  if (sectionTemplate?.content) {
    prompt += '\nEnhancement Guidelines:\n'
    if (sectionTemplate.content.experience) {
      prompt += `Experience: ${sectionTemplate.content.experience}\n`
    }
    if (sectionTemplate.content.skills) {
      prompt += `Skills: ${sectionTemplate.content.skills}\n`
    }
    if (sectionTemplate.content.summary) {
      prompt += `Summary: ${sectionTemplate.content.summary}\n`
    }
  }

  prompt += '\nReturn the enhanced content in JSON format with the same section names.'
  
  return prompt
}

function buildATSOptimizationPrompt(inputData: any, templates: AdminInput[]): string {
  const optimizationTemplate = templates.find(t => t.input_type === 'optimization_template')
  
  let prompt = 'Optimize the following resume for ATS compatibility:\n\n'
  prompt += `Resume Content: ${JSON.stringify(inputData.resumeContent)}\n\n`
  
  if (inputData.jobDescription) {
    prompt += `Job Description: ${inputData.jobDescription}\n\n`
  }

  if (optimizationTemplate?.content.template) {
    prompt += `Optimization Guidelines: ${optimizationTemplate.content.template}\n\n`
  }

  prompt += 'Return the optimized resume in JSON format with improved ATS compatibility.'
  
  return prompt
}

function buildCoverLetterPrompt(inputData: any, templates: AdminInput[]): string {
  const letterTemplate = templates.find(t => t.input_type === 'letter_template')
  
  let prompt = 'Generate a professional cover letter based on:\n\n'
  prompt += `Resume: ${JSON.stringify(inputData.resumeContent)}\n\n`
  prompt += `Job Information: ${JSON.stringify(inputData.jobData)}\n\n`

  if (letterTemplate?.content.structure) {
    prompt += `Structure: ${letterTemplate.content.structure.join(', ')}\n`
  }
  if (letterTemplate?.content.tone) {
    prompt += `Tone: ${letterTemplate.content.tone}\n`
  }

  prompt += '\nReturn a professional cover letter in plain text format.'
  
  return prompt
}

function buildCareerAdvisorPrompt(inputData: any, templates: AdminInput[]): string {
  const analysisTemplate = templates.find(t => t.input_type === 'analysis_template')
  
  let prompt = 'Provide career guidance for:\n\n'
  prompt += `User Profile: ${JSON.stringify(inputData.userProfile)}\n\n`
  
  if (inputData.targetRole) {
    prompt += `Target Role: ${inputData.targetRole}\n\n`
  }

  if (analysisTemplate?.content.template) {
    prompt += `Analysis Framework: ${analysisTemplate.content.template}\n\n`
  }

  prompt += 'Return career recommendations in JSON format with actionable steps.'
  
  return prompt
}

function buildInterviewPrepPrompt(inputData: any, templates: AdminInput[]): string {
  const questionTemplate = templates.find(t => t.input_type === 'question_template')
  
  let prompt = 'Generate interview preparation materials for:\n\n'
  prompt += `Job: ${JSON.stringify(inputData.jobData)}\n\n`
  prompt += `Candidate: ${JSON.stringify(inputData.userProfile)}\n\n`

  if (questionTemplate?.content) {
    prompt += `Question Guidelines: ${JSON.stringify(questionTemplate.content)}\n\n`
  }

  prompt += 'Return interview questions and preparation tips in JSON format.'
  
  return prompt
}

function buildSalaryAnalysisPrompt(inputData: any, templates: AdminInput[]): string {
  const analysisTemplate = templates.find(t => t.input_type === 'salary_analysis')
  
  let prompt = 'Analyze salary data for:\n\n'
  prompt += `Role: ${inputData.role}\n`
  prompt += `Location: ${inputData.location}\n`
  prompt += `Experience: ${inputData.experience} years\n\n`

  if (analysisTemplate?.content.data_sources) {
    prompt += `Analysis Sources: ${analysisTemplate.content.data_sources.join(', ')}\n\n`
  }

  prompt += 'Return salary analysis in JSON format with ranges and market insights.'
  
  return prompt
}

function parseAIResponse(toolSlug: string, content: string): any {
  try {
    // Try to parse as JSON first
    return JSON.parse(content)
  } catch {
    // If not JSON, return based on tool type
    switch (toolSlug) {
      case 'cover-letter-generator':
        return { coverLetter: content }
      case 'resume-enhancer':
        // Try to extract sections from text
        return {
          summary: content.includes('Summary:') ? content.split('Summary:')[1]?.split('\n\n')[0]?.trim() : content,
          experience: content.includes('Experience:') ? content.split('Experience:')[1]?.split('\n\n')[0]?.trim() : '',
          skills: content.includes('Skills:') ? content.split('Skills:')[1]?.split('\n\n')[0]?.trim() : '',
          education: content.includes('Education:') ? content.split('Education:')[1]?.split('\n\n')[0]?.trim() : ''
        }
      default:
        return { response: content }
    }
  }
}

function calculateCost(tokens: number, model: string): number {
  // Rough cost estimation - update with actual OpenAI pricing
  const costPer1kTokens = model.includes('gpt-4') ? 0.03 : 0.002
  return (tokens / 1000) * costPer1kTokens
}
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface AIRequest {
  module: string;
  task: string;
  input: any;
  userId?: string;
  deploymentId?: string;
}

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  requestId?: string;
}

// Log AI request
async function logAIRequest(
  deploymentId: string,
  userId: string | null,
  requestType: string,
  inputData: any,
  outputData: any,
  responseTime: number,
  success: boolean,
  errorMessage?: string,
  tokensUsed?: number,
  costEstimate?: number
) {
  try {
    const { error } = await supabase
      .from('ai_request_logs')
      .insert({
        deployment_id: deploymentId,
        user_id: userId,
        request_type: requestType,
        input_data: inputData,
        output_data: outputData,
        response_time_ms: responseTime,
        success,
        error_message: errorMessage,
        tokens_used: tokensUsed || 0,
        cost_estimate: costEstimate || 0
      });

    if (error) {
      console.error('Error logging AI request:', error);
    }
  } catch (error) {
    console.error('Failed to log AI request:', error);
  }
}

// Get deployment for module and task
async function getDeployment(module: string, task: string) {
  const { data, error } = await supabase
    .from('ai_deployments')
    .select(`
      *,
      ai_models (
        model_name,
        model_version,
        task_type,
        api_endpoint,
        model_config
      )
    `)
    .eq('module_name', module)
    .eq('is_live', true)
    .single();

  if (error) {
    console.error('Error fetching deployment:', error);
    return null;
  }

  return data;
}

// AI Service implementations
async function processResumeScore(input: any, deployment: any): Promise<any> {
  const { resumeText, jobDescription } = input;
  
  const prompt = `
    Analyze this resume and provide a comprehensive score and feedback:
    
    Resume: ${resumeText}
    ${jobDescription ? `Job Description: ${jobDescription}` : ''}
    
    Please provide:
    1. Overall score (0-100)
    2. ATS compatibility score (0-100)
    3. Key strengths (array)
    4. Areas for improvement (array)
    5. Missing keywords (array)
    6. Suggestions for improvement (array)
    
    Format the response as JSON.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are an expert resume analyst and career coach. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: deployment.ai_models.model_config.max_tokens || 1000,
      temperature: deployment.ai_models.model_config.temperature || 0.3
    }),
  });

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens || 0,
    costEstimate: (data.usage?.total_tokens || 0) * 0.00001 // Rough estimate
  };
}

async function processJobMatch(input: any, deployment: any): Promise<any> {
  const { userProfile, jobListings, preferences } = input;
  
  const prompt = `
    Match this user profile with the following job listings and rank them by relevance:
    
    User Profile: ${JSON.stringify(userProfile)}
    Job Listings: ${JSON.stringify(jobListings)}
    Preferences: ${JSON.stringify(preferences)}
    
    Please provide:
    1. Ranked job matches with scores (0-100)
    2. Matching factors for each job
    3. Skill gaps analysis
    4. Salary comparison
    5. Recommendations
    
    Format the response as JSON.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are an expert job matching specialist. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: deployment.ai_models.model_config.max_tokens || 2000,
      temperature: deployment.ai_models.model_config.temperature || 0.5
    }),
  });

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens || 0,
    costEstimate: (data.usage?.total_tokens || 0) * 0.00001
  };
}

async function processCareerPath(input: any, deployment: any): Promise<any> {
  const { currentRole, targetRole, skills, experience, timeframe } = input;
  
  const prompt = `
    Create a detailed career path from ${currentRole} to ${targetRole}:
    
    Current Role: ${currentRole}
    Target Role: ${targetRole}
    Current Skills: ${JSON.stringify(skills)}
    Experience: ${experience}
    Timeframe: ${timeframe}
    
    Please provide:
    1. Step-by-step career progression plan
    2. Required skills for each step
    3. Recommended courses/certifications
    4. Timeline milestones
    5. Potential challenges and solutions
    6. Salary progression estimates
    
    Format the response as JSON.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are an expert career counselor and strategist. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: deployment.ai_models.model_config.max_tokens || 1500,
      temperature: deployment.ai_models.model_config.temperature || 0.4
    }),
  });

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens || 0,
    costEstimate: (data.usage?.total_tokens || 0) * 0.00001
  };
}

async function processCourseRecommend(input: any, deployment: any): Promise<any> {
  const { userProfile, careerGoals, skillGaps, learningPreferences } = input;
  
  const prompt = `
    Recommend courses based on this user profile and career goals:
    
    User Profile: ${JSON.stringify(userProfile)}
    Career Goals: ${JSON.stringify(careerGoals)}
    Skill Gaps: ${JSON.stringify(skillGaps)}
    Learning Preferences: ${JSON.stringify(learningPreferences)}
    
    Please provide:
    1. Recommended courses with priorities
    2. Learning path sequence
    3. Estimated completion time
    4. Prerequisites for each course
    5. Alternative learning resources
    6. Cost-benefit analysis
    
    Format the response as JSON.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are an expert learning advisor and course curator. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: deployment.ai_models.model_config.max_tokens || 1200,
      temperature: deployment.ai_models.model_config.temperature || 0.3
    }),
  });

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens || 0,
    costEstimate: (data.usage?.total_tokens || 0) * 0.00001
  };
}

async function processJDGenerate(input: any, deployment: any): Promise<any> {
  const { jobTitle, companyInfo, requirements, benefits } = input;
  
  const prompt = `
    Generate a comprehensive job description:
    
    Job Title: ${jobTitle}
    Company Info: ${JSON.stringify(companyInfo)}
    Requirements: ${JSON.stringify(requirements)}
    Benefits: ${JSON.stringify(benefits)}
    
    Please provide:
    1. Complete job description
    2. Key responsibilities
    3. Required qualifications
    4. Preferred qualifications
    5. Company culture fit
    6. Growth opportunities
    
    Format the response as JSON with proper structure.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are an expert HR professional and job description writer. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: deployment.ai_models.model_config.max_tokens || 2000,
      temperature: deployment.ai_models.model_config.temperature || 0.6
    }),
  });

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens || 0,
    costEstimate: (data.usage?.total_tokens || 0) * 0.00001
  };
}

// Main AI processing function
async function processAIRequest(request: AIRequest): Promise<AIResponse> {
  const startTime = Date.now();
  
  try {
    // Get deployment configuration
    const deployment = await getDeployment(request.module, request.task);
    if (!deployment) {
      return {
        success: false,
        error: `No active deployment found for module: ${request.module}, task: ${request.task}`
      };
    }

    let result;
    
    // Route to appropriate AI service based on module and task
    switch (`${request.module}:${request.task}`) {
      case 'resume_builder:score':
        result = await processResumeScore(request.input, deployment);
        break;
      case 'jobs:match':
        result = await processJobMatch(request.input, deployment);
        break;
      case 'career_map:generate':
        result = await processCareerPath(request.input, deployment);
        break;
      case 'learning:recommend':
        result = await processCourseRecommend(request.input, deployment);
        break;
      case 'employer:generate_jd':
        result = await processJDGenerate(request.input, deployment);
        break;
      default:
        return {
          success: false,
          error: `Unsupported module:task combination: ${request.module}:${request.task}`
        };
    }

    const responseTime = Date.now() - startTime;
    
    // Log the request
    await logAIRequest(
      deployment.id,
      request.userId || null,
      `${request.module}:${request.task}`,
      request.input,
      result.content,
      responseTime,
      true,
      undefined,
      result.tokensUsed,
      result.costEstimate
    );

    return {
      success: true,
      data: result.content,
      requestId: crypto.randomUUID()
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('AI processing error:', error);
    
    // Log the error
    if (request.deploymentId) {
      await logAIRequest(
        request.deploymentId,
        request.userId || null,
        `${request.module}:${request.task}`,
        request.input,
        null,
        responseTime,
        false,
        error.message
      );
    }

    return {
      success: false,
      error: error.message || 'Internal server error'
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const aiRequest: AIRequest = await req.json();
    
    // Validate request
    if (!aiRequest.module || !aiRequest.task || !aiRequest.input) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: module, task, input'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const response = await processAIRequest(aiRequest);
    
    return new Response(
      JSON.stringify(response),
      {
        status: response.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Request processing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid request format'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
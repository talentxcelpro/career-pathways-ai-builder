import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Utility function for retrying API calls
async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      console.log(`API call attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error('Max retries reached');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let requestId = crypto.randomUUID();
  
  console.log(`🚀 [${requestId}] AI Agent function started`);
  console.log(`🔍 [${requestId}] Request method: ${req.method}`);
  console.log(`🔍 [${requestId}] Request URL: ${req.url}`);
  
  try {
    // Enhanced startup validation with detailed logging
    console.log(`🔑 [${requestId}] Checking environment variables...`);
    
    if (!openAIApiKey) {
      console.error(`❌ [${requestId}] CRITICAL: OpenAI API key not found in environment`);
      console.error(`❌ [${requestId}] Available env vars: ${Object.keys(Deno.env.toObject()).join(', ')}`);
      return new Response(JSON.stringify({
        success: false,
        error: 'AI service configuration error - OpenAI API key missing',
        requestId: requestId,
        debug: 'OpenAI API key not found in environment variables'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`✅ [${requestId}] OpenAI API key found: ${openAIApiKey.substring(0, 10)}...`);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(`❌ [${requestId}] CRITICAL: Supabase configuration missing`);
      console.error(`❌ [${requestId}] Supabase URL: ${supabaseUrl ? 'found' : 'missing'}`);
      console.error(`❌ [${requestId}] Supabase Service Key: ${supabaseServiceKey ? 'found' : 'missing'}`);
      return new Response(JSON.stringify({
        success: false,
        error: 'Database configuration error',
        requestId: requestId,
        debug: 'Supabase configuration missing'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`✅ [${requestId}] Supabase configuration found`);
    console.log(`✅ [${requestId}] All environment variables validated successfully`);
    // Continue with the main request processing
    console.log(`🚀 [${requestId}] New AI Agent request received`);
    
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error(`❌ [${requestId}] Invalid JSON in request body:`, parseError);
      throw new Error('Invalid request format');
    }

    const { module, task, input, userId, prompt } = requestBody;
    
    console.log(`📋 [${requestId}] Request details:`, {
      module,
      task,
      inputKeys: Object.keys(input || {}),
      userId: userId || 'anonymous',
      promptLength: prompt?.length || 0,
      hasPrompt: !!prompt
    });

    // Handle diagnostic test requests
    if (module === 'test' && task === 'ping') {
      console.log(`🧪 [${requestId}] Diagnostic ping request received`);
      return new Response(JSON.stringify({
        success: true,
        response: 'AI Agent function is working properly',
        data: {
          message: 'AI Agent function is working properly',
          timestamp: new Date().toISOString(),
          requestId: requestId,
          processingTime: Date.now() - startTime
        },
        requestId: requestId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate required fields
    if (!module || !task) {
      throw new Error('Missing required fields: module and task are required');
    }


    let systemMessage = '';
    let userMessage = prompt || '';

    // Handle chat messages with direct prompt
    if (task === 'chat' && prompt) {
      userMessage = prompt;
    }

    // Module-specific AI prompts and logic
    switch (module) {
      case 'network':
        systemMessage = 'You are a professional networking AI assistant helping users build meaningful connections, create engaging content, and grow their professional network.';
        if (task === 'generate_post') {
          userMessage = `Generate a professional LinkedIn-style post about: ${input.topic}. Make it engaging and include relevant hashtags.`;
        } else if (task === 'suggest_connections') {
          userMessage = `Based on the user's profile in ${input.industry}, suggest types of professionals they should connect with and why.`;
        }
        break;

      case 'jobs':
        systemMessage = 'You are a career AI assistant specializing in job search, resume optimization, and interview preparation.';
        if (task === 'match_jobs') {
          userMessage = `Based on this user profile: ${input.profile}, suggest how to improve job search strategy and what types of roles to target.`;
        } else if (task === 'interview_prep') {
          userMessage = `Generate 5 common interview questions for a ${input.role} position and provide sample answers.`;
        }
        break;

      case 'resume_builder':
        systemMessage = 'You are a resume optimization AI that helps create ATS-friendly, professional resumes.';
        if (task === 'optimize') {
          userMessage = `Review and provide suggestions to improve this resume for ATS optimization: ${input.resumeText}`;
        } else if (task === 'generate_summary') {
          userMessage = `Create a professional summary for a ${input.role} with ${input.experience} years of experience in ${input.industry}.`;
        }
        break;

      case 'employer':
        systemMessage = 'You are an HR AI assistant helping employers with recruitment, job descriptions, and candidate evaluation.';
        if (task === 'generate_jd') {
          userMessage = `Create a comprehensive job description for: ${input.jobTitle} at a ${input.companyType} company. Include responsibilities, requirements, and benefits.`;
        }
        break;

      case 'career_map':
        systemMessage = 'You are a career guidance AI that helps plan career paths, identify skill gaps, and set professional goals.';
        if (task === 'generate_roadmap') {
          userMessage = `Create a 5-year career roadmap from ${input.currentRole} to ${input.targetRole}. Include skills needed, milestones, and timeline.`;
        }
        break;

      case 'learning':
        systemMessage = 'You are an educational AI assistant that recommends courses, certifications, and learning paths.';
        if (task === 'recommend_courses') {
          userMessage = `Recommend learning resources and courses for someone wanting to transition from ${input.currentField} to ${input.targetField}.`;
        }
        break;

      case 'colleges':
        systemMessage = 'You are an educational counselor AI helping with college selection, applications, and academic planning.';
        if (task === 'recommend_colleges') {
          userMessage = `Suggest colleges/universities for ${input.course} with preferences: ${input.preferences}`;
        }
        break;

      default:
        systemMessage = 'You are TalentXcel AI, a comprehensive career development assistant. Help users with career advice, job search strategies, resume optimization, and professional development.';
        
        // If no specific prompt is provided for chat, use the task/input combination
        if (!userMessage && task === 'chat' && input?.message) {
          userMessage = input.message;
        } else if (!userMessage) {
          userMessage = `Help me with ${task} related to ${module}. Context: ${JSON.stringify(input)}`;
        }
    }

    console.log(`🤖 [${requestId}] Calling OpenAI with:`, {
      model: 'gpt-4o-mini',
      systemMessageLength: systemMessage.length,
      userMessageLength: userMessage.length
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [${requestId}] OpenAI API error:`, response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error(`❌ [${requestId}] No response content from OpenAI:`, data);
      throw new Error('No response generated by AI');
    }

    console.log(`✅ [${requestId}] OpenAI response received:`, {
      responseLength: aiResponse.length,
      tokensUsed: data.usage?.total_tokens || 0
    });

    const processingTime = Date.now() - startTime;

    // Log usage for analytics
    try {
      if (userId) {
        await supabase.from('ai_usage_logs').insert({
          user_id: userId,
          module_name: module,
          feature_type: task,
          request_type: 'ai_agent',
          tokens_used: data.usage?.total_tokens || 0,
          success: true,
          response_time: processingTime,
          operation_id: requestId
        });
      }
    } catch (logError) {
      console.error(`⚠️ [${requestId}] Failed to log usage:`, logError);
      // Don't fail the request if logging fails
    }

    const successResponse = {
      success: true,
      response: aiResponse,
      data: aiResponse, // Include both for compatibility
      tokens_used: data.usage?.total_tokens || 0,
      requestId: requestId,
      processingTime: processingTime
    };

    console.log(`✅ [${requestId}] Success response:`, {
      success: true,
      responseLength: aiResponse.length,
      tokensUsed: data.usage?.total_tokens || 0,
      processingTime: processingTime
    });

    return new Response(JSON.stringify(successResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`💥 [${requestId}] AI Agent error:`, error);
    
    // Log failed requests for analytics
    try {
      if (req.url && userId) {
        await supabase.from('ai_usage_logs').insert({
          user_id: userId,
          module_name: module || 'unknown',
          feature_type: task || 'unknown',
          request_type: 'ai_agent',
          tokens_used: 0,
          success: false,
          response_time: processingTime,
          operation_id: requestId,
          error_message: error.message
        });
      }
    } catch (logError) {
      console.error(`⚠️ [${requestId}] Failed to log error:`, logError);
    }

    const errorResponse = {
      success: false,
      error: error.message,
      requestId: requestId,
      processingTime: processingTime
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

// Simple rate limiting for anonymous users
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

console.log('🚀 Enhanced Resume Function Starting...');

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8);
  const startTime = Date.now();
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  console.log(`📍 [${requestId}] Request received: ${req.method} ${req.url} at ${new Date().toISOString()} from ${clientIP}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${requestId}] CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === 'GET') {
    console.log(`💚 [${requestId}] Health check requested`);
    const healthStatus = {
      status: "healthy",
      openaiConfigured: !!openaiApiKey,
      deepseekConfigured: !!deepseekApiKey,
      providersAvailable: [
        ...(openaiApiKey ? ['openai'] : []),
        ...(deepseekApiKey ? ['deepseek'] : [])
      ],
      timestamp: new Date().toISOString(),
      requestId,
      service: "enhance-resume",
      version: "1.0.0",
      rateLimitStatus: 'enabled',
      authRequired: false
    };
    
    console.log(`✅ [${requestId}] Health check successful:`, healthStatus);
    return new Response(JSON.stringify(healthStatus), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check rate limit for POST requests
  if (req.method === 'POST' && !checkRateLimit(clientIP)) {
    console.log(`⚠️ [${requestId}] Rate limit exceeded for IP: ${clientIP}`);
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please wait a moment before trying again.',
      retryAfter: 60
    }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    console.log(`📥 [${requestId}] Request body received:`, { 
      hasText: !!body.text,
      hasExtractedData: !!body.extractedData,
      hasUserPrompt: !!body.userPrompt,
      hasSummary: !!body.summary,
      hasExperience: !!body.experience,
      hasSkills: !!body.skills,
      hasEducation: !!body.education,
      sectionType: body.sectionType,
      provider: body.provider || body.aiProvider,
      enhancementType: body.enhancementType
    });

    // Extract content based on request format
    let content = '';
    let enhancementType = 'general';
    
    if (body.text) {
      // ChatGPT-style format with direct text
      content = body.text;
      enhancementType = 'full_resume';
    } else if (body.extractedData && body.userPrompt) {
      // ChatGPT interface format with extracted data + user prompt
      content = `${body.userPrompt}\n\nCurrent Resume Data:\n${JSON.stringify(body.extractedData, null, 2)}`;
      enhancementType = body.enhancementType || 'complete_rewrite';
    } else if (body.sectionType) {
      // Section-specific format
      enhancementType = body.sectionType;
      switch (body.sectionType) {
        case 'summary':
          content = body.summary || '';
          break;
        case 'experience':
          content = body.experience || '';
          break;
        case 'skills':
          content = body.skills || '';
          break;
        case 'education':
          content = body.education || '';
          break;
        default:
          content = JSON.stringify({
            summary: body.summary,
            experience: body.experience,
            skills: body.skills,
            education: body.education
          });
      }
    } else {
      // Legacy format - enhance all sections
      content = JSON.stringify({
        summary: body.summary,
        experience: body.experience,
        skills: body.skills,
        education: body.education
      });
      enhancementType = 'all_sections';
    }

    if (!content || content.trim() === '' || content === '{}') {
      console.log(`❌ [${requestId}] No content provided for enhancement`);
      return new Response(
        JSON.stringify({ error: 'No content provided for enhancement' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine provider priority
    const requestedProvider = body.provider || body.aiProvider;
    let primaryProvider = 'deepseek'; // Default to DeepSeek (cost-effective)
    let fallbackProvider = 'openai';
    
    if (requestedProvider === 'openai') {
      primaryProvider = 'openai';
      fallbackProvider = 'deepseek';
    }

    console.log(`🤖 [${requestId}] Using provider strategy: ${primaryProvider} -> ${fallbackProvider}`);

    // Create prompt based on enhancement type
    let prompt = '';
    let systemMessage = 'You are a professional resume enhancement AI. Improve the provided content to be more compelling, professional, and ATS-friendly while maintaining accuracy.';
    
    if (enhancementType === 'full_resume') {
      systemMessage = 'You are a professional resume enhancement AI. Analyze and improve the entire resume text provided, making it more compelling, professional, and ATS-friendly while maintaining all original information.';
      prompt = `Please enhance this resume text to be more professional, compelling, and ATS-friendly:\n\n${content}`;
    } else if (enhancementType === 'complete_rewrite') {
      systemMessage = 'You are a professional resume enhancement AI. Based on the user prompt and resume data provided, create a complete, enhanced resume that is professional, compelling, and ATS-friendly.';
      prompt = content; // Content already includes user prompt + resume data
    } else if (body.sectionType) {
      const sectionPrompts = {
        summary: `Enhance this professional summary to be more compelling and keyword-rich:\n\n${content}`,
        experience: `Improve this work experience section with stronger action verbs and quantified achievements:\n\n${content}`,
        skills: `Optimize this skills section for ATS compatibility and professional presentation:\n\n${content}`,
        education: `Enhance this education section with proper formatting and relevant details:\n\n${content}`
      };
      prompt = sectionPrompts[body.sectionType] || `Enhance this ${body.sectionType} section:\n\n${content}`;
    } else {
      // Multi-section enhancement
      systemMessage = 'You are a professional resume enhancement AI. Improve each section provided to be more compelling, professional, and ATS-friendly. Return the enhanced content in the same JSON structure.';
      prompt = `Please enhance each section of this resume data. Return the response in the same JSON structure:\n\n${content}`;
    }

    // Try primary provider first
    let result = await callAIProvider(primaryProvider, systemMessage, prompt, requestId);
    
    // If primary fails and we have a fallback, try it
    if (!result && fallbackProvider !== primaryProvider) {
      console.log(`🔄 [${requestId}] Primary provider failed, trying fallback: ${fallbackProvider}`);
      result = await callAIProvider(fallbackProvider, systemMessage, prompt, requestId);
    }

    if (!result) {
      console.log(`❌ [${requestId}] All providers failed`);
      return new Response(
        JSON.stringify({ error: 'AI enhancement service temporarily unavailable. Please try again later.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ [${requestId}] Enhancement completed successfully in ${processingTime}ms`);

    // Format response based on request type
    let response;
    if (enhancementType === 'full_resume') {
      response = { enhancedText: result };
    } else if (enhancementType === 'complete_rewrite') {
      response = { enhancedText: result, originalRequest: body.userPrompt };
    } else if (body.sectionType) {
      response = { [body.sectionType]: result };
    } else {
      try {
        // Try to parse as JSON for multi-section response
        const parsedResult = JSON.parse(result);
        response = parsedResult;
      } catch {
        // If parsing fails, return as enhanced text
        response = { enhancedText: result };
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Error in enhance-resume function after ${processingTime}ms:`, error);
    
    // Provide specific error messages based on error type
    let errorMessage = 'Resume enhancement failed';
    let statusCode = 500;
    
    if (error.message?.includes('fetch')) {
      errorMessage = 'AI service temporarily unavailable';
      statusCode = 503;
    } else if (error.message?.includes('JSON')) {
      errorMessage = 'Invalid request format';
      statusCode = 400;
    } else if (error.message?.includes('API key')) {
      errorMessage = 'AI service configuration error';
      statusCode = 502;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: Deno.env.get('NODE_ENV') === 'development' ? error.message : undefined,
      requestId,
      timestamp: new Date().toISOString(),
      processingTime
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function callAIProvider(provider: string, systemMessage: string, prompt: string, requestId: string): Promise<string | null> {
  try {
    if (provider === 'deepseek' && deepseekApiKey) {
      console.log(`🔮 [${requestId}] Calling DeepSeek API`);
      
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        console.log(`❌ [${requestId}] DeepSeek API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        console.log(`✅ [${requestId}] DeepSeek API success`);
        return content;
      } else {
        console.log(`❌ [${requestId}] DeepSeek API returned no content`);
        return null;
      }
    }
    
    if (provider === 'openai' && openaiApiKey) {
      console.log(`🧠 [${requestId}] Calling OpenAI API`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        console.log(`❌ [${requestId}] OpenAI API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        console.log(`✅ [${requestId}] OpenAI API success`);
        return content;
      } else {
        console.log(`❌ [${requestId}] OpenAI API returned no content`);
        return null;
      }
    }
    
    console.log(`❌ [${requestId}] No API key available for provider: ${provider}`);
    return null;
    
  } catch (error) {
    console.error(`❌ [${requestId}] Error calling ${provider}:`, error);
    return null;
  }
}
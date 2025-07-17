import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id, x-user-id',
};

console.log('🚀 AI Resume Enhancement function starting...');

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  
  console.log(`📍 [${requestId}] Request received: ${method} ${url} at ${timestamp}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${requestId}] CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint for connectivity testing
  if (req.method === 'GET') {
    console.log(`💚 [${requestId}] Health check requested`);
    try {
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
      const health = {
        status: 'healthy',
        openaiConfigured: !!openAIApiKey,
        deepseekConfigured: !!deepseekApiKey,
        providersAvailable: [
          ...(openAIApiKey ? ['openai'] : []),
          ...(deepseekApiKey ? ['deepseek'] : [])
        ],
        timestamp,
        requestId,
        service: 'ai-resume-enhancement',
        version: '3.0.0'
      };
      console.log(`✅ [${requestId}] Health check successful:`, health);
      return new Response(JSON.stringify(health), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error(`❌ [${requestId}] Health check failed:`, error);
      return new Response(JSON.stringify({ 
        status: 'unhealthy', 
        error: error.message,
        timestamp,
        requestId
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Only allow POST requests for enhancement
  if (req.method !== 'POST') {
    console.log(`❌ [${requestId}] Method not allowed: ${req.method}`);
    return new Response(JSON.stringify({ 
      error: 'Method not allowed',
      requestId,
      timestamp 
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log(`📝 [${requestId}] Processing resume enhancement request...`);
    
    // Get API keys for both providers
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    console.log(`🔑 [${requestId}] API keys status:`, {
      openai: !!openAIApiKey,
      deepseek: !!deepseekApiKey
    });
    
    if (!openAIApiKey && !deepseekApiKey) {
      console.error(`❌ [${requestId}] No AI API keys found`);
      throw new Error('No AI API keys configured. Please add OPENAI_API_KEY or DEEPSEEK_API_KEY');
    }
    
    // Parse request body with detailed logging
    let body;
    try {
      const rawBody = await req.text();
      console.log(`📏 [${requestId}] Request body size: ${rawBody.length} characters`);
      
      body = JSON.parse(rawBody);
      console.log(`📋 [${requestId}] Request body parsed successfully`);
      console.log(`🔍 [${requestId}] Request details:`, {
        hasExtractedData: !!body.extractedData,
        hasUserPrompt: !!body.userPrompt,
        enhancementType: body.enhancementType,
        clientRequestId: body.requestId
      });
    } catch (error) {
      console.error(`❌ [${requestId}] Invalid JSON in request body:`, error);
      throw new Error('Invalid JSON in request body');
    }
    
    const { 
      prompt, 
      resumeData, 
      category,
      extractedData, 
      userPrompt, 
      enhancementType = 'complete_rewrite',
      aiProvider = 'auto' // 'openai', 'deepseek', or 'auto'
    } = body;

    // Handle ChatGPT-style enhancement
    if (extractedData && userPrompt) {
      console.log(`🎯 [${requestId}] Processing ChatGPT-style enhancement`);
      
      const systemPrompt = `You are an expert resume writer and career coach. Your task is to enhance and rewrite resumes based on user requests while maintaining professionalism and ATS optimization.

Create a COMPLETE, PROFESSIONAL resume that matches the user's request. Use the extracted data as foundation but enhance and expand it significantly.

Return ONLY a valid JSON object with this structure:
{
  "success": true,
  "enhancedResume": {
    "personalInfo": {
      "fullName": "string",
      "email": "string", 
      "phone": "string",
      "location": "string",
      "summary": "string (3-4 sentences professional summary)",
      "linkedin": "string (optional)",
      "confidence": 0.9
    },
    "experience": [
      {
        "title": "string",
        "company": "string",
        "location": "string",
        "startDate": "string (MM/YYYY)",
        "endDate": "string (MM/YYYY or Present)",
        "description": "string",
        "achievements": ["string", "string"],
        "confidence": 0.9
      }
    ],
    "education": [
      {
        "degree": "string",
        "school": "string",
        "location": "string",
        "startDate": "string",
        "endDate": "string",
        "confidence": 0.9
      }
    ],
    "skills": {
      "technical": [{"skill": "string", "proficiency": "Expert|Advanced|Intermediate"}],
      "soft": [{"skill": "string", "proficiency": "Expert|Advanced|Intermediate"}],
      "confidence": 0.9
    },
    "atsOptimization": {
      "score": 85,
      "suggestions": []
    },
    "metadata": {
      "fileName": "Enhanced Resume",
      "extractionTimestamp": "${new Date().toISOString()}"
    }
  }
}`;

      const userMessage = `EXTRACTED RESUME DATA:
${JSON.stringify(extractedData, null, 2)}

USER REQUEST:
${userPrompt}

Please enhance this resume according to the user's request. Create a complete, professional, and ATS-optimized resume.`;

      // Determine which AI provider to use
      let selectedProvider = aiProvider;
      let apiKey = '';
      let apiUrl = '';
      let model = '';
      
      if (selectedProvider === 'auto') {
        // Priority: DeepSeek (cheaper) -> OpenAI (fallback)
        if (deepseekApiKey) {
          selectedProvider = 'deepseek';
        } else if (openAIApiKey) {
          selectedProvider = 'openai';
        } else {
          throw new Error('No AI providers available');
        }
      }
      
      if (selectedProvider === 'deepseek' && deepseekApiKey) {
        apiKey = deepseekApiKey;
        apiUrl = 'https://api.deepseek.com/chat/completions';
        model = 'deepseek-chat';
      } else if (selectedProvider === 'openai' && openAIApiKey) {
        apiKey = openAIApiKey;
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        model = 'gpt-4o-mini';
      } else {
        throw new Error(`${selectedProvider} API key not configured`);
      }

      console.log(`📤 [${requestId}] Sending request to ${selectedProvider.toUpperCase()} (${model})...`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [${requestId}] ${selectedProvider.toUpperCase()} API error:`, response.status, errorText);
        
        // Try fallback provider if auto mode and primary failed
        if (aiProvider === 'auto' && selectedProvider === 'deepseek' && openAIApiKey) {
          console.log(`🔄 [${requestId}] Falling back to OpenAI...`);
          
          const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
              ],
              temperature: 0.7,
              max_tokens: 3000,
            }),
          });
          
          if (!fallbackResponse.ok) {
            throw new Error(`Both providers failed. Last error: ${response.status}`);
          }
          
          const aiResponse = await fallbackResponse.json();
          console.log(`📥 [${requestId}] Fallback OpenAI response received`);
          const enhancedContent = aiResponse.choices[0].message.content;
          
          // Parse and return fallback response
          let parsedResponse;
          try {
            const jsonMatch = enhancedContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedResponse = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('No JSON found in fallback response');
            }
          } catch (parseError) {
            console.error(`❌ [${requestId}] Failed to parse fallback AI response:`, parseError);
            throw new Error('Failed to parse fallback AI response');
          }

          if (!parsedResponse.success || !parsedResponse.enhancedResume) {
            throw new Error('Invalid fallback response structure from AI');
          }

          // Add provider info to response
          parsedResponse.provider = 'openai';
          parsedResponse.fallbackUsed = true;

          console.log(`✅ [${requestId}] Fallback enhancement completed successfully`);
          return new Response(JSON.stringify(parsedResponse), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        throw new Error(`${selectedProvider.toUpperCase()} API error: ${response.status}`);
      }

      const aiResponse = await response.json();
      console.log(`📥 [${requestId}] ${selectedProvider.toUpperCase()} response received`);

      const enhancedContent = aiResponse.choices[0].message.content;
      
      // Parse JSON response
      let parsedResponse;
      try {
        const jsonMatch = enhancedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error(`❌ [${requestId}] Failed to parse AI response:`, parseError);
        throw new Error('Failed to parse AI response');
      }

      if (!parsedResponse.success || !parsedResponse.enhancedResume) {
        throw new Error('Invalid response structure from AI');
      }

      // Add provider info to response
      parsedResponse.provider = selectedProvider;
      parsedResponse.fallbackUsed = false;

      console.log(`✅ [${requestId}] Enhancement completed successfully with ${selectedProvider.toUpperCase()}`);
      return new Response(JSON.stringify(parsedResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle legacy enhancement format
    console.log(`📝 [${requestId}] Processing legacy enhancement (category: ${category})`);
    
    let systemPrompt = 'You are a resume enhancement expert. Improve the provided resume content while maintaining the same JSON structure.';
    
    if (category === 'ats') {
      systemPrompt = 'You are an ATS optimization expert. Add industry keywords, action verbs, and measurable results to improve ATS compatibility.';
    } else if (category === 'achievements') {
      systemPrompt = 'You are a results-focused strategist. Transform all responsibilities into quantified achievements with metrics and business impact.';
    } else if (category === 'professional') {
      systemPrompt = 'You are a professional writing expert. Elevate the language to executive level and improve overall professionalism.';
    }

    // Determine provider for legacy format
    let legacyProvider = aiProvider;
    let legacyApiKey = '';
    let legacyApiUrl = '';
    let legacyModel = '';
    
    if (legacyProvider === 'auto') {
      if (deepseekApiKey) {
        legacyProvider = 'deepseek';
      } else if (openAIApiKey) {
        legacyProvider = 'openai';
      }
    }
    
    if (legacyProvider === 'deepseek' && deepseekApiKey) {
      legacyApiKey = deepseekApiKey;
      legacyApiUrl = 'https://api.deepseek.com/chat/completions';
      legacyModel = 'deepseek-chat';
    } else {
      legacyApiKey = openAIApiKey;
      legacyApiUrl = 'https://api.openai.com/v1/chat/completions';
      legacyModel = 'gpt-4o-mini';
    }

    const legacyPrompt = `${prompt}\n\nResume Data:\n${resumeData}\n\nPlease enhance this resume data and return it in the exact same JSON structure while improving content quality.`;

    const response = await fetch(legacyApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${legacyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: legacyModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: legacyPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ [${requestId}] ${legacyProvider.toUpperCase()} API error:`, errorData);
      throw new Error(`AI enhancement failed: ${response.status}`);
    }

    const data = await response.json();
    const enhancement = data.choices[0].message.content;

    console.log(`✅ [${requestId}] Legacy enhancement completed with ${legacyProvider.toUpperCase()}`);
    return new Response(
      JSON.stringify({ 
        enhancement,
        category,
        success: true,
        requestId,
        provider: legacyProvider
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`💥 [${requestId}] Enhancement error:`, error);
    
    let userFriendlyError = error.message;
    if (error.message.includes('API key')) {
      userFriendlyError = 'AI service configuration issue. Please contact support.';
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      userFriendlyError = 'Network connection issue. Please try again.';
    }

    return new Response(
      JSON.stringify({ 
        error: userFriendlyError,
        success: false,
        requestId,
        retryable: !error.message.includes('API key')
      }),
      { 
        status: error.message.includes('API key') ? 503 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

console.log('✅ AI Resume Enhancement function ready');
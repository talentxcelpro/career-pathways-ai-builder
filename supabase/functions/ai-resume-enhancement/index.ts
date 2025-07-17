import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🚀 AI Resume Enhancement function starting...');

serve(async (req) => {
  console.log(`📍 Request received: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === 'GET') {
    console.log('🏥 Health check request received');
    try {
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      const health = {
        status: 'healthy',
        openaiConfigured: !!openAIApiKey,
        timestamp: new Date().toISOString(),
        service: 'ai-resume-enhancement'
      };
      console.log('✅ Health check successful:', health);
      return new Response(JSON.stringify(health), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return new Response(JSON.stringify({ 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Main enhancement logic
  const requestId = crypto.randomUUID();
  console.log(`🚀 [${requestId}] Enhancement request received`);

  try {
    // Validate OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error(`❌ [${requestId}] OpenAI API key not configured`);
      throw new Error('OpenAI API key not configured');
    }

    // Parse request body
    const body = await req.json();
    console.log(`📋 [${requestId}] Request parsed successfully`);
    
    const { 
      prompt, 
      resumeData, 
      category,
      extractedData, 
      userPrompt, 
      enhancementType = 'complete_rewrite' 
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

      console.log(`📤 [${requestId}] Sending request to OpenAI...`);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [${requestId}] OpenAI API error:`, response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const aiResponse = await response.json();
      console.log(`📥 [${requestId}] OpenAI response received`);

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

      console.log(`✅ [${requestId}] Enhancement completed successfully`);
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

    const legacyPrompt = `${prompt}\n\nResume Data:\n${resumeData}\n\nPlease enhance this resume data and return it in the exact same JSON structure while improving content quality.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
      console.error(`❌ [${requestId}] OpenAI API error:`, errorData);
      throw new Error(`AI enhancement failed: ${response.status}`);
    }

    const data = await response.json();
    const enhancement = data.choices[0].message.content;

    console.log(`✅ [${requestId}] Legacy enhancement completed`);
    return new Response(
      JSON.stringify({ 
        enhancement,
        category,
        success: true,
        requestId
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
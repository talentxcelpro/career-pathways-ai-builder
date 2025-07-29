import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('=== Function called ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('Processing POST request');
    
    // Parse request body
    const body = await req.json();
    console.log('Request body:', body);
    
    const { botId, category, contentType = 'post', prompt } = body;
    
    if (!botId || !category) {
      console.log('Missing required fields');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: botId and category' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check for DeepSeek API key
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      console.log('DeepSeek API key not found');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'DeepSeek API key not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Calling DeepSeek API...');
    
    // Call DeepSeek API
    const enhancedPrompt = prompt || `Create a professional ${contentType} about ${category} for TalentXcel platform users. Make it engaging and valuable for career development.`;
    
    const apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional content creator for TalentXcel, a career development platform. Create engaging, valuable content for professionals.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('DeepSeek API error:', errorText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `DeepSeek API error: ${apiResponse.status}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const apiData = await apiResponse.json();
    console.log('DeepSeek API response received');
    
    const generatedContent = apiData.choices[0].message.content;
    
    // Parse title and content
    const lines = generatedContent.split('\n').filter(line => line.trim());
    const title = lines[0].replace(/^(Title:|#)\s*/, '').trim() || `${category} - Professional Insights`;
    const content = lines.slice(1).join('\n').trim() || generatedContent;

    const response = {
      success: true,
      content: {
        id: crypto.randomUUID(),
        title,
        content,
        content_type: contentType,
        status: 'draft',
        bot_id: botId,
        meta_data: {
          category,
          ai_generated: true
        },
        created_at: new Date().toISOString()
      }
    };

    console.log('Sending successful response');
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
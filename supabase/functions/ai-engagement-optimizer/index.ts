import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, postType, targetAudience } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert content strategist who optimizes social media posts for maximum engagement. 
            Your goal is to improve posts by:
            1. Adding compelling hooks at the beginning
            2. Including call-to-actions
            3. Structuring content for readability
            4. Adding engagement-driving questions
            5. Maintaining professional tone
            
            Return response in JSON format: {"optimizedContent": "improved content here", "improvements": ["list of changes made"]}`
          },
          {
            role: 'user',
            content: `Optimize this ${postType} content for ${targetAudience} audience to maximize engagement:
            
            Original content: "${content}"
            
            Make it more engaging while keeping it professional and authentic.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response from AI
    let optimizationData;
    try {
      optimizationData = JSON.parse(aiResponse);
    } catch (e) {
      // Fallback if AI doesn't return valid JSON
      optimizationData = {
        optimizedContent: content + '\n\nWhat are your thoughts on this? Share your experience in the comments! 👇',
        improvements: ['Added call-to-action', 'Included engagement question']
      };
    }

    console.log('Content optimized for engagement:', optimizationData);

    return new Response(JSON.stringify(optimizationData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-engagement-optimizer function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        optimizedContent: content,
        improvements: []
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
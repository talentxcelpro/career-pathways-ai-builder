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
    const { content, industry, trendingTopics } = await req.json();

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
            content: `You are an expert at generating relevant hashtags for professional social media content. 
            Generate hashtags that are:
            1. Relevant to the content and industry
            2. Mix of popular and niche hashtags
            3. Professional and appropriate
            4. Currently trending (if requested)
            
            Return response in JSON format: {"hashtags": ["#hashtag1", "#hashtag2", ...]}`
          },
          {
            role: 'user',
            content: `Generate 5-8 relevant hashtags for this professional content:
            
            Content: "${content}"
            Industry: "${industry}"
            Include trending topics: ${trendingTopics}
            
            Focus on professional networking, career growth, and industry-specific terms.`
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response from AI
    let hashtagData;
    try {
      hashtagData = JSON.parse(aiResponse);
    } catch (e) {
      // Fallback hashtags if AI doesn't return valid JSON
      hashtagData = {
        hashtags: ['#professional', '#career', '#networking', '#growth', '#industry']
      };
    }

    console.log('AI Hashtags generated:', hashtagData);

    return new Response(JSON.stringify(hashtagData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-hashtag-generator function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        hashtags: ['#professional', '#networking']
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
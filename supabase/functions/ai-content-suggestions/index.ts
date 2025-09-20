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
    const { content, topic, userProfile } = await req.json();

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
            content: `You are an AI assistant that helps professionals create engaging LinkedIn-style content. 
            Generate content suggestions based on the user's profile and industry. 
            Return suggestions in this JSON format:
            {
              "suggestions": [
                {
                  "type": "caption|hashtags|engagement|timing",
                  "title": "suggestion title",
                  "suggestion": "actual suggestion content",
                  "confidence": 0.85
                }
              ]
            }`
          },
          {
            role: 'user',
            content: `Create content suggestions for:
            Content: "${content}"
            Topic: "${topic}"
            User Title: "${userProfile?.title || ''}"
            Industry: "${userProfile?.industry || ''}"
            Skills: ${JSON.stringify(userProfile?.skills || [])}
            
            Please provide 3-4 diverse suggestions including caption improvements, relevant hashtags, engagement tactics, and optimal timing recommendations.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response from AI
    let suggestions;
    try {
      suggestions = JSON.parse(aiResponse);
    } catch (e) {
      // Fallback if AI doesn't return valid JSON
      suggestions = {
        suggestions: [
          {
            type: 'caption',
            title: 'Engagement Boost',
            suggestion: content + ' What are your thoughts on this?',
            confidence: 0.8
          }
        ]
      };
    }

    console.log('AI Content Suggestions generated:', suggestions);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-content-suggestions function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        suggestions: [] 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
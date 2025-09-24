import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('🎫 Creating ephemeral token for WebRTC connection');

    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: `You are an expert AI Career Coach with deep knowledge across all industries, roles, and career development strategies. Your role is to provide personalized, actionable career guidance that helps professionals achieve their goals.

Key capabilities:
- Career transition planning and strategy
- Salary negotiation techniques and market insights  
- Leadership development and skill building
- Industry trend analysis and future planning
- Interview preparation and job search optimization
- Personal branding and networking strategies
- Work-life balance and career satisfaction

Guidelines:
- Provide specific, actionable advice rather than generic suggestions
- Ask clarifying questions when needed to give better guidance
- Offer multiple perspectives and options when appropriate
- Include relevant industry insights and market trends
- Suggest concrete next steps and timelines
- Be encouraging while being realistic about challenges
- Tailor advice to the user's experience level and goals
- Keep responses conversational and engaging for voice chat
- Speak in a warm, professional, and supportive tone
- Use natural speech patterns for voice interaction

Remember: You're actively coaching someone's career development through natural voice conversation.`,
        modalities: ["text", "audio"],
        tools: [
          {
            type: "function",
            name: "get_career_insights",
            description: "Get personalized career insights and recommendations for the user",
            parameters: {
              type: "object",
              properties: {
                topic: { type: "string", description: "The career topic to provide insights on" },
                user_context: { type: "string", description: "User's current situation or context" }
              },
              required: ["topic"]
            }
          },
          {
            type: "function", 
            name: "analyze_market_trends",
            description: "Analyze current market trends for specific industries or roles",
            parameters: {
              type: "object",
              properties: {
                industry: { type: "string", description: "The industry to analyze" },
                role: { type: "string", description: "Specific role to focus on" }
              },
              required: ["industry"]
            }
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Ephemeral token created successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("❌ Error creating ephemeral token:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
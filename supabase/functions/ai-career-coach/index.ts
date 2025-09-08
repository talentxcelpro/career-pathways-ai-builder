import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, conversationHistory } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('AI Career Coach request:', { userId, message: message.substring(0, 100) + '...' });

    // Build conversation context
    const contextMessages = conversationHistory?.map((msg: any) => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) || [];

    const systemPrompt = `You are an expert AI Career Coach with deep knowledge across all industries, roles, and career development strategies. Your role is to provide personalized, actionable career guidance that helps professionals achieve their goals.

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

Response format:
- Provide clear, structured advice
- Include 2-4 follow-up suggestions for deeper exploration
- Mark responses as "actionable" when they contain specific steps
- Generate insights that can be tracked over time

Remember: You're not just answering questions, you're actively coaching someone's career development.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages.slice(-8), // Keep last 8 messages for context
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages,
        max_completion_tokens: 800,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Coach response generated successfully');

    // Generate dynamic suggestions based on the conversation topic
    const suggestionsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'Generate 3-4 relevant follow-up questions or topics based on the career coaching conversation. Make them specific and actionable. Return only a JSON array of strings.'
          },
          {
            role: 'user',
            content: `Previous question: "${message}"\nAI response: "${aiResponse}"\n\nGenerate follow-up suggestions:`
          }
        ],
        max_completion_tokens: 200
      }),
    });

    let suggestions = [
      "How to develop leadership skills?",
      "Industry salary benchmarks",
      "Building a professional network",
      "Career growth planning"
    ];

    let actionable = false;
    let insights = [];

    if (suggestionsResponse.ok) {
      try {
        const suggestionsData = await suggestionsResponse.json();
        const suggestionsText = suggestionsData.choices[0].message.content;
        const parsedSuggestions = JSON.parse(suggestionsText);
        if (Array.isArray(parsedSuggestions)) {
          suggestions = parsedSuggestions;
        }
      } catch (e) {
        console.log('Could not parse suggestions, using defaults');
      }
    }

    // Determine if response is actionable
    actionable = /(?:step|action|do|implement|start|begin|try|practice|apply|schedule|contact|research|update|create|develop)/i.test(aiResponse);

    // Extract key insights
    if (actionable) {
      insights.push('Actionable career guidance provided');
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      suggestions,
      actionable,
      insights,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI career coach function:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to generate coaching response',
      response: "I apologize, but I'm experiencing technical difficulties. In the meantime, here are some universal career tips: Focus on continuous learning, build meaningful professional relationships, regularly update your skills, and always be open to new opportunities. How can I help you with a specific career challenge?",
      suggestions: [
        "Tell me about skill development strategies",
        "Help with career transition planning", 
        "Advice on professional networking",
        "Industry trends and insights"
      ],
      actionable: true,
      insights: []
    }), {
      status: 200, // Return 200 with fallback response
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
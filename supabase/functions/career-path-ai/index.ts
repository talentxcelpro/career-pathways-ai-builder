import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, targetRole, currentRole, timeline } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate a comprehensive career path from ${currentRole} to ${targetRole} over ${timeline}.

Include:
1. 3-5 intermediate career steps with realistic progressions
2. Required skills and qualifications for each step
3. Estimated timeframes and salary ranges
4. Key skill gaps to address

Return as JSON:
{
  "steps": [
    {
      "id": "step1",
      "role": "Role Title",
      "description": "What this role involves",
      "duration": "1-2 years",
      "skills": ["skill1", "skill2"],
      "salary": {"min": 80, "max": 120}
    }
  ],
  "timeline": "3-5 years",
  "skillGaps": [
    {
      "skillName": "Skill Name",
      "currentLevel": 3,
      "targetLevel": 8,
      "priority": "high"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a career guidance expert providing realistic, actionable career progression paths.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ 
      success: true,
      ...result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in career-path-ai:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
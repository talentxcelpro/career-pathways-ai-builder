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
    const { action, currentRole, targetRole, skills, skillId } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (action === 'analyze_gaps') {
      const prompt = `Analyze skill gaps for career transition from ${currentRole} to ${targetRole}.

Current skills and levels: ${JSON.stringify(skills)}

Provide:
1. Target skill levels required for the role
2. Skill gaps and priorities
3. Market demand for each skill
4. Overall readiness assessment
5. Learning recommendations

Return as JSON:
{
  "skillAnalysis": [
    {
      "id": "skill1",
      "name": "JavaScript",
      "category": "technical",
      "currentLevel": 5,
      "targetLevel": 8,
      "gap": 3,
      "priority": "high",
      "marketDemand": "high"
    }
  ],
  "overallScore": 65,
  "readinessLevel": "partially-ready",
  "estimatedTime": "6-12 months"
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
            { role: 'system', content: 'You are a career and skills assessment expert providing detailed skill gap analysis.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
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
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Learning plan generated'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in skill-gap-ai:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
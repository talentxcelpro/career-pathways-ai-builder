
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeContent, targetRole, industry, experienceLevel } = await req.json();

    console.log('Generating personalized recommendations...');

    const recommendationPrompt = `
You are a career guidance expert. Based on the resume content and career goals, provide personalized recommendations.

Resume Content: ${JSON.stringify(resumeContent)}
Target Role: ${targetRole || 'Not specified'}
Industry: ${industry || 'Not specified'}
Experience Level: ${experienceLevel || 'Not specified'}

Provide recommendations in JSON format:
{
  "skillRecommendations": [
    { "skill": string, "reason": string, "priority": "high|medium|low", "learningResources": [string] }
  ],
  "careerPathSuggestions": [
    { "role": string, "description": string, "requiredSkills": [string], "timeline": string }
  ],
  "industryInsights": {
    "trends": [string],
    "opportunities": [string],
    "challenges": [string]
  },
  "networkingTips": [string],
  "certificationSuggestions": [
    { "certification": string, "provider": string, "relevance": string, "estimatedTime": string }
  ],
  "resumeOptimization": [
    { "section": string, "improvement": string, "impact": "high|medium|low" }
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
          { role: 'system', content: 'You are an expert career counselor with deep knowledge of industry trends and career development.' },
          { role: 'user', content: recommendationPrompt }
        ],
        temperature: 0.4,
      }),
    });

    const data = await response.json();
    const recommendations = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ success: true, recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Recommendation generation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      fallback: {
        skillRecommendations: [],
        careerPathSuggestions: [],
        industryInsights: { trends: [], opportunities: [], challenges: [] },
        networkingTips: [],
        certificationSuggestions: [],
        resumeOptimization: []
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

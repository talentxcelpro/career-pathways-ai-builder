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
    const { action, userProfile, targetRole, currentSkills, industryFocus } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('🛤️ Career roadmap request:', { action, targetRole });

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'generate_roadmap') {
      systemPrompt = `You are an expert career strategist and industry analyst. Create a comprehensive, actionable career roadmap based on the user's profile and target role.

Guidelines:
- Provide a realistic timeline with specific milestones
- Include skill development recommendations
- Suggest networking opportunities and industry connections
- Recommend certifications, courses, and learning resources
- Include market insights and salary progression
- Address potential challenges and how to overcome them
- Provide specific action items for each phase

Return structured JSON with this format:
{
  "roadmap": {
    "overview": "Brief summary of the career path",
    "timeline": "6 months to 2 years",
    "phases": [
      {
        "phase": "Foundation (Months 1-3)",
        "objectives": ["Objective 1", "Objective 2"],
        "skills_to_develop": ["Skill 1", "Skill 2"],
        "actions": ["Action 1", "Action 2"],
        "resources": ["Resource 1", "Resource 2"],
        "milestones": ["Milestone 1", "Milestone 2"]
      }
    ],
    "skill_gaps": ["Gap 1", "Gap 2"],
    "certifications": ["Cert 1", "Cert 2"],
    "networking_strategy": ["Strategy 1", "Strategy 2"],
    "market_insights": {
      "demand": "High/Medium/Low",
      "growth_rate": "15% annually",
      "avg_salary": "$85,000 - $120,000",
      "key_trends": ["Trend 1", "Trend 2"]
    },
    "success_metrics": ["Metric 1", "Metric 2"]
  }
}`;

      userPrompt = `User Profile: ${JSON.stringify(userProfile)}
Target Role: ${targetRole}
Current Skills: ${currentSkills.join(', ')}
Industry Focus: ${industryFocus}

Generate a comprehensive career roadmap for transitioning to this role.`;

    } else if (action === 'assess_skills') {
      systemPrompt = `You are a skills assessment expert. Evaluate the user's current skills against industry requirements and provide detailed analysis.

Return JSON with this format:
{
  "assessment": {
    "overall_score": 7.5,
    "skill_categories": {
      "technical_skills": {
        "score": 8,
        "strengths": ["Strength 1", "Strength 2"],
        "gaps": ["Gap 1", "Gap 2"]
      },
      "soft_skills": {
        "score": 7,
        "strengths": ["Strength 1", "Strength 2"],
        "gaps": ["Gap 1", "Gap 2"]
      }
    },
    "recommendations": ["Rec 1", "Rec 2"],
    "learning_priorities": ["Priority 1", "Priority 2"],
    "market_competitiveness": "Above average for mid-level positions"
  }
}`;

      userPrompt = `Current Skills: ${currentSkills.join(', ')}
Target Role: ${targetRole}
Industry: ${industryFocus}

Assess these skills against market requirements.`;

    } else if (action === 'generate_personal_brand') {
      systemPrompt = `You are a personal branding expert. Create a comprehensive personal branding strategy for the user's career goals.

Return JSON with this format:
{
  "brand_strategy": {
    "value_proposition": "Your unique value statement",
    "target_audience": ["Audience 1", "Audience 2"],
    "key_messages": ["Message 1", "Message 2"],
    "content_pillars": ["Pillar 1", "Pillar 2"],
    "linkedin_optimization": {
      "headline": "Optimized headline",
      "summary_points": ["Point 1", "Point 2"],
      "keywords": ["Keyword 1", "Keyword 2"]
    },
    "content_strategy": ["Strategy 1", "Strategy 2"],
    "networking_approach": ["Approach 1", "Approach 2"]
  }
}`;

      userPrompt = `User Profile: ${JSON.stringify(userProfile)}
Target Role: ${targetRole}
Industry: ${industryFocus}

Create a personal branding strategy.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let result = data.choices[0].message.content;

    try {
      result = JSON.parse(result);
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      result = { error: 'Failed to parse response' };
    }

    return new Response(JSON.stringify({
      success: true,
      data: result,
      action,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in career strategist:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      currentSkills,
      targetRole,
      industryFocus,
      userId 
    } = await req.json();

    if (!currentSkills || !targetRole) {
      throw new Error('Current skills and target role are required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing skills gap for:', { targetRole, industryFocus });

    const systemPrompt = `You are an expert skills analyst and career advisor. Analyze skill gaps between current abilities and target role requirements using market data and industry standards.

Provide detailed gap analysis with:
1. Critical missing skills (high priority)
2. Moderate gaps (medium priority) 
3. Skill overlaps (strengths to leverage)
4. Learning time estimates
5. Recommended learning paths
6. Market demand insights
7. Skill transferability analysis

Base recommendations on current job market trends and industry requirements.`;

    const userPrompt = `Analyze the skills gap for career transition:

CURRENT SKILLS:
${JSON.stringify(currentSkills, null, 2)}

TARGET ROLE: ${targetRole}
INDUSTRY FOCUS: ${industryFocus}

ANALYSIS REQUIREMENTS:
1. Identify critical skill gaps that are mandatory for the role
2. Assess moderate gaps that would be beneficial
3. Highlight transferable skills and strengths
4. Estimate learning time for each skill gap
5. Provide specific learning resources and paths
6. Include market demand data for skills
7. Rate urgency and importance of each gap

RESPONSE FORMAT:
{
  "gapAnalysis": {
    "overallScore": 0-100,
    "readinessLevel": "Not Ready|Somewhat Ready|Nearly Ready|Ready",
    "estimatedTimeToReadiness": "X months",
    "confidenceLevel": "High|Medium|Low"
  },
  "criticalGaps": [
    {
      "skillName": "skill name",
      "currentLevel": 0-5,
      "requiredLevel": 0-5,
      "gapSize": "Large|Medium|Small",
      "urgency": "Critical|High|Medium|Low",
      "marketDemand": "Very High|High|Medium|Low",
      "learningTimeEstimate": "X weeks/months",
      "recommendedResources": ["resource1", "resource2"],
      "certificationOptions": ["cert1", "cert2"]
    }
  ],
  "moderateGaps": [
    {
      "skillName": "skill name",
      "currentLevel": 0-5,
      "requiredLevel": 0-5,
      "importance": "High|Medium|Low",
      "learningTimeEstimate": "X weeks",
      "recommendedApproach": "courses|projects|practice"
    }
  ],
  "strengths": [
    {
      "skillName": "skill name",
      "currentLevel": 0-5,
      "marketValue": "Very High|High|Medium|Low",
      "transferability": "Direct|Moderate|Limited",
      "leverageOpportunities": ["opportunity1", "opportunity2"]
    }
  ],
  "learningPlan": {
    "phase1": {
      "focus": "Critical Skills",
      "duration": "X months",
      "skills": ["skill1", "skill2"],
      "recommendedApproach": "intensive|balanced|gradual"
    },
    "phase2": {
      "focus": "Supporting Skills",
      "duration": "X months",
      "skills": ["skill1", "skill2"],
      "recommendedApproach": "project-based|course-based"
    }
  },
  "marketInsights": {
    "skillDemandTrends": [
      {
        "skill": "skill name",
        "trend": "Growing|Stable|Declining",
        "demandLevel": "Very High|High|Medium|Low",
        "salaryImpact": "+$X to salary range"
      }
    ],
    "industryRequirements": ["requirement1", "requirement2"],
    "emergingSkills": ["skill1", "skill2"]
  },
  "recommendations": [
    {
      "priority": "High|Medium|Low",
      "action": "specific action to take",
      "timeline": "immediate|1-3 months|3-6 months",
      "resources": ["resource1", "resource2"],
      "expectedOutcome": "outcome description"
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
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 5000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let analysis;

    try {
      analysis = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse skills gap analysis');
    }

    console.log('Skills gap analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis,
        analyzedAt: new Date().toISOString(),
        metadata: {
          targetRole,
          industryFocus,
          skillsAnalyzed: currentSkills.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in skills gap analyzer:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

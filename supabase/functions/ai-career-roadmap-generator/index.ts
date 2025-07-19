
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
      currentRole, 
      targetRole, 
      experienceLevel, 
      currentSkills, 
      timeframe,
      learningPreferences,
      userId 
    } = await req.json();

    if (!currentRole || !targetRole) {
      throw new Error('Current role and target role are required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating AI career roadmap:', { currentRole, targetRole, experienceLevel });

    const systemPrompt = `You are an expert career advisor and roadmap architect. Create detailed, actionable career transition roadmaps following a proven 5-phase methodology.

ROADMAP STRUCTURE:
Phase 1: Foundation & Core Concepts (Weeks 1-8)
Phase 2: Hands-on Projects & Practice (Weeks 9-16)  
Phase 3: Advanced Skills & Specialization (Weeks 17-26)
Phase 4: Real-world Applications & Portfolio (Weeks 27-38)
Phase 5: Job Hunt & Career Transition (Weeks 39-52)

For each phase, provide:
- Weekly milestones and tasks
- Specific skills to develop
- Recommended courses/resources
- Hands-on projects
- Assessment criteria
- Time investment (hours/week)
- Success metrics

Make roadmaps personalized, realistic, and industry-relevant.`;

    const userPrompt = `Create a comprehensive 12-month career transition roadmap:

CURRENT SITUATION:
- Current Role: ${currentRole}
- Experience Level: ${experienceLevel}
- Current Skills: ${JSON.stringify(currentSkills)}

TARGET TRANSITION:
- Target Role: ${targetRole}
- Timeframe: ${timeframe} months
- Learning Style: ${learningPreferences}

REQUIREMENTS:
1. Create detailed 5-phase roadmap (52 weeks total)
2. Include specific weekly tasks and milestones
3. Recommend courses, certifications, and resources
4. Design hands-on projects for portfolio building
5. Provide skill progression tracking
6. Include market insights and salary expectations
7. Add networking and job search strategies

RESPONSE FORMAT:
{
  "roadmapSummary": {
    "title": "Career Transition: [Current] to [Target]",
    "duration": "${timeframe} months",
    "difficultyLevel": "Beginner|Intermediate|Advanced",
    "successProbability": "High|Medium|Low",
    "estimatedTimeInvestment": "X hours/week"
  },
  "phases": [
    {
      "phaseNumber": 1,
      "title": "Foundation & Core Concepts",
      "duration": "Weeks 1-8",
      "description": "Phase overview",
      "objectives": ["objective1", "objective2"],
      "weeklyPlan": [
        {
          "week": 1,
          "theme": "week theme",
          "tasks": ["task1", "task2"],
          "resources": ["resource1", "resource2"],
          "deliverables": ["deliverable1"],
          "timeInvestment": "X hours"
        }
      ]
    }
  ],
  "skillsRoadmap": [
    {
      "skillName": "skill name",
      "currentLevel": 0-5,
      "targetLevel": 0-5,
      "learningPath": ["step1", "step2"],
      "timeline": "weeks X-Y",
      "resources": ["resource1", "resource2"]
    }
  ],
  "projectPortfolio": [
    {
      "projectName": "project name",
      "description": "project description",
      "skillsDemonstrated": ["skill1", "skill2"],
      "timeline": "weeks X-Y",
      "complexity": "Beginner|Intermediate|Advanced"
    }
  ],
  "certifications": [
    {
      "name": "certification name",
      "provider": "provider name",
      "priority": "High|Medium|Low",
      "estimatedTime": "X hours",
      "cost": "$X",
      "timeline": "month X"
    }
  ],
  "marketInsights": {
    "averageSalary": "$X - $Y",
    "jobDemand": "High|Medium|Low",
    "topCompanies": ["company1", "company2"],
    "keySkillsInDemand": ["skill1", "skill2"],
    "industryTrends": ["trend1", "trend2"]
  },
  "successMetrics": [
    {
      "milestone": "milestone name",
      "timeline": "week X",
      "measurableOutcome": "specific outcome",
      "assessmentMethod": "how to measure"
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
        temperature: 0.4,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let roadmap;

    try {
      roadmap = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse roadmap generation');
    }

    console.log('AI roadmap generation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        roadmap,
        generatedAt: new Date().toISOString(),
        metadata: {
          currentRole,
          targetRole,
          experienceLevel,
          timeframe
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in roadmap generator:', error);
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

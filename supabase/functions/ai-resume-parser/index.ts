
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, userId } = await req.json();

    if (!resumeText) {
      throw new Error('Resume text is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing resume for career mapping analysis');

    const systemPrompt = `You are an expert career analyst and resume parser. Extract and enhance resume data for career mapping and roadmap generation.

Extract the following information with maximum accuracy:
1. Personal Information (name, email, phone, location)
2. Current Role & Experience Level
3. Skills (technical, soft skills, tools, technologies)
4. Work Experience (roles, companies, achievements, duration)
5. Education & Certifications
6. Projects & Accomplishments
7. Career Trajectory Analysis
8. Skill Proficiency Levels (1-5 scale)

Return structured JSON for career mapping system.`;

    const userPrompt = `Parse and analyze this resume for career mapping:

RESUME TEXT:
${resumeText}

REQUIREMENTS:
- Extract ALL skills with proficiency estimation
- Identify career progression patterns
- Suggest potential career paths based on experience
- Rate current experience level (Entry/Mid/Senior/Expert)
- Identify skill gaps for common career transitions
- Provide career trajectory insights

RETURN FORMAT:
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@domain.com",
    "phone": "phone number",
    "location": "city, country",
    "linkedIn": "linkedin profile if available"
  },
  "currentRole": {
    "title": "current job title",
    "experienceLevel": "Entry|Mid|Senior|Expert",
    "yearsExperience": number,
    "industry": "industry name"
  },
  "skills": {
    "technical": [
      {
        "name": "skill name",
        "proficiency": 1-5,
        "category": "Programming|Tools|Frameworks|Cloud|etc"
      }
    ],
    "soft": ["communication", "leadership", "etc"],
    "certifications": ["cert1", "cert2"]
  },
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "duration": "X years Y months",
      "achievements": ["achievement1", "achievement2"],
      "skillsUsed": ["skill1", "skill2"]
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "school name",
      "year": "graduation year"
    }
  ],
  "careerAnalysis": {
    "currentTrajectory": "description of career path",
    "potentialRoles": ["role1", "role2", "role3"],
    "careerStage": "Early|Growth|Peak|Transition",
    "recommendedPaths": [
      {
        "targetRole": "role name",
        "feasibility": "High|Medium|Low",
        "timeframe": "6-12 months|1-2 years|2+ years",
        "keySkillsNeeded": ["skill1", "skill2"]
      }
    ]
  }
}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout

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
        max_tokens: 4000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let parsedResume;

    try {
      parsedResume = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse resume analysis');
    }

    console.log('Resume parsing completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        parsedResume,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in resume parser:', error);
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


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`Resume title generator called: ${req.method} from ${req.headers.get('Origin')}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { resumeData, targetRole, industry, experience } = requestBody;

    console.log('Generating titles for:', { targetRole, industry, experience, hasResumeData: !!resumeData });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    // Handle null or undefined resume data
    if (!resumeData) {
      console.log('No resume data provided, returning sample titles');
      return new Response(
        JSON.stringify({ 
          success: true,
          titles: [
            {
              title: "Professional Seeking New Opportunities",
              reasoning: "Generic professional title suitable for any career level",
              atsScore: 65,
              keywords: ["Professional", "Opportunities"]
            },
            {
              title: "Motivated Professional | Ready for Next Challenge",
              reasoning: "Shows motivation and readiness for career advancement",
              atsScore: 70,
              keywords: ["Motivated", "Professional", "Challenge"]
            },
            {
              title: targetRole ? `${targetRole} | ${industry || 'Industry'} Professional` : "Experienced Professional",
              reasoning: targetRole ? "Incorporates target role and industry" : "Generic professional title",
              atsScore: targetRole ? 80 : 60,
              keywords: targetRole ? [targetRole, industry || 'Industry'] : ["Experienced", "Professional"]
            }
          ],
          recommendations: {
            bestTitle: targetRole ? `${targetRole} | ${industry || 'Industry'} Professional` : "Motivated Professional | Ready for Next Challenge",
            alternatives: [
              "Upload your resume for personalized title suggestions",
              "Add your work experience for better title generation",
              "Specify your target role for tailored recommendations"
            ],
            tips: [
              "Upload your resume to get AI-powered personalized titles",
              "Include your target role and industry for better suggestions",
              "Professional titles should be 50-60 characters for optimal ATS performance"
            ]
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert resume title generator with deep knowledge of ATS optimization and recruitment best practices.

TASK: Generate compelling, ATS-friendly resume titles/headlines based on the provided resume data and target preferences.

ANALYSIS REQUIREMENTS:
1. Extract key skills, experience level, and achievements from resume
2. Incorporate target role and industry if provided
3. Create titles that are keyword-rich but natural
4. Optimize for ATS compatibility and human readability
5. Ensure titles are concise (50-60 characters ideal)

TITLE CRITERIA:
- Include relevant keywords for the target role/industry
- Reflect actual experience level and skills
- Be specific enough to stand out but broad enough for multiple opportunities
- Use power words that convey value and competence
- Avoid generic phrases like "seeking opportunities"

Return a JSON object with this structure:
{
  "titles": [
    {
      "title": "Senior Software Engineer | Full-Stack Development & Cloud Architecture",
      "reasoning": "Combines seniority level with specific technical skills",
      "atsScore": 85,
      "keywords": ["Senior", "Software Engineer", "Full-Stack", "Cloud Architecture"]
    }
  ],
  "recommendations": {
    "bestTitle": "Most recommended title",
    "alternatives": ["Alternative approach 1", "Alternative approach 2"],
    "tips": ["Tip 1", "Tip 2", "Tip 3"]
  }
}`;

    const userPrompt = `Generate resume titles for this profile:

TARGET ROLE: ${targetRole || 'Not specified'}
INDUSTRY: ${industry || 'Not specified'}
EXPERIENCE LEVEL: ${experience || 'Not specified'}

RESUME DATA:
${typeof resumeData === 'string' ? resumeData : JSON.stringify(resumeData, null, 2)}

Generate 5-7 compelling title options that:
1. Reflect the candidate's actual experience and skills
2. Include relevant keywords for the target role/industry
3. Are optimized for ATS systems
4. Stand out to human recruiters
5. Are 50-60 characters when possible

Focus on creating titles that showcase value proposition and key strengths.`;

    console.log('Making request to OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`AI title generation failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received successfully');
    
    const titleData = data.choices[0].message.content;

    let parsedData;
    try {
      parsedData = JSON.parse(titleData);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw AI response:', titleData);
      throw new Error('AI returned invalid JSON format');
    }

    console.log('Title generation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        ...parsedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI title generation:', error);
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

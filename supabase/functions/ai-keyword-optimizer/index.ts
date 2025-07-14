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
    const { resumeContent, jobDescription, targetRole, industry } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Optimizing keywords for:', { targetRole, industry });

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) optimizer with deep knowledge of keyword matching and resume optimization.

TASK: Analyze the resume content against the job description and provide comprehensive keyword optimization recommendations.

ANALYSIS REQUIREMENTS:
1. Extract key skills, technologies, and qualifications from the job description
2. Identify missing keywords in the resume that match the job requirements
3. Suggest natural ways to incorporate missing keywords
4. Analyze keyword density and distribution
5. Provide ATS compatibility score and recommendations
6. Suggest industry-specific terms and phrases

OPTIMIZATION PRINCIPLES:
- Keywords should be naturally integrated, not stuffed
- Focus on exact matches for technical skills and tools
- Include variations and synonyms of key terms
- Prioritize hard skills over soft skills for ATS matching
- Maintain readability and professional tone

Return a JSON object with this structure:
{
  "atsScore": 75,
  "keywordAnalysis": {
    "matched": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"],
    "density": 0.12,
    "distribution": "good"
  },
  "recommendations": [
    {
      "keyword": "Python",
      "priority": "high",
      "suggestion": "Add to technical skills section",
      "naturalIntegration": "Include in a specific project description",
      "section": "skills"
    }
  ],
  "optimizedSections": {
    "summary": "Optimized summary with better keywords",
    "skills": "Optimized skills section",
    "experience": "Optimized experience descriptions"
  },
  "industryKeywords": {
    "technical": ["React", "Node.js", "AWS"],
    "soft": ["Leadership", "Collaboration"],
    "industry": ["Agile", "DevOps", "CI/CD"]
  },
  "improvementTips": [
    "Add specific technology versions",
    "Include industry certifications",
    "Use action verbs that match job description"
  ]
}`;

    const userPrompt = `Optimize ATS keywords for this resume:

TARGET ROLE: ${targetRole || 'Not specified'}
INDUSTRY: ${industry || 'Not specified'}

JOB DESCRIPTION:
${jobDescription || 'No specific job description provided'}

CURRENT RESUME CONTENT:
${JSON.stringify(resumeContent, null, 2)}

Please provide:
1. Comprehensive keyword analysis comparing resume to job requirements
2. Specific recommendations for keyword optimization
3. Natural integration suggestions that maintain readability
4. Industry-specific keyword recommendations
5. ATS compatibility score and improvement tips

Focus on helping the candidate match job requirements while maintaining authenticity.`;

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
        temperature: 0.1,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`AI keyword optimization failed: ${response.status}`);
    }

    const data = await response.json();
    const optimizationData = data.choices[0].message.content;

    let parsedData;
    try {
      parsedData = JSON.parse(optimizationData);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('AI returned invalid JSON format');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        ...parsedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI keyword optimization:', error);
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
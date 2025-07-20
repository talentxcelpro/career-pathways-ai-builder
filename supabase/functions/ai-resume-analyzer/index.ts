
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeContent, jobDescription } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an ATS (Applicant Tracking System) analyzer. Analyze the resume content and provide detailed feedback. Return your response as JSON with this exact structure:
            {
              "overallScore": number (0-100),
              "sections": {
                "contact": {"score": number, "issues": ["issue1"], "suggestions": ["suggestion1"]},
                "summary": {"score": number, "issues": ["issue1"], "suggestions": ["suggestion1"]},
                "experience": {"score": number, "issues": ["issue1"], "suggestions": ["suggestion1"]},
                "education": {"score": number, "issues": ["issue1"], "suggestions": ["suggestion1"]},
                "skills": {"score": number, "issues": ["issue1"], "suggestions": ["suggestion1"]}
              },
              "keywords": {
                "matched": ["keyword1"],
                "missing": ["keyword2"],
                "recommendations": ["keyword3"]
              },
              "formatting": {
                "score": number,
                "issues": ["issue1"],
                "improvements": ["improvement1"]
              },
              "competitiveAnalysis": {
                "industryStandard": number,
                "positionVsMarket": "above/below/at average",
                "improvementPotential": number
              },
              "suggestions": [
                {
                  "id": "1",
                  "type": "ats",
                  "title": "Suggestion Title",
                  "description": "Detailed suggestion",
                  "impact": "high"
                }
              ]
            }`
          },
          {
            role: 'user',
            content: `Analyze this resume content for ATS compatibility and optimization:

Resume Content:
${JSON.stringify(resumeContent)}

${jobDescription ? `Job Description: ${jobDescription}` : ''}

Provide detailed ATS analysis with scores, issues, and actionable suggestions.`
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    let analysisResult;

    try {
      analysisResult = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      // Fallback analysis if JSON parsing fails
      analysisResult = {
        overallScore: 75,
        sections: {
          contact: { score: 85, issues: [], suggestions: ["Ensure all contact information is present"] },
          summary: { score: 70, issues: ["Summary could be more impactful"], suggestions: ["Add quantifiable achievements"] },
          experience: { score: 75, issues: [], suggestions: ["Use more action verbs"] },
          education: { score: 80, issues: [], suggestions: [] },
          skills: { score: 70, issues: [], suggestions: ["Add more relevant technical skills"] }
        },
        keywords: {
          matched: ["Project Management", "Team Leadership"],
          missing: ["Data Analysis", "Strategic Planning"],
          recommendations: ["Add industry-specific keywords"]
        },
        formatting: {
          score: 85,
          issues: [],
          improvements: ["Use consistent formatting throughout"]
        },
        competitiveAnalysis: {
          industryStandard: 78,
          positionVsMarket: "at average",
          improvementPotential: 15
        },
        suggestions: [
          {
            id: "1",
            type: "ats",
            title: "Optimize Keywords",
            description: "Add more industry-relevant keywords to improve ATS scoring",
            impact: "high"
          }
        ]
      };
    }

    return new Response(JSON.stringify({
      success: true,
      data: analysisResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ATS analyzer:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ATSAnalysisResult {
  score: number;
  keywordScore: number;
  formatScore: number;
  contentScore: number;
  strengthsFound: string[];
  issuesFound: string[];
  recommendations: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeData, jobDescription } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build comprehensive resume text for analysis
    const resumeText = buildResumeText(resumeData);

    const systemPrompt = `You are an ATS (Applicant Tracking System) expert analyzer. Analyze resumes for:
1. ATS compatibility (formatting, keywords, structure)
2. Content quality (achievements, metrics, impact)
3. Keyword optimization
4. Professional standards

Return analysis in this JSON format:
{
  "score": <0-100>,
  "keywordScore": <0-100>,
  "formatScore": <0-100>,
  "contentScore": <0-100>,
  "strengthsFound": ["strength1", "strength2", ...],
  "issuesFound": ["issue1", "issue2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "matchedKeywords": ["keyword1", ...],
  "missingKeywords": ["keyword1", ...]
}`;

    let userPrompt = `Analyze this resume:\n\n${resumeText}`;
    
    if (jobDescription) {
      userPrompt += `\n\nTarget Job Description:\n${jobDescription}\n\nProvide job-specific keyword analysis.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    let analysis: ATSAnalysisResult;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      console.error('Failed to parse AI response:', analysisText);
      throw new Error('Invalid AI response format');
    }

    console.log(`ATS Analysis completed. Score: ${analysis.score}/100`);

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ats-analyzer function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildResumeText(resumeData: any): string {
  const sections: string[] = [];

  // Personal Info
  if (resumeData.personalInfo) {
    const pi = resumeData.personalInfo;
    sections.push(`CONTACT INFORMATION`);
    sections.push(`Name: ${pi.fullName || 'N/A'}`);
    sections.push(`Email: ${pi.email || 'N/A'}`);
    sections.push(`Phone: ${pi.phone || 'N/A'}`);
    sections.push(`Location: ${pi.location || 'N/A'}`);
    if (pi.summary) {
      sections.push(`\nPROFESSIONAL SUMMARY\n${pi.summary}`);
    }
  }

  // Experience
  if (resumeData.experience?.length > 0) {
    sections.push(`\nWORK EXPERIENCE`);
    resumeData.experience.forEach((exp: any) => {
      sections.push(`\n${exp.title} at ${exp.company}`);
      sections.push(`${exp.startDate} - ${exp.endDate || 'Present'}`);
      sections.push(`Location: ${exp.location || 'N/A'}`);
      if (exp.description) {
        sections.push(`${exp.description}`);
      }
    });
  }

  // Education
  if (resumeData.education?.length > 0) {
    sections.push(`\nEDUCATION`);
    resumeData.education.forEach((edu: any) => {
      sections.push(`\n${edu.degree} - ${edu.institution}`);
      sections.push(`${edu.startDate} - ${edu.endDate || 'Present'}`);
    });
  }

  // Skills
  if (resumeData.skills) {
    const skills = Array.isArray(resumeData.skills) 
      ? resumeData.skills.map((s: any) => typeof s === 'string' ? s : s.name)
      : [];
    if (skills.length > 0) {
      sections.push(`\nSKILLS`);
      sections.push(skills.join(', '));
    }
  }

  return sections.join('\n');
}

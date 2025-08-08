import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { sectionType, content, personalInfo, action, resumeData, jobDescription, tone } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('AI Resume Enhancer request:', { sectionType, action });

    if (action === 'calculate_ats_score') {
      return await calculateATSScore(resumeData);
    }

    if (action === 'keyword_match') {
      return await analyzeKeywordMatch(resumeData, jobDescription);
    }

    if (action === 'cover_letter') {
      return await generateCoverLetter(resumeData, jobDescription, tone || 'professional');
    }

    // Enhance resume section with AI
    const enhancedContent = await enhanceResumeSection(sectionType, content, personalInfo);

    return new Response(JSON.stringify({ 
      success: true,
      enhancedContent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-resume-enhancer:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function enhanceResumeSection(sectionType: string, content: any, personalInfo: any) {
  const prompts = {
    summary: `Enhance this professional summary to be more compelling and ATS-friendly. Make it concise, keyword-rich, and tailored for ${(personalInfo?.fullName || 'the candidate')}'s profile. Current summary: ${JSON.stringify(content)}`,
    
    experience: `Enhance this work experience entry with strong action verbs, quantified achievements, and relevant keywords. Structure: ${JSON.stringify(content)}`,
    
    skills: `Organize and enhance this skills section. Group by technical skills, soft skills, and tools. Suggest additional relevant skills based on the profile. Current skills: ${JSON.stringify(content)}`,
    
    projects: `Enhance this project description with technical details, impact metrics, and relevant technologies. Make it compelling for recruiters. Project: ${JSON.stringify(content)}`,
    
    education: `Enhance this education entry with relevant coursework, achievements, and GPA if strong. Structure: ${JSON.stringify(content)}`,
    
    certifications: `Enhance this certification entry with relevance context and expiration handling. Structure: ${JSON.stringify(content)}`
  };

  const prompt = prompts[sectionType as keyof typeof prompts] || `Enhance this resume section: ${JSON.stringify(content)}`;

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
          content: 'You are an expert resume writer and career coach. Enhance resume sections to be more compelling, ATS-friendly, and professional. Return only the enhanced content in the same JSON structure as provided.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const enhancedText = data.choices[0].message.content;

  // Try to parse as JSON, fallback to text enhancement
  try {
    return JSON.parse(enhancedText);
  } catch {
    // If not valid JSON, enhance the text content
    if (sectionType === 'summary') {
      return { ...content, text: enhancedText };
    } else if (sectionType === 'experience') {
      return { ...content, description: enhancedText };
    } else {
      return { ...content, enhanced: enhancedText };
    }
  }
}

async function analyzeKeywordMatch(resumeData: any, jobDescription: string) {
  if (!jobDescription || !resumeData) {
    throw new Error('Missing jobDescription or resumeData');
  }

  const prompt = `You are an expert ATS optimizer. Extract the most important keywords and concepts from the given job description, then compare them against the provided resume data. Focus on hard skills, tools, certifications, soft skills, seniority, and domain knowledge.

Return ONLY a compact JSON with exactly this structure:
{
  "matchScore": 0-100,
  "jdKeywords": string[],
  "resumeKeywords": string[],
  "matched": string[],
  "missing": string[],
  "recommendations": string[],
  "sectionsToUpdate": [
    { "section": "summary" | "experience" | "skills" | "projects" | "education", "suggestions": string[] }
  ]
}

JOB_DESCRIPTION:\n${jobDescription}\n\nRESUME_DATA:\n${JSON.stringify(resumeData, null, 2)}\n`;

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
          content: 'You are an ATS optimization assistant. Always return strict JSON matching the requested schema.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  return new Response(JSON.stringify({
    success: true,
    analysis: result
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function calculateATSScore(resumeData: any) {
  const prompt = `Analyze this resume for ATS compatibility and provide a score from 0-100. Consider: keyword optimization, formatting, section structure, and content quality. Resume data: ${JSON.stringify(resumeData, null, 2)}

Return ONLY a JSON object with this structure:
{
  "atsScore": 85,
  "factors": {
    "keywords": 80,
    "formatting": 90,
    "structure": 85,
    "content": 80
  },
  "recommendations": [
    "Add more industry-specific keywords",
    "Include quantified achievements"
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
        { 
          role: 'system', 
          content: 'You are an ATS (Applicant Tracking System) expert. Analyze resumes and provide accurate ATS compatibility scores with specific recommendations.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  return new Response(JSON.stringify({ 
    success: true,
    atsScore: result.atsScore,
    analysis: result
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateCoverLetter(resumeData: any, jobDescription: string, tone: string) {
  if (!resumeData || !jobDescription) {
    throw new Error('Missing resumeData or jobDescription');
  }

  const role = jobDescription.slice(0, 100).replace(/\n/g, ' ');

  const prompt = `Write a concise, professional cover letter (${tone} tone).
Use the RESUME (JSON) and JOB DESCRIPTION below.
- 3–5 short paragraphs max
- Quantify impact where possible
- Mirror key JD keywords naturally
- End with a proactive closing

Return ONLY the letter text, no markdown.

RESUME:\n${JSON.stringify(resumeData, null, 2)}\n\nJOB DESCRIPTION:\n${jobDescription}\n`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a senior career coach who writes crisp, high-conversion cover letters.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 900,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const letter = data.choices?.[0]?.message?.content || '';

  return new Response(JSON.stringify({ success: true, coverLetter: letter }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

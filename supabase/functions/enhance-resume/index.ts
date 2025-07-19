import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnhanceResumeRequest {
  resumeText: string;
  targetRole?: string;
  jobDescription?: string;
  userId?: string;
  fileName?: string;
}

serve(async (req) => {
  console.log('🚀 Enhanced Resume Function Starting...');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  console.log('📋 Request details:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    const { resumeText, targetRole, jobDescription, userId, fileName }: EnhanceResumeRequest = await req.json();
    
    console.log('📄 Processing resume enhancement request:', {
      textLength: resumeText?.length || 0,
      targetRole,
      hasJobDescription: !!jobDescription,
      userId,
      fileName
    });

    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error('No resume text provided');
    }

    // Create the comprehensive system prompt
    const systemPrompt = `You are a world-class Resume Intelligence Engine used by a global career platform.

Your role is to accurately extract structured data from resumes and enhance them with professional, achievement-oriented content. You are used by recruiters, professionals, and ATS-integrated systems to auto-generate top-tier resumes that are keyword-rich and results-driven.

Always think like:
- A professional resume writer
- An ATS optimization expert
- A career coach

Do not hallucinate or fabricate content. If information is missing, mark fields as null or empty.
Always return valid JSON that can be parsed directly.`;

    // Create the main user prompt with dynamic content
    const userPrompt = `Below is a raw resume input, either pasted from a PDF/DOCX or extracted text.

${targetRole ? `TARGET ROLE: ${targetRole}` : ''}
${jobDescription ? `JOB DESCRIPTION CONTEXT: ${jobDescription}` : ''}

Perform the following steps:

### 1. Parse & Extract Resume Data
Convert the resume text into structured JSON using the format below.

Return fields:
- name
- email
- phone
- location
- linkedin
- portfolio (if available)
- summary
- experience[]:
  - title
  - company
  - location
  - startDate (MMM YYYY format)
  - endDate (MMM YYYY format)
  - achievements[] (bullet points)
- education[]
  - degree
  - institution
  - location
  - startDate (MMM YYYY format)
  - endDate (MMM YYYY format)
  - grade
- skills[] (separate hard skills & soft skills if possible)
- certifications[]
- projects[]
  - title
  - description
  - technologies
- languages[]
- hobbies[]
- awards[]

### 2. Enhance Resume Sections (return as separate object)
- Rewrite the summary to be more impactful and keyword-optimized.
- Rewrite each experience with strong action verbs, metrics (if missing), and ATS-friendly keywords.
- Expand skills with industry-specific synonyms or role-based enhancements.
- Rewrite project descriptions to sound outcome-focused.
- Suggest 3–5 bullet points that can improve the resume further.

### 3. Return Result in the Following JSON Format:
{
  "parsed_resume": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "portfolio": "",
    "summary": "",
    "experience": [
      {
        "title": "",
        "company": "",
        "location": "",
        "startDate": "",
        "endDate": "",
        "achievements": []
      }
    ],
    "education": [
      {
        "degree": "",
        "institution": "",
        "location": "",
        "startDate": "",
        "endDate": "",
        "grade": ""
      }
    ],
    "skills": [],
    "certifications": [],
    "projects": [
      {
        "title": "",
        "description": "",
        "technologies": []
      }
    ],
    "languages": [],
    "hobbies": [],
    "awards": []
  },
  "enhanced_resume": {
    "summary": "",
    "experience": [
      {
        "title": "",
        "company": "",
        "location": "",
        "startDate": "",
        "endDate": "",
        "enhanced_achievements": []
      }
    ],
    "skills": {
      "original": [],
      "enhanced": []
    },
    "project_suggestions": [],
    "resume_improvement_suggestions": []
  },
  "ats_analysis": {
    "score": 0,
    "keyword_density": 0,
    "missing_keywords": [],
    "suggestions": []
  }
}

### Resume Text:
"""
${resumeText}
"""

Return ONLY the JSON object, no additional text or formatting.`;

    console.log('🤖 Calling OpenAI API for comprehensive resume enhancement...');
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('❌ OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${error}`);
    }

    const openaiData = await openaiResponse.json();
    console.log('✅ OpenAI API response received');

    if (!openaiData.choices?.[0]?.message?.content) {
      throw new Error('No content in OpenAI response');
    }

    let enhancedData;
    try {
      enhancedData = JSON.parse(openaiData.choices[0].message.content);
      console.log('✅ Successfully parsed enhanced resume data');
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI JSON response:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Convert to the format expected by the existing system
    const convertedData = {
      personalInfo: {
        fullName: enhancedData.parsed_resume?.name || '',
        email: enhancedData.parsed_resume?.email || '',
        phone: enhancedData.parsed_resume?.phone || '',
        location: enhancedData.parsed_resume?.location || '',
        linkedin: enhancedData.parsed_resume?.linkedin || '',
        portfolio: enhancedData.parsed_resume?.portfolio || '',
        summary: enhancedData.enhanced_resume?.summary || enhancedData.parsed_resume?.summary || '',
        confidence: 0.95
      },
      experience: enhancedData.enhanced_resume?.experience?.map((exp: any, index: number) => ({
        title: exp.title || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        responsibilities: exp.enhanced_achievements || exp.achievements || [],
        achievements: exp.enhanced_achievements || [],
        technologies: [],
        confidence: 0.9
      })) || enhancedData.parsed_resume?.experience?.map((exp: any, index: number) => ({
        title: exp.title || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        responsibilities: exp.achievements || [],
        achievements: exp.achievements || [],
        technologies: [],
        confidence: 0.8
      })) || [],
      education: enhancedData.parsed_resume?.education?.map((edu: any, index: number) => ({
        degree: edu.degree || '',
        school: edu.institution || '',
        location: edu.location || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        gpa: edu.grade || '',
        confidence: 0.9
      })) || [],
      skills: {
        technical: enhancedData.enhanced_resume?.skills?.enhanced?.map((skill: any) => ({
          skill: typeof skill === 'string' ? skill : skill.skill || '',
          proficiency: 'intermediate',
          category: 'technical'
        })) || enhancedData.parsed_resume?.skills?.map((skill: any) => ({
          skill: typeof skill === 'string' ? skill : skill.skill || '',
          proficiency: 'intermediate',
          category: 'technical'
        })) || [],
        soft: [],
        languages: enhancedData.parsed_resume?.languages?.map((lang: any) => ({
          language: typeof lang === 'string' ? lang : lang.language || '',
          proficiency: 'intermediate'
        })) || [],
        certifications: enhancedData.parsed_resume?.certifications || []
      },
      projects: enhancedData.parsed_resume?.projects?.map((proj: any, index: number) => ({
        title: proj.title || '',
        description: proj.description || '',
        technologies: proj.technologies || [],
        achievements: [],
        confidence: 0.8
      })) || [],
      certifications: enhancedData.parsed_resume?.certifications?.map((cert: any, index: number) => ({
        name: typeof cert === 'string' ? cert : cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || '',
        confidence: 0.8
      })) || [],
      awards: enhancedData.parsed_resume?.awards?.map((award: any, index: number) => ({
        name: typeof award === 'string' ? award : award.name || '',
        issuer: award.issuer || '',
        date: award.date || '',
        description: award.description || '',
        confidence: 0.8
      })) || [],
      atsOptimization: {
        score: enhancedData.ats_analysis?.score || 85,
        keywordDensity: enhancedData.ats_analysis?.keyword_density || 0.08,
        sectionCompleteness: 0.9,
        readabilityScore: 0.88,
        suggestions: enhancedData.ats_analysis?.suggestions || []
      },
      suggestions: enhancedData.enhanced_resume?.resume_improvement_suggestions?.map((suggestion: any) => ({
        category: 'enhancement',
        priority: 'high',
        issue: 'Content improvement',
        suggestion: typeof suggestion === 'string' ? suggestion : suggestion.suggestion || '',
        impact: 15
      })) || [],
      metadata: {
        fileName: fileName || 'enhanced-resume.txt',
        extractionTimestamp: new Date().toISOString(),
        extractionMethod: 'AI Enhancement - GPT-4o',
        processingVersion: 'v3.0-enhanced',
        targetRole: targetRole || null,
        hasJobDescription: !!jobDescription
      }
    };

    console.log('📊 Enhanced resume data prepared:', {
      personalInfoComplete: !!convertedData.personalInfo.fullName,
      experienceCount: convertedData.experience.length,
      educationCount: convertedData.education.length,
      skillsCount: convertedData.skills.technical.length,
      projectsCount: convertedData.projects.length,
      atsScore: convertedData.atsOptimization.score,
      suggestionsCount: convertedData.suggestions.length
    });

    return new Response(JSON.stringify({
      success: true,
      data: convertedData,
      rawEnhancedData: enhancedData,
      metadata: {
        processingTime: Date.now(),
        model: 'gpt-4o',
        enhancementLevel: 'comprehensive',
        confidence: 0.95
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Resume enhancement error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Resume enhancement failed',
      details: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
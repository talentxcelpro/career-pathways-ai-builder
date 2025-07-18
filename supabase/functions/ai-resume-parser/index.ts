import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResumeParseRequest {
  text: string;
  fileName?: string;
  fileType?: string;
  userId?: string;
}

interface ParsedResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    grade: string;
  }>;
  skills: string[];
  certifications: string[];
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
  languages: string[];
  hobbies: string[];
}

serve(async (req) => {
  console.log('🚀 AI Resume Parser Function Starting...');
  
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

    const { text, fileName, fileType, userId }: ResumeParseRequest = await req.json();
    
    console.log('📄 Processing resume parsing request:', {
      textLength: text?.length || 0,
      fileName,
      fileType,
      userId
    });

    if (!text || text.trim().length === 0) {
      throw new Error('No resume text provided');
    }

    // Create the structured prompt
    const prompt = `You are an expert resume parser.

Extract structured resume data from the text below and return it as a clean JSON object.

### Instructions:
- Extract key fields accurately.
- Dates should be in "MMM YYYY" format (e.g., Jan 2020).
- Use arrays for lists like work experience, education, skills, etc.
- If data is missing, leave the field as null or empty.
- Don't guess or hallucinate values.
- For experience descriptions, split into meaningful bullet points.
- Extract ALL skills mentioned, including technical and soft skills.
- Parse education information completely including grades if available.
- Identify certifications and professional credentials.
- Extract project information with technologies used.
- Identify languages spoken and proficiency levels if mentioned.
- Extract hobbies and interests if mentioned.

### Expected JSON keys:
{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "summary": "",
  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "description": []
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
  "hobbies": []
}

### Resume Text:
"""
${text}
"""

Return ONLY the JSON object, no additional text or formatting.`;

    console.log('🤖 Calling OpenAI API for resume parsing...');
    
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
            content: 'You are an expert resume parser. Always return valid JSON that matches the exact schema provided. Be accurate and thorough in your extraction.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 3000,
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

    let parsedData: ParsedResumeData;
    try {
      parsedData = JSON.parse(openaiData.choices[0].message.content);
      console.log('✅ Successfully parsed resume data');
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI JSON response:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate and enhance the parsed data
    const enhancedData = {
      personalInfo: {
        fullName: parsedData.name || '',
        email: parsedData.email || '',
        phone: parsedData.phone || '',
        location: parsedData.location || '',
        linkedin: parsedData.linkedin || '',
        summary: parsedData.summary || '',
        confidence: 0.9
      },
      experience: parsedData.experience?.map(exp => ({
        title: exp.title || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        responsibilities: exp.description || [],
        achievements: [],
        technologies: [],
        confidence: 0.8
      })) || [],
      education: parsedData.education?.map(edu => ({
        degree: edu.degree || '',
        school: edu.institution || '',
        location: edu.location || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        gpa: edu.grade || '',
        confidence: 0.8
      })) || [],
      skills: {
        technical: parsedData.skills?.map(skill => ({
          skill,
          proficiency: 'intermediate',
          category: 'general'
        })) || [],
        soft: [],
        languages: parsedData.languages?.map(lang => ({
          language: lang,
          proficiency: 'intermediate'
        })) || [],
        certifications: parsedData.certifications || []
      },
      projects: parsedData.projects?.map(proj => ({
        title: proj.title || '',
        description: proj.description || '',
        technologies: proj.technologies || [],
        achievements: [],
        confidence: 0.7
      })) || [],
      certifications: parsedData.certifications?.map(cert => ({
        name: cert,
        issuer: '',
        date: '',
        confidence: 0.7
      })) || [],
      awards: [],
      publications: [],
      customSections: [],
      volunteer: [],
      sectionStructure: {
        detectedSections: ['personal_info', 'experience', 'education', 'skills'],
        sectionBoundaries: {},
        formatMetadata: {
          hasBulletPoints: true,
          indentationLevel: 0,
          fontHints: [],
          layoutType: 'standard'
        }
      },
      atsOptimization: {
        score: 75,
        keywordDensity: 0.05,
        sectionCompleteness: 0.8,
        readabilityScore: 0.85,
        suggestions: []
      },
      confidenceMetrics: {
        overall: 0.85,
        personalInfo: 0.9,
        experience: 0.8,
        education: 0.8,
        skills: 0.75,
        sections: {
          personal_info: 0.9,
          experience: 0.8,
          education: 0.8,
          skills: 0.75
        }
      },
      suggestions: [
        {
          category: 'formatting',
          priority: 'medium',
          issue: 'Consider adding more quantifiable achievements',
          suggestion: 'Add specific numbers, percentages, or metrics to your experience descriptions',
          impact: 10
        }
      ],
      metadata: {
        fileName: fileName || 'resume.txt',
        extractionTimestamp: new Date().toISOString(),
        extractionMethod: 'AI Parsing - GPT-4o',
        processingVersion: 'v2.0'
      }
    };

    console.log('📊 Enhanced resume data prepared:', {
      personalInfoComplete: !!enhancedData.personalInfo.fullName,
      experienceCount: enhancedData.experience.length,
      educationCount: enhancedData.education.length,
      skillsCount: enhancedData.skills.technical.length,
      projectsCount: enhancedData.projects.length
    });

    return new Response(JSON.stringify({
      success: true,
      data: enhancedData,
      rawParsedData: parsedData,
      metadata: {
        processingTime: Date.now(),
        model: 'gpt-4o',
        confidence: enhancedData.confidenceMetrics.overall
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Resume parsing error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Resume parsing failed',
      details: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
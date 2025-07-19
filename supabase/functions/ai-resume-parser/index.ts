
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
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
    github?: string;
    summary?: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
    technologies: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: {
    technical: Array<{
      skill: string;
      proficiency: string;
      category: string;
    }>;
    soft: string[];
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
  };
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    achievements: string[];
  }>;
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

    // Enhanced parsing prompt with specific instructions for civil engineering resumes
    const prompt = `You are an expert resume parser specializing in engineering and construction resumes. Extract structured data from the resume text below.

### Critical Instructions:
1. Extract EXACT names, companies, and job titles as written
2. Parse dates in various formats (Jan 2017, January 2017, 01/2017, 2017-2022, etc.)
3. For engineering roles, identify technical skills, software, and certifications
4. Split job descriptions into clear bullet points
5. Capture ALL contact information including phone, email, LinkedIn
6. Identify civil engineering, construction, and project management terminology
7. Parse education details including degree type, institution, and graduation dates
8. Extract certifications, licenses, and professional memberships

### Expected JSON Structure:
{
  "personalInfo": {
    "fullName": "Exact full name from resume",
    "email": "email@example.com",
    "phone": "phone number with country code if available",
    "location": "City, State/Province, Country",
    "linkedin": "LinkedIn profile URL or username",
    "website": "Personal website if mentioned",
    "github": "GitHub profile if mentioned", 
    "summary": "Professional summary or objective statement"
  },
  "experience": [
    {
      "id": "auto-generated-uuid",
      "title": "Exact job title as written",
      "company": "Exact company name",
      "location": "Work location",
      "startDate": "YYYY-MM format (e.g., 2017-01)",
      "endDate": "YYYY-MM format or empty if current",
      "current": true/false,
      "description": "Overall role description",
      "achievements": [
        "Specific achievement 1",
        "Quantified result 2",
        "Project completion 3"
      ],
      "technologies": ["AutoCAD", "Civil 3D", "Project Management", etc.]
    }
  ],
  "education": [
    {
      "id": "auto-generated-uuid", 
      "degree": "Full degree name (e.g., Bachelor of Civil Engineering)",
      "school": "Institution name",
      "location": "University location",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "gpa": "GPA if mentioned"
    }
  ],
  "skills": {
    "technical": [
      {
        "skill": "Specific technical skill",
        "proficiency": "beginner/intermediate/advanced/expert",
        "category": "Software/Engineering/Management/etc"
      }
    ],
    "soft": ["Leadership", "Communication", "Problem Solving"],
    "languages": [
      {
        "language": "Language name",
        "proficiency": "basic/conversational/fluent/native"
      }
    ]
  },
  "certifications": [
    {
      "id": "auto-generated-uuid",
      "name": "Certification name",
      "issuer": "Issuing organization", 
      "date": "YYYY-MM"
    }
  ],
  "projects": [
    {
      "id": "auto-generated-uuid",
      "title": "Project name",
      "description": "Project description",
      "technologies": ["Tech1", "Tech2"],
      "achievements": ["Achievement 1", "Achievement 2"]
    }
  ]
}

### Resume Text to Parse:
"""
${text}
"""

### Important Parsing Rules:
- Be EXTREMELY accurate with names, companies, and titles
- Convert all dates to YYYY-MM format consistently
- Generate unique IDs for each entry using crypto.randomUUID() format
- If information is missing, use null or empty arrays appropriately
- For current positions, set "current": true and "endDate": ""
- Extract quantifiable achievements (numbers, percentages, dollar amounts)
- Identify engineering software (AutoCAD, Civil 3D, Revit, etc.)
- Parse construction/engineering terminology accurately

Return ONLY valid JSON matching the exact structure above. No additional text or explanations.`;

    console.log('🤖 Calling OpenAI API for enhanced resume parsing...');
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume parser. Always return valid JSON that matches the exact schema provided. Be extremely accurate with personal details, company names, and job titles. Generate proper UUIDs for all ID fields.'
          },
          {
            role: 'user',
            content: prompt
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

    let parsedData: ParsedResumeData;
    try {
      parsedData = JSON.parse(openaiData.choices[0].message.content);
      console.log('✅ Successfully parsed resume data:', {
        hasPersonalInfo: !!parsedData.personalInfo?.fullName,
        experienceCount: parsedData.experience?.length || 0,
        educationCount: parsedData.education?.length || 0,
        skillsCount: parsedData.skills?.technical?.length || 0
      });
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI JSON response:', parseError);
      console.error('Raw response:', openaiData.choices[0].message.content);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Enhanced data mapping to match resume builder format
    const enhancedData = {
      personalInfo: {
        fullName: parsedData.personalInfo?.fullName || '',
        email: parsedData.personalInfo?.email || '',
        phone: parsedData.personalInfo?.phone || '',
        location: parsedData.personalInfo?.location || '',
        linkedin: parsedData.personalInfo?.linkedin || '',
        website: parsedData.personalInfo?.website || '',
        github: parsedData.personalInfo?.github || '',
        summary: parsedData.personalInfo?.summary || '',
        confidence: 0.95
      },
      experience: parsedData.experience?.map(exp => ({
        id: exp.id || crypto.randomUUID(),
        title: exp.title || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: exp.current || false,
        description: exp.description || '',
        achievements: exp.achievements || [],
        technologies: exp.technologies || [],
        confidence: 0.9
      })) || [],
      education: parsedData.education?.map(edu => ({
        id: edu.id || crypto.randomUUID(),
        degree: edu.degree || '',
        school: edu.school || '',
        location: edu.location || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        gpa: edu.gpa || '',
        confidence: 0.85
      })) || [],
      skills: {
        technical: parsedData.skills?.technical?.map(skill => ({
          skill: skill.skill,
          proficiency: skill.proficiency || 'intermediate',
          category: skill.category || 'general'
        })) || [],
        soft: parsedData.skills?.soft || [],
        languages: parsedData.skills?.languages || [],
        certifications: parsedData.certifications?.map(cert => cert.name) || []
      },
      projects: parsedData.projects?.map(proj => ({
        id: proj.id || crypto.randomUUID(),
        title: proj.title || '',
        description: proj.description || '',
        technologies: proj.technologies || [],
        achievements: proj.achievements || [],
        confidence: 0.8
      })) || [],
      certifications: parsedData.certifications?.map(cert => ({
        id: cert.id || crypto.randomUUID(),
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || '',
        confidence: 0.85
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
        score: 85,
        keywordDensity: 0.08,
        sectionCompleteness: 0.9,
        readabilityScore: 0.88,
        suggestions: []
      },
      confidenceMetrics: {
        overall: 0.88,
        personalInfo: 0.95,
        experience: 0.9,
        education: 0.85,
        skills: 0.8,
        sections: {
          personal_info: 0.95,
          experience: 0.9,
          education: 0.85,
          skills: 0.8
        }
      },
      suggestions: [
        {
          category: 'formatting',
          priority: 'medium',
          issue: 'Consider adding more quantifiable achievements',
          suggestion: 'Add specific numbers, percentages, or metrics to your experience descriptions',
          impact: 15
        }
      ],
      metadata: {
        fileName: fileName || 'resume.txt',
        extractionTimestamp: new Date().toISOString(),
        extractionMethod: 'Enhanced AI Parsing - GPT-4.1',
        processingVersion: 'v3.0'
      }
    };

    console.log('📊 Final enhanced data prepared:', {
      personalInfoComplete: !!enhancedData.personalInfo.fullName,
      experienceCount: enhancedData.experience.length,
      educationCount: enhancedData.education.length,
      skillsCount: enhancedData.skills.technical.length,
      projectsCount: enhancedData.projects.length,
      certificationsCount: enhancedData.certifications.length
    });

    return new Response(JSON.stringify({
      success: true,
      data: enhancedData,
      rawParsedData: parsedData,
      metadata: {
        processingTime: Date.now(),
        model: 'gpt-4.1-2025-04-14',
        confidence: enhancedData.confidenceMetrics.overall,
        extractedSections: Object.keys(enhancedData.sectionStructure.detectedSections)
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

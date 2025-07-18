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
    const { resumeText, operation = 'extract_and_enhance' } = await req.json();

    if (!resumeText) {
      throw new Error('Resume text is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing comprehensive resume operation:', operation);

    let systemPrompt = '';
    let userPrompt = '';

    if (operation === 'extract_and_enhance') {
      systemPrompt = `You are an expert resume processor with dual capabilities:
1. Advanced resume extraction and parsing 
2. ATS optimization and enhancement

You will analyze the resume text and provide both extraction AND enhancement in a single response.`;

      userPrompt = `COMPREHENSIVE RESUME PROCESSING

PHASE 1: EXTRACTION
Extract ALL information from this resume with maximum accuracy:

CRITICAL EXTRACTION RULES:
- IGNORE system metadata like "Resume File:", "File Type:", etc.
- Focus ONLY on actual professional information
- Extract real person's name from content (NOT filename)
- Preserve exact wording and terminology
- For PhD/engineering backgrounds, capture ALL technical details
- Extract research experience, publications, specialized skills
- Calculate experience durations accurately

PHASE 2: ATS ENHANCEMENT
For each extracted section, provide an ATS-optimized enhanced version:
- Add relevant keywords for the field
- Improve action verbs and quantifiable achievements
- Optimize for applicant tracking systems
- Maintain professional tone and accuracy
- Suggest additional skills and certifications
- Improve formatting and structure recommendations

RETURN COMPREHENSIVE JSON:
{
  "extracted": {
    "personalInfo": {
      "fullName": "actual name from resume content",
      "email": "exact email",
      "phone": "standardized phone",
      "location": "full location",
      "summary": "complete summary word-for-word",
      "linkedin": "linkedin URL if present",
      "website": "website if present"
    },
    "experience": [
      {
        "title": "exact job title",
        "company": "exact company name",
        "location": "job location",
        "startDate": "MM/YYYY format",
        "endDate": "MM/YYYY or Present",
        "duration": "calculated duration",
        "description": "complete description",
        "achievements": ["quantified achievements"],
        "technologies": ["technologies mentioned"],
        "keywords": ["relevant keywords"]
      }
    ],
    "education": [
      {
        "degree": "exact degree name",
        "school": "exact institution",
        "location": "school location",
        "startDate": "start date",
        "endDate": "graduation date",
        "gpa": "GPA if mentioned",
        "honors": "honors if mentioned",
        "relevantCoursework": ["courses listed"]
      }
    ],
    "skills": {
      "technical": ["exact technical skills"],
      "soft": ["soft skills mentioned"],
      "languages": ["languages spoken"],
      "certifications": ["certifications listed"]
    },
    "projects": [
      {
        "title": "project name",
        "description": "project description",
        "technologies": ["tech used"],
        "startDate": "start if mentioned",
        "endDate": "end if mentioned",
        "url": "URL if provided",
        "achievements": ["project outcomes"]
      }
    ],
    "certifications": [
      {
        "name": "certification name",
        "issuer": "issuing org",
        "date": "date obtained",
        "url": "verification URL if provided"
      }
    ],
    "awards": [
      {
        "name": "award name",
        "issuer": "awarding organization",
        "date": "date received",
        "description": "award details"
      }
    ]
  },
  "enhanced": {
    "personalInfo": {
      "summary": "ATS-optimized professional summary with keywords",
      "improvements": ["specific enhancement suggestions"]
    },
    "experience": [
      {
        "title": "enhanced job title with keywords",
        "description": "ATS-optimized description with action verbs",
        "achievements": ["quantified achievements with metrics"],
        "suggestedKeywords": ["additional relevant keywords"],
        "improvements": ["specific suggestions"]
      }
    ],
    "skills": {
      "recommended": ["additional skills to add"],
      "keywords": ["industry-specific keywords"],
      "certifications": ["suggested certifications"]
    },
    "atsOptimization": {
      "score": 85,
      "keywordDensity": 75,
      "suggestions": [
        {
          "section": "experience",
          "issue": "needs more action verbs",
          "suggestion": "replace passive phrases with active ones",
          "priority": "high"
        }
      ]
    }
  },
  "metadata": {
    "processingVersion": "3.0",
    "extractionConfidence": 0.92,
    "enhancementLevel": "comprehensive"
  }
}

RESUME TEXT TO PROCESS:
${resumeText}

Provide complete extraction AND enhancement in a single comprehensive response.`;
    } else {
      throw new Error('Invalid operation type');
    }

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
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let result;

    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      result = {
        extracted: {
          personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
          experience: [],
          education: [],
          skills: { technical: [], soft: [], languages: [], certifications: [] },
          projects: [],
          certifications: [],
          awards: []
        },
        enhanced: {
          personalInfo: { summary: 'Unable to process - please try again', improvements: [] },
          experience: [],
          skills: { recommended: [], keywords: [], certifications: [] },
          atsOptimization: { score: 0, keywordDensity: 0, suggestions: [] }
        },
        metadata: {
          processingVersion: '3.0',
          extractionConfidence: 0.3,
          enhancementLevel: 'failed'
        }
      };
    }

    console.log('Resume reprocessing completed successfully');

    return new Response(
      JSON.stringify({ 
        ...result,
        success: true,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI resume reprocessor:', error);
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
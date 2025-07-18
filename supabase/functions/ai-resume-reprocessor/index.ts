
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
      systemPrompt = `You are an expert resume processor. Your task is to extract ALL information from the resume text with maximum accuracy and provide structured data that can be easily used in a resume builder application.

CRITICAL EXTRACTION RULES:
1. IGNORE any system metadata like "Resume File:", "File Type:", etc.
2. Extract the ACTUAL person's name from the resume content, NOT from filenames
3. Be very careful to distinguish between section headers and actual content
4. Extract ALL work experience entries completely
5. Extract ALL education entries completely
6. Preserve exact dates, company names, job titles, and descriptions
7. Extract skills comprehensively from any mention in the resume
8. Look for contact information carefully (email, phone, location, LinkedIn, etc.)`;

      userPrompt = `Extract ALL information from this resume and return it in this EXACT JSON structure:

{
  "extracted": {
    "personalInfo": {
      "fullName": "ACTUAL person's name from resume content",
      "email": "email address if found",
      "phone": "phone number if found", 
      "location": "city, state/country if found",
      "linkedin": "LinkedIn URL if found",
      "website": "personal website if found"
    },
    "professionalSummary": {
      "content": "complete professional summary/objective section"
    },
    "experience": [
      {
        "jobTitle": "exact job title",
        "companyName": "exact company name",
        "location": "job location if mentioned",
        "startDate": "start date in MM/YYYY format",
        "endDate": "end date in MM/YYYY format or 'Present'",
        "description": "complete job description",
        "achievements": ["list of specific achievements"],
        "responsibilities": ["list of key responsibilities"]
      }
    ],
    "education": [
      {
        "degree": "exact degree name",
        "institutionName": "exact school/university name",
        "location": "school location if mentioned",
        "startDate": "start date in MM/YYYY format",
        "endDate": "graduation date in MM/YYYY format",
        "grade": "GPA or grade if mentioned",
        "honors": "honors or distinctions if mentioned"
      }
    ],
    "skills": {
      "technical": [
        {
          "skill": "skill name",
          "proficiency": "beginner/intermediate/advanced/expert"
        }
      ],
      "soft": [
        {
          "skill": "soft skill name", 
          "proficiency": "beginner/intermediate/advanced/expert"
        }
      ],
      "languages": [
        {
          "language": "language name",
          "proficiency": "basic/conversational/fluent/native"
        }
      ]
    },
    "certifications": [
      {
        "name": "certification name",
        "issuingOrganization": "issuing organization",
        "issueDate": "date obtained",
        "expiryDate": "expiry date if mentioned",
        "credentialUrl": "URL if provided"
      }
    ],
    "projects": [
      {
        "title": "project name",
        "description": "project description",
        "technologies": ["technologies used"],
        "startDate": "start date if mentioned",
        "endDate": "end date if mentioned",
        "url": "project URL if provided"
      }
    ],
    "awards": [
      {
        "name": "award name",
        "issuer": "awarding organization",
        "date": "date received",
        "description": "award details"
      }
    ],
    "languages": [
      {
        "language": "language name",
        "proficiency": "basic/conversational/fluent/native"
      }
    ]
  },
  "enhanced": {
    "personalInfo": {
      "summary": "ATS-optimized professional summary with relevant keywords",
      "improvements": ["specific suggestions for improving personal info section"]
    },
    "experience": [
      {
        "title": "enhanced job title with relevant keywords",
        "description": "ATS-optimized description with strong action verbs",
        "achievements": ["quantified achievements with specific metrics"],
        "suggestedKeywords": ["relevant industry keywords to add"],
        "improvements": ["specific enhancement suggestions"]
      }
    ],
    "skills": {
      "recommended": ["additional skills to consider adding"],
      "keywords": ["industry-specific keywords to include"],
      "certifications": ["suggested certifications for career growth"]
    },
    "atsOptimization": {
      "score": 85,
      "keywordDensity": 75,
      "suggestions": [
        {
          "section": "section name",
          "issue": "specific issue identified",
          "suggestion": "specific improvement recommendation",
          "priority": "high/medium/low"
        }
      ]
    }
  },
  "metadata": {
    "processingVersion": "3.0",
    "extractionConfidence": 0.95,
    "enhancementLevel": "comprehensive"
  }
}

RESUME TEXT TO PROCESS:
${resumeText}

IMPORTANT: 
- Look carefully for the person's actual name, usually at the top of the resume
- Do not confuse section headers like "PROFESSIONAL SUMMARY" with the person's name
- Extract ALL work experience and education entries, not just the most recent ones
- Be thorough in extracting skills from throughout the resume
- Provide complete and accurate information for each section`;
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
          personalInfo: { fullName: '', email: '', phone: '', location: '' },
          professionalSummary: { content: '' },
          experience: [],
          education: [],
          skills: { technical: [], soft: [], languages: [] },
          projects: [],
          certifications: [],
          awards: [],
          languages: []
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

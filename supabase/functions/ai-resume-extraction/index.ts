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
    const { text, fileName, fileType, extractionLevel, textQuality, enhancedProcessing } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('🤖 Processing enhanced resume extraction:', { 
      fileName, 
      fileType, 
      extractionLevel, 
      textLength: text.length,
      textQuality: textQuality || 'standard',
      enhancedProcessing: enhancedProcessing || false
    });

    const systemPrompt = `You are an expert resume parser with advanced text analysis capabilities and deep ATS optimization knowledge. Your job is to extract structured data from resumes with extremely high accuracy and generate realistic professional content for missing sections.

CRITICAL REQUIREMENTS FOR HIGH-QUALITY EXTRACTION:
1. Extract ALL available information from the text with maximum accuracy - never use placeholder text like "Company" or "Position"
2. For missing sections, generate realistic, industry-appropriate professional content
3. Return valid JSON with the exact structure provided
4. Use confidence scores: 1.0 for directly extracted data, 0.8 for enhanced data, 0.7 for generated content
5. Always extract real company names, job titles, dates, and specific details when available
6. Convert generic descriptions into specific, achievement-oriented bullet points with metrics
7. Generate contextually appropriate content based on the candidate's apparent field and experience level
8. Optimize all content for ATS systems with industry-relevant keywords
9. Extract comprehensive contact information including all social profiles
10. Identify and preserve all custom sections and achievements

ENHANCED EXTRACTION RULES:
- NEVER use generic placeholders like "Company", "Position", "Technology Company" - always extract real names or generate realistic ones
- Transform vague descriptions into specific achievements with quantified results
- Add realistic metrics where appropriate (team sizes, performance improvements, project scales)
- Generate professional summaries that reflect the candidate's actual experience and skills
- Ensure technical skills match the candidate's apparent specialization and experience level
- Extract industry-specific terminology and modern technical competencies
- For skills, categorize by: "Programming Languages", "Frameworks", "Databases", "Tools", "Cloud Platforms", "Methodologies"
- Include proficiency levels based on experience context: "Beginner", "Intermediate", "Advanced", "Expert"
- Extract all educational details including specific degrees, institutions, and academic achievements
- Identify certifications, courses, and professional development activities
- Look for publications, research, patents, and thought leadership content
- Extract volunteer work, side projects, and community involvement
- Preserve all contact methods: email, phone, LinkedIn, GitHub, portfolio websites, social media

DATA QUALITY STANDARDS:
- Real company names from the text or contextually appropriate realistic names
- Specific job titles that match industry standards and career progression
- Accurate date ranges in MM/YYYY format
- Detailed achievement statements with quantified impact
- Technical skills that align with the candidate's field and experience level
- Professional language throughout all sections
- ATS-optimized keyword density (2-3% for key terms)
- Logical career progression and timeline consistency

Return a JSON object with this EXACT structure:
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "summary": "",
    "linkedin": "",
    "website": "",
    "profilePicture": "",
    "dateOfBirth": "",
    "gender": "",
    "confidence": 0.0
  },
  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "description": "",
      "achievements": [],
      "technologies": [],
      "keywords": [],
      "confidence": 0.0
    }
  ],
  "education": [
    {
      "degree": "",
      "school": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "gpa": "",
      "honors": "",
      "relevantCoursework": [],
      "confidence": 0.0
    }
  ],
  "skills": {
    "technical": {
      "programming": [
        {
          "skill": "",
          "proficiency": "",
          "category": ""
        }
      ],
      "frameworks": [
        {
          "skill": "",
          "proficiency": "",
          "category": ""
        }
      ],
      "databases": [
        {
          "skill": "",
          "proficiency": "",
          "category": ""
        }
      ],
      "tools": [
        {
          "skill": "",
          "proficiency": "",
          "category": ""
        }
      ],
      "cloud": [
        {
          "skill": "",
          "proficiency": "",
          "category": ""
        }
      ],
      "confidence": 0.0
    },
    "soft": [
      {
        "skill": "",
        "proficiency": ""
      }
    ],
    "languages": [
      {
        "language": "",
        "proficiency": ""
      }
    ],
    "certifications": []
  },
  "projects": [
    {
      "title": "",
      "description": "",
      "technologies": [],
      "startDate": "",
      "endDate": "",
      "url": "",
      "github": "",
      "achievements": [],
      "confidence": 0.0
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": "",
      "expiryDate": "",
      "credentialId": "",
      "url": "",
      "confidence": 0.0
    }
  ],
  "awards": [
    {
      "name": "",
      "issuer": "",
      "date": "",
      "description": "",
      "confidence": 0.0
    }
  ],
  "publications": [
    {
      "title": "",
      "publisher": "",
      "publicationDate": "",
      "url": "",
      "doi": "",
      "description": "",
      "confidence": 0.0
    }
  ],
  "customSections": [
    {
      "sectionName": "",
      "content": "",
      "confidence": 0.0
    }
  ],
  "volunteer": [
    {
      "organization": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "description": "",
      "confidence": 0.0
    }
  ],
  "sectionStructure": {
    "detectedSections": [],
    "sectionBoundaries": {},
    "formatMetadata": {
      "hasBulletPoints": false,
      "indentationLevel": 0,
      "fontHints": [],
      "layoutType": ""
    }
  },
  "atsOptimization": {
    "score": 0,
    "keywordDensity": 0.0,
    "sectionCompleteness": 0.0,
    "readabilityScore": 0.0,
    "suggestions": [
      {
        "category": "",
        "priority": "",
        "issue": "",
        "suggestion": "",
        "impact": 0
      }
    ]
  },
  "confidenceMetrics": {
    "overall": 0.0,
    "personalInfo": 0.0,
    "experience": 0.0,
    "education": 0.0,
    "skills": 0.0,
    "sections": {}
  },
  "suggestions": [
    {
      "category": "",
      "priority": "",
      "issue": "",
      "suggestion": "",
      "impact": 0
    }
  ],
  "metadata": {
    "fileName": "",
    "extractionTimestamp": "",
    "extractionMethod": "ai-powered",
    "processingVersion": "1.0"
  }
}`;

    const enhancedInstructions = enhancedProcessing ? `
ENHANCED PROCESSING MODE ACTIVE
==============================
Text Quality: ${textQuality || 'standard'}
Enhanced Context: ${enhancedProcessing ? 'YES' : 'NO'}

STRICT QUALITY REQUIREMENTS:
- NEVER use placeholder text like "Company", "Position", "Technology Company"
- Extract real names, dates, and specific details from the source text
- Generate realistic professional content for missing sections
- Ensure all company names are either extracted or contextually realistic
- Use specific job titles that match industry standards
- Include quantified achievements and metrics wherever possible
- Maintain logical career progression and timeline consistency
` : '';

    const userPrompt = `${enhancedInstructions}

Extract comprehensive resume data from this text with maximum accuracy and professional enhancement:

FILE: ${fileName}
TYPE: ${fileType}
PROCESSING MODE: ${enhancedProcessing ? 'Enhanced' : 'Standard'}

TEXT CONTENT:
${text}

CRITICAL EXTRACTION REQUIREMENTS:
1. EXTRACT real company names, job titles, and dates - never use "Company" or generic placeholders
2. Parse all contact information accurately (email, phone, LinkedIn, websites)
3. Transform job responsibilities into achievement-oriented statements with metrics
4. Generate realistic professional content for incomplete sections based on context
5. Categorize technical skills by type with appropriate proficiency levels
6. Extract education details including specific institutions, degrees, and dates
7. Identify certifications, projects, publications, and custom achievements
8. Calculate accurate confidence scores based on data quality and completeness
9. Generate ATS optimization recommendations with industry-specific keywords
10. Ensure all dates follow MM/YYYY format and maintain chronological consistency
11. Create professional summaries that reflect the candidate's actual experience
12. Include industry-appropriate terminology and technical competencies
13. Optimize keyword density for ATS compatibility (2-3% for key terms)
14. Preserve all volunteer work, side projects, and community involvement

ENHANCED QUALITY STANDARDS:
- Real or realistic company names (never "Company" or "Technology Company")
- Specific, industry-appropriate job titles that show career progression
- Quantified achievements with metrics and measurable impact
- Technical skills that align with the candidate's field and experience level
- Professional language throughout all sections
- Logical timeline and career progression
- Comprehensive contact information extraction
- Industry-specific keywords and modern terminology

RESPONSE FORMAT: Return ONLY valid JSON with no additional text, comments, or explanations.`;

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
        temperature: enhancedProcessing ? 0.2 : 0.1,
        max_tokens: 12000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`AI extraction failed: ${response.status}`);
    }

    const data = await response.json();
    const extractedContent = data.choices[0].message.content;

    // Parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(extractedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw response:', extractedContent);
      throw new Error('AI returned invalid JSON format');
    }

    // Add metadata
    parsedData.metadata = {
      ...parsedData.metadata,
      fileName,
      extractionTimestamp: new Date().toISOString(),
      extractionMethod: 'ai-powered',
      processingVersion: '1.0'
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        ...parsedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI resume extraction:', error);
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
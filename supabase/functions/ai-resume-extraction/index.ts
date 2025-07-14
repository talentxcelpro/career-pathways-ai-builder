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
    const { text, fileName, fileType, extractionLevel } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing resume extraction:', { fileName, fileType, extractionLevel, textLength: text.length });

    const systemPrompt = `You are an expert resume parser with advanced text analysis capabilities and deep ATS optimization knowledge. Your job is to extract structured data from resumes and improve incomplete sections.

CRITICAL REQUIREMENTS:
1. Extract ALL available information from the text with high accuracy
2. For missing or incomplete sections, generate professional content based on context
3. Return valid JSON with the exact structure provided
4. Use confidence scores (0.0-1.0): 1.0 for extracted data, 0.7 for AI-generated content
5. Categorize technical skills by type and include proficiency levels
6. Convert all responsibilities into achievement-oriented bullet points
7. If sections are empty, generate appropriate content based on available context
8. Optimize content for ATS systems with relevant keywords
9. Extract comprehensive personal details including social profiles
10. Identify publications, papers, and custom achievement sections

ADVANCED EXTRACTION RULES:
- Transform basic job descriptions into quantified achievement statements
- Add specific metrics where logical (e.g., "managed team" → "managed team of 5+ members")
- Standardize formatting and professional language across all sections
- Generate missing professional summaries based on experience patterns
- Ensure keyword density is optimal for ATS systems (2-3% for key terms)
- Extract industry-specific terminology and technical competencies
- For skills, always include proficiency levels: "Beginner", "Intermediate", "Advanced", "Expert"
- Categorize skills by type: "Programming Languages", "Frameworks", "Databases", "Tools", "Cloud Platforms", "Soft Skills"
- Extract publications, research papers, and academic achievements
- Look for additional personal details like profile pictures, social profiles, certifications
- Identify custom sections like honors, volunteering, hackathons, competitions
- Extract contact information comprehensively including LinkedIn, portfolios, GitHub

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

    const userPrompt = `Extract comprehensive resume data from this text with enhanced AI processing:

FILE: ${fileName}
TYPE: ${fileType}

TEXT CONTENT:
${text}

COMPREHENSIVE EXTRACTION INSTRUCTIONS:
1. Extract ALL sections you can identify with high accuracy
2. For dates, use MM/YYYY format when possible, standardize date formats
3. Group technical skills by category with proficiency levels (Beginner/Intermediate/Advanced/Expert)
4. Extract specific achievements with quantifiable results and metrics
5. Identify all contact information including social media profiles
6. Calculate confidence scores based on text clarity and completeness
7. Generate professional ATS optimization suggestions with keyword analysis
8. Extract publications, research papers, academic achievements
9. Identify custom sections like honors, volunteering, competitions, hackathons
10. Optimize content for professional impact and ATS compatibility
11. For missing sections, generate appropriate professional content based on existing data
12. Include industry-specific keywords and technical terminology
13. Transform passive descriptions into active, achievement-focused statements
14. Ensure all extracted data follows professional resume standards

QUALITY ASSURANCE:
- Verify all extracted information is accurate to the source
- Ensure generated content is contextually appropriate
- Maintain professional tone throughout all sections
- Optimize for both human readability and ATS parsing
- Include relevant keywords for the candidate's industry and role

Return ONLY valid JSON with no additional text or explanations.`;

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
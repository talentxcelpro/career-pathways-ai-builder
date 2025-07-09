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

    const systemPrompt = `You are an advanced resume parsing AI. Extract and structure comprehensive resume data from the provided text.

CRITICAL REQUIREMENTS:
1. Extract ONLY information that exists in the text
2. DO NOT generate or fabricate information
3. Return valid JSON with the exact structure provided
4. Use confidence scores (0.0-1.0) based on text clarity
5. Parse technical skills separately by category
6. Extract quantifiable achievements with numbers/percentages

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
      "programming": [],
      "frameworks": [],
      "databases": [],
      "tools": [],
      "cloud": [],
      "confidence": 0.0
    },
    "soft": [],
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

    const userPrompt = `Extract comprehensive resume data from this text:

FILE: ${fileName}
TYPE: ${fileType}

TEXT CONTENT:
${text}

Instructions:
- Extract ALL sections you can identify
- For dates, use MM/YYYY format when possible
- Group technical skills by category (programming, frameworks, databases, tools, cloud)
- Extract specific achievements with quantifiable results
- Identify all contact information
- Calculate confidence scores based on text clarity
- Generate ATS optimization suggestions
- Return ONLY valid JSON with no additional text`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 4000,
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
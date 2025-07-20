
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  console.log('=== AI Resume Parser Function Called ===');
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const requestBody = await req.json();
    const { extractedText, fileName } = requestBody;

    if (!extractedText) {
      throw new Error('Missing extracted text');
    }

    console.log('Processing resume text for:', fileName);

    const systemPrompt = `You are a professional resume parsing assistant. Extract all important details from the given resume text and return them in the exact JSON format specified below. Be thorough and accurate.

Return JSON in this exact structure:
{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "summary": "",
  "skills": [],
  "work_experience": [
    {
      "company": "",
      "title": "",
      "duration": "",
      "location": "",
      "description": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "duration": "",
      "location": ""
    }
  ],
  "certifications": [],
  "projects": [],
  "languages": [],
  "linkedin": "",
  "github": "",
  "portfolio": ""
}

Guidelines:
- Extract the full name from the document
- Find email, phone, and location information
- Parse work experience with company, title, duration, and descriptions
- Extract education details including degree, institution, and timeframe
- Identify all skills mentioned (technical, soft skills, tools, etc.)
- Find certifications, projects, and languages if mentioned
- Extract social media links (LinkedIn, GitHub, portfolio)
- If information is not available, use empty string or empty array
- Ensure all dates are normalized to readable format`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Parse this resume text:\n\n${extractedText}` }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    console.log('OpenAI response received');

    let parsedResume;
    try {
      const content = aiResult.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }
      
      // Clean the response to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      
      parsedResume = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Calculate confidence score based on completeness
    let confidenceScore = 0;
    const fields = ['name', 'email', 'phone', 'summary'];
    fields.forEach(field => {
      if (parsedResume[field] && parsedResume[field].length > 0) {
        confidenceScore += 25;
      }
    });

    // Bonus points for experience and education
    if (parsedResume.work_experience && parsedResume.work_experience.length > 0) {
      confidenceScore += 15;
    }
    if (parsedResume.education && parsedResume.education.length > 0) {
      confidenceScore += 15;
    }
    if (parsedResume.skills && parsedResume.skills.length > 0) {
      confidenceScore += 10;
    }

    const result = {
      success: true,
      data: {
        structured_resume: parsedResume,
        raw_text: extractedText,
        key_metrics: {
          years_experience: extractYearsOfExperience(parsedResume.work_experience || []),
          top_skills_matched: parsedResume.skills?.slice(0, 5) || [],
          confidence_score: Math.min(confidenceScore, 100)
        }
      }
    };

    console.log('Parsing completed successfully with confidence:', confidenceScore);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('❌ Function error:', error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
});

function extractYearsOfExperience(workExperience: any[]): number {
  if (!workExperience || workExperience.length === 0) return 0;
  
  let totalYears = 0;
  workExperience.forEach(job => {
    if (job.duration) {
      const yearMatch = job.duration.match(/(\d+)\s*(?:years?|yrs?)/i);
      if (yearMatch) {
        totalYears += parseInt(yearMatch[1]);
      } else {
        // Try to parse date ranges
        const dateRange = job.duration.match(/(\d{4})\s*[-–—]\s*(\d{4}|present|current)/i);
        if (dateRange) {
          const startYear = parseInt(dateRange[1]);
          const endYear = dateRange[2].toLowerCase().includes('present') || dateRange[2].toLowerCase().includes('current') 
            ? new Date().getFullYear() 
            : parseInt(dateRange[2]);
          totalYears += Math.max(0, endYear - startYear);
        }
      }
    }
  });
  
  return totalYears;
}

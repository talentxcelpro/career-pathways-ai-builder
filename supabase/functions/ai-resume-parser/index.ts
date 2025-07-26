
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
  "skills": {
    "technical": [],
    "soft": [],
    "languages": [],
    "tools": [],
    "frameworks": [],
    "databases": [],
    "certifications": []
  },
  "work_experience": [
    {
      "company": "",
      "title": "",
      "duration": "",
      "location": "",
      "description": "",
      "achievements": [],
      "technologies_used": []
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "duration": "",
      "location": "",
      "gpa": "",
      "relevant_coursework": [],
      "honors": []
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": "",
      "expiry": "",
      "credential_id": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "duration": "",
      "link": "",
      "role": ""
    }
  ],
  "languages": [
    {
      "language": "",
      "proficiency": ""
    }
  ],
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "additional_links": []
}

Guidelines:
- Categorize skills into technical (programming languages), soft (leadership, communication), tools (software), frameworks, databases, and languages
- Extract detailed work achievements and technologies used in each role
- Parse education with GPA, coursework, and honors if mentioned
- Structure certifications with issuer, dates, and credential IDs
- Break down projects with technologies, duration, and links
- Specify language proficiency levels (native, fluent, conversational, basic)
- If information is not available, use empty string or empty array
- Ensure all dates are normalized to readable format
- Focus on quantifiable achievements and specific technical details`;

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

    // Enhanced confidence scoring and metrics calculation
    const confidenceMetrics = calculateAdvancedConfidence(parsedResume);
    const atsMetrics = calculateATSCompatibility(parsedResume, extractedText);
    const qualityMetrics = calculateContentQuality(parsedResume, extractedText);

    const result = {
      success: true,
      data: {
        structured_resume: parsedResume,
        raw_text: extractedText,
        field_confidence: confidenceMetrics.fieldConfidence,
        ats_compatibility: atsMetrics,
        content_quality: qualityMetrics,
        key_metrics: {
          years_experience: extractYearsOfExperience(parsedResume.work_experience || []),
          top_skills_matched: getAllSkills(parsedResume.skills || {}).slice(0, 5),
          confidence_score: confidenceMetrics.overallScore,
          completeness_percentage: confidenceMetrics.completeness
        }
      }
    };

    console.log('Parsing completed successfully with confidence:', confidenceMetrics.overallScore);

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

function getAllSkills(skills: any): string[] {
  if (!skills || typeof skills !== 'object') return [];
  
  const allSkills: string[] = [];
  Object.values(skills).forEach(skillArray => {
    if (Array.isArray(skillArray)) {
      allSkills.push(...skillArray);
    }
  });
  
  return allSkills;
}

function calculateAdvancedConfidence(resume: any) {
  const fieldConfidence: any[] = [];
  let totalScore = 0;
  let maxScore = 0;
  let completenessScore = 0;
  let maxCompleteness = 0;

  // Evaluate each field
  const fields = [
    { name: 'name', weight: 10, required: true },
    { name: 'email', weight: 10, required: true },
    { name: 'phone', weight: 8, required: true },
    { name: 'location', weight: 5, required: false },
    { name: 'summary', weight: 8, required: false },
    { name: 'work_experience', weight: 25, required: true },
    { name: 'education', weight: 15, required: true },
    { name: 'skills', weight: 15, required: true },
    { name: 'certifications', weight: 4, required: false }
  ];

  fields.forEach(field => {
    maxScore += field.weight;
    maxCompleteness += field.required ? 1 : 0.5;
    
    const value = resume[field.name];
    let confidence = 0;
    let quality = 0;
    let completeness = 0;

    if (value) {
      if (typeof value === 'string' && value.trim().length > 0) {
        confidence = field.name === 'summary' && value.length > 50 ? field.weight : field.weight * 0.8;
        quality = value.length > 10 ? 1 : 0.6;
        completeness = field.required ? 1 : 0.5;
      } else if (Array.isArray(value) && value.length > 0) {
        confidence = field.weight;
        quality = value.length >= 3 ? 1 : value.length / 3;
        completeness = field.required ? 1 : 0.5;
      } else if (typeof value === 'object' && Object.keys(value).length > 0) {
        const subValues = Object.values(value).flat();
        confidence = subValues.length > 0 ? field.weight : 0;
        quality = subValues.length >= 5 ? 1 : subValues.length / 5;
        completeness = field.required ? 1 : 0.5;
      }
    }

    fieldConfidence.push({
      field: field.name,
      value: value,
      confidence: Math.round((confidence / field.weight) * 100),
      completeness: completeness,
      quality_score: Math.round(quality * 100)
    });

    totalScore += confidence;
    completenessScore += completeness;
  });

  return {
    fieldConfidence,
    overallScore: Math.round((totalScore / maxScore) * 100),
    completeness: Math.round((completenessScore / maxCompleteness) * 100)
  };
}

function calculateATSCompatibility(resume: any, rawText: string) {
  let score = 0;
  let keywordDensity = 0;
  let formatScore = 0;
  let sectionCompleteness = 0;

  // Check keyword density
  const keywords = ['experience', 'skills', 'education', 'project', 'achievement'];
  const textLower = rawText.toLowerCase();
  keywords.forEach(keyword => {
    const matches = (textLower.match(new RegExp(keyword, 'g')) || []).length;
    keywordDensity += matches;
  });
  keywordDensity = Math.min((keywordDensity / rawText.split(' ').length) * 1000, 100);

  // Format score based on structure
  formatScore += resume.name ? 20 : 0;
  formatScore += resume.email ? 20 : 0;
  formatScore += resume.work_experience?.length > 0 ? 30 : 0;
  formatScore += resume.education?.length > 0 ? 20 : 0;
  formatScore += resume.skills ? 10 : 0;

  // Section completeness
  const sections = ['name', 'email', 'work_experience', 'education', 'skills'];
  sectionCompleteness = (sections.filter(section => resume[section]).length / sections.length) * 100;

  score = Math.round((formatScore + keywordDensity + sectionCompleteness) / 3);

  return {
    score: Math.min(score, 100),
    keyword_density: Math.round(keywordDensity),
    format_score: formatScore,
    section_completeness: Math.round(sectionCompleteness)
  };
}

function calculateContentQuality(resume: any, rawText: string) {
  let overallScore = 0;
  let grammarScore = 80; // Assume good grammar by default
  let detailLevel = 0;
  let achievementFocus = 0;

  // Detail level based on content length
  const avgDescLength = resume.work_experience?.reduce((acc: number, exp: any) => 
    acc + (exp.description?.length || 0), 0) / (resume.work_experience?.length || 1);
  detailLevel = Math.min((avgDescLength / 100) * 100, 100);

  // Achievement focus (look for quantifiable achievements)
  const achievementKeywords = ['increased', 'improved', 'reduced', 'achieved', 'delivered', '%', '$'];
  achievementFocus = achievementKeywords.reduce((acc, keyword) => 
    acc + (rawText.toLowerCase().includes(keyword) ? 1 : 0), 0) * 10;

  overallScore = Math.round((grammarScore + detailLevel + achievementFocus) / 3);

  return {
    overall_score: Math.min(overallScore, 100),
    grammar_score: grammarScore,
    detail_level: Math.round(detailLevel),
    achievement_focus: Math.min(Math.round(achievementFocus), 100)
  };
}

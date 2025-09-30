
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

  let fileName = 'resume';
  try {
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const requestBody = await req.json();
    const { extractedText, fileName: requestFileName } = requestBody;
    fileName = requestFileName || 'resume';

    if (!extractedText || extractedText.trim().length === 0) {
      console.warn('⚠️ No extracted text provided, using fallback parsing');
      
      // Create a basic fallback resume when no text is provided
      const fallbackResume = createFallbackResume('', fileName);
      
      const result = {
        success: true,
        data: {
          structured_resume: fallbackResume,
          raw_text: '',
          field_confidence: [{ field: 'fallback', confidence: 30, note: 'No text extracted, using filename-based parsing' }],
          ats_compatibility: { score: 30, note: 'Limited analysis - no text content available' },
          content_quality: { overall_score: 30, note: 'Limited analysis - no text content available' },
          key_metrics: {
            years_experience: 0,
            top_skills_matched: [],
            confidence_score: 30,
            completeness_percentage: 20,
            fallback_mode: true,
            extraction_issue: 'No text content available'
          }
        }
      };
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    }

    console.log('Processing resume text for:', fileName);

    // Import AI fallback utility
    const { generateJSONWithFallback } = await import('../_shared/ai-fallback.ts');

    const systemPrompt = `You are a professional resume parsing assistant. Extract all important details from the given resume text and return them in the exact JSON format specified below. Be thorough and accurate.

CRITICAL NAME EXTRACTION RULES:
- Extract the ACTUAL PERSON'S NAME, never job titles, company names, or descriptive text
- Look for names at the top of the resume, in headers, or contact sections
- Names should be 2-4 words and contain only letters, spaces, apostrophes, or hyphens
- Reject phrases like "International Voice Process Executive", "Summary Experienced Assistant", "Having Experience"
- If no clear person name is found, leave "name" field empty rather than using incorrect text
- Examples of VALID names: "John Smith", "Sarah O'Connor", "Maria Garcia-Lopez"
- Examples of INVALID names: "Experienced Professional", "Software Engineer", "Resume Summary"

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
- MOST IMPORTANT: Extract the correct person's name, not job titles or descriptions
- Categorize skills into technical (programming languages), soft (leadership, communication), tools (software), frameworks, databases, and languages
- Extract detailed work achievements and technologies used in each role
- Parse education with GPA, coursework, and honors if mentioned
- Structure certifications with issuer, dates, and credential IDs
- Break down projects with technologies, duration, and links
- Specify language proficiency levels (native, fluent, conversational, basic)
- If information is not available, use empty string or empty array
- Ensure all dates are normalized to readable format
- Focus on quantifiable achievements and specific technical details`;

    // Use AI fallback for better reliability
    const aiResult = await generateJSONWithFallback(
      systemPrompt,
      `Parse this resume text:\n\n${extractedText}`,
      {
        model: 'gpt-5-mini-2025-08-07',
        maxTokens: 2000,
        temperature: 0.3
      }
    );

    console.log(`✅ Resume parsed successfully using ${aiResult.provider}`);
    const parsedResume = aiResult.data;
    
    // Validate parsed resume structure
    if (!parsedResume || typeof parsedResume !== 'object') {
      throw new Error('Invalid resume structure returned from AI');
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
    
    // Check if it's an AI service failure
    const isAIFailure = (error as Error).message?.includes('quota') ||
                       (error as Error).message?.includes('unavailable') ||
                       (error as Error).message?.includes('API error');
    
    if (isAIFailure) {
      console.log('🔄 Attempting basic text extraction fallback...');
      
      // Basic fallback parsing when AI fails
      const fallbackResume = createFallbackResume('Resume text not available', fileName);
      
      const result = {
        success: true,
        data: {
          structured_resume: fallbackResume,
          raw_text: 'Resume text not available',
          field_confidence: [{ field: 'fallback', confidence: 40, note: 'AI services unavailable, basic extraction used' }],
          ats_compatibility: { score: 50, note: 'Limited analysis - AI services unavailable' },
          content_quality: { overall_score: 50, note: 'Limited analysis - AI services unavailable' },
          key_metrics: {
            years_experience: 0,
            top_skills_matched: [],
            confidence_score: 40,
            completeness_percentage: 30,
            fallback_mode: true
          }
        }
      };
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    }
    
    const errorResponse = {
      success: false,
      error: (error as Error).message || 'Unknown error occurred',
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

function createFallbackResume(text: string, fileName?: string): any {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Try to extract basic info using simple patterns
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/(?:\+91|91)?[-.\s]?[789]\d{9}/);
  
  // Simple name extraction - take first non-empty line that looks like a name
  let name = '';
  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim();
    if (trimmed.length > 2 && trimmed.length < 50 && 
        /^[a-zA-Z\s.'-]+$/.test(trimmed) && 
        !trimmed.toLowerCase().includes('resume') &&
        !trimmed.toLowerCase().includes('cv')) {
      name = trimmed;
      break;
    }
  }
  
  // If no name found, use filename without extension
  if (!name && fileName) {
    name = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  }

  return {
    name: name || '',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    location: '',
    summary: 'Resume processed with basic text extraction due to AI service limitations.',
    skills: {
      technical: [],
      soft: [],
      languages: [],
      tools: [],
      frameworks: [],
      databases: [],
      certifications: []
    },
    work_experience: [],
    education: [],
    certifications: [],
    projects: [],
    languages: [],
    linkedin: '',
    github: '',
    portfolio: '',
    additional_links: []
  };
}

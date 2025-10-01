
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  console.log('=== AI Resume Parser Function Called ===');
  console.log('Method:', req.method);

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
    if (!LOVABLE_API_KEY) {
      throw new Error('Missing LOVABLE_API_KEY');
    }

    const requestBody = await req.json();
    const { extractedText, fileName: requestFileName } = requestBody;
    fileName = requestFileName || 'resume';

    console.log('📄 Received request for file:', fileName);
    console.log('📝 Extracted text length:', extractedText?.length || 0);
    console.log('📋 First 500 chars of text:', extractedText?.substring(0, 500));

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

    // Use Lovable AI (Gemini - FREE!)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Parse this resume text:\n\n${extractedText.substring(0, 30000)}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again shortly." }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const parsedText = aiData.choices[0].message.content;

    console.log('✅ Raw AI response received');
    console.log('🤖 AI parsed response preview:', parsedText.substring(0, 300));

    // Extract JSON from response (handle markdown code blocks)
    let parsedResume;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = parsedText.match(/```json\n([\s\S]*?)\n```/) || 
                        parsedText.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : parsedText;
      
      parsedResume = JSON.parse(jsonStr);
      
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      parsedResume = createFallbackResume(extractedText, fileName);
    }
    
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
  console.log('🔄 Creating fallback resume from text...');
  const lines = text.split('\n').filter(line => line.trim());
  
  // Extract email
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const email = emailMatch?.[0] || '';
  
  // Extract phone
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
  const phone = phoneMatch?.[0] || '';
  
  // Extract name - look for name patterns at the start
  let name = '';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    // Skip if line is too long (likely not a name)
    if (line.length > 50) continue;
    // Skip if line has common non-name patterns
    if (/\d{4}|\d+\s*(years?|months?)|experience|summary|objective|professional|profile|resume|curriculum|vitae/i.test(line)) continue;
    // Skip if line has email or phone
    if (email && line.includes(email)) continue;
    if (phone && line.includes(phone)) continue;
    // Check if it looks like a name (2-4 words, mostly letters)
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && /^[A-Za-z\s\-'.]+$/.test(line)) {
      name = line;
      break;
    }
  }
  
  // Fallback to filename if no name found
  if (!name && fileName && fileName !== 'resume') {
    name = fileName.replace(/[_-]/g, ' ').replace(/\.(pdf|docx|doc|txt)$/i, '').trim();
  }
  
  // Extract location (look for city, state patterns)
  const locationMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s*[A-Z]{2,})/);
  const location = locationMatch?.[0] || '';
  
  // Extract summary (first substantial paragraph)
  let summary = '';
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 100 && line.length < 500 && !line.includes('@') && !/^\d/.test(line)) {
      summary = line;
      break;
    }
  }
  
  // If no summary, use first paragraph of text
  if (!summary) {
    summary = text.substring(0, 300).replace(/\s+/g, ' ').trim();
  }
  
  console.log('📋 Fallback extracted:', { name, email, phone, location, summaryLength: summary.length });

  return {
    name: name || '',
    email: email,
    phone: phone,
    location: location,
    summary: summary,
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

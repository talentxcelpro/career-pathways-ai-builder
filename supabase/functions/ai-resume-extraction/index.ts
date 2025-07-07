import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ATSOptimization {
  score: number;
  keywordDensity: number;
  sectionCompleteness: number;
  readabilityScore: number;
  suggestions: Array<{
    category: 'keywords' | 'structure' | 'content' | 'formatting';
    priority: 'high' | 'medium' | 'low';
    issue: string;
    suggestion: string;
    impact: number;
  }>;
}

interface ConfidenceMetrics {
  overall: number;
  personalInfo: number;
  experience: number;
  education: number;
  skills: number;
  sections: Record<string, number>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, fileName, fileType, extractionLevel = 'comprehensive' } = await req.json();

    if (!text) {
      throw new Error('No resume text provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing resume with advanced AI extraction:', fileName, 'Type:', fileType);

    // Enhanced prompt with NLP-style instructions
    const enhancedPrompt = `You are an expert resume parser with advanced NLP capabilities. Analyze this resume text with maximum accuracy using modern extraction techniques.

EXTRACTION REQUIREMENTS:
1. Use Named Entity Recognition (NER) principles to identify:
   - PERSON (names, titles)
   - ORG (companies, institutions) 
   - DATE (employment dates, education dates)
   - SKILL (technical and soft skills)
   - LOCATION (addresses, work locations)

2. Apply section detection using:
   - Header pattern matching (e.g., "Work Experience", "Education")
   - Layout analysis cues (bullet points, indentation)
   - Context-aware boundary detection

3. Implement confidence scoring for each extracted field (0.0-1.0)

4. Preserve original formatting and structure metadata

RETURN COMPREHENSIVE JSON:
{
  "personalInfo": {
    "fullName": "exact name with confidence",
    "email": "exact email",
    "phone": "standardized phone format",
    "location": "full address/location",
    "summary": "complete professional summary word-for-word",
    "linkedin": "linkedin profile URL",
    "website": "personal website URL",
    "confidence": 0.95
  },
  "experience": [
    {
      "title": "exact job title",
      "company": "exact company name", 
      "location": "job location",
      "startDate": "MM/YYYY format",
      "endDate": "MM/YYYY or Present",
      "duration": "calculated duration",
      "description": "complete job description",
      "achievements": ["quantified achievements with metrics"],
      "technologies": ["specific technologies mentioned"],
      "keywords": ["relevant industry keywords"],
      "confidence": 0.90
    }
  ],
  "education": [
    {
      "degree": "exact degree name",
      "school": "exact institution name",
      "location": "school location",
      "startDate": "start date",
      "endDate": "graduation date",
      "gpa": "GPA if mentioned",
      "honors": "honors/distinctions",
      "relevantCoursework": ["specific courses"],
      "confidence": 0.88
    }
  ],
  "skills": {
    "technical": {
      "programming": ["languages with proficiency levels"],
      "frameworks": ["frameworks and libraries"],
      "databases": ["database technologies"],
      "tools": ["development tools"],
      "cloud": ["cloud platforms"],
      "confidence": 0.92
    },
    "soft": ["leadership", "communication", "etc"],
    "languages": [{"language": "English", "proficiency": "Native"}],
    "certifications": ["active certifications"]
  },
  "projects": [
    {
      "title": "project name",
      "description": "detailed description",
      "technologies": ["tech stack used"],
      "startDate": "start date",
      "endDate": "end date", 
      "url": "project URL",
      "github": "repository link",
      "achievements": ["measurable outcomes"],
      "confidence": 0.85
    }
  ],
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing organization",
      "date": "date obtained",
      "expiryDate": "expiry if applicable",
      "credentialId": "credential ID",
      "url": "verification URL",
      "confidence": 0.90
    }
  ],
  "awards": [
    {
      "name": "award name",
      "issuer": "organization",
      "date": "date received",
      "description": "award details",
      "confidence": 0.87
    }
  ],
  "volunteer": [
    {
      "organization": "organization name",
      "role": "volunteer position",
      "startDate": "start date",
      "endDate": "end date",
      "description": "volunteer activities",
      "confidence": 0.85
    }
  ],
  "sectionStructure": {
    "detectedSections": ["list of identified sections"],
    "sectionBoundaries": {"section": "line_numbers"},
    "formatMetadata": {
      "hasBulletPoints": true,
      "indentationLevel": 2,
      "fontHints": ["bold headers detected"],
      "layoutType": "traditional/modern/creative"
    }
  },
  "confidenceMetrics": {
    "overall": 0.89,
    "personalInfo": 0.95,
    "experience": 0.88,
    "education": 0.92,
    "skills": 0.85,
    "sections": {"experience": 0.90, "education": 0.88}
  }
}

EXTRACTION RULES:
- Extract EXACTLY what is written - no interpretation
- Maintain original wording and phrasing
- For dates, standardize to MM/YYYY format when possible
- Calculate durations for experience entries
- Identify and preserve quantified achievements (numbers, percentages)
- Detect industry-specific keywords and technologies
- Assign confidence scores based on text clarity and context
- Preserve formatting cues (bullets, indentation, sections)

Resume text to analyze:
${text}

Return ONLY valid JSON with comprehensive extraction and confidence metrics.`;

    // Use advanced model for better NLP capabilities
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Use most capable model for resume parsing
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert resume parser with advanced NLP capabilities. Analyze resumes with maximum accuracy and provide comprehensive extraction with confidence metrics.'
          },
          { role: 'user', content: enhancedPrompt }
        ],
        temperature: 0.1,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      
      // Fallback to GPT-4o if Claude fails
      const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert resume parser. Extract information accurately and return comprehensive JSON.'
            },
            { role: 'user', content: enhancedPrompt }
          ],
          temperature: 0.1,
          max_tokens: 6000,
        }),
      });

      if (!fallbackResponse.ok) {
        throw new Error(`AI parsing failed: ${response.status}`);
      }

      const fallbackData = await fallbackResponse.json();
      return await processAIResponse(fallbackData.choices[0].message.content, fileName);
    }

    const data = await response.json();
    return await processAIResponse(data.choices[0].message.content, fileName);

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

async function processAIResponse(extractedContent: string, fileName: string) {
  console.log('AI extracted content length:', extractedContent.length);

  let parsedData;
  try {
    parsedData = JSON.parse(extractedContent);
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON:', parseError);
    // Return enhanced default structure
    parsedData = getDefaultResumeStructure();
  }

  // Calculate comprehensive ATS score
  const atsOptimization = calculateAdvancedATSScore(parsedData);
  
  // Calculate confidence metrics
  const confidenceMetrics = calculateConfidenceMetrics(parsedData);

  // Generate optimization suggestions
  const suggestions = generateOptimizationSuggestions(parsedData, atsOptimization);

  return new Response(
    JSON.stringify({ 
      ...parsedData, 
      atsOptimization,
      confidenceMetrics,
      suggestions,
      metadata: {
        fileName,
        extractionTimestamp: new Date().toISOString(),
        extractionMethod: 'ai-enhanced-nlp',
        processingVersion: '2.0'
      },
      success: true 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function calculateAdvancedATSScore(data: any): ATSOptimization {
  let score = 0;
  let keywordDensity = 0;
  let sectionCompleteness = 0;
  let readabilityScore = 0;
  const suggestions = [];

  // Personal Info Score (25 points)
  const personalInfo = data.personalInfo || {};
  let personalScore = 0;
  if (personalInfo.fullName) personalScore += 8;
  if (personalInfo.email) personalScore += 6;
  if (personalInfo.phone) personalScore += 6;
  if (personalInfo.location) personalScore += 3;
  if (personalInfo.summary && personalInfo.summary.length > 50) personalScore += 2;
  
  if (personalScore < 20) {
    suggestions.push({
      category: 'content',
      priority: 'high',
      issue: 'Incomplete contact information',
      suggestion: 'Add missing contact details (phone, email, location)',
      impact: 20 - personalScore
    });
  }

  // Experience Score (35 points)
  const experience = data.experience || [];
  let experienceScore = 0;
  if (experience.length > 0) {
    experienceScore += 15;
    const hasQuantifiedAchievements = experience.some(exp => 
      exp.achievements && exp.achievements.some(ach => /\d+/.test(ach))
    );
    if (hasQuantifiedAchievements) experienceScore += 10;
    
    const hasTechnologies = experience.some(exp => exp.technologies && exp.technologies.length > 0);
    if (hasTechnologies) experienceScore += 10;
  } else {
    suggestions.push({
      category: 'content',
      priority: 'high',
      issue: 'No work experience listed',
      suggestion: 'Add detailed work experience with quantified achievements',
      impact: 35
    });
  }

  // Skills Score (20 points)
  const skills = data.skills || {};
  let skillsScore = 0;
  if (skills.technical && Object.keys(skills.technical).length > 0) skillsScore += 12;
  if (skills.soft && skills.soft.length > 0) skillsScore += 4;
  if (skills.certifications && skills.certifications.length > 0) skillsScore += 4;

  // Education Score (10 points)
  const education = data.education || [];
  let educationScore = education.length > 0 ? 10 : 0;

  // Additional Sections Score (10 points)
  let additionalScore = 0;
  if (data.projects && data.projects.length > 0) additionalScore += 4;
  if (data.certifications && data.certifications.length > 0) additionalScore += 3;
  if (data.awards && data.awards.length > 0) additionalScore += 2;
  if (data.volunteer && data.volunteer.length > 0) additionalScore += 1;

  score = personalScore + experienceScore + skillsScore + educationScore + additionalScore;
  sectionCompleteness = (score / 100) * 100;

  // Calculate keyword density
  const allText = JSON.stringify(data).toLowerCase();
  const commonKeywords = [
    'managed', 'developed', 'implemented', 'led', 'created', 'improved',
    'increased', 'reduced', 'optimized', 'collaborated', 'designed'
  ];
  
  const keywordCount = commonKeywords.filter(keyword => allText.includes(keyword)).length;
  keywordDensity = (keywordCount / commonKeywords.length) * 100;

  // Calculate readability score
  const summaryLength = personalInfo.summary ? personalInfo.summary.length : 0;
  const avgDescriptionLength = experience.length > 0 
    ? experience.reduce((sum, exp) => sum + (exp.description ? exp.description.length : 0), 0) / experience.length
    : 0;
  
  readabilityScore = Math.min(100, (summaryLength / 200) * 50 + (avgDescriptionLength / 300) * 50);

  return {
    score: Math.round(score),
    keywordDensity: Math.round(keywordDensity),
    sectionCompleteness: Math.round(sectionCompleteness),
    readabilityScore: Math.round(readabilityScore),
    suggestions
  };
}

function calculateConfidenceMetrics(data: any): ConfidenceMetrics {
  const getConfidence = (obj: any) => obj?.confidence || 0.8;
  
  return {
    overall: data.confidenceMetrics?.overall || 0.85,
    personalInfo: getConfidence(data.personalInfo),
    experience: data.experience?.length > 0 
      ? data.experience.reduce((sum: number, exp: any) => sum + getConfidence(exp), 0) / data.experience.length
      : 0.5,
    education: data.education?.length > 0
      ? data.education.reduce((sum: number, edu: any) => sum + getConfidence(edu), 0) / data.education.length  
      : 0.5,
    skills: getConfidence(data.skills),
    sections: data.confidenceMetrics?.sections || {}
  };
}

function generateOptimizationSuggestions(data: any, ats: ATSOptimization) {
  const suggestions = [...ats.suggestions];

  // Add keyword suggestions
  if (ats.keywordDensity < 60) {
    suggestions.push({
      category: 'keywords',
      priority: 'medium',
      issue: 'Low keyword density',
      suggestion: 'Add more action verbs and industry-specific keywords',
      impact: 15
    });
  }

  // Add structure suggestions
  if (!data.personalInfo?.summary) {
    suggestions.push({
      category: 'structure',
      priority: 'high',
      issue: 'Missing professional summary',
      suggestion: 'Add a compelling professional summary (2-3 sentences)',
      impact: 10
    });
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority] || b.impact - a.impact;
  });
}

function getDefaultResumeStructure() {
  return {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      confidence: 0.5
    },
    experience: [],
    education: [],
    skills: {
      technical: {},
      soft: [],
      languages: [],
      certifications: []
    },
    projects: [],
    certifications: [],
    awards: [],
    volunteer: [],
    sectionStructure: {
      detectedSections: [],
      sectionBoundaries: {},
      formatMetadata: {
        hasBulletPoints: false,
        indentationLevel: 0,
        fontHints: [],
        layoutType: 'unknown'
      }
    },
    confidenceMetrics: {
      overall: 0.5,
      personalInfo: 0.5,
      experience: 0.5,
      education: 0.5,
      skills: 0.5,
      sections: {}
    }
  };
}
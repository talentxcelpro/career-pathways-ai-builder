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

    // Enhanced prompt with NLP-style instructions and improved section detection
    const enhancedPrompt = `You are an expert resume parser with advanced NLP capabilities. Analyze this resume text with maximum accuracy using modern extraction techniques.

CRITICAL PREPROCESSING RULES:
1. IGNORE AND FILTER OUT any lines containing:
   - "RESUME FILE ANALYSIS REQUEST"
   - "File Name:", "File Type:", "File Size:", "Last Modified:"
   - "EXTRACTED TEXT CONTENT:", "PROCESSING INSTRUCTIONS:"
   - Page numbers, headers/footers like "CONFIDENTIAL"
   - Any metadata artifacts or system-generated content

2. FOCUS ONLY ON ACTUAL RESUME CONTENT

ENHANCED SECTION DETECTION:
Use this hybrid approach to identify sections:

Primary Keywords (case-insensitive):
- Work Experience: ["work experience", "work history", "employment", "professional experience", "career history"]
- Education: ["education", "academic background", "academic", "schooling", "degrees"]
- Skills: ["skills", "competencies", "technical skills", "core competencies", "proficiencies"]
- Projects: ["projects", "portfolio", "personal projects", "key projects"]
- Certifications: ["certifications", "licenses", "credentials", "professional certifications"]
- Awards: ["awards", "honors", "achievements", "recognition"]
- Summary: ["summary", "profile", "objective", "professional summary", "about"]

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

4. REQUIRED FIELD VALIDATION - Flag if missing:
   - Personal Info: name, email, phone (minimum required)
   - Work Experience: at least one position with title, company, dates
   - Education: at least one entry
   - Skills: at least 3 technical or professional skills

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
- MINIMUM LENGTH CHECK: If extracted content is too short, flag for manual review

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

  // Enhanced scoring weights
  const SCORE_WEIGHTS = {
    work_experience: 0.30,
    education: 0.20,
    skills: 0.15,
    personal_info: 0.15,
    projects: 0.10,
    certifications: 0.05,
    awards: 0.03,
    volunteer: 0.02
  };

  // Required fields validation
  const REQUIRED_FIELDS = {
    personalInfo: ['fullName', 'email'],
    experience: ['title', 'company', 'startDate'],
    education: ['degree', 'school'],
    skills: ['technical', 'soft']
  };

  let baseScore = 70; // Starting ATS score

  // 1. Personal Info Score (Enhanced validation)
  const personalInfo = data.personalInfo || {};
  let personalScore = 0;
  
  if (personalInfo.fullName?.trim()) personalScore += 25;
  if (personalInfo.email?.includes('@')) personalScore += 20;
  if (personalInfo.phone?.replace(/\D/g, '').length >= 10) personalScore += 15;
  if (personalInfo.location?.trim()) personalScore += 10;
  if (personalInfo.summary?.length > 50) personalScore += 15;
  if (personalInfo.linkedin?.includes('linkedin')) personalScore += 10;
  if (personalInfo.website?.includes('http')) personalScore += 5;

  // Check for missing required personal info
  const missingPersonalFields = REQUIRED_FIELDS.personalInfo.filter(field => !personalInfo[field]?.trim());
  if (missingPersonalFields.length > 0) {
    suggestions.push({
      category: 'content',
      priority: 'high',
      issue: `Missing required personal information: ${missingPersonalFields.join(', ')}`,
      suggestion: 'Add all required contact details for ATS compatibility',
      impact: 25
    });
  }

  // 2. Experience Score (More detailed validation)
  const experience = data.experience || [];
  let experienceScore = 0;
  
  if (experience.length === 0) {
    suggestions.push({
      category: 'content',
      priority: 'high',
      issue: 'No work experience found',
      suggestion: 'Add at least one work experience entry with job title, company, and dates',
      impact: 40
    });
  } else {
    experienceScore += Math.min(experience.length * 15, 60); // Up to 4 experiences
    
    // Check for quantified achievements
    const hasQuantifiedAchievements = experience.some(exp => 
      exp.achievements?.some(ach => /\d+(\.\d+)?%|\$\d+|\d+\+/.test(ach))
    );
    if (hasQuantifiedAchievements) experienceScore += 20;
    
    // Check for technology mentions
    const hasTechnologies = experience.some(exp => exp.technologies?.length > 0);
    if (hasTechnologies) experienceScore += 15;
    
    // Check for action verbs
    const actionVerbs = ['managed', 'led', 'developed', 'created', 'implemented', 'improved', 'increased', 'reduced'];
    const hasActionVerbs = experience.some(exp => 
      actionVerbs.some(verb => exp.description?.toLowerCase().includes(verb))
    );
    if (hasActionVerbs) experienceScore += 10;
    
    // Validate required fields for each experience
    experience.forEach((exp, index) => {
      const missingFields = REQUIRED_FIELDS.experience.filter(field => !exp[field]);
      if (missingFields.length > 0) {
        suggestions.push({
          category: 'structure',
          priority: 'medium',
          issue: `Experience ${index + 1} missing: ${missingFields.join(', ')}`,
          suggestion: 'Complete all required fields for each work experience',
          impact: 10
        });
      }
    });
  }

  // 3. Skills Score (Enhanced validation)
  const skills = data.skills || {};
  let skillsScore = 0;
  
  const technicalSkillsCount = skills.technical ? 
    Object.values(skills.technical).flat().filter(Boolean).length : 0;
  const softSkillsCount = skills.soft?.length || 0;
  const totalSkills = technicalSkillsCount + softSkillsCount;
  
  if (totalSkills >= 10) skillsScore += 30;
  else if (totalSkills >= 5) skillsScore += 20;
  else if (totalSkills >= 3) skillsScore += 10;
  
  if (skills.certifications?.length > 0) skillsScore += 10;
  if (skills.languages?.length > 0) skillsScore += 5;
  
  if (totalSkills < 3) {
    suggestions.push({
      category: 'content',
      priority: 'high',
      issue: 'Insufficient skills listed',
      suggestion: 'Add at least 5-10 relevant technical and soft skills',
      impact: 20
    });
  }

  // 4. Education Score
  const education = data.education || [];
  let educationScore = 0;
  
  if (education.length > 0) {
    educationScore += 20;
    if (education.some(edu => edu.gpa)) educationScore += 5;
    if (education.some(edu => edu.honors)) educationScore += 5;
  } else {
    suggestions.push({
      category: 'content',
      priority: 'medium',
      issue: 'No education information found',
      suggestion: 'Add at least one education entry',
      impact: 15
    });
  }

  // 5. Additional Sections Score
  let additionalScore = 0;
  if (data.projects?.length > 0) additionalScore += 15;
  if (data.certifications?.length > 0) additionalScore += 10;
  if (data.awards?.length > 0) additionalScore += 5;
  if (data.volunteer?.length > 0) additionalScore += 5;

  // Calculate final scores
  score = Math.min(baseScore + (personalScore * 0.15) + (experienceScore * 0.30) + 
                   (skillsScore * 0.15) + (educationScore * 0.20) + (additionalScore * 0.20), 100);

  sectionCompleteness = Math.round((score / 100) * 100);

  // Enhanced keyword density calculation
  const allText = JSON.stringify(data).toLowerCase();
  const industryKeywords = [
    // Action verbs
    'managed', 'developed', 'implemented', 'led', 'created', 'improved',
    'increased', 'reduced', 'optimized', 'collaborated', 'designed',
    // Technical terms
    'project', 'team', 'client', 'customer', 'analysis', 'strategy',
    'solution', 'process', 'system', 'technology', 'business', 'data'
  ];
  
  const keywordCount = industryKeywords.filter(keyword => allText.includes(keyword)).length;
  keywordDensity = Math.round((keywordCount / industryKeywords.length) * 100);

  // Enhanced readability calculation
  const summaryLength = personalInfo.summary?.length || 0;
  const avgDescriptionLength = experience.length > 0 
    ? experience.reduce((sum, exp) => sum + (exp.description?.length || 0), 0) / experience.length
    : 0;
  
  readabilityScore = Math.min(100, 
    (summaryLength > 100 ? 30 : summaryLength * 0.3) +
    (avgDescriptionLength > 200 ? 40 : avgDescriptionLength * 0.2) +
    (experience.length * 10) // Bonus for multiple experiences
  );

  return {
    score: Math.round(score),
    keywordDensity,
    sectionCompleteness,
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
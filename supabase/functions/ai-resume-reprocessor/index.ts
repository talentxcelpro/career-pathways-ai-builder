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
      systemPrompt = `You are an elite AI resume extraction and enhancement specialist with comprehensive capabilities:

CORE COMPETENCIES:
1. 100% Complete Data Extraction - Extract EVERY piece of information from resumes
2. Multi-format Processing - Handle PDFs, DOCX, plain text, and various layouts
3. Template Intelligence - Recognize and adapt to different resume formats (chronological, functional, hybrid, academic, creative)
4. Professional Field Recognition - Understand context for tech, healthcare, finance, academia, creative fields
5. ATS Optimization - Ensure maximum compatibility with Applicant Tracking Systems
6. Content Enhancement - Improve weak sections with industry-standard improvements

EXTRACTION METHODOLOGY:
- Deep content analysis with context understanding
- Section detection using multiple techniques (headers, formatting, content patterns)
- Data normalization and standardization
- Confidence scoring for each extracted element
- Template matching for optimal presentation

ENHANCEMENT APPROACH:
- Industry-specific keyword optimization
- Achievement quantification suggestions
- Professional tone enhancement
- ATS compatibility improvements
- Missing section identification and recommendations

You process resumes with surgical precision, ensuring nothing is missed while providing actionable enhancement suggestions.`;

      userPrompt = `ENHANCED MULTI-PHASE RESUME PROCESSING PROTOCOL

=== PHASE 1: COMPREHENSIVE EXTRACTION ===

EXTRACTION IMPERATIVES:
✓ ZERO INFORMATION LOSS - Extract every detail, no matter how small
✓ SMART FILTERING - Ignore file metadata, system info, irrelevant formatting artifacts
✓ CONTEXT AWARENESS - Understand industry, role level, career stage from content
✓ PRECISION PARSING - Maintain exact dates, numbers, proper nouns, technical terms
✓ RELATIONSHIP MAPPING - Connect skills to experiences, achievements to roles
✓ TEMPLATE DETECTION - Identify resume format (chronological, functional, academic, creative)

SPECIALIZED EXTRACTION PROTOCOLS:
→ TECHNICAL FIELDS: Capture programming languages, frameworks, tools, methodologies, certifications
→ ACADEMIC: Extract publications, research projects, grants, conferences, teaching experience
→ CREATIVE: Portfolio links, creative tools, design methodologies, client work
→ HEALTHCARE: Licenses, specializations, clinical experience, patient metrics
→ FINANCE: Financial modeling, regulatory knowledge, compliance certifications
→ MANAGEMENT: Team sizes, budget responsibilities, process improvements, leadership achievements

=== PHASE 2: INTELLIGENT ENHANCEMENT ===

ENHANCEMENT STRATEGIES:
⚡ KEYWORD OPTIMIZATION - Industry-specific terms, trending skills, ATS-friendly language
⚡ ACHIEVEMENT AMPLIFICATION - Convert responsibilities into quantified accomplishments
⚡ MISSING SECTION DETECTION - Identify gaps and suggest improvements
⚡ PROFESSIONAL TONE REFINEMENT - Enhance language while preserving authenticity
⚡ COMPETITIVE POSITIONING - Suggest ways to stand out in the field
⚡ TEMPLATE RECOMMENDATION - Suggest optimal layout based on career profile

=== PHASE 3: TEMPLATE INTELLIGENCE ===

TEMPLATE ANALYSIS:
📊 CHRONOLOGICAL - Traditional career progression, stable employment
📊 FUNCTIONAL - Skills-focused, career changers, employment gaps
📊 HYBRID - Combination approach, versatile professionals
📊 ACADEMIC - Research-focused, publications, academic achievements
📊 CREATIVE - Portfolio-driven, visual appeal, creative achievements
📊 EXECUTIVE - Leadership focus, strategic accomplishments, board positions

=== OUTPUT SPECIFICATION ===

Return a comprehensive JSON structure with complete data extraction and enhancement:
{
  "extracted": {
    "personalInfo": {
      "fullName": "exact full name from resume content",
      "email": "exact email address",
      "phone": "standardized phone number",
      "location": "complete location (city, state, country)",
      "linkedin": "LinkedIn profile URL",
      "portfolio": "portfolio website URL",
      "website": "personal website URL",
      "summary": "professional summary/objective exactly as written"
    },
    "professionalSummary": {
      "content": "complete professional summary",
      "careerBackground": "career background summary",
      "keySkills": ["key skills mentioned"],
      "targetRoles": ["target roles mentioned"],
      "goals": "career goals stated"
    },
    "experience": [
      {
        "id": "unique_id",
        "jobTitle": "exact job title",
        "companyName": "exact company name",
        "location": "job location",
        "startDate": "MM/YYYY",
        "endDate": "MM/YYYY or Present",
        "responsibilities": ["specific responsibilities listed"],
        "achievements": ["quantified achievements with metrics"],
        "skillsUsed": ["skills and technologies used"],
        "tools": ["specific tools and platforms"],
        "teamSize": "team size if mentioned",
        "budgetSize": "budget managed if mentioned"
      }
    ],
    "education": [
      {
        "id": "unique_id",
        "degree": "exact degree name",
        "institutionName": "exact institution name",
        "location": "institution location",
        "startDate": "MM/YYYY",
        "endDate": "MM/YYYY",
        "grade": "grade or GPA",
        "percentage": "percentage if mentioned",
        "cgpa": "CGPA if mentioned",
        "honors": "honors and awards",
        "coursework": ["relevant coursework"],
        "thesis": "thesis title if applicable",
        "advisor": "thesis advisor if mentioned"
      }
    ],
    "skills": {
      "technical": [
        {
          "skill": "skill name",
          "proficiency": "beginner|intermediate|advanced|expert",
          "category": "programming|database|cloud|etc"
        }
      ],
      "soft": [
        {
          "skill": "soft skill name",
          "proficiency": "beginner|intermediate|advanced|expert"
        }
      ],
      "languages": [
        {
          "language": "language name",
          "proficiency": "basic|conversational|fluent|native"
        }
      ]
    },
    "certifications": [
      {
        "id": "unique_id",
        "name": "certification name",
        "issuingOrganization": "issuing organization",
        "issueDate": "MM/YYYY",
        "expiryDate": "MM/YYYY if applicable",
        "credentialId": "credential ID if provided",
        "credentialUrl": "verification URL if provided"
      }
    ],
    "projects": [
      {
        "id": "unique_id",
        "title": "project name",
        "description": "detailed project description",
        "technologies": ["technologies used"],
        "startDate": "MM/YYYY if mentioned",
        "endDate": "MM/YYYY if mentioned",
        "githubUrl": "GitHub URL if provided",
        "liveUrl": "live demo URL if provided",
        "role": "your role in the project",
        "achievements": ["project outcomes and metrics"]
      }
    ],
    "awards": [
      {
        "id": "unique_id",
        "name": "award name",
        "issuer": "awarding organization",
        "date": "MM/YYYY",
        "description": "award details and context",
        "context": "competition, academic, professional"
      }
    ],
    "languages": [
      {
        "language": "language name",
        "proficiency": "basic|conversational|fluent|native",
        "certifications": ["language certifications if any"]
      }
    ],
    "hobbies": [
      {
        "category": "category name",
        "items": ["specific hobbies/interests"]
      }
    ],
    "publications": [
      {
        "title": "publication title",
        "journal": "journal/conference name",
        "date": "MM/YYYY",
        "authors": ["co-authors"],
        "url": "publication URL if available"
      }
    ],
    "additional": {
      "declaration": "declaration statement if present",
      "references": [
        {
          "name": "reference name",
          "position": "their position",
          "company": "their company",
          "phone": "phone if provided",
          "email": "email if provided",
          "relationship": "professional relationship"
        }
      ],
      "availableUponRequest": true
    },
    "metadata": {
      "extractionMethod": "ai-parser",
      "processingDate": "current_date",
      "detectedTemplate": "chronological|functional|hybrid|academic|creative",
      "industryFocus": "detected industry/field",
      "experienceLevel": "entry|mid|senior|executive",
      "extractionConfidence": 0.95
    }
  },
  "enhanced": {
    "templateRecommendation": {
      "recommended": "chronological|functional|hybrid|academic|creative",
      "reasoning": "why this template is recommended",
      "alternativeOptions": ["other suitable templates"]
    },
    "professionalSummary": {
      "enhanced": "ATS-optimized professional summary with industry keywords",
      "keywordDensity": 85,
      "improvements": ["specific enhancement suggestions"],
      "missingElements": ["elements that should be added"]
    },
    "experience": [
      {
        "originalIndex": 0,
        "enhancedTitle": "optimized job title with keywords",
        "enhancedDescription": "ATS-optimized description with powerful action verbs",
        "enhancedAchievements": ["quantified achievements with specific metrics"],
        "suggestedKeywords": ["industry-relevant keywords to add"],
        "actionVerbs": ["powerful action verbs to use"],
        "quantificationOpportunities": ["areas where numbers can be added"],
        "improvements": ["specific enhancement suggestions"]
      }
    ],
    "skills": {
      "recommendedTechnical": ["trending technical skills to add"],
      "recommendedSoft": ["important soft skills to add"],
      "industryKeywords": ["must-have industry keywords"],
      "emergingSkills": ["future-relevant skills to consider"],
      "certificationSuggestions": ["valuable certifications to pursue"]
    },
    "missingSections": [
      {
        "section": "projects|certifications|volunteer",
        "importance": "high|medium|low",
        "reason": "why this section should be added",
        "suggestions": ["specific content suggestions"]
      }
    ],
    "atsOptimization": {
      "overallScore": 85,
      "breakdown": {
        "keywordOptimization": 80,
        "formatCompatibility": 90,
        "contentQuality": 85,
        "achievementQuantification": 75,
        "professionalLanguage": 90
      },
      "criticalIssues": [
        {
          "section": "section name",
          "issue": "specific issue identified",
          "solution": "recommended solution",
          "priority": "critical|high|medium|low",
          "impact": "potential improvement in ATS score"
        }
      ],
      "quickWins": [
        {
          "change": "specific change to make",
          "expectedImprovement": "5-10 point ATS score increase",
          "effort": "low|medium|high"
        }
      ]
    },
    "competitiveAnalysis": {
      "strengths": ["key competitive advantages"],
      "weaknesses": ["areas needing improvement"],
      "marketPosition": "entry|competitive|strong|exceptional",
      "recommendedFocus": ["areas to emphasize for best results"]
    }
  },
  "processing": {
    "version": "4.0-enhanced",
    "timestamp": "current_timestamp",
    "confidence": 0.95,
    "processingTime": "processing_duration",
    "enhancementLevel": "comprehensive-plus",
    "templateMatched": "detected_template_type",
    "industryOptimized": "detected_industry"
  }
}

RESUME TEXT TO PROCESS:
${resumeText}

Provide complete extraction AND enhancement in a single comprehensive response.`;
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
          personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
          experience: [],
          education: [],
          skills: { technical: [], soft: [], languages: [], certifications: [] },
          projects: [],
          certifications: [],
          awards: []
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
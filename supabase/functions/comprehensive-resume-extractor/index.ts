import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ComprehensiveExtractionRequest {
  text: string;
  fileName: string;
  fileType: string;
  userId: string;
  resumeId?: string;
  industryType?: string;
  extractionLevel?: 'basic' | 'enhanced' | 'comprehensive';
}

serve(async (req) => {
  console.log('🚀 Comprehensive Resume Extractor Starting...');

  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { 
      text, 
      fileName, 
      fileType, 
      userId, 
      resumeId,
      industryType = 'general',
      extractionLevel = 'comprehensive'
    }: ComprehensiveExtractionRequest = await req.json();

    console.log('📋 Processing comprehensive extraction:', {
      fileName,
      fileType,
      userId,
      resumeId,
      industryType,
      extractionLevel,
      textLength: text.length
    });

    // Create extraction job record
    const { data: extractionJob, error: jobError } = await supabase
      .from('resume_extraction_jobs')
      .insert({
        resume_id: resumeId,
        user_id: userId,
        extraction_status: 'processing',
        processing_step: 'comprehensive_extraction',
        progress_percentage: 10,
        raw_text: text
      })
      .select()
      .single();

    if (jobError) {
      console.error('❌ Failed to create extraction job:', jobError);
      throw new Error('Failed to create extraction job');
    }

    console.log('✅ Extraction job created:', extractionJob.id);

    // Update progress
    await supabase
      .from('resume_extraction_jobs')
      .update({
        processing_step: 'ai_analysis',
        progress_percentage: 25
      })
      .eq('id', extractionJob.id);

    // Get industry-specific skills for context
    const { data: industrySkills } = await supabase
      .from('industry_skills_library')
      .select('*')
      .eq('industry', industryType)
      .eq('is_active', true);

    console.log('📊 Industry skills loaded:', industrySkills?.length || 0);

    // Advanced comprehensive extraction prompt
    const systemPrompt = `You are an expert resume extraction specialist with deep knowledge of professional documents, ATS optimization, and industry-specific requirements. Your task is to perform COMPREHENSIVE, WORD-BY-WORD accurate extraction from resume text.

CRITICAL EXTRACTION PRINCIPLES:
1. EXACT WORD-BY-WORD ACCURACY - Extract exactly as written, preserve original terminology
2. COMPLETE INFORMATION CAPTURE - Never miss any detail, no matter how small
3. STRUCTURED DATA MAPPING - Organize all information into logical, searchable structures
4. INDUSTRY-SPECIFIC INTELLIGENCE - Recognize field-specific terminology and skills
5. ACHIEVEMENT QUANTIFICATION - Identify and preserve all metrics, numbers, percentages
6. TEMPORAL PRECISION - Extract all dates, durations, and chronological information
7. CONTACT COMPLETENESS - Capture ALL contact methods and social profiles
8. TECHNICAL SKILL CATEGORIZATION - Organize skills by type, proficiency, and relevance
9. CONFIDENCE SCORING - Assign accuracy confidence to each extracted element
10. ENHANCEMENT SUGGESTIONS - Provide actionable improvement recommendations

ENHANCED EXTRACTION REQUIREMENTS:
- Extract every single detail from the text
- Preserve exact spelling, capitalization, and terminology
- Identify industry-specific software, tools, and methodologies
- Capture all quantified achievements (numbers, percentages, dollar amounts)
- Extract complete contact information including all social profiles
- Identify all certifications, licenses, and professional memberships
- Parse complex date formats and calculate exact durations
- Recognize and categorize technical skills by proficiency level
- Extract project details, publications, awards, and achievements
- Identify volunteer work, side projects, and community involvement
- Preserve formatting hints and document structure information
- Calculate comprehensive confidence scores for data quality assessment`;

    const industryContext = industrySkills?.length > 0 ? `
INDUSTRY-SPECIFIC CONTEXT (${industryType.toUpperCase()}):
Key Skills to Look For: ${industrySkills.map(s => s.skill_name).join(', ')}
Software/Tools: ${industrySkills.filter(s => s.skill_category === 'software').map(s => s.skill_name).join(', ')}
Certifications: ${industrySkills.filter(s => s.skill_category === 'certification').map(s => s.skill_name).join(', ')}
Technical Areas: ${industrySkills.filter(s => s.skill_category === 'technical').map(s => s.skill_name).join(', ')}
` : '';

    const userPrompt = `COMPREHENSIVE RESUME EXTRACTION TASK
==========================================

EXTRACTION LEVEL: ${extractionLevel.toUpperCase()}
INDUSTRY TYPE: ${industryType.toUpperCase()}
${industryContext}

RESUME TEXT TO EXTRACT:
"""
${text}
"""

EXTRACTION REQUIREMENTS:
1. WORD-BY-WORD ACCURACY - Extract exactly as written
2. COMPLETE INFORMATION - Never miss any detail
3. STRUCTURED ORGANIZATION - Organize all data logically
4. INDUSTRY RECOGNITION - Identify field-specific terminology
5. QUANTIFIED ACHIEVEMENTS - Preserve all metrics and numbers
6. TEMPORAL PRECISION - Extract all dates and durations
7. CONTACT COMPLETENESS - Capture all contact methods
8. TECHNICAL CATEGORIZATION - Organize skills by type and proficiency
9. CONFIDENCE ASSESSMENT - Score extraction accuracy
10. ENHANCEMENT SUGGESTIONS - Provide improvement recommendations

RETURN COMPREHENSIVE JSON:
{
  "personalInfo": {
    "fullName": "exact full name from resume",
    "professionalTitle": "professional title or headline",
    "email": "exact email address",
    "phone": "standardized phone number",
    "address": {
      "street": "street address",
      "city": "city",
      "state": "state/province",
      "country": "country",
      "zipCode": "postal code"
    },
    "location": "complete location string",
    "linkedin": "linkedin profile URL",
    "github": "github profile URL",
    "website": "personal website URL",
    "portfolio": "portfolio URL",
    "otherProfiles": ["other social profiles"],
    "summary": "professional summary word-for-word",
    "extractionConfidence": 0.95
  },
  "experience": [
    {
      "jobTitle": "exact job title",
      "company": "exact company name",
      "companyDescription": "company description if provided",
      "location": "job location",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "duration": "calculated duration",
      "employmentType": "full-time/part-time/contract/etc",
      "description": "complete job description",
      "responsibilities": ["exact responsibility bullets"],
      "achievements": ["quantified achievements"],
      "technologies": ["technologies used"],
      "keywords": ["relevant keywords"],
      "projects": ["projects mentioned"],
      "teamSize": "team size if mentioned",
      "reportingStructure": "reporting structure if mentioned",
      "budgetManaged": "budget managed if mentioned",
      "extractionConfidence": 0.92
    }
  ],
  "education": [
    {
      "degree": "exact degree name",
      "fieldOfStudy": "field of study",
      "institution": "exact institution name",
      "location": "institution location",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "gpa": "GPA if mentioned",
      "maxGpa": "GPA scale",
      "honors": "honors and awards",
      "relevantCoursework": ["relevant courses"],
      "thesis": "thesis title if mentioned",
      "advisors": ["advisor names"],
      "activities": ["activities and societies"],
      "extractionConfidence": 0.90
    }
  ],
  "technicalSkills": {
    "programmingLanguages": [
      {
        "skill": "skill name",
        "proficiency": "beginner/intermediate/advanced/expert",
        "yearsOfExperience": "years if mentioned",
        "lastUsed": "when last used",
        "context": "where used"
      }
    ],
    "frameworks": [
      {
        "skill": "framework name",
        "proficiency": "proficiency level",
        "yearsOfExperience": "years if mentioned",
        "lastUsed": "when last used",
        "context": "where used"
      }
    ],
    "databases": [
      {
        "skill": "database name",
        "proficiency": "proficiency level",
        "yearsOfExperience": "years if mentioned",
        "lastUsed": "when last used",
        "context": "where used"
      }
    ],
    "tools": [
      {
        "skill": "tool name",
        "proficiency": "proficiency level",
        "yearsOfExperience": "years if mentioned",
        "lastUsed": "when last used",
        "context": "where used"
      }
    ],
    "cloudPlatforms": [
      {
        "skill": "cloud platform",
        "proficiency": "proficiency level",
        "yearsOfExperience": "years if mentioned",
        "lastUsed": "when last used",
        "context": "where used"
      }
    ],
    "methodologies": [
      {
        "skill": "methodology name",
        "proficiency": "proficiency level",
        "yearsOfExperience": "years if mentioned",
        "lastUsed": "when last used",
        "context": "where used"
      }
    ],
    "extractionConfidence": 0.88
  },
  "softSkills": [
    {
      "skill": "soft skill",
      "proficiency": "proficiency level",
      "evidence": "evidence or examples",
      "context": "where demonstrated"
    }
  ],
  "languages": [
    {
      "language": "language name",
      "proficiency": "native/fluent/conversational/basic",
      "certifications": ["certifications if any"],
      "context": "where used"
    }
  ],
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing organization",
      "issueDate": "MM/YYYY",
      "expiryDate": "MM/YYYY",
      "credentialId": "credential ID",
      "verificationUrl": "verification URL",
      "description": "certification description",
      "extractionConfidence": 0.90
    }
  ],
  "projects": [
    {
      "title": "project title",
      "description": "detailed description",
      "role": "your role in project",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "duration": "project duration",
      "teamSize": "team size if mentioned",
      "technologies": ["technologies used"],
      "achievements": ["project achievements"],
      "url": "project URL",
      "github": "github repository",
      "demo": "demo URL",
      "extractionConfidence": 0.85
    }
  ],
  "awards": [
    {
      "name": "award name",
      "issuer": "awarding organization",
      "date": "MM/YYYY",
      "description": "award description",
      "significance": "significance level",
      "extractionConfidence": 0.88
    }
  ],
  "publications": [
    {
      "title": "publication title",
      "authors": ["author names"],
      "publisher": "publisher name",
      "publicationDate": "MM/YYYY",
      "url": "publication URL",
      "doi": "DOI if available",
      "citations": "citation count if mentioned",
      "description": "publication description",
      "extractionConfidence": 0.85
    }
  ],
  "volunteer": [
    {
      "organization": "organization name",
      "role": "volunteer role",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "description": "volunteer description",
      "achievements": ["volunteer achievements"],
      "extractionConfidence": 0.80
    }
  ],
  "interests": [
    {
      "interest": "interest name",
      "description": "interest description",
      "relevance": "professional relevance"
    }
  ],
  "references": [
    {
      "name": "reference name",
      "title": "reference title",
      "company": "reference company",
      "email": "reference email",
      "phone": "reference phone",
      "relationship": "professional relationship"
    }
  ],
  "extractionMetadata": {
    "totalExtractionTime": "processing time in ms",
    "extractionVersion": "v3.0",
    "industryType": "${industryType}",
    "extractionLevel": "${extractionLevel}",
    "overallConfidence": 0.90,
    "sectionsExtracted": ["list of sections"],
    "wordsProcessed": ${text.split(' ').length},
    "linesProcessed": ${text.split('\n').length},
    "extractionTimestamp": "${new Date().toISOString()}"
  },
  "qualityAssessment": {
    "completenessScore": 0.85,
    "accuracyScore": 0.92,
    "consistencyScore": 0.88,
    "relevanceScore": 0.90,
    "atsCompatibility": 0.85,
    "overallQuality": 0.88
  },
  "enhancementSuggestions": [
    {
      "category": "content",
      "priority": "high",
      "section": "experience",
      "issue": "specific issue identified",
      "suggestion": "specific improvement suggestion",
      "impact": "expected impact score",
      "example": "example of improvement"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Extract EVERY piece of information from the text
- Preserve EXACT wording and terminology
- Assign accurate confidence scores (0.0-1.0)
- Provide specific, actionable enhancement suggestions
- Organize technical skills by category with proficiency levels
- Include all contact methods and social profiles
- Calculate exact durations and date ranges
- Identify industry-specific terminology and skills
- Extract quantified achievements with metrics
- Preserve document structure and formatting hints

Return ONLY the JSON object with no additional text or explanations.`;

    // Update progress
    await supabase
      .from('resume_extraction_jobs')
      .update({
        processing_step: 'openai_processing',
        progress_percentage: 40
      })
      .eq('id', extractionJob.id);

    console.log('🤖 Calling OpenAI API for comprehensive extraction...');
    
    const startTime = Date.now();
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 16000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    const processingTime = Date.now() - startTime;

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('❌ OpenAI API error:', errorData);
      
      // Update extraction job with error
      await supabase
        .from('resume_extraction_jobs')
        .update({
          extraction_status: 'error',
          error_details: `OpenAI API error: ${openaiResponse.status}`,
          processing_time_ms: processingTime
        })
        .eq('id', extractionJob.id);

      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const data = await openaiResponse.json();
    console.log('✅ OpenAI API response received');

    // Update progress
    await supabase
      .from('resume_extraction_jobs')
      .update({
        processing_step: 'data_validation',
        progress_percentage: 70
      })
      .eq('id', extractionJob.id);

    let extractedData;
    try {
      extractedData = JSON.parse(data.choices[0].message.content);
      console.log('✅ Successfully parsed comprehensive extraction data');
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI JSON response:', parseError);
      
      // Update extraction job with error
      await supabase
        .from('resume_extraction_jobs')
        .update({
          extraction_status: 'error',
          error_details: 'Failed to parse AI response as JSON',
          processing_time_ms: processingTime
        })
        .eq('id', extractionJob.id);

      throw new Error('Failed to parse AI response as JSON');
    }

    // Update progress
    await supabase
      .from('resume_extraction_jobs')
      .update({
        processing_step: 'database_update',
        progress_percentage: 85
      })
      .eq('id', extractionJob.id);

    // Update the extraction job with complete data
    const { error: updateError } = await supabase
      .from('resume_extraction_jobs')
      .update({
        extraction_status: 'completed',
        processing_step: 'finalization',
        progress_percentage: 100,
        extracted_data: extractedData,
        processing_time_ms: processingTime,
        completed_at: new Date().toISOString()
      })
      .eq('id', extractionJob.id);

    if (updateError) {
      console.error('❌ Failed to update extraction job:', updateError);
    }

    // Update resume with extracted data and metadata
    if (resumeId) {
      const { error: resumeUpdateError } = await supabase
        .from('resumes')
        .update({
          raw_extracted_data: extractedData,
          extraction_confidence: extractedData.qualityAssessment?.overallQuality || 0.88,
          processing_metadata: {
            extractionJobId: extractionJob.id,
            processingTime: processingTime,
            extractionTimestamp: new Date().toISOString(),
            industryType: industryType,
            extractionLevel: extractionLevel
          },
          extraction_version: 'v3.0',
          industry_type: industryType,
          completeness_score: Math.round((extractedData.qualityAssessment?.completenessScore || 0.85) * 100)
        })
        .eq('id', resumeId);

      if (resumeUpdateError) {
        console.error('❌ Failed to update resume:', resumeUpdateError);
      }
    }

    console.log('📊 Comprehensive extraction completed:', {
      processingTime: processingTime,
      overallConfidence: extractedData.qualityAssessment?.overallQuality || 0.88,
      sectionsExtracted: extractedData.extractionMetadata?.sectionsExtracted?.length || 0,
      wordsProcessed: extractedData.extractionMetadata?.wordsProcessed || 0
    });

    return new Response(JSON.stringify({
      success: true,
      data: extractedData,
      extractionJobId: extractionJob.id,
      processingTime: processingTime,
      metadata: {
        extractionLevel: extractionLevel,
        industryType: industryType,
        model: 'gpt-4.1-2025-04-14',
        version: 'v3.0',
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Comprehensive extraction error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Comprehensive extraction failed',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
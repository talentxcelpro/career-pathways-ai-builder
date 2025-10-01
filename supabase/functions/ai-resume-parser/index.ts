
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

    const systemPrompt = `You are an expert resume parser. Extract EVERY detail from the resume EXACTLY as written.

CRITICAL EXTRACTION RULES:

1. NAME EXTRACTION (HIGHEST PRIORITY):
   - The name is ALWAYS the first prominent text at the top, often in ALL CAPS or large font
   - Examples: "EMIN MARDANOV", "E M I N M A R D A N O V", "John Smith"
   - Appears BEFORE any icons (📍📞), location, phone, or email
   - NEVER extract: job titles (Engineer, Supervisor), locations (Baku, Azerbaijan), companies
   - Look for 2-4 words that are person names, not roles or places

2. CONTACT INFORMATION (extract exactly as shown):
   - Phone with country codes (e.g., "+994 51 789 9614")
   - Email addresses
   - Location (City, Country format)
   - LinkedIn, GitHub, portfolio URLs

3. PROFESSIONAL SUMMARY/OBJECTIVE:
   - Extract the COMPLETE summary paragraph word-for-word
   - Keep all sentences, achievements, and keywords

4. WORK EXPERIENCE (extract EVERY job):
   - Job title (exact, e.g., "Construction Civil Supervisor")
   - Company name (exact, e.g., "TCM-KT JV Azerbaijan (Maire Tecnimont)")
   - Project name if mentioned (e.g., "SOCAR HAOR Project")
   - Location (e.g., "Baku, Azerbaijan")
   - Start and end dates (e.g., "Jun 2019 – Present")
   - ALL bullet points/responsibilities word-for-word
   - Extract EVERY achievement

5. EDUCATION (extract ALL degrees):
   - Degree name (exact, e.g., "Bachelor of Science in Civil Engineering")
   - Institution (exact, e.g., "Azerbaijan University of Architecture and Construction")
   - Location, dates, GPA, honors

6. CERTIFICATIONS & TRAINING (extract EVERY certification):
   - Full certification name (e.g., "SA-8000 Social Accountability")
   - Issuing organization
   - Dates if mentioned

7. TECHNICAL SKILLS (extract ALL):
   - Software/Tools (e.g., "AutoCAD, Navisworks, MS Office")
   - Expertise areas (e.g., "Civil supervision, underground utilities, QA/QC")
   - Languages with proficiency (e.g., "English (Fluent), Turkish (Fluent)")
   - Driving licenses (e.g., "B, C")

8. CORE COMPETENCIES (if present):
   - Extract all competency points

9. PROJECTS & AWARDS (if any):
   - Full details with dates and descriptions

Return JSON in this EXACT structure:
{
  "name": "<Person's actual name from top of resume>",
  "email": "",
  "phone": "", 
  "location": "",
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "summary": "<Complete professional summary paragraph>",
  "work_experience": [
    {
      "title": "<Exact job title>",
      "company": "<Full company name with details>",
      "location": "<Job location>",
      "duration": "<Start Month Year – End Month Year or Present>",
      "description": "",
      "achievements": ["<All bullet points>"],
      "technologies_used": []
    }
  ],
  "education": [
    {
      "degree": "<Full degree name>",
      "institution": "<University/School name>",
      "location": "",
      "duration": "<Year range or graduation year>",
      "gpa": "",
      "relevant_coursework": [],
      "honors": []
    }
  ],
  "certifications": [
    {
      "name": "<Full certification name>",
      "issuer": "",
      "date": ""
    }
  ],
  "skills": {
    "technical": ["<Technical expertise areas>"],
    "tools": ["<Software and tools>"],
    "languages": ["<Language (Proficiency)>"],
    "soft": ["<Core competencies>"],
    "other": ["<Driving licenses, etc.>"]
  },
  "projects": [],
  "additional_links": []
}

CRITICAL NAME EXAMPLES:
- "EMIN MARDANOV" at top → name: "EMIN MARDANOV"
- "E M I N  M A R D A N O V" → name: "EMIN MARDANOV"
- "Bharadwaj AVB" → name: "Bharadwaj AVB"
- NOT "Civil Engineer" or "Baku, Azerbaijan"

Extract EVERY section and EVERY detail exactly as written in the CV.`;

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
  console.log('🔄 Creating enhanced fallback resume with actual data extraction...');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Enhanced email extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch?.[0] || '';
  console.log('📧 Email found:', email || 'None');
  
  // Enhanced phone extraction with international support
  const phonePatterns = [
    /\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
    /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    /\d{10,}/g
  ];
  let phone = '';
  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches && matches[0] && matches[0].length >= 10) {
      phone = matches[0];
      console.log('📞 Phone found:', phone);
      break;
    }
  }
  
  // Enhanced name extraction with multiple strategies - VERY AGGRESSIVE
  let name = '';
  
  // Strategy 1: Check very first lines for ALL CAPS or spaced names (e.g., "EMIN MARDANOV" or "E M I N  M A R D A N O V")
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].replace(/[📍📞🔗]/g, '').trim(); // Remove icons
    
    // Skip section headers
    if (/^(RESUME|CV|CURRICULUM|CONTACT|PERSONAL)/i.test(line)) continue;
    
    // Check for ALL CAPS names with possible extra spaces (E M I N  M A R D A N O V)
    const normalizedLine = line.replace(/\s+/g, ' ').trim();
    if (/^[A-Z\s]{4,60}$/.test(normalizedLine)) {
      const words = normalizedLine.split(/\s+/).filter(w => w.length > 0);
      // Accept if 2-6 words (handles spaced letters like "E M I N M A R D A N O V")
      if (words.length >= 2 && words.length <= 8) {
        // Reject common non-name words
        if (!words.some(w => /^(BAKU|AZERBAIJAN|CIVIL|ENGINEER|MANAGER|SUPERVISOR|DEVELOPER|INDIA|USA)$/i.test(w))) {
          name = normalizedLine;
          console.log('✅ Name found (ALL CAPS):', name);
          break;
        }
      }
    }
    
    // Check for Title Case names
    if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,4}$/.test(normalizedLine)) {
      if (!/PROFESSIONAL|SUMMARY|PROFILE|EXPERIENCE|EDUCATION|SKILLS/i.test(normalizedLine)) {
        name = normalizedLine;
        console.log('✅ Name found (Title Case):', name);
        break;
      }
    }
  }
  
  // Strategy 2: Look in first 10 lines for capitalized full names
  if (!name) {
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      if (/^(RESUME|CV|CURRICULUM|PROFILE|SUMMARY|PROFESSIONAL|EXPERIENCE|EDUCATION|SKILLS|DELIVERY|LEADER|EXECUTIVE)/i.test(line)) {
        continue;
      }
      const fullNameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/);
      if (fullNameMatch && fullNameMatch[1].split(' ').length >= 2) {
        name = fullNameMatch[1];
        console.log('✅ Name found in text (Strategy 2):', name);
        break;
      }
    }
  }
  
  // Strategy 3: Look before email
  if (!name && email) {
    const emailIndex = text.indexOf(email);
    if (emailIndex > 0) {
      const textBeforeEmail = text.substring(Math.max(0, emailIndex - 200), emailIndex);
      const linesBeforeEmail = textBeforeEmail.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      for (let i = Math.max(0, linesBeforeEmail.length - 5); i < linesBeforeEmail.length; i++) {
        const line = linesBeforeEmail[i];
        if (/^(RESUME|CV|CURRICULUM|PROFILE|SUMMARY|PROFESSIONAL|EXPERIENCE|EDUCATION|SKILLS)/i.test(line)) {
          continue;
        }
        const nameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/);
        if (nameMatch) {
          name = nameMatch[1];
          console.log('✅ Name found before email (Strategy 3):', name);
          break;
        }
      }
    }
  }
  
  // Strategy 4: Look for "Name:" label patterns
  if (!name) {
    const namePatterns = [
      /(?:Name|NAME|Full Name|FULL NAME):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,
      /(?:Candidate|CANDIDATE):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/
    ];
    
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        name = match[1];
        console.log('✅ Name found with label (Strategy 4):', name);
        break;
      }
    }
  }
  
  // Strategy 5: Capitalized words sequence near top
  if (!name) {
    const firstBlock = lines.slice(0, 5).join(' ');
    const capitalizedWords = firstBlock.match(/\b[A-Z][a-z]+\b/g);
    if (capitalizedWords && capitalizedWords.length >= 2) {
      const potentialName = capitalizedWords.slice(0, Math.min(3, capitalizedWords.length)).join(' ');
      if (!/^(PROFESSIONAL|RESUME|CV|SUMMARY|PROFILE|EXPERIENCE|EDUCATION|DELIVERY|LEADER|EXECUTIVE|STRATEGIC)/i.test(potentialName)) {
        name = potentialName;
        console.log('✅ Name from capitalized sequence (Strategy 5):', name);
      }
    }
  }
  
  // Strategy 6: Extract from email prefix as last resort
  if (!name && email) {
    const emailPrefix = email.split('@')[0];
    // Convert bharadwajavbn -> Bharadwaj Avbn (split on common patterns)
    const nameFromEmail = emailPrefix
      .replace(/[._-]/g, ' ')
      .split(/(?=[A-Z])/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
      .trim();
    
    if (nameFromEmail.length >= 3 && nameFromEmail.split(' ').length >= 2) {
      name = nameFromEmail;
      console.log('✅ Name extracted from email (Strategy 6):', name);
    }
  }
  
  // Strategy 7: Extract from filename as last resort
  if (!name && fileName && fileName !== 'resume') {
    name = fileName
      .replace(/\.(pdf|docx?|txt)$/i, '')
      .replace(/^(resume|cv)[\s\-_]*/i, '')
      .replace(/[\-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
    
    if (name && name.split(' ').length >= 2) {
      console.log('✅ Name extracted from filename (Strategy 7):', name);
    } else {
      name = '';
    }
  }
  
  // Enhanced location extraction
  let location = '';
  const locationPatterns = [
    /(?:Location|Address|City):\s*([A-Z][a-zA-Z\s,.-]+(?:,\s*[A-Z]{2})?)/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*(?:[A-Z]{2}|[A-Z][a-z]+))\b/g,
    /\b([A-Z][a-z]+,\s*India|India)\b/gi,
    /\b(Mumbai|Delhi|Bangalore|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Baku|Azerbaijan|New York|London|Singapore|Dubai)/gi
  ];
  
  for (const pattern of locationPatterns) {
    const matches = text.match(pattern);
    if (matches && matches[0]) {
      location = matches[0]
        .replace(/^(Location|Address|City):\s*/i, '')
        .replace(/\s*\n.*/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!/^(PROFESSIONAL|SUMMARY|EXPERIENCE|EDUCATION|SKILLS)/i.test(location)) {
        console.log('📍 Location found:', location);
        break;
      }
    }
  }
  
  // Enhanced summary extraction
  let summary = '';
  const summaryKeywords = ['SUMMARY', 'PROFILE', 'PROFESSIONAL SUMMARY', 'OBJECTIVE', 'ABOUT'];
  let summaryStartIndex = -1;
  
  for (const keyword of summaryKeywords) {
    const index = lines.findIndex(line => 
      line.toUpperCase().includes(keyword) && 
      line.length < 40
    );
    if (index >= 0) {
      summaryStartIndex = index + 1;
      break;
    }
  }
  
  if (summaryStartIndex >= 0) {
    const summaryLines = [];
    for (let i = summaryStartIndex; i < Math.min(summaryStartIndex + 10, lines.length); i++) {
      const line = lines[i];
      if (/^(EXPERIENCE|EDUCATION|SKILLS|WORK|EMPLOYMENT)/i.test(line)) break;
      if (line.length > 30 && !line.includes('@')) {
        summaryLines.push(line);
      }
    }
    summary = summaryLines.join(' ');
    console.log('📝 Summary found, length:', summary.length);
  }
  
  if (!summary) {
    const substantialLine = lines.find(line => 
      line.length > 80 && 
      !line.includes('@') && 
      !line.match(/^[A-Z\s]+$/) &&
      !/^(RESUME|CV|PROFESSIONAL|EXPERIENCE|EDUCATION|SKILLS)/i.test(line)
    );
    summary = substantialLine || 'Experienced professional with demonstrated expertise and a track record of delivering results.';
  }
  
  console.log('📊 Fallback extraction complete:', { 
    hasName: !!name, 
    hasEmail: !!email, 
    hasPhone: !!phone, 
    hasLocation: !!location,
    summaryLength: summary.length 
  });

  // Extract work experience from text
  const experience = extractWorkExperienceFromText(text, lines);
  console.log('💼 Extracted experience:', experience.length, 'positions');
  
  // Extract education from text
  const education = extractEducationFromText(text, lines);
  console.log('🎓 Extracted education:', education.length, 'entries');
  
  // Extract skills from text
  const skills = extractSkillsFromText(text);
  console.log('🛠️ Extracted skills:', {
    technical: skills.technical.length,
    soft: skills.soft.length,
    languages: skills.languages.length
  });

  return {
    name: name || '',
    email: email,
    phone: phone,
    location: location,
    summary: summary,
    skills: skills,
    work_experience: experience,
    education: education,
    certifications: [],
    projects: [],
    languages: [],
    linkedin: '',
    github: '',
    portfolio: '',
    additional_links: []
  };
}

// Extract work experience from resume text
function extractWorkExperienceFromText(text: string, lines: string[]): any[] {
  const experience: any[] = [];
  
  // Find EXPERIENCE section
  const expSectionIndex = lines.findIndex(line => 
    /^(WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT|PROFESSIONAL\s+EXPERIENCE|CAREER\s+HISTORY)/i.test(line)
  );
  
  if (expSectionIndex < 0) return experience;
  
  // Parse experience entries
  let currentExp: any = null;
  const expLines = lines.slice(expSectionIndex + 1);
  
  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i];
    
    // Stop at next major section
    if (/^(EDUCATION|SKILLS|CERTIFICATIONS|PROJECTS)/i.test(line)) break;
    
    // Detect job title pattern (usually capitalized or with company name)
    if (line.length > 5 && line.length < 100) {
      // Check if looks like a position (Title at Company or Title | Company)
      const titleCompanyMatch = line.match(/^(.+?)(?:\s+at\s+|\s+@\s+|\s+\|\s+|\s+-\s+)(.+?)(?:\s+\||\s+-|\s*$)/i);
      
      if (titleCompanyMatch) {
        // Save previous experience
        if (currentExp) experience.push(currentExp);
        
        currentExp = {
          title: titleCompanyMatch[1].trim(),
          company: titleCompanyMatch[2].trim(),
          location: '',
          duration: '',
          description: '',
          achievements: [],
          technologies_used: []
        };
        continue;
      }
      
      // Check for date ranges (indicates experience header)
      if (/\d{4}\s*[-–—]\s*(?:\d{4}|present|current)/i.test(line)) {
        if (currentExp) {
          currentExp.duration = line.trim();
        }
        continue;
      }
    }
    
    // Collect description and achievements
    if (currentExp && line.length > 20) {
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        currentExp.achievements.push(line.replace(/^[•\-*]\s*/, ''));
      } else if (!currentExp.description) {
        currentExp.description = line;
      } else {
        currentExp.description += ' ' + line;
      }
    }
  }
  
  // Add last experience
  if (currentExp) experience.push(currentExp);
  
  return experience;
}

// Extract education from resume text
function extractEducationFromText(text: string, lines: string[]): any[] {
  const education: any[] = [];
  
  // Find EDUCATION section
  const eduSectionIndex = lines.findIndex(line => 
    /^(EDUCATION|ACADEMIC|QUALIFICATIONS)/i.test(line)
  );
  
  if (eduSectionIndex < 0) return education;
  
  let currentEdu: any = null;
  const eduLines = lines.slice(eduSectionIndex + 1);
  
  for (let i = 0; i < eduLines.length; i++) {
    const line = eduLines[i];
    
    // Stop at next major section
    if (/^(EXPERIENCE|SKILLS|CERTIFICATIONS|PROJECTS)/i.test(line)) break;
    
    // Detect degree patterns
    const degreeMatch = line.match(/(Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|B\.?Tech|M\.?Tech)/i);
    if (degreeMatch) {
      if (currentEdu) education.push(currentEdu);
      
      currentEdu = {
        degree: line.trim(),
        institution: '',
        location: '',
        duration: '',
        gpa: '',
        relevant_coursework: [],
        honors: []
      };
      continue;
    }
    
    // Extract institution (usually next line after degree)
    if (currentEdu && !currentEdu.institution && line.length > 5) {
      if (/University|College|Institute|School/i.test(line)) {
        currentEdu.institution = line.trim();
      }
    }
    
    // Extract date range
    if (currentEdu && /\d{4}\s*[-–—]\s*(?:\d{4}|present)/i.test(line)) {
      currentEdu.duration = line.trim();
    }
  }
  
  if (currentEdu) education.push(currentEdu);
  
  return education;
}

// Extract skills from resume text
function extractSkillsFromText(text: string): any {
  const technicalSkills: string[] = [];
  const softSkills: string[] = [];
  const languages: string[] = [];
  const tools: string[] = [];
  const other: string[] = [];
  
  // Find SKILLS section
  const lines = text.split('\n').map(l => l.trim());
  const skillsSectionIndex = lines.findIndex(line => 
    /^(SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|EXPERTISE)/i.test(line)
  );
  
  if (skillsSectionIndex >= 0) {
    const skillLines = lines.slice(skillsSectionIndex + 1, Math.min(skillsSectionIndex + 20, lines.length));
    
    for (const line of skillLines) {
      // Stop at next major section
      if (/^(EXPERIENCE|EDUCATION|CERTIFICATIONS|PROJECTS|AWARDS)/i.test(line)) break;
      
      // Extract Software/Tools
      if (/software|tools/i.test(line)) {
        const toolsMatch = line.match(/(?:Software|Tools):\s*(.+)/i);
        if (toolsMatch) {
          toolsMatch[1].split(/[,;]/).forEach(tool => {
            const cleaned = tool.trim();
            if (cleaned) tools.push(cleaned);
          });
        }
        continue;
      }
      
      // Extract Expertise
      if (/expertise|specialization/i.test(line)) {
        const expertiseMatch = line.match(/(?:Expertise|Specialization):\s*(.+)/i);
        if (expertiseMatch) {
          expertiseMatch[1].split(/[,;]/).forEach(skill => {
            const cleaned = skill.trim();
            if (cleaned) technicalSkills.push(cleaned);
          });
        }
        continue;
      }
      
      // Extract Languages with proficiency
      if (/languages/i.test(line)) {
        const langMatch = line.match(/Languages:\s*(.+)/i);
        if (langMatch) {
          langMatch[1].split(/[,;]/).forEach(lang => {
            const cleaned = lang.trim();
            if (cleaned) languages.push(cleaned);
          });
        }
        continue;
      }
      
      // Extract Driving License
      if (/driving|license/i.test(line)) {
        const licenseMatch = line.match(/(?:Driving\s+License|License):\s*(.+)/i);
        if (licenseMatch) {
          other.push('Driving License: ' + licenseMatch[1].trim());
        }
        continue;
      }
    }
  }
  
  // Civil Engineering specific skills
  const civilEngSkills = [
    /\b(Civil\s+[Ee]ngineering|Civil\s+[Ss]upervision|Site\s+[Ss]upervision|QA\/?QC|Quality\s+[Aa]ssurance)\b/gi,
    /\b(Underground\s+[Uu]tilities|Underground\s+[Ii]nfrastructure|Manhole\s+[Ii]nstallation|Pipe\s+[Ii]nstallation)\b/gi,
    /\b(Structural\s+[Ff]oundations?|Concrete\s+[Ff]oundations?|Steel\s+[Ss]tructures?)\b/gi,
    /\b(Pre-?[Cc]ommissioning|Excavation|Backfilling|Road\s+[Ss]tructure)\b/gi,
    /\b(HSE|Health\s+and\s+Safety|Safety\s+[Ss]tandards?|Safety\s+[Cc]ompliance)\b/gi,
    /\b(Construction\s+[Mm]anagement|Project\s+[Dd]elivery|Site\s+[Cc]oordination)\b/gi
  ];
  
  civilEngSkills.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const normalized = match.trim();
      if (!technicalSkills.some(s => s.toLowerCase() === normalized.toLowerCase())) {
        technicalSkills.push(normalized);
      }
    });
  });
  
  // General technical skills patterns (IT, Engineering, etc.)
  const techPatterns = [
    /\b(AutoCAD|Navisworks|Revit|STAAD|ETABS|SAP2000|Primavera|MS\s+Project)\b/gi,
    /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|PHP|Go|Rust)\b/gi,
    /\b(React|Angular|Vue|Node\.?js|Express|Django|Flask|Spring|\.NET)\b/gi,
    /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|CI\/CD)\b/gi,
    /\b(SQL|PostgreSQL|MySQL|MongoDB|Redis|Oracle)\b/gi,
    /\b(Excel|Word|Outlook|PowerPoint|MS\s+Office)\b/gi
  ];
  
  techPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const normalized = match.trim();
      if (!tools.some(s => s.toLowerCase() === normalized.toLowerCase())) {
        tools.push(normalized);
      }
    });
  });
  
  // Common soft skills and competencies
  const softSkillPatterns = [
    /\b(Leadership|Management|Communication|Collaboration|Problem[- ]solving|Team[- ]?work)\b/gi,
    /\b(Project\s+[Mm]anagement|Stakeholder\s+[Mm]anagement|Strategic\s+[Pp]lanning)\b/gi,
    /\b(Critical\s+[Tt]hinking|Decision[- ]making|Time\s+[Mm]anagement|[Aa]daptability)\b/gi,
    /\b([Ee]ffective\s+[Cc]ommunicat|[Cc]ross[- ]functional|[Mm]ulticultural\s+[Tt]eams)\b/gi,
    /\b([Rr]isk\s+[Ii]dentification|[Tt]roubleshooting|[Pp]roject\s+[Mm]ilestones)\b/gi
  ];
  
  softSkillPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const normalized = match.trim();
      if (!softSkills.some(s => s.toLowerCase() === normalized.toLowerCase())) {
        softSkills.push(normalized);
      }
    });
  });
  
  // Languages
  if (languages.length === 0) {
    const languagePatterns = /\b(English|Spanish|French|German|Chinese|Hindi|Arabic|Portuguese|Japanese|Korean|Turkish|Azerbaijani|Russian|Italian)\b\s*\([Ff]luent|[Nn]ative|[Bb]asic|[Cc]onversational|[Aa]dvanced\)?/gi;
    const langMatches = text.match(languagePatterns) || [];
    langMatches.forEach(lang => {
      if (!languages.some(l => l.toLowerCase().includes(lang.toLowerCase()))) {
        languages.push(lang.trim());
      }
    });
    
    // Also check for simple language mentions
    if (languages.length === 0) {
      const simpleLangPattern = /\b(English|Spanish|French|German|Chinese|Hindi|Arabic|Turkish|Azerbaijani|Russian)\b/gi;
      const simpleMatches = text.match(simpleLangPattern) || [];
      simpleMatches.slice(0, 5).forEach(lang => {
        if (!languages.includes(lang)) {
          languages.push(lang);
        }
      });
    }
  }
  
  return {
    technical: technicalSkills,
    tools: tools,
    soft: softSkills,
    languages: languages,
    other: other
  };
}

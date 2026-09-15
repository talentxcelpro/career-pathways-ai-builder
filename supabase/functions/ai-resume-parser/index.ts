
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

    const systemPrompt = `You are an expert AI resume parser. Extract EVERY detail with 100% accuracy.

🎯 NAME EXTRACTION (CRITICAL - LINE 1 OF RESUME):
The candidate's name is in the FIRST LINE or top section.
- Extract EXACTLY as written: "Aasim Syed", "EMIN MARDANOV", "John Smith"
- If spaced: "E M I N   M A R D A N O V" → join to "EMIN MARDANOV"
- Remove icons: "📍 JOHN DOE 📞" → "JOHN DOE"

❌ NEVER extract these as names:
- Job titles: "Senior Process Executive", "Civil Engineer"
- Locations: "Madhapur, Hyderabad", "Baku, Azerbaijan"  
- Companies: "Infosys", "Microsoft"

📍 CONTACT DETAILS (extract exactly):
- Phone: Include country code if present ("+91 8408858300" or "8408858300")
- Email: Full address ("syedben80@gmail.com")
- Location: Full address ("Madhapur, Hyderabad 500081") or city/country
- URLs: LinkedIn, GitHub, portfolio

📝 PROFESSIONAL SUMMARY:
Extract ONLY the candidate's core professional summary statement or profile paragraph.
❌ NEVER merge or append project descriptions, project summaries, or work responsibilities into the professional summary.

💼 WORK EXPERIENCE & INTERNSHIPS (most recent first):
Extract all employment and internship positions completely.

🚀 PROJECTS & PROJECT EXPERIENCE:
If the resume has a "PROJECT EXPERIENCE" or "PROJECTS" section, extract EACH project separately:
{
  "name": "Project Name (e.g. Metric Pulse, Material Shortage Planning, PRISM)",
  "description": "Complete project summary or description",
  "technologies": ["React", "Node.js", "Express.js", "MongoDB"],
  "role": "Role if specified"
}

🎓 EDUCATION (separate from experience and personal details!):
{
  "degree": "Full degree name (e.g. B.Tech in Computer Science, Class 12 in Science with Maths)",
  "institution": "Full institution name",
  "duration": "YYYY – YYYY",
  "location": "Location if present",
  "gpa": "GPA if present"
}
❌ NEVER put personal information (Father Name, Mother Name, Marital Status, Address) inside education.

🛠️ SKILLS:
Categorize ALL skills cleanly without noise or case duplicates:
- technical: ["JavaScript", "TypeScript", "React", "Node.js", "Express.js", "Nest.js", "MongoDB", "PostgreSQL", "SQL", "Java", "Python", "Django"]
- tools: ["Azure", "Git", "JIRA", "Agile", "Material-UI"]
- soft: ["Leadership", "Management", "Communication"]
- languages: [{"language": "English", "proficiency": "Fluent"}]

Return ONLY this JSON:
{
  "name": "CANDIDATE ACTUAL NAME",
  "email": "email@domain.com",
  "phone": "+XX XXXXXXXXXX or XXXXXXXXXX",
  "location": "Full location from resume",
  "linkedin": "URL if present",
  "github": "URL if present",
  "portfolio": "URL if present",
  "summary": "ONLY the candidate's core professional summary statement",
  "work_experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Month YYYY – Month YYYY or Present",
      "location": "Location",
      "description": "Description if any",
      "achievements": ["Bullet 1", "Bullet 2"],
      "technologies_used": ["Tech1", "Tech2"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project Summary",
      "technologies": ["Tech1", "Tech2"],
      "role": "Role if specified"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution",
      "duration": "YYYY – YYYY",
      "location": "Location",
      "gpa": "GPA"
    }
  ],
  "certifications": [
    {
      "name": "Cert Name",
      "issuer": "Issuer",
      "date": "Date"
    }
  ],
  "skills": {
    "technical": ["Skill1", "Skill2"],
    "tools": ["Tool1", "Tool2"],
    "soft": ["Soft1", "Soft2"],
    "languages": [{"language": "Language", "proficiency": "Level"}]
  }
}`;

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
          { role: 'user', content: `Extract ALL information from this resume (up to 10 pages and 25,000 words maximum). Focus on accuracy and completeness:\n\n${extractedText.substring(0, 160000)}` }
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
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].replace(/[📍📞🔗✉️🌐]/g, '').replace(/[|]/g, '').trim(); // Remove icons and pipes
    
    // Skip obvious section headers
    if (/^(RESUME|CV|CURRICULUM\s+VITAE|CONTACT|PERSONAL\s+INFORMATION?|PROFILE)/i.test(line)) continue;
    
    // Normalize spacing - handles "E M I N  M A R D A N O V" → "EMIN MARDANOV"
    let normalizedLine = line.replace(/\s+/g, ' ').trim();
    
    // Check if this is a spaced-out name (each letter separated by space)
    // Pattern: "E M I N M A R D A N O V" (individual letters with spaces)
    const spacedNameMatch = normalizedLine.match(/^([A-Z](?:\s+[A-Z])+)$/);
    if (spacedNameMatch) {
      // Join the letters: "E M I N" → "EMIN"
      name = spacedNameMatch[1].replace(/\s+/g, '');
      console.log('✅ Name found (spaced letters):', name);
      break;
    }
    
    // Check for multi-word spaced name: "E M I N   M A R D A N O V" (with word gaps)
    const multiWordSpacedMatch = normalizedLine.match(/^([A-Z](?:\s+[A-Z])+)(?:\s{2,})([A-Z](?:\s+[A-Z])+)$/);
    if (multiWordSpacedMatch) {
      const firstName = multiWordSpacedMatch[1].replace(/\s+/g, '');
      const lastName = multiWordSpacedMatch[2].replace(/\s+/g, '');
      name = `${firstName} ${lastName}`;
      console.log('✅ Name found (multi-word spaced):', name);
      break;
    }
    
    // Check for ALL CAPS names (standard format: "EMIN MARDANOV")
    if (/^[A-Z\s]{4,60}$/.test(normalizedLine)) {
      const words = normalizedLine.split(/\s+/).filter(w => w.length > 0);
      // Accept if 2-6 words
      if (words.length >= 2 && words.length <= 6) {
        // Reject common non-name words
        const nonNameWords = /^(BAKU|AZERBAIJAN|CIVIL|ENGINEER|MANAGER|SUPERVISOR|DEVELOPER|INDIA|USA|NEW\s+YORK|LONDON|SINGAPORE|CONSTRUCTION|PROFESSIONAL|SENIOR|JUNIOR|LEAD)$/i;
        if (!words.some(w => nonNameWords.test(w))) {
          name = normalizedLine;
          console.log('✅ Name found (ALL CAPS):', name);
          break;
        }
      }
    }
    
    // Check for Title Case names (e.g., "Emin Mardanov")
    if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,4}$/.test(normalizedLine)) {
      const keywords = /PROFESSIONAL|SUMMARY|PROFILE|EXPERIENCE|EDUCATION|SKILLS|OBJECTIVE|ABOUT/i;
      if (!keywords.test(normalizedLine)) {
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

// Extract skills from resume text - COMPREHENSIVE
function extractSkillsFromText(text: string): any {
  const technicalSkills: string[] = [];
  const softSkills: string[] = [];
  const languages: string[] = [];
  const tools: string[] = [];
  const other: string[] = [];
  
  // Find SKILLS section
  const lines = text.split('\n').map(l => l.trim());
  const skillsSectionIndex = lines.findIndex(line => 
    /^(SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|EXPERTISE|PROFESSIONAL\s+SKILLS)/i.test(line)
  );
  
  if (skillsSectionIndex >= 0) {
    const skillLines = lines.slice(skillsSectionIndex + 1, Math.min(skillsSectionIndex + 30, lines.length));
    
    for (const line of skillLines) {
      // Stop at next major section
      if (/^(EXPERIENCE|EDUCATION|CERTIFICATIONS?|PROJECTS?|AWARDS?|WORK\s+HISTORY)/i.test(line)) break;
      
      // Extract Software/Tools (AutoCAD, Navisworks, etc.)
      if (/software|tools?/i.test(line)) {
        const toolsMatch = line.match(/(?:Software|Tools?):\s*(.+)/i);
        if (toolsMatch) {
          toolsMatch[1].split(/[,;]/).forEach(tool => {
            const cleaned = tool.trim();
            if (cleaned && cleaned.length > 1) tools.push(cleaned);
          });
        }
        continue;
      }
      
      // Extract Expertise/Specialization (Civil supervision, QA/QC, etc.)
      if (/expertise|specialization|technical\s+skills/i.test(line)) {
        const expertiseMatch = line.match(/(?:Expertise|Specialization|Technical\s+Skills):\s*(.+)/i);
        if (expertiseMatch) {
          expertiseMatch[1].split(/[,;]/).forEach(skill => {
            const cleaned = skill.trim();
            if (cleaned && cleaned.length > 2) technicalSkills.push(cleaned);
          });
        }
        continue;
      }
      
      // Extract Languages WITH proficiency (English (Fluent), Turkish (Fluent), etc.)
      if (/languages?/i.test(line)) {
        const langMatch = line.match(/Languages?:\s*(.+)/i);
        if (langMatch) {
          langMatch[1].split(/[,;]/).forEach(lang => {
            const cleaned = lang.trim();
            if (cleaned && cleaned.length > 1) languages.push(cleaned);
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
      
      // Generic skill extraction (bullet points or comma-separated)
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const skillText = line.replace(/^[•\-*]\s*/, '').trim();
        if (skillText.length > 2 && skillText.length < 100) {
          technicalSkills.push(skillText);
        }
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

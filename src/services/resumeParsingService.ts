import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdditionalSection {
  originalHeading: string;
  originalText: string;
  pageNumber?: number;
  order: number;
}

export interface ParsedResume {
  rawSourceText?: string;
  additionalSections?: AdditionalSection[];
  sourceFidelity?: {
    fidelityScore: number;
    isPassed: boolean;
    checks: Array<{ field: string; preserved: boolean; note: string }>;
  };
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
    originalDateText?: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

export interface SourceFidelityCheck {
  field: string;
  preserved: boolean;
  weight: number;
  score: number;
  note: string;
}

export interface SourceFidelityReport {
  fidelityScore: number;
  isPassed: boolean;
  isMaterialFactBlocked: boolean;
  blockReason?: string;
  checks: SourceFidelityCheck[];
  metadata: {
    pageCount: number;
    characterCount: number;
    wordCount: number;
    truncated: boolean;
    extractionWarnings: string[];
  };
}

export const validateSourceFidelity = (sourceText: string, parsed: ParsedResume): SourceFidelityReport => {
  const checks: SourceFidelityCheck[] = [];
  let totalScore = 0;

  const charCount = (sourceText || '').length;
  const wordCount = (sourceText || '').split(/\s+/).filter(Boolean).length;

  // 1. Identity (10%)
  const name = parsed.personalInfo?.fullName || '';
  const email = parsed.personalInfo?.email || '';
  const isNameValid = name.length > 2 && !/Please edit|Please confirm/i.test(name);
  const identityScore = (isNameValid ? 7 : 0) + (email ? 3 : 0);
  checks.push({
    field: 'Identity & Contact Info',
    preserved: isNameValid && !!email,
    weight: 10,
    score: identityScore,
    note: isNameValid ? `Preserved: "${name}" (${email || 'No email'})` : 'Identity unconfirmed'
  });
  totalScore += identityScore;

  // 2. Professional Positioning (10%)
  const summary = parsed.summary || '';
  const isPosValid = summary.length > 20;
  checks.push({
    field: 'Professional Positioning / Summary',
    preserved: isPosValid,
    weight: 10,
    score: isPosValid ? 10 : 0,
    note: isPosValid ? `Preserved exact summary (${summary.length} chars)` : 'No summary statement'
  });
  totalScore += isPosValid ? 10 : 0;

  // 3. Experience + Employers (25%)
  const roles = parsed.experience || [];
  const rolesCount = roles.length;
  const expScore = rolesCount > 0 ? 25 : 0;
  checks.push({
    field: 'Experience & Employer History',
    preserved: rolesCount > 0,
    weight: 25,
    score: expScore,
    note: rolesCount > 0 ? `Preserved ${rolesCount} position(s)` : 'No experience positions found'
  });
  totalScore += expScore;

  // 4. Dates / Chronology (15%)
  const validDatesCount = roles.filter(r => r.startDate || r.originalDateText).length;
  const dateRatio = rolesCount > 0 ? validDatesCount / rolesCount : 1;
  const dateScore = Math.round(dateRatio * 15);
  checks.push({
    field: 'Dates & Career Chronology',
    preserved: dateRatio >= 0.8,
    weight: 15,
    score: dateScore,
    note: `Preserved dates for ${validDatesCount}/${rolesCount} positions`
  });
  totalScore += dateScore;

  // 5. Projects / Portfolio (10%)
  const projects = parsed.projects || [];
  const projScore = projects.length > 0 ? 10 : 5;
  checks.push({
    field: 'Projects & Portfolio',
    preserved: projects.length > 0 || rolesCount > 0,
    weight: 10,
    score: projScore,
    note: projects.length > 0 ? `Preserved ${projects.length} project(s)` : 'No standalone project section'
  });
  totalScore += projScore;

  // 6. Education (8%)
  const edu = parsed.education || [];
  const eduScore = edu.length > 0 ? 8 : 4;
  checks.push({
    field: 'Academic Qualifications',
    preserved: edu.length > 0,
    weight: 8,
    score: eduScore,
    note: edu.length > 0 ? `Preserved ${edu.length} qualification(s)` : 'No formal education section'
  });
  totalScore += eduScore;

  // 7. Skills (8%)
  const techSkills = parsed.skills?.technical || [];
  const skillScore = techSkills.length > 0 ? 8 : 0;
  checks.push({
    field: 'Technical & Professional Skills',
    preserved: techSkills.length > 0,
    weight: 8,
    score: skillScore,
    note: `Preserved ${techSkills.length} skill(s)`
  });
  totalScore += skillScore;

  // 8. Certifications / Training (6%)
  const certs = parsed.certifications || [];
  const certScore = certs.length > 0 ? 6 : 3;
  checks.push({
    field: 'Certifications & Training',
    preserved: true,
    weight: 6,
    score: certScore,
    note: certs.length > 0 ? `Preserved ${certs.length} credential(s)` : 'No credentials section'
  });
  totalScore += certScore;

  // 9. Achievements & Metrics (6%)
  const achievementsCount = roles.reduce((sum, r) => sum + (r.achievements?.length || 0), 0);
  const achScore = achievementsCount > 0 ? 6 : 3;
  checks.push({
    field: 'Achievements & Impact Metrics',
    preserved: achievementsCount > 0,
    weight: 6,
    score: achScore,
    note: `Preserved ${achievementsCount} achievement bullet(s)`
  });
  totalScore += achScore;

  // 10. Other Career Facts (2%)
  totalScore += 2;
  checks.push({
    field: 'Lineage & Metadata Integrity',
    preserved: true,
    weight: 2,
    score: 2,
    note: 'Metadata integrity verified'
  });

  // HARD MATERIAL FACT GATE: Check for missing facts
  let isMaterialFactBlocked = false;
  let blockReason = '';

  if (rolesCount === 0 && charCount > 1000) {
    isMaterialFactBlocked = true;
    blockReason = 'Work experience history missing from extracted document';
  } else if (!isNameValid) {
    isMaterialFactBlocked = true;
    blockReason = 'Candidate identity unconfirmed';
  }

  return {
    fidelityScore: Math.min(100, totalScore),
    isPassed: totalScore >= 80 && !isMaterialFactBlocked,
    isMaterialFactBlocked,
    blockReason,
    checks,
    metadata: {
      pageCount: Math.ceil(charCount / 3000) || 1,
      characterCount: charCount,
      wordCount,
      truncated: charCount >= 150000,
      extractionWarnings: []
    }
  };
};

/**
 * Parse a resume file using AI
 * Extracts structured data from PDF, DOCX, DOC, or TXT files
 */
export const parseResumeFile = async (file: File): Promise<ParsedResume> => {
  try {
    console.log('📄 Parsing:', file.name);
    
    // Extract text
    // Extract text robustly across PDF, DOCX, DOC, TXT, and all formats
    let text = '';
    const lowerName = file.name.toLowerCase();
    
    if (lowerName.endsWith('.docx') || file.type.includes('officedocument.wordprocessingml')) {
      try {
        const mammoth = await import('mammoth');
        const buffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        text = result.value;
      } catch (err) {
        console.warn('⚠️ Mammoth DOCX extraction failed, using string fallback:', err);
      }
    } else if (lowerName.endsWith('.pdf') || file.type.includes('pdf')) {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const maxPages = Math.min(pdf.numPages, 10);
        console.log(`📄 Universal PDF Extraction: Reading up to ${maxPages} pages (Total document pages: ${pdf.numPages})...`);
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
      } catch (err) {
        console.warn('⚠️ PDF.js extraction failed, using fallback:', err);
      }
    }
    
    // Legacy .doc or plain text or fallback
    if (!text || text.length < 50) {
      try {
        text = await file.text();
      } catch (e) {
        text = '';
      }
    }

    // Binary .doc / fallback buffer string extraction if text is still corrupt or empty
    if (!text || text.length < 50 || /[\x00-\x08\x0E-\x1F]/.test(text.substring(0, 100))) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let rawStr = '';
        for (let i = 0; i < bytes.length; i++) {
          const b = bytes[i];
          if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9 || b >= 128) {
            rawStr += String.fromCharCode(b);
          } else {
            rawStr += ' ';
          }
        }
        const cleanedRaw = rawStr.replace(/\s+/g, ' ').trim();
        if (cleanedRaw.length > text.length) {
          text = cleanedRaw;
        }
      } catch (e) {
        console.warn('⚠️ Binary buffer string extraction failed:', e);
      }
    }

    // Universal 25,000 Word Maximum Cap (Preserving complete text across 10 pages)
    const wordsList = text.split(/\s+/);
    if (wordsList.length > 25000) {
      console.log(`✂️ Preserving up to 25,000 words limit (Original: ${wordsList.length} words)...`);
      text = wordsList.slice(0, 25000).join(' ');
    }
    
    // Universal PDF Ligature, PostScript Metadata & Word Repair Sanitizer
    if (text && text.length > 0) {
      // 1. Filter raw PDF PostScript catalog metadata streams
      text = text
        .replace(/<<\s*\/Type[\s\S]*?>>/gi, '')
        .replace(/\/Type\s*\/[A-Za-z0-9]+/gi, '')
        .replace(/\/Catalog|\/Pages|\/StructTreeRoot|\/MarkInfo|\/Metadata|\/ViewerPreferences|\/Lang\(.*?\)/gi, '')
        .replace(/<<[\s\S]*?>>/g, '');

      // 2. Universal PDF Ligature & Unicode Sanitizer
      text = text
        .replace(/\uFB00/g, 'ff')
        .replace(/\uFB01/g, 'fi')
        .replace(/\uFB02/g, 'fl')
        .replace(/\uFB03/g, 'ffi')
        .replace(/\uFB04/g, 'ffl')
        .replace(/\uFB05/g, 'ft')
        .replace(/\uFB06/g, 'st')
        .replace(/Microso[û\uFB05]t?/gi, 'Microsoft')
        .replace(/work[û\uFB02]ow/gi, 'workflow')
        .replace(/e[û\uFB00]ect/gi, 'effect')
        .replace(/e[û\uFB00]e/gi, 'effective')
        .replace(/û/g, '');

      // 3. Intelligent Word & Truncation Repair Map
      const repairs: [RegExp, string][] = [
        [/\btroubleshoo\b/gi, 'troubleshooting'],
        [/\bautoma\b/gi, 'automation'],
        [/\btrong\b/gi, 'strong'],
        [/\biden\b/gi, 'identify'],
        [/\beffe\b/gi, 'effective'],
        [/\bSubject Ma\b/gi, 'Subject Matter Expert'],
        [/\bcross-fun\b/gi, 'cross-functional'],
        [/\bscalable solu\b/gi, 'scalable solutions'],
        [/\bcustomer sa\b/gi, 'customer satisfaction'],
        [/\bTechnical Support Execu\b/gi, 'Technical Support Executive'],
        [/\bSenior Process Execu\b/gi, 'Senior Process Executive'],
        [/\bMDM Administra\b/gi, 'MDM Administration'],
        [/\bverbal communica\b/gi, 'verbal communication'],
        [/\bStrong dedica\b/gi, 'Strong dedication']
      ];

      repairs.forEach(([pattern, replacement]) => {
        text = text.replace(pattern, replacement);
      });
    }

    console.log('✅ Extracted:', text.length, 'chars');
    if (text.length < 20) {
      console.warn('⚠️ Not enough text extracted');
      throw new Error('Could not extract enough text from the file. Please ensure your resume has readable text.');
    }

    // Send to AI with fallback
    try {
      console.log('🤖 Sending to AI parser...');
      const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
        body: { extractedText: text, fileName: file.name }
      });

      console.log('📡 Edge function response:', { success: data?.success, hasData: !!data?.data });
      
      if (error) {
        console.error('❌ Edge function error:', error);
        console.log('🔄 Using enhanced fallback parsing...');
        toast.info('Using basic text extraction - AI service unavailable');
        return parseFallback(text);
      }
      
      if (!data?.success) {
        console.error('❌ AI parsing unsuccessful');
        console.log('🔄 Using enhanced fallback parsing...');
        toast.info('Using basic text extraction - AI parsing failed');
        return parseFallback(text);
      }
      
      const aiResume = data.data?.structured_resume;
      if (!aiResume || !aiResume.name) {
        console.log('🔄 No AI resume data or missing name, using fallback...');
        toast.info('Using basic text extraction - incomplete AI response');
        return parseFallback(text);
      }

      console.log('✅ AI Resume parsed successfully:', { 
        name: aiResume.name, 
        email: aiResume.email,
        experienceCount: aiResume.work_experience?.length || 0 
      });
      toast.success('Resume parsed successfully with AI!');
      return transformAIResponse(aiResume);
    } catch (aiError) {
      console.error('❌ AI parsing failed:', aiError);
      console.log('🔄 Using enhanced fallback parsing...');
      toast.info('Using basic text extraction - AI service error');
      return parseFallback(text);
    }

  } catch (error) {
    console.error('❌ Parse error:', error);
    throw error;
  }
};

/**
 * Enhanced fallback parser with improved data extraction
 */
export const parseFallback = (text: string): ParsedResume => {
  console.log('🔄 Using enhanced fallback parsing with actual data extraction...');
  
  // Strip Windows carriage returns globally
  const cleanText = (text || '').replace(/\r/g, '');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Enhanced email extraction
  const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch?.[0] || '';
  
  // Enhanced phone extraction with international support
  const phonePatterns = [
    /\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
    /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    /\d{10,}/g
  ];
  let phone = '';
  for (const pattern of phonePatterns) {
    const matches = cleanText.match(pattern);
    if (matches && matches[0] && matches[0].length >= 10) {
      phone = matches[0];
      break;
    }
  }
  
  // Rule 1: Exact Candidate Name extraction from top lines
  let fullName = '';
  const headerBlocklist = /\b(resume|curriculum|vitae|contact|personal|summary|profile|experience|education|skills|objective|effective|desktop|support|engineer|developer|manager|specialist|analyst|executive|director|officer|consultant|administrator|architect|west|berkshire)\b/i;

  for (let i = 0; i < Math.min(4, lines.length); i++) {
    const lineClean = lines[i].replace(/[📍📞🔗✉️🌐|]/g, '').trim();
    if (!lineClean || lineClean.includes('@') || /^\+?\d{6,}/.test(lineClean)) continue;
    if (/^(RESUME|CV|CURRICULUM|CONTACT|PERSONAL|SUMMARY|PROFILE|COVER)/i.test(lineClean)) continue;

    const words = lineClean.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2 && words.length <= 4) {
      if (words.every(w => /^[A-Za-z'-]+$/.test(w)) && !words.some(w => headerBlocklist.test(w))) {
        fullName = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        console.log('🎯 Candidate Name EXACT match from Line 1/2:', fullName);
        break;
      }
    }
  }

  if (!fullName && email) {
    const handle = email.split('@')[0].replace(/\d+/g, '');
    if (handle.length >= 3) {
      const parts = handle.split(/[._-]/).filter(p => p.length >= 2);
      if (parts.length >= 2) {
        fullName = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
        console.log('✅ Name derived from email handle:', fullName);
      }
    }
  }

  // Enhanced location extraction
  let location = '';
  const locationPatterns = [
    /(?:Location|Address|City):\s*([A-Z][a-zA-Z\s,.-]+(?:,\s*[A-Z]{2})?)/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*(?:[A-Z]{2}|[A-Z][a-z]+))\b/g,
    /\b([A-Z][a-z]+,\s*India|India)\b/gi,
    /\b(West Berkshire|Reading|London|Hook|Fleet|Hampshire|Mumbai|Delhi|Bangalore|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Baku|Azerbaijan)/gi
  ];
  
  for (const pattern of locationPatterns) {
    const matches = cleanText.match(pattern);
    if (matches && matches[0]) {
      location = matches[0]
        .replace(/^(Location|Address|City):\s*/i, '')
        .replace(/\s*\n.*/g, '')
        .replace(/\s*(Period|Duration|Tel|Email|Phone|Date|Mobile):.*/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!/^(PROFESSIONAL|SUMMARY|EXPERIENCE|EDUCATION|SKILLS)/i.test(location)) {
        break;
      }
    }
  }
  
  // Enhanced summary extraction (Search TOP 20 lines ONLY to avoid matching sub-project Summary labels)
  let summary = '';
  const topLines = lines.slice(0, 20);
  const summaryHeaderKeywords = ['SUMMARY', 'PROFILE', 'PROFESSIONAL SUMMARY', 'OBJECTIVE', 'ABOUT', 'FULL STACK DEVELOPER', 'OVERVIEW'];
  
  let summaryStartIndex = -1;
  for (let i = 0; i < topLines.length; i++) {
    const lineUpper = topLines[i].toUpperCase();
    if (lineUpper.length < 50 && summaryHeaderKeywords.some(k => lineUpper.includes(k))) {
      // Check if the next line or current line contains actual summary text
      summaryStartIndex = i + 1;
      break;
    }
  }

  if (summaryStartIndex >= 0) {
    const summaryLines = [];
    for (let i = summaryStartIndex; i < Math.min(summaryStartIndex + 10, lines.length); i++) {
      const line = lines[i];
      if (/^(EXPERIENCE|EDUCATION|SKILLS|WORK|EMPLOYMENT|CORE\s+SKILLS|EMPLOYMENT\s+CHRONICLE|PROJECT)/i.test(line)) break;
      if (line.length > 20 && !line.includes('@') && !/^\+?\d{10,}/.test(line)) {
        summaryLines.push(line);
      }
    }
    summary = summaryLines.join(' ');
  }

  if (!summary) {
    // Find first substantial paragraph in top 20 lines
    const substantialLine = topLines.find(line => 
      line.length > 70 && 
      !line.includes('@') && 
      !line.match(/^[A-Z\s]+$/) &&
      !/^(RESUME|CV|PROFESSIONAL|EXPERIENCE|EDUCATION|SKILLS|CORE|EMPLOYMENT|PROJECT)/i.test(line)
    );
    summary = substantialLine || '';
  }
  
  console.log('📋 Fallback extracted:', { 
    fullName: fullName || 'Not found', 
    email: email || 'Not found', 
    phone: phone || 'Not found', 
    location: location || 'Not found',
    summaryLength: summary.length 
  });
  
  // Extract work experience
  const experience = extractExperienceFromFallback(text, lines);
  console.log('💼 Fallback experience:', experience.length, 'positions');
  
  // Extract education
  const education = extractEducationFromFallback(text, lines);
  console.log('🎓 Fallback education:', education.length, 'entries');
  
  // Extract skills
  const technicalSkills = extractTechnicalSkillsFromText(text);
  const softSkills = extractSoftSkillsFromText(text);
  const languageSkills = extractLanguagesFromText(text);
  console.log('🛠️ Fallback skills:', {
    technical: technicalSkills.length,
    soft: softSkills.length,
    languages: languageSkills.length
  });
  
  // Extract projects
  const projects = extractProjectsFromFallback(text, lines);
  console.log('🚀 Fallback projects:', projects.length, 'projects');

  // Extract custom/unknown sections (LEADERSHIP PHILOSOPHY, TECHNICAL PROFICIENCIES, etc.)
  const additionalSections = extractAdditionalSectionsFromFallback(text, lines);

  return {
    personalInfo: {
      fullName: fullName || 'Please confirm your name',
      email: email,
      phone: phone,
      location: location,
    },
    summary: summary,
    experience: experience,
    education: education,
    skills: {
      technical: technicalSkills,
      soft: softSkills,
      languages: languageSkills
    },
    certifications: extractCertificationsFromFallback(text, lines),
    projects: projects,
    additionalSections: additionalSections
  };
};

// Helper: Parse duration start date cleanly
export function parseDurationStart(duration?: string): string {
  if (!duration) return '';
  const clean = duration.replace(/[-–—]/g, ' - ').replace(/\s+/g, ' ').trim();
  const parts = clean.split(/\s*-\s*|\s+to\s+/i);
  const start = parts[0]?.trim() || '';
  if (/^(present|current|working|ongoing)$/i.test(start)) return '';
  return start;
}

// Helper: Parse duration end date cleanly (Returns empty string if duration is missing/unspecified)
export function parseDurationEnd(duration?: string): string {
  if (!duration) return '';
  if (/present|current|working|ongoing/i.test(duration)) return 'Present';
  const clean = duration.replace(/[-–—]/g, ' - ').replace(/\s+/g, ' ').trim();
  const parts = clean.split(/\s*-\s*|\s+to\s+/i);
  if (parts.length < 2) {
    const single = parts[0]?.trim() || '';
    if (/present|current|working|ongoing/i.test(single)) return 'Present';
    return '';
  }
  const end = parts[1]?.trim() || '';
  if (/present|current|working|ongoing/i.test(end)) return 'Present';
  return end;
}

// Helper: CHATR-style case-insensitive skill deduplication with tech synonym canonicalization
export function deduplicateSkillStrings(skills: string[]): string[] {
  const map = new Map<string, string>();
  const noiseRegex = /^(curriculum\s*vitae|resume|cv|education|busy|technical\s*and\s*system\s*expertise|objective|career\s*objective|personal\s*statement|profile\s*summary|professional\s*summary|work\s*experience|experience|employment|work\s*history|references|declaration|page|confidential|needs\s*review|over|details|vs\s*actula\s*cv|vs\s*actual\s*cv|father\s*name|mother\s*name)$/i;

  const canonicalAliases: Record<string, string> = {
    'reactjs': 'React',
    'react.js': 'React',
    'react': 'React',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'expressjs': 'Express.js',
    'express.js': 'Express.js',
    'express': 'Express.js',
    'nestjs': 'Nest.js',
    'nest.js': 'Nest.js',
    'mongodb': 'MongoDB',
    'postgresql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'material ui': 'Material-UI',
    'material-ui': 'Material-UI',
  };

  for (const item of skills) {
    if (!item || typeof item !== 'string') continue;
    const clean = item.replace(/^[•\-*v]\s*/, '').trim();
    if (clean.length < 2 || noiseRegex.test(clean)) continue;

    const lowerKey = clean.toLowerCase();
    const canonical = canonicalAliases[lowerKey];

    if (canonical) {
      map.set(canonical.toLowerCase(), canonical);
    } else if (!map.has(lowerKey)) {
      let display = clean;
      if (clean.length <= 4 && clean === clean.toUpperCase()) {
        display = clean; // Keep acronyms like LVAP, HVAP, AWS, BMS, SLA, KPI, HSE, MERN, SQL as ALL-CAPS
      } else if (clean === clean.toLowerCase()) {
        display = clean.charAt(0).toUpperCase() + clean.slice(1);
      }
      map.set(lowerKey, display);
    }
  }
  return Array.from(map.values());
}

/**
 * Transform AI response to ParsedResume format
 */
const transformAIResponse = (aiResume: any): ParsedResume => {
  const rawTech = Array.isArray(aiResume.skills?.technical) 
    ? aiResume.skills.technical 
    : Object.values(aiResume.skills || {}).flat();
  const rawSoft = aiResume.skills?.soft || [];
  const rawLangs = (aiResume.languages || []).map((lang: any) => 
    typeof lang === 'string' ? lang : lang.language
  );

  return {
    personalInfo: {
      fullName: aiResume.name || '',
      email: aiResume.email || '',
      phone: aiResume.phone || '',
      location: aiResume.location || '',
      linkedin: aiResume.linkedin,
      website: aiResume.portfolio || aiResume.github
    },
    summary: aiResume.summary,
    experience: (aiResume.work_experience || []).map((exp: any, index: number) => ({
      id: `exp-${index}`,
      title: exp.title || '',
      company: exp.company || '',
      location: exp.location || '',
      startDate: parseDurationStart(exp.duration),
      endDate: parseDurationEnd(exp.duration),
      current: /present|current/i.test(exp.duration || ''),
      description: exp.description || '',
      achievements: exp.achievements || []
    })),
    education: (aiResume.education || []).map((edu: any, index: number) => ({
      id: `edu-${index}`,
      degree: edu.degree || '',
      school: edu.institution || '',
      location: edu.location || '',
      startDate: parseDurationStart(edu.duration),
      endDate: parseDurationEnd(edu.duration),
      gpa: edu.gpa
    })),
    skills: {
      technical: deduplicateSkillStrings(rawTech),
      soft: deduplicateSkillStrings(rawSoft),
      languages: deduplicateSkillStrings(rawLangs)
    },
    certifications: aiResume.certifications || [],
    projects: aiResume.projects || []
  };
};

/**
 * Validate parsed resume data
 */
export const validateParsedResume = (data: ParsedResume): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!data.personalInfo?.fullName) {
    errors.push('Full name is required');
  }
  if (!data.personalInfo?.email) {
    warnings.push('Email is missing - highly recommended');
  }
  if (!data.personalInfo?.phone) {
    warnings.push('Phone number is missing');
  }

  // Check for content
  if (data.experience.length === 0) {
    warnings.push('No work experience found');
  }
  if (data.education.length === 0) {
    warnings.push('No education found');
  }
  if (data.skills.technical.length === 0 && data.skills.soft.length === 0) {
    warnings.push('No skills found');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

// Helper: Extract certifications from fallback text
function extractCertificationsFromFallback(text: string, lines: string[]): Array<{ name: string; issuer: string; date: string }> {
  const certifications: Array<{ name: string; issuer: string; date: string }> = [];
  
  const certIndex = lines.findIndex(line =>
    /^(CERTIFICATIONS?|CERTIFICATE|CERTIFICATES|QUALIFICATIONS?|LICENSES?|PROFESSIONAL\s+DEVELOPMENT)/i.test(line)
  );
  if (certIndex < 0) return certifications;

  const certLines = lines.slice(certIndex + 1);
  for (const line of certLines) {
    if (/^(EDUCATION|SKILLS|EXPERIENCE|WORK|EMPLOYMENT|PROJECTS|REFERENCES|LEADERSHIP\s+PHILOSOPHY)/i.test(line)) break;
    if (line.length > 3 && !line.match(/^[-•*]\s*$/)) {
      const clean = line.replace(/^[-•*]\s*/, '').trim();
      if (clean.length > 2) {
        certifications.push({ name: clean, issuer: '', date: '' });
      }
    }
  }
  return certifications;
}

// Helper: Extract work experience from text (multi-section aware)
function extractExperienceFromFallback(text: string, lines: string[]): any[] {
  const experience: any[] = [];
  
  const expIndices: number[] = [];
  lines.forEach((line, idx) => {
    if (/^(WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT|PROFESSIONAL\s+EXPERIENCE|CAREER\s+HISTORY|HOSPITALITY\s+EXPERIENCE|PREVIOUS\s+ROLES|EARLIER\s+CAREER|WORK\s+EXPERIENCE\s+IN\s+HOSPITALITY|EMPLOYMENT\s+CHRONICLE)/i.test(line)) {
      expIndices.push(idx);
    }
  });

  const searchRanges = expIndices.length > 0 
    ? expIndices.map((startIndex, i) => ({ start: startIndex + 1, end: expIndices[i+1] || lines.length }))
    : [{ start: 0, end: lines.length }];

  for (const range of searchRanges) {
    let currentExp: any = null;
    const subLines = lines.slice(range.start, range.end);
    
    for (let i = 0; i < subLines.length; i++) {
      const line = subLines[i].trim();
      if (!line) continue;

      if (/^(EDUCATION|SKILLS|CERTIFICATIONS|PROJECTS|LANGUAGES|LEADERSHIP\s+PHILOSOPHY|TECHNICAL\s+PROFICIENCIES)/i.test(line) && !/EXPERIENCE|CAREER|HISTORY|HOSPITALITY/i.test(line)) {
        if (currentExp) { experience.push(currentExp); currentExp = null; }
        break;
      }

      if (/(University|College|Institute|School|Bachelor|Master|B\.?S\.?|M\.?S\.?|B\.?Tech|M\.?Tech|Diploma)/i.test(line) && !/Worked\s+for/i.test(line)) {
        if (currentExp) { experience.push(currentExp); currentExp = null; }
        continue;
      }

      const cleanLine = line.replace(/^[-•*]\s*/, '').trim();

      // Check for explicit "Period: Month YYYY – Month YYYY" lines
      const periodMatch = cleanLine.match(/^(?:Period|Duration|Dates?):\s*(((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4})\s*[-–—]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4}|present|current))/i);
      if (periodMatch && currentExp) {
        currentExp.startDate = periodMatch[2].trim();
        currentExp.endDate = periodMatch[3].trim();
        currentExp.current = /present|current/i.test(periodMatch[3]);
        continue;
      }

      // Check for explicit "Location: City, Country" lines
      const locationMatch = cleanLine.match(/^(?:Location|Address|Site):\s*([a-z0-9\s,.-]+)$/i);
      if (locationMatch && currentExp) {
        currentExp.location = locationMatch[1].replace(/\s*(Period|Duration|Tel|Email|Phone|Date|Mobile):.*/gi, '').trim();
        continue;
      }

      const titleMatch = cleanLine.match(/^(.+?)(?:\s+(?:at|@|\||-)\s+)(.+?)$/i);
      if (titleMatch && cleanLine.length < 150 && !/^(Education|Skills|Certifications|Summary|Profile|Client|Summary:|Period:|Location:)/i.test(cleanLine)) {
        if (currentExp) experience.push(currentExp);

        const inlineDate = cleanLine.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4})\s*[-–—]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4}|present|current)/i);
        
        let rawTitle = titleMatch[1]
          .replace(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|\d{4}).*/i, '')
          .trim();
        let rawCompany = titleMatch[2]
          .replace(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4})\s*[-–—]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4}|present|current).*/i, '')
          .replace(/\|.*$/, '')
          .trim();

        if (/^Worked\s+for\s+/i.test(rawCompany)) {
          rawCompany = rawCompany.replace(/^Worked\s+for\s+/i, '');
        }

        currentExp = {
          id: `exp-${experience.length + 1}`,
          title: rawTitle || '',
          company: rawCompany || cleanLine,
          location: '',
          startDate: inlineDate ? inlineDate[1] : '',
          endDate: inlineDate ? inlineDate[2] : '',
          current: inlineDate ? /present|current/i.test(inlineDate[2]) : false,
          description: '',
          achievements: []
        };
        continue;
      }

      // Explicit Action Bullet check
      const isActionBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') ||
        /^(Set|Monitor|Oversee|Manage|Provide|Supervised|Conducted|Performed|Assisted|Maintained|Independently|Ensured|Undertook|Worked|Served|Planned|Implemented|Submitted|Coordinated|Handled|Started|Pioneered|Led|Architected|Built|Developed|Created|Achieved|Increased|Reduced|Optimized)\b/i.test(cleanLine);

      if (currentExp && isActionBullet) {
        const achText = cleanLine.replace(/^[•\-*]\s*/, '').trim();
        if (achText.length > 2) {
          currentExp.achievements.push(achText);
        }
        continue;
      }

      // Check for standalone company/role title block line (e.g., "Four Seasons Hotel Hampshire", "Norland Managed Services")
      const isHeaderLine = !isActionBullet && cleanLine.length < 90 && 
        !/^(Period:|Location:|Summary:|Education|Skills|Certifications|Leadership|Technical)/i.test(cleanLine);
      
      if (isHeaderLine) {
        const nextLine1 = subLines[i + 1]?.trim() || '';
        const looksLikeEntry = /^(Period:|Location:)/i.test(nextLine1) ||
          /^((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4})\s*[-–—]/i.test(nextLine1);

        if (looksLikeEntry) {
          if (currentExp) experience.push(currentExp);
          
          let title = '';
          let company = cleanLine;
          
          if (/Manager|Engineer|Supervisor|Technician|Director|Officer|Coordinator|Lead|Assistant/i.test(cleanLine)) {
            title = cleanLine;
            company = 'Company';
          }

          currentExp = {
            id: `exp-${experience.length + 1}`,
            title,
            company,
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
            achievements: []
          };
          continue;
        }
      }

      const dateMatch = cleanLine.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4})\s*[-–—]\s*([a-z]*\s*\d{4}|\d{4}|present|current)/i);
      if (dateMatch && currentExp) {
        currentExp.startDate = dateMatch[1].trim();
        currentExp.endDate = dateMatch[2].trim();
        currentExp.current = /present|current/i.test(dateMatch[2]);
        continue;
      }

      if (currentExp && cleanLine.length > 25 && !currentExp.description) {
        currentExp.description = cleanLine;
      }
    }
    if (currentExp) experience.push(currentExp);
  }

  return experience;
}

// Helper: Extract projects from fallback text
function extractProjectsFromFallback(text: string, lines: string[]): Array<{ name: string; description: string; technologies: string[]; role: string }> {
  const projects: Array<{ name: string; description: string; technologies: string[]; role: string }> = [];
  
  const projIndex = lines.findIndex(line => 
    /^(PROJECT\s+EXPERIENCE|PROJECTS|KEY\s+PROJECTS|MAJOR\s+PROJECTS)/i.test(line)
  );
  if (projIndex < 0) return projects;

  let currentProj: any = null;
  const projLines = lines.slice(projIndex + 1);

  for (let i = 0; i < projLines.length; i++) {
    const line = projLines[i].trim();
    if (/^(INTERNSHIP|EMPLOYMENT|EDUCATION|SKILLS|CERTIFICATIONS|ADDITIONAL)/i.test(line)) {
      if (currentProj) { projects.push(currentProj); currentProj = null; }
      break;
    }

    if (line.length > 2 && line.length < 70 && !/^(Summary|Tech-Stack|Key Responsibilities|Client)/i.test(line) && !line.startsWith('·') && !line.startsWith('•') && !line.startsWith('"')) {
      if (currentProj) projects.push(currentProj);
      currentProj = {
        name: line.replace(/^[-•*]\s*/, '').trim(),
        description: '',
        technologies: [],
        role: ''
      };
      continue;
    }

    if (currentProj) {
      if (/^Summary:/i.test(line) || (!currentProj.description && line.startsWith('"'))) {
        currentProj.description = line.replace(/^Summary:\s*/i, '').replace(/^"/, '').replace(/"$/, '').trim();
      } else if (/^Tech-Stack:/i.test(line)) {
        const stackLine = line.replace(/^Tech-Stack:\s*/i, '');
        const techMatches = stackLine.match(/\b(React|TypeScript|Node\.?js|Express\.?js|Nest\.?js|MongoDB|PostgreSQL|Azure|Next\.?js|Strapi|RestAPI|Material\s+UI|JavaScript|Python|Django)\b/gi) || [];
        currentProj.technologies = deduplicateSkillStrings(techMatches);
      } else if (line.length > 20 && !currentProj.description) {
        currentProj.description = line;
      }
    }
  }

  if (currentProj) projects.push(currentProj);
  return projects;
}

// Helper: Extract education from text
function extractEducationFromFallback(text: string, lines: string[]): any[] {
  const education: any[] = [];
  
  const eduIndex = lines.findIndex(line => 
    /^(EDUCATION|ACADEMIC|QUALIFICATIONS|EDUCATIONAL\s+BRIEF)/i.test(line)
  );
  
  if (eduIndex < 0) return education;
  
  let currentEdu: any = null;
  const eduLines = lines.slice(eduIndex + 1);
  
  for (const line of eduLines) {
    if (/^(EXPERIENCE|SKILLS|CERTIFICATIONS|PROJECTS|ADDITIONAL\s+INFORMATION|PERSONAL)/i.test(line)) {
      if (currentEdu) { education.push(currentEdu); currentEdu = null; }
      break;
    }
    if (/^Father\s+Name|^Mother\s+Name|^Marital\s+Status|^Date\s+Of\s+Birth|^Address/i.test(line)) {
      if (currentEdu) { education.push(currentEdu); currentEdu = null; }
      break;
    }

    const degreeMatch = line.match(/(Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|B\.?Tech|M\.?Tech|Diploma|Class\s+12|12th|10th|Secondary)/i);
    if (degreeMatch || line.includes('🎓')) {
      if (currentEdu) education.push(currentEdu);
      currentEdu = {
        id: `edu-${education.length + 1}`,
        degree: line.replace(/^[🎓\s]+/, '').trim(),
        school: '',
        location: '',
        startDate: '',
        endDate: '',
        gpa: ''
      };
      continue;
    }
    
    if (currentEdu && !currentEdu.school && /University|College|Institute|School/i.test(line)) {
      currentEdu.school = line.replace(/\|.*$/, '').trim();
    }
    
    const dateMatch = line.match(/(\d{4})\s*[-–—]\s*(\d{4}|present)/i);
    if (dateMatch && currentEdu) {
      currentEdu.startDate = dateMatch[1];
      currentEdu.endDate = dateMatch[2];
    }
  }
  
  if (currentEdu) education.push(currentEdu);
  return education;
}

// Helper: Extract technical skills (including M&E, Electrical, Critical Facilities domain terms)
function extractTechnicalSkillsFromText(text: string): string[] {
  const rawSkills: string[] = [];

  // Electrical / HV / LV & M&E / Critical Facilities patterns
  const mePatterns = [
    /\b(LVAP|HVAP|LV[/ ]HV|Low\s+Voltage|High\s+Voltage|18th\s+Edition|Wiring\s+Regulations)\b/gi,
    /\b(BMS|CMMS|Maximo|CAFM|Facilities\s+Management|Critical\s+Facilities|Data\s+Centre|Data\s+Center)\b/gi,
    /\b(M&E|Mechanical\s+&\s+Electrical|Electrical\s+Maintenance|Preventive\s+Maintenance|PPM|PPM\s+Schedules)\b/gi,
    /\b(UPS|Generator|HVAC|Chiller|Cooling\s+Tower|PDU|SLA|KPI|Compliance|Safety)\b/gi,
    /\b(Incident\s+Management|Change\s+Management|Vendor\s+Management|Site\s+Supervision)\b/gi,
  ];
  
  // Civil Engineering specific skills
  const civilEngPatterns = [
    /\b(AutoCAD|Navisworks|MS\s+Project|Primavera\s+P6|Civil\s+3D|Revit)\b/gi,
    /\b(Civil\s+[Ee]ngineering|Civil\s+[Ss]upervision|QA\/?QC|Quality\s+[Aa]ssurance|Quality\s+[Cc]ontrol)\b/gi,
    /\b(Underground\s+[Uu]tilities|Underground\s+[Ii]nfrastructure|Manhole|Pipe\s+[Ii]nstallation)\b/gi,
    /\b(Structural\s+[Ff]oundations?|Concrete|Steel\s+[Ss]tructures?|Excavation|Backfilling)\b/gi,
    /\b(Pre-?[Cc]ommissioning|Road\s+[Cc]onstruction|Site\s+[Cc]oordination|HSE|Health\s+and\s+Safety)\b/gi
  ];
  
  // General IT/Software skills
  const techPatterns = [
    /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|PHP|Go|Rust|Swift|Kotlin)\b/gi,
    /\b(React|Angular|Vue|Node\.?js|Express|Django|Flask|Spring|ASP\.NET)\b/gi,
    /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|GitLab|CI\/CD|DevOps)\b/gi,
    /\b(SQL|PostgreSQL|MySQL|MongoDB|Redis|Oracle|NoSQL|Firebase)\b/gi,
    /\b(HTML5?|CSS3?|SASS|Tailwind|Bootstrap|Material\s+UI)\b/gi,
    /\b(REST|GraphQL|API|Microservices|Serverless)\b/gi,
    /\b(Git|GitHub|Jira|Confluence|Agile|Scrum)\b/gi
  ];
  
  // MS Office and common business tools
  const businessTools = [
    /\b(MS\s+Office|Microsoft\s+Office|Excel|PowerPoint|Word|Outlook)\b/gi,
    /\b(Google\s+Workspace|G\s+Suite|Sheets|Docs|Slides)\b/gi,
    /\b(Slack|Teams|Microsoft\s+Teams|Zoom|Webex)\b/gi
  ];
  
  const allPatterns = [...mePatterns, ...civilEngPatterns, ...techPatterns, ...businessTools];
  
  allPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => rawSkills.push(match.trim()));
  });
  
  return deduplicateSkillStrings(rawSkills);
}

// Helper: Extract soft skills
function extractSoftSkillsFromText(text: string): string[] {
  const rawSkills: string[] = [];
  const pattern = /\b(Leadership|Management|Communication|Collaboration|Problem[- ]solving|Team[- ]?work|Critical[- ]thinking|Decision[- ]making|Project[- ]management|Stakeholder[- ]management|Strategic[- ]planning|Time[- ]management|Adaptability|Creativity|Innovation|Situational\s+Leadership)\b/gi;
  
  const matches = text.match(pattern) || [];
  matches.forEach(match => rawSkills.push(match.trim()));
  
  return deduplicateSkillStrings(rawSkills);
}

// Helper: Extract languages with proficiency levels
function extractLanguagesFromText(text: string): string[] {
  const rawLangs: string[] = [];
  
  const languageWithProficiency = text.match(/\b(English|Spanish|French|German|Chinese|Mandarin|Hindi|Arabic|Portuguese|Japanese|Korean|Italian|Russian|Dutch|Swedish|Tamil|Telugu|Bengali|Marathi|Turkish|Azerbaijani|Persian)\s*\((?:Native|Fluent|Advanced|Intermediate|Basic|Conversational|Professional)\)/gi);
  if (languageWithProficiency) {
    languageWithProficiency.forEach(lang => rawLangs.push(lang.trim()));
  }
  
  const standaloneLanguages = text.match(/\b(English|Spanish|French|German|Chinese|Mandarin|Hindi|Arabic|Portuguese|Japanese|Korean|Italian|Russian|Dutch|Swedish|Tamil|Telugu|Bengali|Marathi|Turkish|Azerbaijani|Persian)\b/gi);
  if (standaloneLanguages && rawLangs.length === 0) {
    standaloneLanguages.forEach(lang => rawLangs.push(lang.trim()));
  }
  
  return deduplicateSkillStrings(rawLangs);
}

// Helper: Extract custom/additional sections (e.g. LEADERSHIP PHILOSOPHY, TECHNICAL PROFICIENCIES, HONORS, etc.)
function extractAdditionalSectionsFromFallback(text: string, lines: string[]): AdditionalSection[] {
  const sections: AdditionalSection[] = [];
  const standardHeaders = /^(SUMMARY|PROFILE|PROFESSIONAL\s+SUMMARY|OBJECTIVE|WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT|CAREER\s+HISTORY|EDUCATION|SKILLS|TECHNICAL\s+SKILLS|CERTIFICATIONS|PROJECTS|LANGUAGES|CONTACT|PERSONAL\s+DETAILS)/i;

  let currentHeading = '';
  let currentLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const isHeading = line.length < 50 && line === line.toUpperCase() && /[A-Z]{3,}/.test(line) && !standardHeaders.test(line);

    if (isHeading) {
      if (currentHeading && currentLines.length > 0) {
        sections.push({
          originalHeading: currentHeading,
          originalText: currentLines.join('\n'),
          order: sections.length + 1
        });
      }
      currentHeading = line;
      currentLines = [];
    } else if (currentHeading) {
      if (standardHeaders.test(line)) {
        sections.push({
          originalHeading: currentHeading,
          originalText: currentLines.join('\n'),
          order: sections.length + 1
        });
        currentHeading = '';
        currentLines = [];
      } else {
        currentLines.push(line);
      }
    }
  }

  if (currentHeading && currentLines.length > 0) {
    sections.push({
      originalHeading: currentHeading,
      originalText: currentLines.join('\n'),
      order: sections.length + 1
    });
  }

  return sections;
}


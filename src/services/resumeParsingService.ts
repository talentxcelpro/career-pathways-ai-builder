import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ParsedResume {
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

/**
 * Parse a resume file using AI
 * Extracts structured data from PDF, DOCX, DOC, or TXT files
 */
export const parseResumeFile = async (file: File): Promise<ParsedResume> => {
  try {
    console.log('📄 Parsing:', file.name);
    
    // Extract text
    let text = '';
    
    if (file.type.includes('word') || file.name.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      text = result.value;
    } else if (file.type.includes('pdf')) {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
    }
    
    console.log('✅ Extracted:', text.length, 'chars');
    if (text.length < 50) {
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
const parseFallback = (text: string): ParsedResume => {
  console.log('🔄 Using enhanced fallback parsing with actual data extraction...');
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Enhanced email extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch?.[0] || '';
  
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
      break;
    }
  }
  
  // Enhanced name extraction with multiple strategies - VERY AGGRESSIVE
  let fullName = '';
  
  // Strategy 1: Check very first line (most common location for names)
  if (lines.length > 0) {
    const firstLine = lines[0];
    // If first line looks like a name (2-4 capitalized words, no special resume keywords)
    if (!/^(RESUME|CV|CURRICULUM)/i.test(firstLine)) {
      const words = firstLine.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && /^[A-Z][A-Za-z\s\-'.]+$/.test(firstLine)) {
        // Additional check: make sure it's not a common header phrase
        if (!/PROFESSIONAL|SUMMARY|PROFILE|EXPERIENCE|EDUCATION|SKILLS|OBJECTIVE/i.test(firstLine)) {
          fullName = firstLine;
          console.log('✅ Name found in first line:', fullName);
        }
      }
    }
  }
  
  // Strategy 2: Look in first 10 lines for capitalized full names
  if (!fullName) {
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      if (/^(RESUME|CV|CURRICULUM|PROFILE|SUMMARY|PROFESSIONAL|EXPERIENCE|EDUCATION|SKILLS)/i.test(line)) {
        continue;
      }
      const fullNameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/);
      if (fullNameMatch && fullNameMatch[1].split(' ').length >= 2) {
        fullName = fullNameMatch[1];
        console.log('✅ Name found (Strategy 2):', fullName);
        break;
      }
    }
  }
  
  // Strategy 3: Look before email address
  if (!fullName && email) {
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
          fullName = nameMatch[1];
          console.log('✅ Name found before email (Strategy 3):', fullName);
          break;
        }
      }
    }
  }
  
  // Strategy 4: Look for "Name:" label pattern
  if (!fullName) {
    const namePatterns = [
      /(?:Name|NAME|Full Name|FULL NAME):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,
      /(?:Candidate|CANDIDATE):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/
    ];
    
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        fullName = match[1];
        console.log('✅ Name found with label pattern (Strategy 4):', fullName);
        break;
      }
    }
  }
  
  // Strategy 5: Look for capitalized words sequence near the top
  if (!fullName) {
    const firstBlock = lines.slice(0, 5).join(' ');
    const capitalizedWords = firstBlock.match(/\b[A-Z][a-z]+\b/g);
    if (capitalizedWords && capitalizedWords.length >= 2) {
      const potentialName = capitalizedWords.slice(0, Math.min(3, capitalizedWords.length)).join(' ');
      // Make sure it's not resume keywords
      if (!/^(PROFESSIONAL|RESUME|CV|SUMMARY|PROFILE|EXPERIENCE|EDUCATION|DELIVERY|LEADER|EXECUTIVE|STRATEGIC)/i.test(potentialName)) {
        fullName = potentialName;
        console.log('✅ Name found from capitalized sequence (Strategy 5):', fullName);
      }
    }
  }
  
  // Enhanced location extraction
  let location = '';
  const locationPatterns = [
    /(?:Location|Address|City):\s*([A-Z][a-zA-Z\s,.-]+(?:,\s*[A-Z]{2})?)/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*(?:[A-Z]{2}|[A-Z][a-z]+))\b/g,
    /\b([A-Z][a-z]+,\s*India|India)\b/gi,
    /\b(Mumbai|Delhi|Bangalore|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Baku|Azerbaijan)/gi
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
  }
  
  if (!summary) {
    const substantialLine = lines.find(line => 
      line.length > 80 && 
      !line.includes('@') && 
      !line.match(/^[A-Z\s]+$/) &&
      !/^(RESUME|CV|PROFESSIONAL|EXPERIENCE|EDUCATION|SKILLS)/i.test(line)
    );
    summary = substantialLine || text.substring(0, 200);
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
  
  return {
    personalInfo: {
      fullName: fullName || 'Please edit your name',
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
    certifications: [],
    projects: []
  };
};

// Helper: Extract work experience from text
function extractExperienceFromFallback(text: string, lines: string[]): any[] {
  const experience: any[] = [];
  
  const expIndex = lines.findIndex(line => 
    /^(WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT\s+HISTORY|PROFESSIONAL\s+EXPERIENCE)/i.test(line)
  );
  
  if (expIndex < 0) return experience;
  
  let currentExp: any = null;
  const expLines = lines.slice(expIndex + 1);
  
  for (const line of expLines) {
    if (/^(EDUCATION|SKILLS|CERTIFICATIONS|PROJECTS)/i.test(line)) break;
    
    // Detect position (Title at/| Company)
    const titleMatch = line.match(/^(.+?)(?:\s+(?:at|@|\||-)\s+)(.+?)$/i);
    if (titleMatch && line.length < 150) {
      if (currentExp) experience.push(currentExp);
      currentExp = {
        id: `exp-${experience.length + 1}`,
        title: titleMatch[1].trim(),
        company: titleMatch[2].replace(/\|.*$/, '').trim(),
        location: '',
        startDate: '',
        endDate: 'Present',
        current: false,
        description: '',
        achievements: []
      };
      continue;
    }
    
    // Extract dates
    const dateMatch = line.match(/(\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\s*[-–—]\s*(\d{4}|present|current)/i);
    if (dateMatch && currentExp) {
      currentExp.startDate = dateMatch[1];
      currentExp.endDate = dateMatch[2];
      currentExp.current = /present|current/i.test(dateMatch[2]);
      continue;
    }
    
    // Collect achievements (bullet points)
    if (currentExp && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
      currentExp.achievements.push(line.replace(/^[•\-*]\s*/, ''));
    } else if (currentExp && line.length > 30 && !currentExp.description) {
      currentExp.description = line;
    }
  }
  
  if (currentExp) experience.push(currentExp);
  return experience;
}

// Helper: Extract education from text
function extractEducationFromFallback(text: string, lines: string[]): any[] {
  const education: any[] = [];
  
  const eduIndex = lines.findIndex(line => 
    /^(EDUCATION|ACADEMIC|QUALIFICATIONS)/i.test(line)
  );
  
  if (eduIndex < 0) return education;
  
  let currentEdu: any = null;
  const eduLines = lines.slice(eduIndex + 1);
  
  for (const line of eduLines) {
    if (/^(EXPERIENCE|SKILLS|CERTIFICATIONS|PROJECTS)/i.test(line)) break;
    
    const degreeMatch = line.match(/(Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|B\.?Tech|M\.?Tech|Diploma)/i);
    if (degreeMatch) {
      if (currentEdu) education.push(currentEdu);
      currentEdu = {
        id: `edu-${education.length + 1}`,
        degree: line.trim(),
        school: '',
        location: '',
        startDate: '',
        endDate: '',
        gpa: ''
      };
      continue;
    }
    
    if (currentEdu && !currentEdu.school && /University|College|Institute|School/i.test(line)) {
      currentEdu.school = line.trim();
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

// Helper: Extract technical skills
function extractTechnicalSkillsFromText(text: string): string[] {
  const skills = new Set<string>();
  const patterns = [
    /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|PHP|Go|Rust|Swift|Kotlin|Scala)\b/gi,
    /\b(React|Angular|Vue|Svelte|Node\.?js|Express|Django|Flask|Spring|ASP\.NET|Laravel)\b/gi,
    /\b(AWS|Azure|GCP|Google Cloud|Docker|Kubernetes|Jenkins|GitLab|CI\/CD|DevOps)\b/gi,
    /\b(SQL|PostgreSQL|MySQL|MongoDB|Redis|Oracle|Cassandra|DynamoDB|NoSQL|Firebase)\b/gi,
    /\b(HTML5?|CSS3?|SASS|SCSS|Less|Tailwind|Bootstrap|Material UI|Ant Design)\b/gi,
    /\b(REST|GraphQL|gRPC|WebSocket|API|Microservices|Serverless|Lambda)\b/gi,
    /\b(Git|GitHub|Bitbucket|SVN|Version Control|Jira|Confluence|Slack)\b/gi,
    /\b(Agile|Scrum|Kanban|Waterfall|PMP|ITIL|Six Sigma|Lean)\b/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => skills.add(match));
  });
  
  return Array.from(skills);
}

// Helper: Extract soft skills
function extractSoftSkillsFromText(text: string): string[] {
  const skills = new Set<string>();
  const pattern = /\b(Leadership|Management|Communication|Collaboration|Problem[- ]solving|Team[- ]?work|Critical[- ]thinking|Decision[- ]making|Project[- ]management|Stakeholder[- ]management|Strategic[- ]planning|Time[- ]management|Adaptability|Creativity|Innovation)\b/gi;
  
  const matches = text.match(pattern) || [];
  matches.forEach(match => skills.add(match));
  
  return Array.from(skills);
}

// Helper: Extract languages
function extractLanguagesFromText(text: string): string[] {
  const languages = new Set<string>();
  const pattern = /\b(English|Spanish|French|German|Chinese|Mandarin|Hindi|Arabic|Portuguese|Japanese|Korean|Italian|Russian|Dutch|Swedish|Tamil|Telugu|Bengali|Marathi)\b/gi;
  
  const matches = text.match(pattern) || [];
  matches.forEach(match => languages.add(match));
  
  return Array.from(languages);
}

/**
 * Transform AI response to ParsedResume format
 */
const transformAIResponse = (aiResume: any): ParsedResume => {
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
      startDate: exp.duration?.split('-')[0]?.trim() || '',
      endDate: exp.duration?.split('-')[1]?.trim() || 'Present',
      current: exp.duration?.toLowerCase().includes('present') || false,
      description: exp.description || '',
      achievements: exp.achievements || []
    })),
    education: (aiResume.education || []).map((edu: any, index: number) => ({
      id: `edu-${index}`,
      degree: edu.degree || '',
      school: edu.institution || '',
      location: edu.location || '',
      startDate: edu.duration?.split('-')[0]?.trim() || '',
      endDate: edu.duration?.split('-')[1]?.trim() || '',
      gpa: edu.gpa
    })),
    skills: {
      technical: Array.isArray(aiResume.skills?.technical) 
        ? aiResume.skills.technical 
        : Object.values(aiResume.skills || {}).flat(),
      soft: aiResume.skills?.soft || [],
      languages: (aiResume.languages || []).map((lang: any) => 
        typeof lang === 'string' ? lang : lang.language
      )
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

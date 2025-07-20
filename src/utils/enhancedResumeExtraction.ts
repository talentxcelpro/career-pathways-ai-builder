
import { EnhancedResumeData } from '@/types/enhanced-resume';
import { supabase } from '@/integrations/supabase/client';

export interface ParsedResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  work_experience: Array<{
    company: string;
    title: string;
    duration: string;
    location: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    duration: string;
    location: string;
  }>;
  certifications: string[];
  projects: string[];
  languages: string[];
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface EnhancedParsingResult {
  success: boolean;
  data?: {
    structured_resume: ParsedResumeData;
    raw_text: string;
    key_metrics: {
      years_experience: number;
      top_skills_matched: string[];
      confidence_score: number;
    };
  };
  error?: string;
}

export class EnhancedResumeExtractor {
  private static async callAIParser(extractedText: string, fileName: string): Promise<EnhancedParsingResult> {
    try {
      console.log('🤖 Calling AI resume parser...');
      
      const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
        body: {
          extractedText,
          fileName
        }
      });

      if (error) {
        console.error('AI parser error:', error);
        throw new Error(error.message || 'AI parsing failed');
      }

      console.log('✅ AI parsing completed successfully');
      return data;
    } catch (error) {
      console.error('❌ AI parser failed:', error);
      throw error;
    }
  }

  private static preprocessText(text: string): string {
    console.log('🔄 Preprocessing extracted text...');
    
    // Step 1: Advanced emoji and special character handling
    let processed = this.normalizeEmojisAndSpecialChars(text);
    
    // Step 2: Smart line splitting for mixed content
    processed = this.smartLineSplitting(processed);
    
    // Step 3: Context-aware section boundary detection
    processed = this.detectSectionBoundaries(processed);
    
    // Step 4: Handle complex date formats
    processed = this.normalizeDateFormats(processed);
    
    // Step 5: Process parenthetical skills and descriptions
    processed = this.processParentheticalContent(processed);
    
    // Step 6: Normalize international phone formats
    processed = this.normalizePhoneFormats(processed);
    
    console.log('✅ Advanced text preprocessing completed');
    return processed;
  }

  private static normalizeEmojisAndSpecialChars(text: string): string {
    // Extended emoji and symbol handling
    return text
      // Contact info emojis and symbols
      .replace(/📧|✉️|📬|📮|💌|@|email/gi, ' EMAIL: ')
      .replace(/📞|☎️|📱|📲|📟|📠|phone|tel|mobile|cell/gi, ' PHONE: ')
      .replace(/🏠|🏢|📍|🗺️|📌|🌍|🌎|🌏|location|address|based/gi, ' LOCATION: ')
      .replace(/💼|👔|🏢|💻|work|employment|career/gi, ' WORK: ')
      .replace(/🎓|🏫|📚|📖|📝|education|academic|university|college/gi, ' EDUCATION: ')
      .replace(/🔗|🌐|link|website|portfolio|url/gi, ' LINK: ')
      .replace(/💪|⚡|🚀|skills|expertise|proficient/gi, ' SKILLS: ')
      // Professional symbols
      .replace(/•|●|◦|◯|▪|▫|■|□|→|➤|►|✓|✔|✅/g, '\n• ')
      // Clean up multiple spaces and normalize
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  private static smartLineSplitting(text: string): string {
    // Handle mixed content on same line (e.g., "John Doe | Software Engineer | john@email.com")
    let processed = text
      // Split on pipes, dashes, and other separators for contact info
      .replace(/\s*[|•·]\s*/g, '\n')
      .replace(/\s*[-–—]\s*(?=[A-Z])/g, '\n')
      // Handle dates and locations in parentheses
      .replace(/\s*\(([^)]+)\)\s*/g, ' ($1) ')
      // Preserve multi-line descriptions but clean up formatting
      .replace(/\n+/g, '\n')
      .replace(/^\s+|\s+$/gm, '');

    // Split long lines that contain multiple pieces of info
    const lines = processed.split('\n');
    const smartLines: string[] = [];
    
    lines.forEach(line => {
      // If line contains email and other info, split them
      if (line.includes('@') && line.length > 50) {
        const parts = line.split(/\s+/);
        let currentLine = '';
        parts.forEach(part => {
          if (part.includes('@') || part.includes('linkedin') || part.includes('github')) {
            if (currentLine.trim()) smartLines.push(currentLine.trim());
            smartLines.push(part);
            currentLine = '';
          } else {
            currentLine += ' ' + part;
          }
        });
        if (currentLine.trim()) smartLines.push(currentLine.trim());
      } else {
        smartLines.push(line);
      }
    });

    return smartLines.join('\n');
  }

  private static detectSectionBoundaries(text: string): string {
    // Enhanced section header detection and normalization
    return text
      // Work experience variations
      .replace(/\b(WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EMPLOYMENT\s+HISTORY|CAREER\s+HISTORY|EXPERIENCE|WORK\s+HISTORY|PROFESSIONAL\s+BACKGROUND)\b/gi, '\n\nEXPERIENCE\n')
      // Education variations  
      .replace(/\b(EDUCATION|ACADEMIC\s+BACKGROUND|EDUCATIONAL\s+BACKGROUND|QUALIFICATIONS|ACADEMIC\s+QUALIFICATIONS|EDUCATIONAL\s+HISTORY)\b/gi, '\n\nEDUCATION\n')
      // Skills variations
      .replace(/\b(SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|AREAS\s+OF\s+EXPERTISE|TECHNICAL\s+COMPETENCIES|SKILL\s+SET|TECHNOLOGIES|PROGRAMMING\s+LANGUAGES)\b/gi, '\n\nSKILLS\n')
      // Contact variations
      .replace(/\b(CONTACT|PERSONAL\s+DETAILS|CONTACT\s+INFORMATION|CONTACT\s+DETAILS|PERSONAL\s+INFORMATION)\b/gi, '\n\nCONTACT\n')
      // Summary variations
      .replace(/\b(SUMMARY|PROFILE|PROFESSIONAL\s+SUMMARY|CAREER\s+SUMMARY|OBJECTIVE|CAREER\s+OBJECTIVE|ABOUT\s+ME|ABOUT)\b/gi, '\n\nSUMMARY\n')
      // Projects variations
      .replace(/\b(PROJECTS|NOTABLE\s+PROJECTS|KEY\s+PROJECTS|PERSONAL\s+PROJECTS|SIDE\s+PROJECTS)\b/gi, '\n\nPROJECTS\n')
      // Certifications variations
      .replace(/\b(CERTIFICATIONS?|CERTIFICATES?|PROFESSIONAL\s+CERTIFICATIONS?|LICENSES?|CREDENTIALS?)\b/gi, '\n\nCERTIFICATIONS\n')
      // Languages variations
      .replace(/\b(LANGUAGES?|LANGUAGE\s+SKILLS?|SPOKEN\s+LANGUAGES?)\b/gi, '\n\nLANGUAGES\n')
      // Clean up excessive newlines
      .replace(/\n{3,}/g, '\n\n');
  }

  private static normalizeDateFormats(text: string): string {
    // Handle various date formats and ranges
    return text
      // Standard ranges: 2020 - 2024, 2020-2024, 2020–2024, 2020—2024
      .replace(/(\d{4})\s*[-–—]\s*(\d{4})/g, '$1-$2')
      .replace(/(\d{4})\s*[-–—]\s*(present|current|now)/gi, '$1-Present')
      // Month/Year formats: Jan 2020 - Dec 2024
      .replace(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s*[-–—]\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/gi, '$1 $2 - $3 $4')
      .replace(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s*[-–—]\s*(present|current|now)/gi, '$1 $2 - Present')
      // Handle duration formats: (3 years), (2008 – 2012)
      .replace(/\(\s*(\d+)\s+years?\s*\)/gi, '($1 years)')
      .replace(/\(\s*(\d{4})\s*[-–—]\s*(\d{4}|present|current)\s*\)/gi, '($1-$2)');
  }

  private static processParentheticalContent(text: string): string {
    // Handle skills in parentheses like "MS Office (Excel, Word, Outlook)"
    return text
      // Expand parenthetical skills
      .replace(/([A-Za-z\s]+)\s*\(([^)]+)\)/g, (match, skill, details) => {
        const mainSkill = skill.trim();
        const subSkills = details.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
        return `${mainSkill}, ${subSkills.join(', ')}`;
      })
      // Handle location and duration info in parentheses
      .replace(/\(([^)]*(?:years?|months?|yrs?|mos?)[^)]*)\)/gi, ' Duration: $1 ')
      .replace(/\(([^)]*(?:Remote|On-site|Hybrid|[A-Z]{2}|City|State)[^)]*)\)/gi, ' Location: $1 ');
  }

  private static normalizePhoneFormats(text: string): string {
    return text
      // International formats: +1-234-567-8900, +91 98765 43210
      .replace(/\+(\d{1,3})\s*[-.]?\s*(\d{2,4})\s*[-.]?\s*(\d{3,4})\s*[-.]?\s*(\d{3,4})/g, '+$1-$2-$3-$4')
      // US formats: (123) 456-7890, 123-456-7890, 123.456.7890
      .replace(/\((\d{3})\)\s*(\d{3})\s*[-.]?\s*(\d{4})/g, '($1) $2-$3')
      .replace(/(\d{3})\s*[-.]?\s*(\d{3})\s*[-.]?\s*(\d{4})/g, '$1-$2-$3')
      // Clean up multiple dashes
      .replace(/[-]{2,}/g, '-');
  }

  static async parseResume(file: File): Promise<EnhancedParsingResult> {
    try {
      console.log('🚀 Starting enhanced resume parsing for:', file.name);
      
      // Extract text from file
      const extractedText = await this.extractTextFromFile(file);
      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Insufficient text content extracted from file');
      }

      // Preprocess the text
      const processedText = this.preprocessText(extractedText);

      // Try AI parsing first
      try {
        const aiResult = await this.callAIParser(processedText, file.name);
        if (aiResult.success && aiResult.data) {
          console.log('✅ AI parsing successful');
          return aiResult;
        }
      } catch (aiError) {
        console.warn('⚠️ AI parsing failed, falling back to rule-based parsing:', aiError);
      }

      // Fallback to rule-based parsing
      console.log('🔄 Using fallback rule-based parsing...');
      const fallbackResult = await this.fallbackParsing(processedText);
      
      return {
        success: true,
        data: {
          structured_resume: fallbackResult,
          raw_text: extractedText,
          key_metrics: {
            years_experience: this.calculateExperience(fallbackResult.work_experience),
            top_skills_matched: fallbackResult.skills.slice(0, 5),
            confidence_score: 65 // Lower confidence for fallback
          }
        }
      };

    } catch (error) {
      console.error('❌ Enhanced parsing failed:', error);
      return {
        success: false,
        error: error.message || 'Resume parsing failed'
      };
    }
  }

  private static async extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type.toLowerCase();
    
    if (fileType.includes('pdf')) {
      return this.extractFromPDF(file);
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return this.extractFromDOCX(file);
    } else if (fileType.includes('text')) {
      return this.extractFromText(file);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  private static async extractFromPDF(file: File): Promise<string> {
    try {
      const pdfjs = await import('pdfjs-dist');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item): item is any => 'str' in item)
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText;
    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  private static async extractFromDOCX(file: File): Promise<string> {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('DOCX extraction failed:', error);
      throw new Error('Failed to extract text from DOCX file');
    }
  }

  private static async extractFromText(file: File): Promise<string> {
    return await file.text();
  }

  private static async fallbackParsing(text: string): Promise<ParsedResumeData> {
    // Enhanced regex patterns for better accuracy
    const nameRegex = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)|(?:Name\s*:?\s*)([A-Z][a-zA-Z\s]+)/im;
    const emailRegex = /(?:EMAIL\s*:?\s*)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const phoneRegex = /(?:PHONE\s*:?\s*)?(\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,15})/;
    const linkedinRegex = /(?:linkedin\.com\/in\/|linkedin\.com\/profile\/)([a-zA-Z0-9-]+)/i;
    const githubRegex = /(?:github\.com\/)([a-zA-Z0-9-]+)/i;

    // Extract basic info
    const name = text.match(nameRegex)?.[1] || text.match(nameRegex)?.[2] || '';
    const email = text.match(emailRegex)?.[1] || '';
    const phone = text.match(phoneRegex)?.[1] || '';
    const linkedin = text.match(linkedinRegex) ? `https://linkedin.com/in/${text.match(linkedinRegex)?.[1]}` : '';
    const github = text.match(githubRegex) ? `https://github.com/${text.match(githubRegex)?.[1]}` : '';

    // Extract skills with better pattern matching
    const skillsSection = text.match(/(?:SKILLS|TECHNOLOGIES|TECHNICAL\s+SKILLS)[:\s]*(.*?)(?=\n\s*(?:[A-Z]{2,}|$))/is)?.[1] || '';
    const skills = this.extractSkillsFromText(skillsSection + ' ' + text);

    // Extract experience
    const work_experience = this.extractWorkExperience(text);

    // Extract education
    const education = this.extractEducation(text);

    return {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: this.extractLocation(text),
      summary: this.extractSummary(text),
      skills,
      work_experience,
      education,
      certifications: this.extractCertifications(text),
      projects: this.extractProjects(text),
      languages: this.extractLanguages(text),
      linkedin,
      github,
      portfolio: ''
    };
  }

  private static extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      // Programming languages
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
      // Frameworks
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
      // Databases
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle',
      // Cloud & DevOps
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
      // Tools
      'Figma', 'Photoshop', 'Illustrator', 'Sketch', 'InVision',
      // Soft skills
      'Leadership', 'Communication', 'Project Management', 'Team Management', 'Problem Solving'
    ];

    const foundSkills: string[] = [];
    const textLower = text.toLowerCase();

    commonSkills.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });

    return [...new Set(foundSkills)];
  }

  private static extractWorkExperience(text: string): Array<{
    company: string;
    title: string;
    duration: string;
    location: string;
    description: string;
  }> {
    const experiences: Array<{
      company: string;
      title: string;
      duration: string;
      location: string;
      description: string;
    }> = [];

    // Extract experience section
    const experienceSection = this.extractSection(text, 'EXPERIENCE');
    if (!experienceSection) return experiences;

    // Split into potential job entries
    const jobEntries = this.smartSplitExperienceEntries(experienceSection);
    
    jobEntries.forEach(entry => {
      const parsed = this.parseJobEntry(entry);
      if (parsed.company && parsed.title) {
        experiences.push(parsed);
      }
    });

    return experiences;
  }

  private static extractSection(text: string, sectionName: string): string {
    const sectionPattern = new RegExp(`\\n\\n${sectionName}\\n([\\s\\S]*?)(?=\\n\\n[A-Z]+\\n|$)`, 'i');
    return text.match(sectionPattern)?.[1] || '';
  }

  private static smartSplitExperienceEntries(text: string): string[] {
    // Split on patterns that indicate new job entries
    const entries: string[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentEntry = '';
    let inDescription = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line starts a new job entry
      if (this.isJobTitleLine(line) && currentEntry) {
        entries.push(currentEntry.trim());
        currentEntry = line;
        inDescription = false;
      } else if (this.isCompanyLine(line) && !inDescription) {
        currentEntry += '\n' + line;
      } else if (this.isDurationLine(line)) {
        currentEntry += '\n' + line;
        inDescription = true; // Next lines likely to be description
      } else if (line.startsWith('•') || line.startsWith('-') || inDescription) {
        currentEntry += '\n' + line;
      } else {
        currentEntry += '\n' + line;
      }
    }
    
    if (currentEntry.trim()) {
      entries.push(currentEntry.trim());
    }
    
    return entries;
  }

  private static isJobTitleLine(line: string): boolean {
    // Job titles often start with capital letters and contain common title words
    const titleWords = ['Engineer', 'Developer', 'Manager', 'Director', 'Analyst', 'Specialist', 'Coordinator', 'Lead', 'Senior', 'Junior', 'Associate'];
    return titleWords.some(word => line.includes(word)) && /^[A-Z]/.test(line);
  }

  private static isCompanyLine(line: string): boolean {
    // Company names often have specific patterns
    const companyIndicators = ['Inc', 'LLC', 'Corp', 'Ltd', 'Company', 'Group', 'Technologies', 'Solutions', 'Systems', 'Consulting'];
    return companyIndicators.some(indicator => line.includes(indicator)) || 
           (/^[A-Z][A-Za-z\s&,]+$/.test(line) && line.length > 3 && line.length < 50);
  }

  private static isDurationLine(line: string): boolean {
    // Duration lines contain date patterns
    return /(\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line) && 
           /(present|current|\d{4})/i.test(line);
  }

  private static parseJobEntry(entry: string): {
    company: string;
    title: string;
    duration: string;
    location: string;
    description: string;
  } {
    const lines = entry.split('\n').filter(line => line.trim());
    
    let company = '';
    let title = '';
    let duration = '';
    let location = '';
    let description = '';
    
    // Try different parsing strategies
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!title && this.isJobTitleLine(line)) {
        title = line;
      } else if (!company && this.isCompanyLine(line)) {
        company = line;
      } else if (!duration && this.isDurationLine(line)) {
        duration = line;
        // Check if location is in the same line
        const locationMatch = line.match(/,\s*([A-Z][a-z]+(?:,\s*[A-Z]{2})?)/);
        if (locationMatch) {
          location = locationMatch[1];
          duration = line.replace(locationMatch[0], '').trim();
        }
      } else if (line.startsWith('•') || line.startsWith('-') || 
                 (description && !this.isJobTitleLine(line) && !this.isCompanyLine(line))) {
        description += (description ? '\n' : '') + line;
      }
    }
    
    // Fallback: try to extract from first few lines using patterns
    if (!company || !title) {
      const firstLine = lines[0] || '';
      const secondLine = lines[1] || '';
      
      // Pattern: "Job Title at Company Name"
      const atPattern = firstLine.match(/(.+?)\s+at\s+(.+)/i);
      if (atPattern) {
        title = title || atPattern[1].trim();
        company = company || atPattern[2].trim();
      }
      
      // Pattern: "Company Name - Job Title"
      const dashPattern = firstLine.match(/(.+?)\s*[-–—]\s*(.+)/);
      if (dashPattern && !title) {
        if (this.isCompanyLine(dashPattern[1])) {
          company = company || dashPattern[1].trim();
          title = title || dashPattern[2].trim();
        } else {
          title = title || dashPattern[1].trim();
          company = company || dashPattern[2].trim();
        }
      }
      
      // Try second line for missing info
      if (secondLine && (!company || !title)) {
        if (!company && this.isCompanyLine(secondLine)) {
          company = secondLine;
        } else if (!title && this.isJobTitleLine(secondLine)) {
          title = secondLine;
        }
      }
    }
    
    return {
      company: company.replace(/[,\-–—]$/, '').trim(),
      title: title.replace(/[,\-–—]$/, '').trim(),
      duration: duration.trim(),
      location: location.trim(),
      description: description.trim()
    };
  }

  private static extractEducation(text: string): Array<{
    degree: string;
    institution: string;
    duration: string;
    location: string;
  }> {
    const education: Array<{
      degree: string;
      institution: string;
      duration: string;
      location: string;
    }> = [];

    const educationPattern = /(Bachelor|Master|PhD|B\.?[A-Za-z]*|M\.?[A-Za-z]*|Doctor).*?(?:from\s+|at\s+)?([A-Z][A-Za-z\s&]+(?:University|College|Institute|School))[,\s]*(?:\(([^)]+)\))?\s*(?:[-–—]\s*)?(\d{4}(?:\s*[-–—]\s*\d{4})?)/gi;
    
    let match;
    while ((match = educationPattern.exec(text)) !== null) {
      education.push({
        degree: match[1].trim(),
        institution: match[2].trim(),
        duration: match[4].trim(),
        location: match[3]?.trim() || ''
      });
    }

    return education;
  }

  private static extractLocation(text: string): string {
    const locationPattern = /(?:LOCATION\s*:?\s*)?([A-Z][a-z]+,\s*[A-Z]{2}|[A-Z][a-z]+,\s*[A-Z][a-z]+)/;
    return text.match(locationPattern)?.[1] || '';
  }

  private static extractSummary(text: string): string {
    const summaryPattern = /(?:SUMMARY|OBJECTIVE|PROFILE)[:\s]*(.*?)(?=\n\s*(?:[A-Z]{2,}|$))/is;
    return text.match(summaryPattern)?.[1]?.trim() || '';
  }

  private static extractCertifications(text: string): string[] {
    const certPattern = /(?:CERTIFICATIONS?|CERTIFICATES?)[:\s]*(.*?)(?=\n\s*(?:[A-Z]{2,}|$))/is;
    const certText = text.match(certPattern)?.[1] || '';
    return certText.split(/[,\n]/).map(cert => cert.trim()).filter(cert => cert.length > 2);
  }

  private static extractProjects(text: string): string[] {
    const projectPattern = /(?:PROJECTS?)[:\s]*(.*?)(?=\n\s*(?:[A-Z]{2,}|$))/is;
    const projectText = text.match(projectPattern)?.[1] || '';
    return projectText.split(/[,\n]/).map(project => project.trim()).filter(project => project.length > 2);
  }

  private static extractLanguages(text: string): string[] {
    const langPattern = /(?:LANGUAGES?)[:\s]*(.*?)(?=\n\s*(?:[A-Z]{2,}|$))/is;
    const langText = text.match(langPattern)?.[1] || '';
    return langText.split(/[,\n]/).map(lang => lang.trim()).filter(lang => lang.length > 1);
  }

  private static calculateExperience(workExperience: any[]): number {
    if (!workExperience || workExperience.length === 0) return 0;
    
    let totalYears = 0;
    workExperience.forEach(job => {
      if (job.duration) {
        const yearMatch = job.duration.match(/(\d+)\s*(?:years?|yrs?)/i);
        if (yearMatch) {
          totalYears += parseInt(yearMatch[1]);
        } else {
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
}

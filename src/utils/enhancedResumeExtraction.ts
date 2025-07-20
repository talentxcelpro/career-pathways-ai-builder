
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
    
    // Remove excessive whitespace and normalize line breaks
    let processed = text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // Handle common emoji and special characters in contact info
    processed = processed
      .replace(/📧|✉️|@/g, ' EMAIL: ')
      .replace(/📞|☎️|📱/g, ' PHONE: ')
      .replace(/🏠|🏢|📍/g, ' LOCATION: ')
      .replace(/💼|👔/g, ' WORK: ')
      .replace(/🎓|🏫/g, ' EDUCATION: ');

    // Normalize section headers
    processed = processed
      .replace(/\b(WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EMPLOYMENT\s+HISTORY|CAREER\s+HISTORY)\b/gi, 'EXPERIENCE')
      .replace(/\b(ACADEMIC\s+BACKGROUND|EDUCATIONAL\s+BACKGROUND|QUALIFICATIONS)\b/gi, 'EDUCATION')
      .replace(/\b(TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|AREAS\s+OF\s+EXPERTISE)\b/gi, 'SKILLS')
      .replace(/\b(PERSONAL\s+DETAILS|CONTACT\s+INFORMATION|CONTACT\s+DETAILS)\b/gi, 'CONTACT');

    // Handle international phone formats
    processed = processed
      .replace(/\+(\d{1,3})\s*[-.]?\s*(\d+)/g, '+$1-$2')
      .replace(/\((\d{3})\)\s*(\d{3})\s*[-.]?\s*(\d{4})/g, '($1) $2-$3');

    console.log('✅ Text preprocessing completed');
    return processed;
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

    // Enhanced pattern for work experience
    const experiencePattern = /([A-Z][A-Za-z\s&]+(?:Inc|LLC|Corp|Ltd|Company|Group|Technologies|Solutions|Systems)?)[,\s]*[-–—]\s*([A-Z][A-Za-z\s]+?)(?:\s+[-–—]\s+([A-Za-z\s,]+?))?\s*\(?((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}).*?(?:Present|Current|\d{4}))\)?/gi;
    
    let match;
    while ((match = experiencePattern.exec(text)) !== null) {
      experiences.push({
        company: match[1].trim(),
        title: match[2].trim(),
        duration: match[4].trim(),
        location: match[3]?.trim() || '',
        description: ''
      });
    }

    return experiences;
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


import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import type { Resume, ResumePersonalInfo, ResumeExperience, ResumeEducation, ResumeSkill } from '@/types/resume';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractionResult {
  success: boolean;
  resume?: Resume;
  confidence: number;
  errors?: string[];
  rawText?: string;
}

export class ResumeExtractor {
  async extractFromFile(file: File): Promise<ExtractionResult> {
    console.log('Starting extraction for file:', file.name, file.type);
    
    try {
      let text = '';
      
      if (file.type === 'application/pdf') {
        text = await this.extractTextFromPDF(file);
      } else if (file.type.includes('wordprocessingml.document') || file.type.includes('msword')) {
        text = await this.extractTextFromDOCX(file);
      } else if (file.type.startsWith('image/')) {
        throw new Error('Image extraction not implemented in this version');
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      console.log('Extracted text length:', text.length);
      
      if (!text || text.length < 50) {
        throw new Error('Insufficient content extracted from file');
      }

      const resume = this.parseTextToResume(text);
      const confidence = this.calculateConfidence(resume, text);

      return {
        success: true,
        resume,
        confidence,
        rawText: text
      };
    } catch (error) {
      console.error('Extraction failed:', error);
      return {
        success: false,
        confidence: 0,
        errors: [error.message || 'Unknown extraction error'],
        rawText: ''
      };
    }
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  }

  private async extractTextFromDOCX(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  private parseTextToResume(text: string): Resume {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    return {
      personalInfo: this.extractPersonalInfo(text, lines),
      summary: this.extractSummary(text, lines),
      experience: this.extractExperience(text, lines),
      education: this.extractEducation(text, lines),
      skills: this.extractSkills(text, lines),
      selectedTemplate: 'modern-professional'
    };
  }

  private extractPersonalInfo(text: string, lines: string[]): ResumePersonalInfo {
    const name = this.extractName(lines);
    const email = this.extractEmail(text);
    const phone = this.extractPhone(text);
    const location = this.extractLocation(text);
    
    return {
      fullName: name,
      email: email || '',
      phone: phone || '',
      location: location || '',
      website: this.extractWebsite(text),
      linkedin: this.extractLinkedIn(text)
    };
  }

  private extractName(lines: string[]): string {
    // Look for name in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line.length > 5 && line.length < 50 && 
          /^[A-Za-z\s.'-]+$/.test(line) && 
          !line.toLowerCase().includes('resume') &&
          !line.toLowerCase().includes('cv') &&
          !this.isContactInfo(line)) {
        return line;
      }
    }
    return '';
  }

  private extractEmail(text: string): string | undefined {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const matches = text.match(emailRegex);
    return matches?.[0];
  }

  private extractPhone(text: string): string | undefined {
    const phoneRegex = /(\+?1?[-.\s]?)?(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g;
    const matches = text.match(phoneRegex);
    return matches?.[0];
  }

  private extractLocation(text: string): string | undefined {
    const locationPatterns = [
      /([A-Za-z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?)/g,
      /([A-Za-z\s]+,\s*[A-Za-z\s]+)/g
    ];
    
    for (const pattern of locationPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        return matches[0];
      }
    }
    return undefined;
  }

  private extractWebsite(text: string): string | undefined {
    const websiteRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    const matches = text.match(websiteRegex);
    return matches?.find(url => !url.includes('linkedin.com'));
  }

  private extractLinkedIn(text: string): string | undefined {
    const linkedinRegex = /(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/gi;
    const matches = text.match(linkedinRegex);
    return matches?.[0];
  }

  private extractSummary(text: string, lines: string[]): string {
    const summaryKeywords = ['summary', 'profile', 'objective', 'about', 'overview'];
    const lowerText = text.toLowerCase();
    
    for (const keyword of summaryKeywords) {
      const keywordIndex = lowerText.indexOf(keyword);
      if (keywordIndex !== -1) {
        const afterKeyword = text.slice(keywordIndex + keyword.length);
        const sentences = afterKeyword.split(/[.!?]/).slice(0, 3);
        const summary = sentences.join('.').trim();
        if (summary.length > 20) {
          return summary + '.';
        }
      }
    }
    
    return 'Experienced professional with a strong background in technology and innovation.';
  }

  private extractExperience(text: string, lines: string[]): ResumeExperience[] {
    const experience: ResumeExperience[] = [];
    const experienceKeywords = ['experience', 'employment', 'work history', 'professional experience'];
    
    // Find experience section
    const experienceStart = this.findSectionStart(text, experienceKeywords);
    if (experienceStart === -1) return [];
    
    const experienceText = text.slice(experienceStart);
    const jobEntries = this.parseJobEntries(experienceText);
    
    return jobEntries.map((entry, index) => ({
      id: `exp-${index}`,
      title: entry.title || 'Software Engineer',
      company: entry.company || 'Technology Company',
      location: entry.location || 'Remote',
      startDate: entry.startDate || '2022',
      endDate: entry.endDate || 'Present',
      current: entry.endDate === 'Present' || entry.endDate === 'Current',
      description: entry.description || 'Responsible for developing and maintaining software applications.',
      achievements: entry.achievements || []
    }));
  }

  private extractEducation(text: string, lines: string[]): ResumeEducation[] {
    const education: ResumeEducation[] = [];
    const educationKeywords = ['education', 'academic', 'university', 'college', 'school'];
    
    const educationStart = this.findSectionStart(text, educationKeywords);
    if (educationStart === -1) return [];
    
    const educationText = text.slice(educationStart);
    const degreePatterns = [
      /([Bb]achelor|[Mm]aster|[Dd]octor|PhD|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?)[\s\w]*([Ii]n\s+)?([A-Za-z\s]+)/g,
      /([A-Za-z\s]+)\s+(University|College|Institute)/gi
    ];
    
    for (const pattern of degreePatterns) {
      const matches = Array.from(educationText.matchAll(pattern));
      matches.forEach((match, index) => {
        if (match[0] && education.length < 3) { // Limit to 3 entries
          education.push({
            id: `edu-${index}`,
            degree: match[0].trim(),
            school: match[4] || 'University',
            location: '',
            startDate: '2018',
            endDate: '2022'
          });
        }
      });
    }
    
    return education;
  }

  private extractSkills(text: string, lines: string[]): ResumeSkill[] {
    const commonSkills = [
      // Technical skills
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
      'HTML', 'CSS', 'SCSS', 'Tailwind', 'Bootstrap', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'Jenkins', 'Linux', 'Agile', 'Scrum'
    ];
    
    const foundSkills: ResumeSkill[] = [];
    const lowerText = text.toLowerCase();
    
    commonSkills.forEach((skill, index) => {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push({
          id: `skill-${index}`,
          name: skill,
          category: this.categorizeSkill(skill),
          level: 'intermediate'
        });
      }
    });
    
    return foundSkills.length > 0 ? foundSkills : this.getDefaultSkills();
  }

  private categorizeSkill(skill: string): 'technical' | 'soft' | 'language' {
    const technicalSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker'];
    const softSkills = ['Leadership', 'Communication', 'Problem Solving', 'Teamwork'];
    
    if (technicalSkills.some(tech => skill.toLowerCase().includes(tech.toLowerCase()))) {
      return 'technical';
    }
    if (softSkills.some(soft => skill.toLowerCase().includes(soft.toLowerCase()))) {
      return 'soft';
    }
    return 'technical'; // Default to technical
  }

  private getDefaultSkills(): ResumeSkill[] {
    return [
      { id: 'skill-1', name: 'JavaScript', category: 'technical', level: 'intermediate' },
      { id: 'skill-2', name: 'React', category: 'technical', level: 'intermediate' },
      { id: 'skill-3', name: 'Node.js', category: 'technical', level: 'intermediate' },
      { id: 'skill-4', name: 'Python', category: 'technical', level: 'intermediate' }
    ];
  }

  private findSectionStart(text: string, keywords: string[]): number {
    const lowerText = text.toLowerCase();
    let earliestIndex = -1;
    
    for (const keyword of keywords) {
      const index = lowerText.indexOf(keyword.toLowerCase());
      if (index !== -1 && (earliestIndex === -1 || index < earliestIndex)) {
        earliestIndex = index;
      }
    }
    
    return earliestIndex;
  }

  private parseJobEntries(text: string): any[] {
    // Simple job parsing - in reality this would be more sophisticated
    const entries = [];
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    let currentEntry: any = {};
    
    for (const line of lines.slice(0, 10)) { // Limit parsing
      if (this.looksLikeJobTitle(line)) {
        if (currentEntry.title) {
          entries.push(currentEntry);
          currentEntry = {};
        }
        currentEntry.title = line.trim();
      } else if (this.looksLikeCompany(line)) {
        currentEntry.company = line.trim();
      } else if (this.looksLikeDate(line)) {
        const dates = this.parseDate(line);
        currentEntry.startDate = dates.start;
        currentEntry.endDate = dates.end;
      }
    }
    
    if (currentEntry.title) {
      entries.push(currentEntry);
    }
    
    return entries.length > 0 ? entries : [{}]; // Return at least one entry
  }

  private looksLikeJobTitle(line: string): boolean {
    const jobTitleKeywords = ['engineer', 'developer', 'manager', 'analyst', 'specialist', 'coordinator'];
    return jobTitleKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    );
  }

  private looksLikeCompany(line: string): boolean {
    return line.length > 3 && line.Length < 50 && 
           !this.looksLikeDate(line) && 
           !line.includes('@');
  }

  private looksLikeDate(line: string): boolean {
    return /\b(19|20)\d{2}\b|present|current/i.test(line);
  }

  private parseDate(line: string): { start: string; end: string } {
    const currentMatch = /present|current/i.test(line);
    const yearMatches = line.match(/\b(19|20)\d{2}\b/g);
    
    if (yearMatches && yearMatches.length >= 2) {
      return { start: yearMatches[0], end: yearMatches[1] };
    } else if (yearMatches && yearMatches.length === 1) {
      return { start: yearMatches[0], end: currentMatch ? 'Present' : yearMatches[0] };
    }
    
    return { start: '2022', end: 'Present' };
  }

  private isContactInfo(line: string): boolean {
    return /[@.]/.test(line) || /\d{3}/.test(line);
  }

  private calculateConfidence(resume: Resume, text: string): number {
    let score = 0;
    
    // Personal info scoring
    if (resume.personalInfo.fullName) score += 20;
    if (resume.personalInfo.email) score += 15;
    if (resume.personalInfo.phone) score += 10;
    
    // Content scoring
    if (resume.experience.length > 0) score += 25;
    if (resume.education.length > 0) score += 15;
    if (resume.skills.length > 0) score += 15;
    
    return Math.min(score, 100);
  }
}

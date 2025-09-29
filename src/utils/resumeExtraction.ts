
// PDF.js loaded dynamically to prevent memory issues
// import * as pdfjsLib from 'pdfjs-dist';
// import * as mammoth from 'mammoth'; // Removed - using lazy loading instead
import type { Resume, ResumePersonalInfo, ResumeExperience, ResumeEducation, ResumeSkill, ExtractionResult } from '@/types/resume';

// Dynamic PDF.js loading to prevent memory issues
const loadPDFJS = async () => {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  return pdfjsLib;
};

export class ResumeExtractor {
  private text: string = '';
  private lines: string[] = [];
  private cleanLines: string[] = [];

  async extractFromFile(file: File): Promise<ExtractionResult> {
    try {
      console.log('Starting extraction for file:', file.name);
      
      // Extract text based on file type
      if (file.type === 'application/pdf') {
        this.text = await this.extractTextFromPDF(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file.name.endsWith('.docx')) {
        this.text = await this.extractTextFromDOCX(file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
      }

      console.log('Extracted text length:', this.text.length);
      console.log('First 500 chars:', this.text.substring(0, 500));

      // Preprocess text
      this.preprocessText();
      
      // Extract structured data
      const resume = this.parseResumeData();
      
      // Calculate confidence score
      const confidence = this.calculateConfidence(resume);
      
      console.log('Extraction completed with confidence:', confidence);
      console.log('Extracted resume:', resume);

      return {
        success: true,
        resume,
        confidence,
        suggestions: this.generateSuggestions(resume, confidence)
      };

    } catch (error) {
      console.error('Extraction failed:', error);
      return {
        success: false,
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    const pdfjsLib = await loadPDFJS();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
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
  }

  private async extractTextFromDOCX(file: File): Promise<string> {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  private preprocessText(): void {
    // Clean emojis and special characters
    this.text = this.text
      .replace(/[📍📞✉️🔗]/g, '') // Remove common resume emojis
      .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Split into lines and clean
    this.lines = this.text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    this.cleanLines = this.lines.map(line => 
      line.replace(/\s+/g, ' ').trim()
    ).filter(line => line.length > 0);

    console.log('Preprocessed lines:', this.cleanLines.slice(0, 10));
  }

  private parseResumeData(): Resume {
    const personalInfo = this.extractPersonalInfo();
    const summary = this.extractSummary();
    const experience = this.extractExperience();
    const education = this.extractEducation();
    const skills = this.extractSkills();

    return {
      personalInfo,
      summary,
      experience,
      education,
      skills,
      selectedTemplate: 'modern-professional',
      atsScore: 85
    };
  }

  private extractPersonalInfo(): ResumePersonalInfo {
    console.log('Extracting personal info...');
    
    // Enhanced name extraction
    const name = this.extractName();
    const email = this.extractEmail();
    const phone = this.extractPhone();
    const location = this.extractLocation();
    const linkedin = this.extractLinkedIn();
    const website = this.extractWebsite();

    const personalInfo = {
      fullName: name,
      email: email,
      phone: phone,
      location: location,
      linkedin: linkedin || undefined,
      website: website || undefined
    };

    console.log('Extracted personal info:', personalInfo);
    return personalInfo;
  }

  private extractName(): string {
    // Look for name patterns in first few lines
    for (let i = 0; i < Math.min(5, this.cleanLines.length); i++) {
      const line = this.cleanLines[i];
      
      // Skip lines with contact info
      if (line.includes('@') || line.includes('+') || line.includes('www') || 
          line.toLowerCase().includes('linkedin') || line.toLowerCase().includes('phone')) {
        continue;
      }

      // Look for capitalized names (2-4 words, each starting with capital)
      const nameMatch = line.match(/^([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?(?:\s[A-Z][a-z]+)?)(?:\s|$)/);
      if (nameMatch) {
        const potentialName = nameMatch[1].trim();
        // Verify it's not a section header
        if (!this.isSectionHeader(potentialName) && potentialName.split(' ').length >= 2) {
          return potentialName;
        }
      }

      // Try extracting from mixed content lines
      const words = line.split(' ').filter(word => word.length > 1);
      if (words.length >= 2) {
        const firstTwoWords = words.slice(0, 2).join(' ');
        if (firstTwoWords.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/) && 
            !this.isSectionHeader(firstTwoWords)) {
          return firstTwoWords;
        }
      }
    }

    return '';
  }

  private extractEmail(): string {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = this.text.match(emailRegex);
    return matches ? matches[0] : '';
  }

  private extractPhone(): string {
    // Enhanced phone regex for international numbers
    const phoneRegex = /(?:\+\d{1,3}\s?)?\(?\d{1,4}\)?\s?[\d\s-]{7,15}/g;
    const matches = this.text.match(phoneRegex);
    if (matches) {
      // Filter out likely false positives (years, etc.)
      for (const match of matches) {
        const cleaned = match.replace(/\D/g, '');
        if (cleaned.length >= 7 && cleaned.length <= 15) {
          return match.trim();
        }
      }
    }
    return '';
  }

  private extractLocation(): string {
    // Look for location patterns
    const locationPatterns = [
      /([A-Z][a-z]+,?\s+[A-Z][a-z]+)/g, // City, State/Country
      /([A-Z][a-z]+\s+[A-Z][a-z]+)/g,   // City State
    ];

    for (const pattern of locationPatterns) {
      const matches = this.text.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Skip common false positives
          if (!match.includes('University') && !match.includes('Company') && 
              !match.includes('School') && match.length < 50) {
            return match.trim();
          }
        }
      }
    }

    return '';
  }

  private extractLinkedIn(): string {
    const linkedinRegex = /(?:linkedin\.com\/in\/|LinkedIn:\s*)([a-zA-Z0-9-_]+)/i;
    const match = this.text.match(linkedinRegex);
    return match ? `linkedin.com/in/${match[1]}` : '';
  }

  private extractWebsite(): string {
    const websiteRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
    const matches = this.text.match(websiteRegex);
    if (matches) {
      // Filter out email domains and linkedin
      for (const match of matches) {
        if (!match.includes('linkedin') && !match.includes('@')) {
          return match.startsWith('http') ? match : `https://${match}`;
        }
      }
    }
    return '';
  }

  private extractSummary(): string {
    const summaryKeywords = ['summary', 'profile', 'objective', 'about'];
    
    for (let i = 0; i < this.cleanLines.length; i++) {
      const line = this.cleanLines[i].toLowerCase();
      
      if (summaryKeywords.some(keyword => line.includes(keyword))) {
        // Look for content in next few lines
        let summary = '';
        for (let j = i + 1; j < Math.min(i + 10, this.cleanLines.length); j++) {
          const nextLine = this.cleanLines[j];
          
          // Stop if we hit another section
          if (this.isSectionHeader(nextLine)) {
            break;
          }
          
          summary += nextLine + ' ';
          
          // Stop if we have enough content
          if (summary.length > 200) {
            break;
          }
        }
        
        if (summary.trim().length > 50) {
          return summary.trim();
        }
      }
    }

    // If no explicit summary section, try to find descriptive paragraphs
    for (const line of this.cleanLines) {
      if (line.length > 100 && line.length < 500 && 
          !line.includes('@') && !this.isSectionHeader(line)) {
        return line;
      }
    }

    return '';
  }

  private extractExperience(): ResumeExperience[] {
    const experiences: ResumeExperience[] = [];
    const experienceKeywords = ['experience', 'employment', 'work history', 'professional experience'];
    
    let inExperienceSection = false;
    let currentExperience: Partial<ResumeExperience> = {};
    
    for (let i = 0; i < this.cleanLines.length; i++) {
      const line = this.cleanLines[i];
      const lowerLine = line.toLowerCase();
      
      // Check if we're entering experience section
      if (experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
        inExperienceSection = true;
        continue;
      }
      
      // Check if we're leaving experience section
      if (inExperienceSection && this.isNewSection(line)) {
        if (currentExperience.title && currentExperience.company) {
          experiences.push(this.completeExperience(currentExperience));
        }
        break;
      }
      
      if (inExperienceSection) {
        // Try to identify job title
        if (this.looksLikeJobTitle(line) && !currentExperience.title) {
          currentExperience.title = line;
        }
        // Try to identify company
        else if (this.looksLikeCompany(line) && !currentExperience.company) {
          currentExperience.company = line;
        }
        // Try to identify dates
        else if (this.containsDateRange(line)) {
          const dates = this.extractDateRange(line);
          currentExperience.startDate = dates.start;
          currentExperience.endDate = dates.end;
          currentExperience.current = dates.current;
        }
        // Try to identify description
        else if (line.length > 50 && !this.looksLikeJobTitle(line) && !this.looksLikeCompany(line)) {
          if (!currentExperience.description) {
            currentExperience.description = line;
          } else {
            currentExperience.description += ' ' + line;
          }
        }
        
        // If we have enough info for this experience, save it and start new one
        if (currentExperience.title && currentExperience.company && 
            Object.keys(currentExperience).length >= 4) {
          experiences.push(this.completeExperience(currentExperience));
          currentExperience = {};
        }
      }
    }
    
    // Add final experience if exists
    if (currentExperience.title && currentExperience.company) {
      experiences.push(this.completeExperience(currentExperience));
    }
    
    console.log('Extracted experiences:', experiences);
    return experiences;
  }

  private extractEducation(): ResumeEducation[] {
    const education: ResumeEducation[] = [];
    const educationKeywords = ['education', 'academic', 'qualifications', 'degree'];
    
    let inEducationSection = false;
    let currentEducation: Partial<ResumeEducation> = {};
    
    for (let i = 0; i < this.cleanLines.length; i++) {
      const line = this.cleanLines[i];
      const lowerLine = line.toLowerCase();
      
      // Check if we're entering education section
      if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
        inEducationSection = true;
        continue;
      }
      
      // Check if we're leaving education section
      if (inEducationSection && this.isNewSection(line)) {
        if (currentEducation.degree && currentEducation.school) {
          education.push(this.completeEducation(currentEducation));
        }
        break;
      }
      
      if (inEducationSection) {
        // Try to identify degree
        if (this.looksLikeDegree(line)) {
          currentEducation.degree = line;
        }
        // Try to identify school
        else if (this.looksLikeSchool(line)) {
          currentEducation.school = line;
        }
        // Try to identify dates
        else if (this.containsDateRange(line)) {
          const dates = this.extractDateRange(line);
          currentEducation.startDate = dates.start;
          currentEducation.endDate = dates.end;
        }
        
        // If we have enough info, save it
        if (currentEducation.degree && currentEducation.school) {
          education.push(this.completeEducation(currentEducation));
          currentEducation = {};
        }
      }
    }
    
    // Add final education if exists
    if (currentEducation.degree && currentEducation.school) {
      education.push(this.completeEducation(currentEducation));
    }
    
    console.log('Extracted education:', education);
    return education;
  }

  private extractSkills(): ResumeSkill[] {
    const skills: ResumeSkill[] = [];
    const skillsKeywords = ['skills', 'technologies', 'expertise', 'competencies'];
    
    // Technical skills dictionary
    const technicalSkills = [
      'AutoCAD', 'Navisworks', 'Excel', 'Word', 'Outlook', 'JavaScript', 'Python', 'Java',
      'React', 'Angular', 'Vue', 'Node.js', 'SQL', 'Git', 'Docker', 'AWS', 'Azure'
    ];
    
    let inSkillsSection = false;
    
    for (let i = 0; i < this.cleanLines.length; i++) {
      const line = this.cleanLines[i];
      const lowerLine = line.toLowerCase();
      
      // Check if we're entering skills section
      if (skillsKeywords.some(keyword => lowerLine.includes(keyword))) {
        inSkillsSection = true;
        continue;
      }
      
      // Check if we're leaving skills section
      if (inSkillsSection && this.isNewSection(line)) {
        break;
      }
      
      if (inSkillsSection) {
        // Extract skills from the line
        const extractedSkills = this.parseSkillsFromLine(line);
        skills.push(...extractedSkills);
      }
    }
    
    // Also search for technical skills throughout the document
    for (const skill of technicalSkills) {
      if (this.text.toLowerCase().includes(skill.toLowerCase()) && 
          !skills.some(s => s.name.toLowerCase() === skill.toLowerCase())) {
        skills.push({
          id: `skill-${skills.length}`,
          name: skill,
          category: 'technical'
        });
      }
    }
    
    console.log('Extracted skills:', skills);
    return skills;
  }

  private parseSkillsFromLine(line: string): ResumeSkill[] {
    const skills: ResumeSkill[] = [];
    
    // Split by common delimiters
    const skillItems = line.split(/[,;|•·]/);
    
    for (let item of skillItems) {
      item = item.trim();
      
      // Handle parenthetical descriptions like "MS Office (Excel, Word, Outlook)"
      if (item.includes('(') && item.includes(')')) {
        const mainSkill = item.split('(')[0].trim();
        const subSkills = item.match(/\(([^)]+)\)/)?.[1]?.split(',') || [];
        
        if (mainSkill.length > 1) {
          skills.push({
            id: `skill-${Date.now()}-${Math.random()}`,
            name: mainSkill,
            category: 'technical'
          });
        }
        
        for (const subSkill of subSkills) {
          const cleanSubSkill = subSkill.trim();
          if (cleanSubSkill.length > 1) {
            skills.push({
              id: `skill-${Date.now()}-${Math.random()}`,
              name: cleanSubSkill,
              category: 'technical'
            });
          }
        }
      } else if (item.length > 1 && item.length < 50) {
        // Determine skill category
        const category = this.categorizeSkill(item);
        skills.push({
          id: `skill-${Date.now()}-${Math.random()}`,
          name: item,
          category
        });
      }
    }
    
    return skills;
  }

  private categorizeSkill(skill: string): 'technical' | 'soft' | 'language' {
    const lowerSkill = skill.toLowerCase();
    
    // Language skills
    if (['english', 'spanish', 'french', 'german', 'turkish', 'arabic', 'chinese'].some(lang => 
        lowerSkill.includes(lang))) {
      return 'language';
    }
    
    // Soft skills
    if (['leadership', 'communication', 'teamwork', 'problem solving', 'management'].some(soft => 
        lowerSkill.includes(soft))) {
      return 'soft';
    }
    
    // Default to technical
    return 'technical';
  }

  // Helper methods
  private isSectionHeader(line: string): boolean {
    const headers = [
      'experience', 'education', 'skills', 'summary', 'profile', 'objective',
      'certifications', 'awards', 'projects', 'references', 'languages'
    ];
    const lowerLine = line.toLowerCase();
    return headers.some(header => lowerLine.includes(header) && line.length < 50);
  }

  private isNewSection(line: string): boolean {
    return this.isSectionHeader(line) || 
           (line.length < 50 && line.match(/^[A-Z\s]+$/) !== null);
  }

  private looksLikeJobTitle(line: string): boolean {
    const titleWords = ['engineer', 'manager', 'developer', 'analyst', 'specialist', 'director', 
                       'coordinator', 'supervisor', 'consultant', 'architect'];
    const lowerLine = line.toLowerCase();
    return titleWords.some(word => lowerLine.includes(word)) && 
           line.length > 5 && line.length < 100;
  }

  private looksLikeCompany(line: string): boolean {
    return line.length > 3 && line.length < 50 && 
           !this.looksLikeDate(line) && 
           !line.includes('@');
  }

  private looksLikeDegree(line: string): boolean {
    const degreeWords = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'certificate'];
    const lowerLine = line.toLowerCase();
    return degreeWords.some(word => lowerLine.includes(word));
  }

  private looksLikeSchool(line: string): boolean {
    const schoolWords = ['university', 'college', 'institute', 'school', 'academy'];
    const lowerLine = line.toLowerCase();
    return schoolWords.some(word => lowerLine.includes(word));
  }

  private containsDateRange(line: string): boolean {
    return this.looksLikeDate(line) || 
           line.match(/\d{4}\s*[-–—]\s*\d{4}/) !== null ||
           line.match(/\d{4}\s*[-–—]\s*present/i) !== null;
  }

  private looksLikeDate(line: string): boolean {
    return /\b(19|20)\d{2}\b/.test(line) || 
           /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(line);
  }

  private extractDateRange(line: string): { start: string; end: string; current: boolean } {
    // Enhanced date extraction
    const yearRangeMatch = line.match(/(\d{4})\s*[-–—]\s*(\d{4}|present)/i);
    if (yearRangeMatch) {
      return {
        start: yearRangeMatch[1],
        end: yearRangeMatch[2].toLowerCase() === 'present' ? '' : yearRangeMatch[2],
        current: yearRangeMatch[2].toLowerCase() === 'present'
      };
    }
    
    const singleYearMatch = line.match(/(\d{4})/);
    if (singleYearMatch) {
      return {
        start: singleYearMatch[1],
        end: '',
        current: false
      };
    }
    
    return { start: '', end: '', current: false };
  }

  private completeExperience(exp: Partial<ResumeExperience>): ResumeExperience {
    return {
      id: `exp-${Date.now()}-${Math.random()}`,
      title: exp.title || 'Unknown Position',
      company: exp.company || 'Unknown Company',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      current: exp.current || false,
      description: exp.description || '',
      achievements: []
    };
  }

  private completeEducation(edu: Partial<ResumeEducation>): ResumeEducation {
    return {
      id: `edu-${Date.now()}-${Math.random()}`,
      degree: edu.degree || 'Unknown Degree',
      school: edu.school || 'Unknown School',
      location: edu.location || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || ''
    };
  }

  private calculateConfidence(resume: Resume): number {
    let score = 0;
    const maxScore = 100;
    
    // Personal info scoring (30 points)
    if (resume.personalInfo.fullName) score += 10;
    if (resume.personalInfo.email) score += 10;
    if (resume.personalInfo.phone) score += 5;
    if (resume.personalInfo.location) score += 5;
    
    // Experience scoring (30 points)
    if (resume.experience.length > 0) score += 15;
    if (resume.experience.some(exp => exp.description.length > 50)) score += 15;
    
    // Education scoring (20 points)
    if (resume.education.length > 0) score += 20;
    
    // Skills scoring (20 points)
    if (resume.skills.length > 0) score += 10;
    if (resume.skills.length >= 5) score += 10;
    
    return Math.min(score, maxScore);
  }

  private generateSuggestions(resume: Resume, confidence: number): string[] {
    const suggestions: string[] = [];
    
    if (confidence < 70) {
      suggestions.push('Consider uploading a higher quality PDF or DOCX file for better extraction accuracy.');
    }
    
    if (!resume.personalInfo.phone) {
      suggestions.push('Add your phone number for better contact information.');
    }
    
    if (resume.experience.length === 0) {
      suggestions.push('No work experience was detected. Please review and add your professional experience.');
    }
    
    if (resume.skills.length < 5) {
      suggestions.push('Add more skills to improve your resume\'s visibility to employers.');
    }
    
    return suggestions;
  }
}

// Export singleton instance
export const resumeExtractor = new ResumeExtractor();

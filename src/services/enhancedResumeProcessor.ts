import { supabase } from "@/integrations/supabase/client";
import { ResumeTextExtractor } from "./resumeTextExtractor";

export interface EnhancedResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    linkedin?: string;
    website?: string;
    confidence: number;
  };
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    duration?: string;
    description: string;
    achievements: string[];
    technologies: string[];
    keywords: string[];
    confidence: number;
  }>;
  education: Array<{
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    honors?: string;
    relevantCoursework: string[];
    confidence: number;
  }>;
  skills: {
    technical: {
      programming: string[];
      frameworks: string[];
      databases: string[];
      tools: string[];
      cloud: string[];
      confidence: number;
    };
    soft: string[];
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
    certifications: string[];
  };
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
    github?: string;
    achievements: string[];
    confidence: number;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    credentialId?: string;
    url?: string;
    confidence: number;
  }>;
  awards: Array<{
    name: string;
    issuer: string;
    date: string;
    description: string;
    confidence: number;
  }>;
  volunteer: Array<{
    organization: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
    confidence: number;
  }>;
  sectionStructure: {
    detectedSections: string[];
    sectionBoundaries: Record<string, string>;
    formatMetadata: {
      hasBulletPoints: boolean;
      indentationLevel: number;
      fontHints: string[];
      layoutType: string;
    };
  };
  atsOptimization: {
    score: number;
    keywordDensity: number;
    sectionCompleteness: number;
    readabilityScore: number;
    suggestions: Array<{
      category: 'keywords' | 'structure' | 'content' | 'formatting';
      priority: 'high' | 'medium' | 'low';
      issue: string;
      suggestion: string;
      impact: number;
    }>;
  };
  confidenceMetrics: {
    overall: number;
    personalInfo: number;
    experience: number;
    education: number;
    skills: number;
    sections: Record<string, number>;
  };
  suggestions: Array<{
    category: string;
    priority: string;
    issue: string;
    suggestion: string;
    impact: number;
  }>;
  metadata: {
    fileName: string;
    extractionTimestamp: string;
    extractionMethod: string;
    processingVersion: string;
  };
}

export class EnhancedResumeProcessor {
  private textExtractor = new ResumeTextExtractor();

  async processResume(file: File): Promise<EnhancedResumeData> {
    console.log('Starting enhanced resume processing for:', file.name);
    
    try {
      // Step 1: Advanced text extraction with file type detection
      const extractedText = await this.performAdvancedTextExtraction(file);
      
      // Step 2: AI-powered parsing with NLP techniques
      const parsedData = await this.performAIExtraction(extractedText, file.name, file.type);
      
      // Step 3: Post-processing and validation
      const enhancedData = await this.postProcessExtraction(parsedData, file);
      
      return enhancedData;
      
    } catch (error) {
      console.error('Enhanced resume processing failed:', error);
      throw new Error(`Failed to process resume: ${error.message}`);
    }
  }

  private async performAdvancedTextExtraction(file: File): Promise<string> {
    console.log('Performing advanced text extraction...');
    
    try {
      // Multi-step extraction process
      let extractedText = '';
      
      // Primary extraction
      extractedText = await this.textExtractor.extractText(file);
      
      // Clean and validate
      extractedText = this.textExtractor.cleanText(extractedText);
      
      // Enhanced cleaning for better AI processing
      extractedText = this.enhanceTextForAI(extractedText);
      
      console.log('Text extraction complete. Length:', extractedText.length);
      
      if (!this.textExtractor.isValidText(extractedText)) {
        console.warn('Text quality is poor, providing file metadata for AI processing');
        extractedText = this.generateFileMetadataPrompt(file, extractedText);
      }
      
      return extractedText;
      
    } catch (error) {
      console.error('Text extraction failed:', error);
      // Fallback to file metadata
      return this.generateFileMetadataPrompt(file, '');
    }
  }

  private enhanceTextForAI(text: string): string {
    return text
      // Preserve section headers
      .replace(/^([A-Z\s]+)$/gm, '\n=== $1 ===\n')
      // Enhance bullet points
      .replace(/^\s*[•·\-\*]\s*/gm, '\n• ')
      // Preserve email patterns
      .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '\nEMAIL: $1\n')
      // Preserve phone patterns
      .replace(/(\+?[\d\s\-\(\)]{10,})/g, '\nPHONE: $1\n')
      // Preserve dates
      .replace(/(\d{1,2}\/\d{4}|\d{4}[\-\/]\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/gi, '\nDATE: $1\n')
      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private generateFileMetadataPrompt(file: File, extractedText: string): string {
    return `
RESUME FILE ANALYSIS REQUEST
============================
File Name: ${file.name}
File Type: ${file.type}
File Size: ${(file.size / 1024).toFixed(1)}KB
Last Modified: ${new Date(file.lastModified).toISOString()}

EXTRACTED TEXT CONTENT:
${extractedText || 'Text extraction failed - please use advanced AI parsing'}

PROCESSING INSTRUCTIONS:
This is a ${file.type.includes('pdf') ? 'PDF' : file.type.includes('doc') ? 'Word document' : 'text file'} that requires advanced AI processing.
Please extract all resume sections including:
- Personal Information (name, email, phone, address)
- Professional Summary/Objective
- Work Experience (companies, titles, dates, responsibilities)
- Education (degrees, institutions, dates)
- Skills (technical, soft skills, certifications)
- Projects (if any)
- Awards/Achievements
- Volunteer Experience

Use your advanced NLP capabilities to identify and structure this information even if the text extraction is incomplete.
    `.trim();
  }

  private async performAIExtraction(text: string, fileName: string, fileType: string): Promise<any> {
    console.log('Performing AI-powered extraction...');
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-resume-extraction', {
        body: { 
          text,
          fileName,
          fileType,
          extractionLevel: 'comprehensive'
        }
      });

      if (error) {
        console.error('AI extraction error:', error);
        throw new Error(`AI extraction failed: ${error.message}`);
      }

      if (!data.success) {
        console.error('AI extraction unsuccessful:', data.error);
        throw new Error(`AI extraction unsuccessful: ${data.error}`);
      }

      console.log('AI extraction successful with confidence:', data.confidenceMetrics?.overall);
      return data;

    } catch (error) {
      console.error('AI extraction failed:', error);
      // Fallback to basic extraction
      return this.performFallbackExtraction(text, fileName);
    }
  }

  private async postProcessExtraction(data: any, file: File): Promise<EnhancedResumeData> {
    console.log('Post-processing extraction results...');
    
    // Validate and enhance data
    const processedData = {
      ...data,
      personalInfo: this.validatePersonalInfo(data.personalInfo),
      experience: this.validateExperience(data.experience || []),
      education: this.validateEducation(data.education || []),
      skills: this.validateSkills(data.skills || {}),
      projects: this.validateProjects(data.projects || []),
      certifications: this.validateCertifications(data.certifications || []),
      awards: data.awards || [],
      volunteer: data.volunteer || [],
    };

    // Generate additional insights
    processedData.suggestions = this.generateEnhancedSuggestions(processedData);
    
    // Update metadata
    processedData.metadata = {
      ...data.metadata,
      fileSize: file.size,
      processingTimestamp: new Date().toISOString(),
    };

    return processedData;
  }

  private validatePersonalInfo(personalInfo: any) {
    return {
      fullName: personalInfo?.fullName || '',
      email: personalInfo?.email || '',
      phone: this.standardizePhone(personalInfo?.phone || ''),
      location: personalInfo?.location || '',
      summary: personalInfo?.summary || '',
      linkedin: this.validateUrl(personalInfo?.linkedin),
      website: this.validateUrl(personalInfo?.website),
      confidence: personalInfo?.confidence || 0.5
    };
  }

  private validateExperience(experience: any[]) {
    return experience.map(exp => ({
      ...exp,
      startDate: this.standardizeDate(exp.startDate),
      endDate: this.standardizeDate(exp.endDate),
      duration: this.calculateDuration(exp.startDate, exp.endDate),
      achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
      technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
      keywords: this.extractKeywords(exp.description || ''),
      confidence: exp.confidence || 0.7
    }));
  }

  private validateEducation(education: any[]) {
    return education.map(edu => ({
      ...edu,
      startDate: this.standardizeDate(edu.startDate),
      endDate: this.standardizeDate(edu.endDate),
      relevantCoursework: Array.isArray(edu.relevantCoursework) ? edu.relevantCoursework : [],
      confidence: edu.confidence || 0.8
    }));
  }

  private validateSkills(skills: any) {
    return {
      technical: {
        programming: Array.isArray(skills.technical?.programming) ? skills.technical.programming : [],
        frameworks: Array.isArray(skills.technical?.frameworks) ? skills.technical.frameworks : [],
        databases: Array.isArray(skills.technical?.databases) ? skills.technical.databases : [],
        tools: Array.isArray(skills.technical?.tools) ? skills.technical.tools : [],
        cloud: Array.isArray(skills.technical?.cloud) ? skills.technical.cloud : [],
        confidence: skills.technical?.confidence || 0.8
      },
      soft: Array.isArray(skills.soft) ? skills.soft : [],
      languages: Array.isArray(skills.languages) ? skills.languages : [],
      certifications: Array.isArray(skills.certifications) ? skills.certifications : []
    };
  }

  private validateProjects(projects: any[]) {
    return projects.map(project => ({
      ...project,
      technologies: Array.isArray(project.technologies) ? project.technologies : [],
      achievements: Array.isArray(project.achievements) ? project.achievements : [],
      confidence: project.confidence || 0.7
    }));
  }

  private validateCertifications(certifications: any[]) {
    return certifications.map(cert => ({
      ...cert,
      confidence: cert.confidence || 0.8
    }));
  }

  private standardizePhone(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format US phone numbers
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    
    return phone; // Return original if can't standardize
  }

  private standardizeDate(date: string): string {
    if (!date) return '';
    
    // Convert various date formats to MM/YYYY
    const dateRegex = /(\d{1,2})\/(\d{4})|(\d{4})|(\w{3,9})\s+(\d{4})/i;
    const match = date.match(dateRegex);
    
    if (match) {
      if (match[1] && match[2]) {
        // MM/YYYY format
        return `${match[1].padStart(2, '0')}/${match[2]}`;
      } else if (match[3]) {
        // Just year
        return `01/${match[3]}`;
      } else if (match[4] && match[5]) {
        // Month Year format
        const monthMap: { [key: string]: string } = {
          'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
          'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
          'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
        };
        const month = monthMap[match[4].toLowerCase().slice(0, 3)] || '01';
        return `${month}/${match[5]}`;
      }
    }
    
    return date;
  }

  private calculateDuration(startDate: string, endDate: string): string {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate.replace('/', '/01/'));
    const end = endDate.toLowerCase() === 'present' ? new Date() : new Date(endDate.replace('/', '/01/'));
    
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (monthsDiff < 12) {
      return `${monthsDiff} month${monthsDiff !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(monthsDiff / 12);
      const months = monthsDiff % 12;
      return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` ${months} month${months !== 1 ? 's' : ''}` : ''}`;
    }
  }

  private extractKeywords(text: string): string[] {
    const keywords = new Set<string>();
    const keywordPatterns = [
      /\b(managed|led|developed|created|implemented|designed|built|optimized|improved|increased|reduced)\b/gi,
      /\b(JavaScript|Python|Java|React|Node\.js|SQL|AWS|Docker|Kubernetes)\b/gi,
      /\b(\d+%|\d+\+|save[d]?\s*\$?\d+|increase[d]?\s*\d+%|reduce[d]?\s*\d+%)\b/gi
    ];
    
    keywordPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => keywords.add(match.toLowerCase()));
      }
    });
    
    return Array.from(keywords).slice(0, 10); // Limit to top 10 keywords
  }

  private validateUrl(url: string): string {
    if (!url) return '';
    
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return url.startsWith('http') ? url : `https://${url}`;
    } catch {
      return url; // Return original if not a valid URL
    }
  }

  private generateEnhancedSuggestions(data: any) {
    const suggestions = [...(data.suggestions || [])];
    
    // Add custom suggestions based on analysis
    if (data.confidenceMetrics.overall < 0.7) {
      suggestions.push({
        category: 'quality',
        priority: 'medium',
        issue: 'Low extraction confidence',
        suggestion: 'Review and manually verify extracted information for accuracy',
        impact: 10
      });
    }
    
    if (data.personalInfo.summary.length < 100) {
      suggestions.push({
        category: 'content',
        priority: 'high',
        issue: 'Brief professional summary',
        suggestion: 'Expand your professional summary to 100-150 words for better impact',
        impact: 8
      });
    }
    
    return suggestions;
  }

  private performFallbackExtraction(text: string, fileName: string): any {
    console.log('Using fallback extraction...');
    
    // Return minimal structure
    return {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        summary: text.substring(0, 200) + '...',
        confidence: 0.3
      },
      experience: [],
      education: [],
      skills: { technical: {}, soft: [], languages: [], certifications: [] },
      projects: [],
      certifications: [],
      awards: [],
      volunteer: [],
      atsOptimization: {
        score: 40,
        keywordDensity: 30,
        sectionCompleteness: 20,
        readabilityScore: 50,
        suggestions: [{
          category: 'content',
          priority: 'high',
          issue: 'Incomplete extraction',
          suggestion: 'Manual review required for accurate information',
          impact: 50
        }]
      },
      confidenceMetrics: {
        overall: 0.3,
        personalInfo: 0.3,
        experience: 0.3,
        education: 0.3,
        skills: 0.3,
        sections: {}
      },
      success: true
    };
  }
}
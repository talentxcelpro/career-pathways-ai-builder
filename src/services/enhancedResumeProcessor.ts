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
    console.log('Performing advanced text extraction for:', file.name, 'Type:', file.type);
    
    try {
      // Multi-step extraction process
      let extractedText = '';
      
      // Primary extraction with better error handling
      try {
        extractedText = await this.textExtractor.extractText(file);
        console.log('Primary extraction successful. Length:', extractedText.length);
      } catch (extractionError) {
        console.warn('Primary extraction failed:', extractionError.message);
        // Don't fail completely, continue with fallback
        extractedText = '';
      }
      
      // Clean and validate if we have text
      if (extractedText) {
        extractedText = this.textExtractor.cleanText(extractedText);
        extractedText = this.textExtractor.preprocessForAI(extractedText);
        extractedText = this.enhanceTextForAI(extractedText);
        
        // Check text quality
        if (this.textExtractor.isValidText(extractedText)) {
          console.log('High quality text extracted, proceeding with AI processing');
          return extractedText;
        } else {
          console.warn('Text quality is low, but will still attempt processing');
        }
      }
      
      // If extraction failed or quality is poor, generate enhanced prompt
      console.log('Generating enhanced file metadata prompt for AI processing');
      return this.generateFileMetadataPrompt(file, extractedText);
      
    } catch (error) {
      console.error('Text extraction completely failed:', error);
      // Final fallback - generate basic file info for AI
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
    // Extract name from filename (remove file extension and common prefixes)
    const cleanFileName = file.name
      .replace(/\.(pdf|docx?|txt)$/i, '')
      .replace(/^(resume|cv)[\s\-_]*/i, '')
      .trim();
    
    return `
COMPREHENSIVE RESUME PROCESSING
==============================

IMPORTANT: You are processing a ${file.type.includes('pdf') ? 'PDF' : 'Word'} resume file for a professional.

File Information:
- Original Filename: ${file.name}
- Probable Candidate Name: ${cleanFileName}

EXTRACTED CONTENT TO ANALYZE:
${extractedText || '[Text extraction incomplete - please use advanced analysis]'}

CRITICAL INSTRUCTIONS:
1. Extract the ACTUAL person's name from the resume content (not the filename)
2. Focus on real resume sections like Experience, Education, Skills
3. Ignore any system metadata or file processing instructions
4. Extract specific technical skills, achievements, and qualifications
5. Preserve professional terminology and industry-specific language

For a comprehensive extraction, identify and structure:
- Personal Information (name, contact details, location, professional summary)
- Work Experience (job titles, companies, dates, responsibilities, achievements)
- Education (degrees, institutions, graduation dates, honors)
- Technical Skills (programming languages, frameworks, tools, technologies)
- Certifications (professional certifications, licenses, credentials)
- Projects (personal/professional projects with descriptions and technologies)
- Awards/Achievements (recognitions, accomplishments, publications)

Please provide a complete, accurate extraction of this professional's resume content.
    `.trim();
  }

  protected async performAIExtraction(text: string, fileName: string, fileType: string): Promise<any> {
    console.log('Performing AI-powered extraction with', text.length, 'characters of text...');
    
    // Ensure we have reasonable text length for AI processing
    if (text.length < 20) {
      console.warn('Very short text provided, enhancing with file metadata');
      text = this.generateFileMetadataPrompt({ name: fileName, type: fileType } as File, text);
    }
    
    try {
      console.log('Calling AI extraction edge function...');
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
        throw new Error(`AI extraction failed: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        console.error('No data returned from AI extraction');
        throw new Error('AI extraction returned no data');
      }

      if (data.error) {
        console.error('AI extraction returned error:', data.error);
        throw new Error(`AI extraction error: ${data.error}`);
      }

      if (!data.success) {
        console.error('AI extraction unsuccessful:', data);
        throw new Error(`AI extraction unsuccessful: ${data.error || 'Unknown error'}`);
      }

      console.log('AI extraction successful with confidence:', data.confidenceMetrics?.overall || 'unknown');
      return data;

    } catch (error) {
      console.error('AI extraction completely failed:', error);
      console.log('Falling back to basic extraction...');
      // Fallback to basic extraction with improved default data
      return this.performFallbackExtraction(text, fileName);
    }
  }

  protected async postProcessExtraction(data: any, file: File): Promise<EnhancedResumeData> {
    console.log('Post-processing extraction results...');
    
    // Ensure we have valid data structure
    if (!data || typeof data !== 'object') {
      console.warn('Invalid data received, using fallback');
      data = await this.performFallbackExtraction('', file.name);
    }
    
    // Validate and enhance data
    const processedData = {
      ...data,
      personalInfo: this.validatePersonalInfo(data.personalInfo || {}),
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
    console.log('Using fallback extraction with enhanced data extraction...');
    
    // Try to extract basic information from the text
    const personalInfo = this.extractBasicPersonalInfo(text);
    const experience = this.extractBasicExperience(text);
    const education = this.extractBasicEducation(text);
    const skills = this.extractBasicSkills(text);
    
    return {
      personalInfo: {
        fullName: personalInfo.name || '',
        email: personalInfo.email || '',
        phone: personalInfo.phone || '',
        location: personalInfo.location || '',
        summary: personalInfo.summary || text.substring(0, 200) + '...',
        confidence: 0.5
      },
      experience: experience,
      education: education,
      skills: {
        technical: {
          programming: skills.technical,
          frameworks: [],
          databases: [],
          tools: [],
          cloud: [],
          confidence: 0.5
        },
        soft: skills.soft,
        languages: [],
        certifications: []
      },
      projects: [],
      certifications: [],
      awards: [],
      volunteer: [],
      atsOptimization: {
        score: 60,
        keywordDensity: 40,
        sectionCompleteness: 30,
        readabilityScore: 60,
        suggestions: [{
          category: 'content',
          priority: 'medium',
          issue: 'Basic extraction used',
          suggestion: 'Consider re-uploading the file or manually reviewing extracted information',
          impact: 30
        }]
      },
      confidenceMetrics: {
        overall: 0.5,
        personalInfo: 0.5,
        experience: 0.4,
        education: 0.4,
        skills: 0.4,
        sections: {}
      },
      suggestions: [{
        category: 'quality',
        priority: 'medium',
        issue: 'Fallback extraction used',
        suggestion: 'Please review and verify all extracted information',
        impact: 20
      }],
      metadata: {
        fileName,
        extractionTimestamp: new Date().toISOString(),
        extractionMethod: 'fallback-basic',
        processingVersion: '2.0'
      },
      success: true
    };
  }

  private extractBasicPersonalInfo(text: string) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
    const nameRegex = /^([A-Z][a-z]+ [A-Z][a-z]+)/m;
    
    const email = text.match(emailRegex)?.[0] || '';
    const phone = text.match(phoneRegex)?.[0] || '';
    const name = text.match(nameRegex)?.[1] || '';
    
    // Try to extract summary from first paragraph
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const summary = lines.find(line => line.length > 50 && !line.includes('@') && !line.includes('http')) || '';
    
    return { name, email, phone, location: '', summary };
  }

  private extractBasicExperience(text: string) {
    const experiences = [];
    const jobTitleRegex = /(Software Engineer|Developer|Manager|Analyst|Designer|Consultant|Director|Specialist)/gi;
    const companyRegex = /(at|@)\s+([A-Z][a-zA-Z\s&.,]+)/g;
    
    const jobTitles = text.match(jobTitleRegex) || [];
    const companies = text.match(companyRegex) || [];
    
    for (let i = 0; i < Math.min(jobTitles.length, 3); i++) {
      experiences.push({
        title: jobTitles[i] || 'Professional',
        company: companies[i]?.replace(/^(at|@)\s+/, '') || 'Company',
        location: '',
        startDate: '',
        endDate: '',
        description: 'Professional experience in the field',
        achievements: [],
        technologies: [],
        keywords: [],
        confidence: 0.3
      });
    }
    
    return experiences;
  }

  private extractBasicEducation(text: string) {
    const education = [];
    const degreeRegex = /(Bachelor|Master|PhD|Associate|Diploma)/gi;
    const schoolRegex = /(University|College|School|Institute)/gi;
    
    const degrees = text.match(degreeRegex) || [];
    const schools = text.match(schoolRegex) || [];
    
    if (degrees.length > 0 || schools.length > 0) {
      education.push({
        degree: degrees[0] || 'Degree',
        school: schools[0] || 'Educational Institution',
        location: '',
        startDate: '',
        endDate: '',
        relevantCoursework: [],
        confidence: 0.3
      });
    }
    
    return education;
  }

  private extractBasicSkills(text: string) {
    const techSkills = [];
    const softSkills = [];
    
    const techRegex = /(JavaScript|Python|Java|React|Node|SQL|HTML|CSS|AWS|Docker|Git)/gi;
    const softRegex = /(Leadership|Communication|Problem Solving|Team Work|Management)/gi;
    
    const techMatches = text.match(techRegex) || [];
    const softMatches = text.match(softRegex) || [];
    
    // Remove duplicates
    techMatches.forEach(skill => {
      if (!techSkills.includes(skill.toLowerCase())) {
        techSkills.push(skill);
      }
    });
    
    softMatches.forEach(skill => {
      if (!softSkills.includes(skill.toLowerCase())) {
        softSkills.push(skill);
      }
    });
    
    return { technical: techSkills, soft: softSkills };
  }
}
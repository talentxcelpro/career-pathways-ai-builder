import { EnhancedResumeData } from '@/types/enhanced-resume';
import { supabase } from '@/integrations/supabase/client';

export interface CategorizedSkills {
  technical: string[];
  soft: string[];
  languages: string[];
  tools: string[];
  frameworks: string[];
  databases: string[];
  certifications: string[];
}

export interface EnhancedProject {
  name: string;
  description: string;
  technologies: string[];
  duration?: string;
  link?: string;
  role?: string;
}

export interface FieldConfidence {
  field: string;
  value: any;
  confidence: number;
  completeness: number;
  quality_score: number;
}

export interface ParsedResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: CategorizedSkills;
  work_experience: Array<{
    company: string;
    title: string;
    duration: string;
    location: string;
    description: string;
    achievements: string[];
    technologies_used?: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    duration: string;
    location: string;
    gpa?: string;
    relevant_coursework?: string[];
    honors?: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date?: string;
    expiry?: string;
    credential_id?: string;
  }>;
  projects: EnhancedProject[];
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
  linkedin: string;
  github: string;
  portfolio: string;
  additional_links: string[];
}

export interface EnhancedParsingResult {
  success: boolean;
  data?: {
    structured_resume: ParsedResumeData;
    raw_text: string;
    field_confidence: FieldConfidence[];
    ats_compatibility: {
      score: number;
      keyword_density: number;
      format_score: number;
      section_completeness: number;
    };
    content_quality: {
      overall_score: number;
      grammar_score: number;
      detail_level: number;
      achievement_focus: number;
    };
    key_metrics: {
      years_experience: number;
      top_skills_matched: string[];
      confidence_score: number;
      completeness_percentage: number;
      extraction_method?: string;
      data_quality?: {
        isEmpty: boolean;
        reason: string;
        confidenceAdjustment: number;
        suggestions: string[];
      };
    };
  };
  error?: string;
}

export class EnhancedResumeExtractor {
  private static async callAIParser(extractedText: string, fileName: string): Promise<EnhancedParsingResult> {
    try {
      console.log('🤖 Calling AI resume parser...');
      console.log('📝 Extracted text length:', extractedText.length);
      console.log('📋 First 200 chars:', extractedText.substring(0, 200));
      
      const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
        body: {
          extractedText: extractedText,
          fileName: fileName
        }
      });

      if (error) {
        console.error('AI parser error:', error);
        throw new Error(error.message || 'AI parsing failed');
      }

      if (!data || !data.success) {
        console.error('AI parser returned unsuccessful result:', data);
        throw new Error(data?.error || 'AI parsing returned unsuccessful result');
      }

      console.log('✅ AI parsing completed successfully');
      console.log('📊 Parsed data structure:', Object.keys(data.data || {}));
      return { success: data.success, data: data.data, error: data.error };
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
      const fieldConfidence = this.calculateFieldConfidence(fallbackResult);
      const atsMetrics = this.calculateATSCompatibility(fallbackResult, extractedText);
      const qualityMetrics = this.calculateContentQuality(fallbackResult, extractedText);
      
      return {
        success: true,
        data: {
          structured_resume: fallbackResult,
          raw_text: extractedText,
          field_confidence: fieldConfidence,
          ats_compatibility: atsMetrics,
          content_quality: qualityMetrics,
          key_metrics: {
            years_experience: this.calculateExperience(fallbackResult.work_experience),
            top_skills_matched: this.getAllSkillsArray(fallbackResult.skills).slice(0, 5),
            confidence_score: 65, // Lower confidence for fallback
            completeness_percentage: this.calculateCompleteness(fallbackResult)
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
      let hasImagePages = false;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item): item is any => 'str' in item)
          .map((item: any) => item.str)
          .join(' ');
        
        // Check if page has minimal text (likely image-based)
        if (pageText.trim().length < 50) {
          console.log(`📷 Page ${i} appears to be image-based, attempting OCR...`);
          hasImagePages = true;
          try {
            const ocrText = await this.extractTextWithOCR(page);
            fullText += ocrText + '\n';
          } catch (ocrError) {
            console.warn(`⚠️ OCR failed for page ${i}:`, ocrError);
            fullText += pageText + '\n'; // Fallback to extracted text
          }
        } else {
          fullText += pageText + '\n';
        }
      }
      
      if (hasImagePages) {
        console.log('✅ PDF processing completed with OCR assistance');
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

  // Phase 4: OCR Integration for image-based PDFs
  private static async extractTextWithOCR(page: any): Promise<string> {
    try {
      // Import Tesseract.js dynamically
      const Tesseract = (await import('tesseract.js')).default;
      
      // Render page to canvas
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
      
      // Convert canvas to blob for Tesseract
      const imageData = canvas.toDataURL('image/png');
      
      console.log('🔍 Running OCR on page...');
      
      // Run OCR with optimized settings for documents
      const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      console.log('✅ OCR completed successfully');
      return text;
    } catch (error) {
      console.error('❌ OCR failed:', error);
      throw new Error('OCR text extraction failed');
    }
  }

  // Phase 4: Enhanced error handling with progressive enhancement
  static async parseResumeWithFallbacks(file: File, onProgress?: (step: string, progress: number) => void): Promise<EnhancedParsingResult> {
    const progressCallback = onProgress || (() => {});
    
    try {
      progressCallback('Initializing parsing...', 0);
      console.log('🚀 Starting enhanced resume parsing with fallbacks for:', file.name);
      
      // Step 1: Basic file validation
      progressCallback('Validating file...', 10);
      if (!this.validateFile(file)) {
        throw new Error('Invalid file type or size');
      }
      
      // Step 2: Text extraction with multiple attempts
      progressCallback('Extracting text...', 20);
      let extractedText = '';
      let extractionMethod = '';
      
      try {
        extractedText = await this.extractTextFromFile(file);
        extractionMethod = 'standard';
        progressCallback('Text extraction completed', 40);
      } catch (extractionError) {
        console.warn('⚠️ Standard extraction failed, trying OCR fallback...', extractionError);
        progressCallback('Standard extraction failed, trying OCR...', 30);
        
        try {
          extractedText = await this.extractTextWithOCRFallback(file);
          extractionMethod = 'ocr';
          progressCallback('OCR extraction completed', 40);
        } catch (ocrError) {
          console.error('❌ All extraction methods failed:', ocrError);
          throw new Error('Could not extract text from file using any method');
        }
      }

      if (!extractedText || extractedText.trim().length < 20) {
        throw new Error('Insufficient text content extracted from file');
      }

      // Step 3: Text preprocessing
      progressCallback('Preprocessing text...', 50);
      const processedText = this.preprocessText(extractedText);

      // Step 4: AI parsing with fallbacks
      progressCallback('AI parsing...', 60);
      let result: EnhancedParsingResult;
      
      try {
        result = await this.callAIParser(processedText, file.name);
        if (result.success && result.data) {
          progressCallback('AI parsing successful', 90);
          result.data.key_metrics.extraction_method = extractionMethod;
          return result;
        }
      } catch (aiError) {
        console.warn('⚠️ AI parsing failed, using rule-based fallback:', aiError);
      }

      // Step 5: Rule-based fallback
      progressCallback('Using rule-based parsing...', 70);
      const fallbackResult = await this.fallbackParsing(processedText);
      const fieldConfidence = this.calculateFieldConfidence(fallbackResult);
      const atsMetrics = this.calculateATSCompatibility(fallbackResult, extractedText);
      const qualityMetrics = this.calculateContentQuality(fallbackResult, extractedText);
      
      progressCallback('Parsing completed', 100);
      
      // Phase 4: Validate extracted data quality
      const dataQuality = this.validateExtractedData(fallbackResult);
      if (dataQuality.isEmpty) {
        throw new Error(`No meaningful data extracted: ${dataQuality.reason}`);
      }
      
      return {
        success: true,
        data: {
          structured_resume: fallbackResult,
          raw_text: extractedText,
          field_confidence: fieldConfidence,
          ats_compatibility: atsMetrics,
          content_quality: qualityMetrics,
          key_metrics: {
            years_experience: this.calculateExperience(fallbackResult.work_experience),
            top_skills_matched: this.getAllSkillsArray(fallbackResult.skills).slice(0, 5),
            confidence_score: dataQuality.confidenceAdjustment, // Adjust based on data quality
            completeness_percentage: this.calculateCompleteness(fallbackResult),
            extraction_method: extractionMethod,
            data_quality: dataQuality
          }
        }
      };

    } catch (error) {
      console.error('❌ Enhanced parsing with fallbacks failed:', error);
      progressCallback('Parsing failed', 0);
      
      return {
        success: false,
        error: this.getUserFriendlyError(error.message)
      };
    }
  }

  // Phase 4: File validation
  private static validateFile(file: File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported file type. Please use PDF, DOCX, DOC, or TXT files.');
    }
    
    return true;
  }

  // Phase 4: OCR fallback for completely image-based files
  private static async extractTextWithOCRFallback(file: File): Promise<string> {
    if (file.type.includes('pdf')) {
      // For PDFs, extract as images and run OCR
      const pdfjs = await import('pdfjs-dist');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const ocrText = await this.extractTextWithOCR(page);
        fullText += ocrText + '\n';
      }
      
      return fullText;
    } else {
      // For image files, run OCR directly
      const Tesseract = (await import('tesseract.js')).default;
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      return text;
    }
  }

  // Phase 4: User-friendly error messages
  private static getUserFriendlyError(errorMessage: string): string {
    const errorMap: { [key: string]: string } = {
      'Insufficient text content': 'The file appears to be mostly images or has very little text. Please ensure your resume contains readable text.',
      'Failed to extract text from PDF': 'Unable to read the PDF file. Please try converting it to a different format or ensure it\'s not password protected.',
      'Failed to extract text from DOCX': 'Unable to read the Word document. Please try saving it in a different format.',
      'Unsupported file type': 'Please upload a PDF, Word document (DOCX/DOC), or text file.',
      'File size exceeds': 'The file is too large. Please compress it or use a smaller file (max 10MB).',
      'OCR text extraction failed': 'Could not extract text from images in your resume. Please try a text-based resume format.',
      'AI parsing failed': 'Our AI service is temporarily unavailable. We\'ve parsed your resume using our backup system.',
      'Missing OpenAI API key': 'AI parsing is temporarily unavailable. Your resume has been processed using our standard parser.'
    };
    
    for (const [key, message] of Object.entries(errorMap)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return message;
      }
    }
    
    return 'An unexpected error occurred while processing your resume. Please try again or contact support if the issue persists.';
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
    const skills = this.categorizeSkills(this.extractSkillsFromText(skillsSection + ' ' + text));

    // Extract experience
    const work_experience = this.enhanceWorkExperience(this.extractWorkExperience(text));

    // Extract education
    const education = this.enhanceEducation(this.extractEducation(text));

    return {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: this.extractLocation(text),
      summary: this.extractSummary(text),
      skills,
      work_experience,
      education,
      certifications: this.enhanceCertifications(this.extractCertifications(text)),
      projects: this.enhanceProjects(this.extractProjects(text)),
      languages: this.enhanceLanguages(this.extractLanguages(text)),
      linkedin,
      github,
      portfolio: '',
      additional_links: []
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


  // Phase 4: Validate extracted data quality
  private static validateExtractedData(resume: ParsedResumeData): {
    isEmpty: boolean;
    reason: string;
    confidenceAdjustment: number;
    suggestions: string[];
  } {
    const issues: string[] = [];
    let isEmpty = false;
    let confidenceScore = 80;
    const suggestions: string[] = [];

    // Check if basic contact info is missing
    const hasBasicInfo = resume.name.trim().length > 0 || 
                        resume.email.trim().length > 0 || 
                        resume.phone.trim().length > 0;

    if (!hasBasicInfo) {
      issues.push('No contact information found');
      confidenceScore -= 30;
      suggestions.push('Ensure your resume contains clear contact information at the top');
    }

    // Check if any substantial content exists
    const hasContent = resume.work_experience.length > 0 || 
                      resume.education.length > 0 || 
                      this.getAllSkillsArray(resume.skills).length > 0 ||
                      resume.summary.trim().length > 0;

    if (!hasContent) {
      isEmpty = true;
      issues.push('No substantial content found (no experience, education, skills, or summary)');
      suggestions.push('Check if your resume file is readable or try a different format');
      suggestions.push('If using a PDF, ensure it contains selectable text, not just images');
    }

    // Check for very short content that might indicate parsing failure
    const totalTextLength = [
      resume.name,
      resume.email,
      resume.summary,
      ...resume.work_experience.map(exp => exp.description),
      ...resume.education.map(edu => edu.degree + edu.institution)
    ].join('').length;

    if (totalTextLength < 50 && !isEmpty) {
      issues.push('Extracted content is very minimal');
      confidenceScore -= 20;
      suggestions.push('The extracted text seems very short - please verify your file contains readable content');
    }

    // Check for image-based content indicators
    if (resume.name.includes('image') || resume.summary.includes('image')) {
      issues.push('Content appears to be image-based');
      suggestions.push('Your resume may be image-based. Try using OCR or converting to a text-based format');
    }

    return {
      isEmpty,
      reason: issues.join('; '),
      confidenceAdjustment: Math.max(confidenceScore, 10),
      suggestions
    };
  }


  // Enhanced utility methods for Phase 3
  private static categorizeSkills(skillsList: string[]): CategorizedSkills {
    const skillCategories = {
      technical: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'HTML', 'CSS', 'SQL'],
      frameworks: ['React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Next.js'],
      databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'Cassandra'],
      tools: ['Git', 'Docker', 'Kubernetes', 'Jenkins', 'Figma', 'Photoshop', 'Illustrator', 'Sketch', 'InVision'],
      soft: ['Leadership', 'Communication', 'Project Management', 'Team Management', 'Problem Solving', 'Critical Thinking'],
      certifications: ['AWS', 'Azure', 'GCP', 'PMP', 'Scrum Master', 'CISSP'],
      languages: []
    };

    const result: CategorizedSkills = {
      technical: [],
      soft: [],
      languages: [],
      tools: [],
      frameworks: [],
      databases: [],
      certifications: []
    };

    skillsList.forEach(skill => {
      let categorized = false;
      for (const [category, keywords] of Object.entries(skillCategories)) {
        if (keywords.some(keyword => skill.toLowerCase().includes(keyword.toLowerCase()))) {
          result[category as keyof CategorizedSkills].push(skill);
          categorized = true;
          break;
        }
      }
      if (!categorized) {
        result.technical.push(skill); // Default to technical
      }
    });

    return result;
  }

  private static enhanceWorkExperience(experiences: any[]): ParsedResumeData['work_experience'] {
    return experiences.map(exp => ({
      ...exp,
      achievements: this.extractAchievements(exp.description || ''),
      technologies_used: this.extractTechnologies(exp.description || '')
    }));
  }

  private static enhanceEducation(education: any[]): ParsedResumeData['education'] {
    return education.map(edu => ({
      ...edu,
      gpa: '',
      relevant_coursework: [],
      honors: []
    }));
  }

  private static enhanceCertifications(certs: string[]): ParsedResumeData['certifications'] {
    return certs.map(cert => ({
      name: cert,
      issuer: '',
      date: '',
      expiry: '',
      credential_id: ''
    }));
  }

  private static enhanceProjects(projects: string[]): EnhancedProject[] {
    return projects.map(project => ({
      name: project,
      description: '',
      technologies: [],
      duration: '',
      link: '',
      role: ''
    }));
  }

  private static enhanceLanguages(languages: string[]): ParsedResumeData['languages'] {
    return languages.map(lang => ({
      language: lang,
      proficiency: 'intermediate'
    }));
  }

  private static extractAchievements(description: string): string[] {
    const achievementPatterns = [
      /increased[^.]*?(\d+%)/gi,
      /improved[^.]*?(\d+%)/gi,
      /reduced[^.]*?(\d+%)/gi,
      /saved[^.]*?\$[\d,]+/gi,
      /generated[^.]*?\$[\d,]+/gi
    ];

    const achievements: string[] = [];
    achievementPatterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) achievements.push(...matches);
    });

    return achievements;
  }

  private static extractTechnologies(description: string): string[] {
    const techKeywords = ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'MySQL', 'MongoDB'];
    return techKeywords.filter(tech => 
      description.toLowerCase().includes(tech.toLowerCase())
    );
  }

  private static getAllSkillsArray(skills: CategorizedSkills): string[] {
    return [
      ...skills.technical,
      ...skills.frameworks,
      ...skills.databases,
      ...skills.tools,
      ...skills.soft,
      ...skills.certifications
    ];
  }

  private static calculateFieldConfidence(resume: ParsedResumeData): FieldConfidence[] {
    const fields = [
      { name: 'name', weight: 10 },
      { name: 'email', weight: 10 },
      { name: 'phone', weight: 8 },
      { name: 'summary', weight: 8 },
      { name: 'work_experience', weight: 25 },
      { name: 'education', weight: 15 },
      { name: 'skills', weight: 15 }
    ];

    return fields.map(field => {
      const value = resume[field.name as keyof ParsedResumeData];
      let confidence = 0;
      let completeness = 0;
      let quality = 0;

      if (value) {
        if (typeof value === 'string' && value.trim().length > 0) {
          confidence = 90;
          completeness = 1;
          quality = value.length > 10 ? 100 : 60;
        } else if (Array.isArray(value) && value.length > 0) {
          confidence = 85;
          completeness = 1;
          quality = value.length >= 3 ? 100 : (value.length / 3) * 100;
        } else if (typeof value === 'object' && Object.keys(value).length > 0) {
          confidence = 80;
          completeness = 1;
          quality = 85;
        }
      }

      return {
        field: field.name,
        value,
        confidence,
        completeness,
        quality_score: quality
      };
    });
  }

  private static calculateATSCompatibility(resume: ParsedResumeData, rawText: string) {
    let formatScore = 0;
    formatScore += resume.name ? 20 : 0;
    formatScore += resume.email ? 20 : 0;
    formatScore += resume.work_experience?.length > 0 ? 30 : 0;
    formatScore += resume.education?.length > 0 ? 20 : 0;
    formatScore += this.getAllSkillsArray(resume.skills).length > 0 ? 10 : 0;

    const keywordDensity = Math.min((rawText.split(' ').length / 100) * 5, 100);
    const sectionCompleteness = 85; // Assume good completeness

    return {
      score: Math.round((formatScore + keywordDensity + sectionCompleteness) / 3),
      keyword_density: Math.round(keywordDensity),
      format_score: formatScore,
      section_completeness: sectionCompleteness
    };
  }

  private static calculateContentQuality(resume: ParsedResumeData, rawText: string) {
    const avgDescLength = resume.work_experience?.reduce((acc, exp) => 
      acc + (exp.description?.length || 0), 0) / (resume.work_experience?.length || 1);
    
    const detailLevel = Math.min((avgDescLength / 100) * 100, 100);
    const achievementKeywords = ['increased', 'improved', 'reduced', 'achieved', 'delivered'];
    const achievementFocus = achievementKeywords.reduce((acc, keyword) => 
      acc + (rawText.toLowerCase().includes(keyword) ? 1 : 0), 0) * 20;

    return {
      overall_score: Math.round((80 + detailLevel + achievementFocus) / 3),
      grammar_score: 80,
      detail_level: Math.round(detailLevel),
      achievement_focus: Math.min(Math.round(achievementFocus), 100)
    };
  }

  private static calculateCompleteness(resume: ParsedResumeData): number {
    const requiredFields = ['name', 'email', 'work_experience', 'education'];
    const presentFields = requiredFields.filter(field => {
      const value = resume[field as keyof ParsedResumeData];
      return value && (typeof value === 'string' ? value.trim().length > 0 : 
                      Array.isArray(value) ? value.length > 0 : true);
    });
    
    return Math.round((presentFields.length / requiredFields.length) * 100);
  }
}

/**
 * Enhanced resume text extraction service
 * Handles PDF, DOCX, and TXT files with better text extraction using proper libraries
 */

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export class ResumeTextExtractor {
  /**
   * Extract text from various file formats
   */
  async extractText(file: File): Promise<string> {
    console.log(`Extracting text from ${file.type}: ${file.name}`);
    
    try {
      switch (file.type) {
        case 'application/pdf':
          return await this.extractFromPDF(file);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          return await this.extractFromDOCX(file);
        case 'text/plain':
          return await this.extractFromTXT(file);
        default:
          throw new Error(`Unsupported file type: ${file.type}`);
      }
    } catch (error) {
      console.error('Text extraction failed:', error);
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF files
   * Uses pdfjs-dist for proper PDF text extraction with enhanced handling
   */
  private async extractFromPDF(file: File): Promise<string> {
    try {
      console.log('Starting enhanced PDF extraction with pdfjs-dist...');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
        disableFontFace: false,
        standardFontDataUrl: '//unpkg.com/pdfjs-dist@3.11.174/standard_fonts/'
      }).promise;
      
      let text = '';
      let totalWords = 0;
      
      console.log(`PDF has ${pdf.numPages} pages`);
      
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Enhanced text extraction with positioning
          const textItems = textContent.items.map((item: any) => {
            let extractedText = '';
            if (typeof item === 'string') {
              extractedText = item;
            } else if (item && typeof item.str === 'string') {
              extractedText = item.str;
            } else if (item && typeof item.text === 'string') {
              extractedText = item.text;
            }
            
            return {
              text: extractedText.trim(),
              x: item.transform?.[4] || 0,
              y: item.transform?.[5] || 0,
              width: item.width || 0,
              height: item.height || 0
            };
          }).filter(item => item.text.length > 0);
          
          // Sort by position (top to bottom, left to right)
          textItems.sort((a, b) => {
            const yDiff = Math.abs(a.y - b.y);
            if (yDiff < 5) { // Same line
              return a.x - b.x;
            }
            return b.y - a.y; // Top to bottom
          });
          
          const pageText = textItems.map(item => item.text).join(' ');
          const wordCount = pageText.split(/\s+/).filter(w => w.length > 0).length;
          totalWords += wordCount;
          
          if (pageText.trim()) {
            text += pageText + '\n\n';
          }
          
          console.log(`Page ${i}: extracted ${wordCount} words`);
        } catch (pageError) {
          console.warn(`Error extracting page ${i}:`, pageError.message);
          continue;
        }
      }
      
      const cleanedText = this.cleanText(text);
      console.log(`PDF extraction complete. Extracted ${cleanedText.length} characters, ${totalWords} words`);
      
      // More lenient validation - check for meaningful content
      if (cleanedText.length < 100 || totalWords < 20) {
        console.warn('PDF extraction yielded minimal text content');
        // Still return what we extracted rather than fallback
        return cleanedText || `[PDF parsing incomplete] File: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
      }
      
      return cleanedText;
      
    } catch (error) {
      console.error('PDF extraction failed:', error);
      // Return a helpful error message that AI can work with
      return `[PDF extraction error] File: ${file.name}, Size: ${(file.size / 1024).toFixed(1)}KB, Error: ${error.message}. Please try OCR processing or re-upload in a different format.`;
    }
  }


  /**
   * Extract text from DOCX files using mammoth library with enhanced options
   */
  private async extractFromDOCX(file: File): Promise<string> {
    try {
      console.log('Starting enhanced DOCX extraction with mammoth...');
      const arrayBuffer = await file.arrayBuffer();
      
      // Extract both raw text and structured content
      const [rawResult, htmlResult] = await Promise.all([
        mammoth.extractRawText({ arrayBuffer }),
        mammoth.convertToHtml({ arrayBuffer })
      ]);
      
      let extractedText = rawResult.value.trim();
      const wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length;
      
      console.log(`DOCX extraction complete. Extracted ${extractedText.length} characters, ${wordCount} words`);
      
      // If raw text is minimal, try to extract from HTML structure
      if (extractedText.length < 100 || wordCount < 20) {
        console.log('Raw text minimal, attempting HTML structure extraction...');
        const htmlText = htmlResult.value
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (htmlText.length > extractedText.length) {
          extractedText = htmlText;
          console.log(`Enhanced extraction yielded ${extractedText.length} characters`);
        }
      }
      
      if (extractedText.length < 50) {
        console.warn('DOCX extraction yielded minimal text even after enhancement');
        return `[DOCX parsing incomplete] File: ${file.name} (${(file.size / 1024).toFixed(1)}KB). Document may contain images or complex formatting.`;
      }
      
      return this.cleanText(extractedText);
      
    } catch (error) {
      console.error('DOCX extraction failed:', error);
      return `[DOCX extraction error] File: ${file.name}, Size: ${(file.size / 1024).toFixed(1)}KB, Error: ${error.message}. Please try a different format.`;
    }
  }


  /**
   * Extract text from TXT files
   */
  private async extractFromTXT(file: File): Promise<string> {
    try {
      console.log('Starting TXT extraction...');
      const text = await file.text();
      console.log(`TXT extraction complete. Extracted ${text.length} characters`);
      return text.trim();
    } catch (error) {
      console.error('TXT extraction failed:', error);
      throw new Error(`Failed to extract text from TXT: ${error.message}`);
    }
  }

  /**
   * Validate extracted text quality with enhanced metrics
   */
  isValidText(text: string): boolean {
    if (!text || text.length < 10) {
      return false;
    }
    
    // Enhanced validation metrics
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    
    // Check for resume indicators
    const resumeIndicators = /\b(experience|education|skills|work|university|company|project|certification|achievement)\b/i;
    const hasResumeContent = resumeIndicators.test(text);
    
    // Check for contact information
    const hasEmail = /@/.test(text);
    const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
    const hasContactInfo = hasEmail || hasPhone;
    
    // More lenient validation - accept if we have meaningful content
    const minWords = Math.max(10, words.length * 0.1); // At least 10 unique words or 10% of total
    const hasMinimumWords = uniqueWords.size >= minWords;
    
    return hasMinimumWords && (hasResumeContent || hasContactInfo || text.length > 200);
  }

  /**
   * Calculate text extraction quality score
   */
  getExtractionQuality(text: string): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;

    if (!text || text.length < 50) {
      issues.push('Very short text extracted');
      score -= 40;
    }

    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 20) {
      issues.push('Low word count');
      score -= 20;
    }

    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    if (uniqueWords.size < 10) {
      issues.push('Low vocabulary diversity');
      score -= 15;
    }

    if (!/\b(experience|education|skills|work)\b/i.test(text)) {
      issues.push('Missing typical resume sections');
      score -= 15;
    }

    if (!/@/.test(text) && !/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) {
      issues.push('No contact information detected');
      score -= 10;
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * Clean and structure extracted text for better AI parsing
   */
  cleanText(text: string): string {
    return text
      .replace(/\x00+/g, ' ') // Remove null characters
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Keep only printable ASCII + whitespace
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .replace(/\t+/g, ' ') // Convert tabs to spaces
      .replace(/(\r\n|\r)/g, '\n') // Normalize line endings
      .trim();
  }

  /**
   * Enhanced text preprocessing for better AI extraction
   */
  preprocessForAI(text: string): string {
    const cleaned = this.cleanText(text);
    
    // Add section markers if they're missing
    let enhanced = cleaned;
    
    // Common section headers that might be missing proper formatting
    const sectionPatterns = [
      { pattern: /\b(summary|profile|objective)\b/gi, replacement: '\n\nSUMMARY:\n' },
      { pattern: /\b(experience|employment|work history)\b/gi, replacement: '\n\nEXPERIENCE:\n' },
      { pattern: /\b(education|academic)\b/gi, replacement: '\n\nEDUCATION:\n' },
      { pattern: /\b(skills|competencies|technical skills)\b/gi, replacement: '\n\nSKILLS:\n' },
      { pattern: /\b(certifications|certificates)\b/gi, replacement: '\n\nCERTIFICATIONS:\n' },
      { pattern: /\b(projects|portfolio)\b/gi, replacement: '\n\nPROJECTS:\n' }
    ];

    // Only apply section markers if the text doesn't already have clear structure
    if (!enhanced.includes('SUMMARY:') && !enhanced.includes('EXPERIENCE:')) {
      sectionPatterns.forEach(({ pattern, replacement }) => {
        enhanced = enhanced.replace(pattern, replacement);
      });
    }

    return enhanced;
  }
}
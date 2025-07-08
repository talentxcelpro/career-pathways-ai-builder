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
   * Uses pdfjs-dist for proper PDF text extraction
   */
  private async extractFromPDF(file: File): Promise<string> {
    try {
      console.log('Starting PDF extraction with pdfjs-dist...');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      
      console.log(`PDF has ${pdf.numPages} pages`);
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => {
            // Handle different item types that might have text
            if (typeof item === 'string') return item;
            if (item && typeof item.str === 'string') return item.str;
            if (item && typeof item.text === 'string') return item.text;
            return '';
          })
          .filter(str => str.trim().length > 0)
          .join(' ');
        
        if (pageText.trim()) {
          text += pageText + '\n\n';
        }
      }
      
      const cleanedText = text.trim();
      console.log(`PDF extraction complete. Extracted ${cleanedText.length} characters`);
      
      if (cleanedText.length < 50) {
        console.warn('PDF extraction yielded minimal text, using fallback message');
        return `PDF Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)}KB\nThis PDF may contain images or complex formatting. Please verify extracted content.`;
      }
      
      return cleanedText;
      
    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }


  /**
   * Extract text from DOCX files using mammoth library
   */
  private async extractFromDOCX(file: File): Promise<string> {
    try {
      console.log('Starting DOCX extraction with mammoth...');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      const extractedText = result.value.trim();
      console.log(`DOCX extraction complete. Extracted ${extractedText.length} characters`);
      
      if (extractedText.length < 50) {
        console.warn('DOCX extraction yielded minimal text');
        return `DOCX Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)}KB\nDocument may be empty or contain primarily images.`;
      }
      
      return extractedText;
      
    } catch (error) {
      console.error('DOCX extraction failed:', error);
      throw new Error(`Failed to extract text from DOCX: ${error.message}`);
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
   * Validate extracted text quality
   */
  isValidText(text: string): boolean {
    if (!text || text.length < 10) {
      return false;
    }
    
    // Check if text has reasonable word distribution
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    
    // Should have at least 10 unique words for a valid resume
    return uniqueWords.size >= 10;
  }

  /**
   * Clean extracted text
   */
  cleanText(text: string): string {
    return text
      .replace(/\x00+/g, ' ') // Remove null characters
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Keep only printable ASCII + whitespace
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
  }
}
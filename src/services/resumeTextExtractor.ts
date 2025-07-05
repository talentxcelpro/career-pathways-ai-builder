/**
 * Enhanced resume text extraction service
 * Handles PDF, DOCX, and TXT files with better text extraction
 */

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
   * Uses FileReader to get basic text content
   */
  private async extractFromPDF(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const text = this.extractTextFromPDFBuffer(arrayBuffer);
          
          if (text.length < 20) {
            // If extraction is poor, return file info for AI to process
            resolve(`PDF Document: ${file.name}\nThis PDF requires AI processing for text extraction.`);
          } else {
            resolve(text);
          }
        } catch (error) {
          console.error('PDF reading error:', error);
          resolve(`PDF Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)}KB\nContent requires AI processing.`);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Basic PDF text extraction from buffer
   */
  private extractTextFromPDFBuffer(buffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(buffer);
    let text = '';
    
    // Convert to string and look for text patterns
    const str = new TextDecoder('latin1').decode(uint8Array);
    
    // Basic PDF text extraction - look for text between parentheses and brackets
    const textRegex = /\(([^)]+)\)/g;
    let match;
    
    while ((match = textRegex.exec(str)) !== null) {
      text += match[1] + ' ';
    }
    
    // Also try to find plain text patterns
    const plainTextRegex = /[A-Za-z0-9@.\-\s]{10,}/g;
    const plainMatches = str.match(plainTextRegex);
    
    if (plainMatches) {
      text += plainMatches.join(' ');
    }
    
    return text.trim();
  }

  /**
   * Extract text from DOCX files
   */
  private async extractFromDOCX(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const text = this.extractTextFromDOCXBuffer(arrayBuffer);
          resolve(text || `DOCX Document: ${file.name}\nRequires AI processing for text extraction.`);
        } catch (error) {
          console.error('DOCX reading error:', error);
          resolve(`DOCX Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)}KB`);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read DOCX file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Basic DOCX text extraction
   */
  private extractTextFromDOCXBuffer(buffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(buffer);
    let text = '';
    
    // Convert to string for text pattern matching
    const str = new TextDecoder('utf-8', { ignoreBOM: true }).decode(uint8Array);
    
    // Look for XML text content patterns typical in DOCX
    const xmlTextRegex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
    let match;
    
    while ((match = xmlTextRegex.exec(str)) !== null) {
      text += match[1] + ' ';
    }
    
    // Also try simpler text patterns
    if (text.length < 50) {
      const simpleTextRegex = /[A-Za-z0-9@.\s\-,()]{15,}/g;
      const matches = str.match(simpleTextRegex);
      if (matches) {
        text = matches.join(' ');
      }
    }
    
    // Clean up extracted text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .trim();
    
    return text;
  }

  /**
   * Extract text from TXT files
   */
  private async extractFromTXT(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const text = event.target?.result as string;
        resolve(text || '');
      };
      
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
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
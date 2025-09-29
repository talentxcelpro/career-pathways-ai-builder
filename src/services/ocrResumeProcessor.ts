// Tesseract.js loaded dynamically to prevent memory issues
// import { createWorker } from 'tesseract.js';
import { EnhancedResumeProcessor, EnhancedResumeData } from './enhancedResumeProcessor';

export class OCRResumeProcessor extends EnhancedResumeProcessor {
  private ocrWorker: any = null;

  async initializeOCR(): Promise<void> {
    if (this.ocrWorker) return;
    
    console.log('Initializing OCR worker...');
    const { createWorker } = await import('tesseract.js');
    this.ocrWorker = await createWorker('eng');
    console.log('OCR worker initialized successfully');
  }

  async processResumeWithOCR(file: File, onProgress?: (progress: number, status: string) => void): Promise<EnhancedResumeData> {
    console.log('Starting OCR-enhanced resume processing for:', file.name);
    
    try {
      // Try standard processing first
      onProgress?.(10, 'Attempting standard text extraction...');
      
      try {
        const result = await this.processResume(file);
        
        // Check if extraction was successful
        const hasContent = result.personalInfo?.fullName || 
                          result.experience?.length > 0 || 
                          result.education?.length > 0;
        
        if (hasContent) {
          console.log('Standard processing successful, skipping OCR');
          onProgress?.(100, 'Processing complete');
          return result;
        }
      } catch (error) {
        console.log('Standard processing failed, falling back to OCR:', error.message);
      }

      // Fall back to OCR processing
      onProgress?.(20, 'Standard extraction failed, initializing OCR...');
      await this.initializeOCR();
      
      onProgress?.(40, 'Performing OCR text recognition...');
      const ocrText = await this.performOCRExtraction(file, onProgress);
      
      onProgress?.(70, 'Processing OCR text with AI...');
      const enhancedText = this.enhanceOCRText(ocrText);
      
      // Process with enhanced AI using OCR text
      const parsedData = await this.performAIExtraction(enhancedText, file.name, file.type);
      
      onProgress?.(90, 'Finalizing OCR results...');
      const result = await this.postProcessExtraction(parsedData, file);
      
      // Mark as OCR-processed
      result.metadata = {
        ...result.metadata,
        extractionMethod: 'OCR + AI',
        processingVersion: result.metadata.processingVersion + ' + OCR'
      };

      onProgress?.(100, 'OCR processing complete');
      return result;
      
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  private async performOCRExtraction(file: File, onProgress?: (progress: number, status: string) => void): Promise<string> {
    console.log('Performing OCR extraction on file:', file.name);
    
    // Convert file to image if it's a PDF
    let imageFile = file;
    
    if (file.type === 'application/pdf') {
      onProgress?.(45, 'Converting PDF to image for OCR...');
      imageFile = await this.convertPdfToImage(file);
    }

    // Perform OCR
    onProgress?.(50, 'Running OCR analysis...');
    const { data: { text, confidence } } = await this.ocrWorker.recognize(imageFile, {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          const progress = Math.round(50 + (m.progress * 15)); // 50-65% range
          onProgress?.(progress, `OCR progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    console.log(`OCR completed with confidence: ${confidence}`);
    console.log(`Extracted text length: ${text.length}`);
    
    if (confidence < 60) {
      console.warn('Low OCR confidence detected, text may contain errors');
    }

    return text;
  }

  private async convertPdfToImage(file: File): Promise<File> {
    // For now, return the original file and let OCR handle it
    // In a full implementation, you'd use pdf-poppler or similar
    return file;
  }

  private enhanceOCRText(text: string): string {
    console.log('Enhancing OCR text quality...');
    
    return text
      // Fix common OCR errors
      .replace(/[|l1I]/g, 'I') // Fix vertical lines to I
      .replace(/0/g, 'O') // Fix zeros to O in names/words
      .replace(/\b[0O]f\b/g, 'of') // Fix "0f" to "of"
      .replace(/\b[Il]\s/g, 'I ') // Fix lowercase l to I at word start
      .replace(/rn/g, 'm') // Fix rn to m
      .replace(/\bAncl\b/g, 'And') // Fix "Ancl" to "And"
      
      // Enhance structure
      .replace(/^([A-Z\s]{3,})$/gm, '\n=== $1 ===\n') // Mark section headers
      .replace(/^\s*([•·\-\*]|\d+\.)\s*/gm, '\n• ') // Normalize bullet points
      
      // Preserve important patterns
      .replace(/(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/g, '\nEMAIL: $1\n')
      .replace(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g, '\nPHONE: $1\n')
      .replace(/(\b\d{1,2}[\/\-]\d{4}\b|\b\d{4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4}\b)/gi, '\nDATE: $1\n')
      
      // Clean up
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private calculateOCRConfidence(text: string): number {
    // Simple heuristic to calculate OCR confidence
    const indicators = {
      hasEmail: /@/.test(text),
      hasPhone: /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text),
      hasDate: /\d{4}/.test(text),
      hasCommonWords: /\b(experience|education|skills|work|university|company)\b/i.test(text),
      hasProperCase: /[A-Z][a-z]+/.test(text),
      notTooManyNumbers: (text.match(/\d/g) || []).length < text.length * 0.3
    };

    const score = Object.values(indicators).filter(Boolean).length;
    return Math.min(100, (score / Object.keys(indicators).length) * 100);
  }

  async cleanup(): Promise<void> {
    if (this.ocrWorker) {
      console.log('Cleaning up OCR worker...');
      await this.ocrWorker.terminate();
      this.ocrWorker = null;
    }
  }
}
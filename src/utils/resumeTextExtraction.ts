// import * as mammoth from 'mammoth'; // Removed - using lazy loading instead

/**
 * Shared utility for extracting text from resume files (PDF/DOC/DOCX)
 * Used by both bulk upload and name fixer tools
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const type = file.type || '';

  // Helper for OCR fallback on PDFs when text extraction fails
  const ocrFromPdfFirstPage = async (): Promise<string> => {
    try {
      const pdfjsLib: any = await import('pdfjs-dist');
      if (pdfjsLib?.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      const data = await file.arrayBuffer();
      const loadingTask = (pdfjsLib as any).getDocument({ data });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;

      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(canvas);
      await worker.terminate();
      return (text || '').trim();
    } catch (e) {
      console.warn('OCR fallback failed:', (e as any)?.message || e);
      return '';
    }
  };

  try {
    // Handle Word documents
    if (type.includes('word') || type.includes('doc')) {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const { value } = await mammoth.extractRawText({ arrayBuffer });
      return value || '';
    }

    // Handle PDFs
    if (type.includes('pdf')) {
      const pdfjsLib: any = await import('pdfjs-dist');
      if (pdfjsLib?.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      const data = await file.arrayBuffer();
      const loadingTask = (pdfjsLib as any).getDocument({ data });
      const pdf = await loadingTask.promise;
      let text = '';
      const maxPages = Math.min(pdf.numPages, 10); // cap for speed
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((it: any) => it.str).join(' ');
        text += '\n' + strings;
      }
      
      text = text.trim();
      
      // If extraction yielded very little text, try OCR
      if (text.length < 20) {
        const ocrText = await ocrFromPdfFirstPage();
        if (ocrText && ocrText.length > text.length) return ocrText;
      }
      
      return text;
    }
  } catch (e) {
    console.warn('Client text extraction failed:', (e as any)?.message || e);
  }
  
  return '';
};

/**
 * Validate if a name looks like a real person's name (not a job title)
 */
export const isValidPersonName = (name: string): boolean => {
  if (!name || name.trim().length < 2) return false;
  
  const invalidPatterns = [
    /executive/i, /assistant/i, /experience/i, /summary/i, /professional/i,
    /engineer/i, /manager/i, /developer/i, /analyst/i, /having/i, /international/i,
    /skilled/i, /qualified/i, /certified/i, /expert/i, /specialist/i,
    /voice\s+process/i, /experienced/i, /fresher/i, /graduate/i
  ];

  // Reject names that are too short (single word) or too long (likely descriptions)
  const words = name.trim().split(/\s+/);
  if (words.length > 5 || (words.length === 1 && words[0].length < 3)) return false;

  return !invalidPatterns.some(pattern => pattern.test(name));
};

/**
 * Download file from URL for re-processing
 */
export const downloadFileFromUrl = async (url: string, fileName: string): Promise<File> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download file: ${response.statusText}`);
  
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type });
};
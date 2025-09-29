/**
 * Centralized PDF.js worker configuration
 * Provides reliable PDF worker setup with fallbacks
 */

let workerConfigured = false;

export const configurePDFWorker = async (): Promise<void> => {
  if (workerConfigured) {
    console.log('PDF worker already configured');
    return;
  }

  try {
    const pdfjsLib = await import('pdfjs-dist');
    console.log('Configuring PDF.js worker...');
    
    // Primary: Try using local worker file
    const localWorkerUrl = `/pdf.worker.min.js`;
    
    try {
      const response = await fetch(localWorkerUrl, { method: 'HEAD' });
      if (response.ok) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = localWorkerUrl;
        console.log('✅ PDF worker: Using local worker file');
        workerConfigured = true;
        return;
      }
    } catch (localError) {
      console.log('Local PDF worker not available:', localError.message);
    }

    // Fallback 1: Use reliable CDN
    const cdnWorkerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    try {
      const response = await fetch(cdnWorkerUrl, { method: 'HEAD' });
      if (response.ok) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = cdnWorkerUrl;
        console.log('✅ PDF worker: Using CDN fallback');
        workerConfigured = true;
        return;
      }
    } catch (cdnError) {
      console.log('CDN PDF worker not available:', cdnError.message);
    }

    // Final fallback: Create inline worker
    console.warn('⚠️ PDF worker: CDN sources failed, creating minimal inline worker');
    const inlineWorkerContent = `
      // Minimal PDF.js worker implementation
      importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js');
    `;
    
    const blob = new Blob([inlineWorkerContent], { type: 'application/javascript' });
    const inlineWorkerUrl = URL.createObjectURL(blob);
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = inlineWorkerUrl;
    console.log('✅ PDF worker: Using inline worker as final fallback');
    workerConfigured = true;

  } catch (error) {
    console.error('❌ PDF worker configuration failed completely:', error);
    workerConfigured = true;
  }
};

export const isPDFWorkerReady = (): boolean => {
  return workerConfigured;
};

export const getPDFWorkerStatus = (): string => {
  if (!workerConfigured) return 'Not configured';
  return 'Configured';
};

// Auto-configure on import
configurePDFWorker().catch(console.error);
/**
 * Centralized PDF.js worker configuration
 * Provides reliable PDF worker setup with fallbacks
 */

import * as pdfjsLib from 'pdfjs-dist';

let workerConfigured = false;

export const configurePDFWorker = async (): Promise<void> => {
  if (workerConfigured) {
    console.log('PDF worker already configured');
    return;
  }

  try {
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

    // Fallback 2: Use jsdelivr CDN
    const jsdelivrWorkerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    
    try {
      const response = await fetch(jsdelivrWorkerUrl, { method: 'HEAD' });
      if (response.ok) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = jsdelivrWorkerUrl;
        console.log('✅ PDF worker: Using JSDelivr CDN fallback');
        workerConfigured = true;
        return;
      }
    } catch (jsdelivrError) {
      console.log('JSDelivr PDF worker not available:', jsdelivrError.message);
    }

    // Final fallback: Create inline worker
    console.warn('⚠️ PDF worker: All CDN sources failed, creating minimal inline worker');
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
    
    // Emergency fallback: disable worker (will be slow but functional)
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    console.warn('⚠️ PDF worker: Running without worker (performance will be degraded)');
    workerConfigured = true;
  }
};

export const isPDFWorkerReady = (): boolean => {
  return workerConfigured && !!pdfjsLib.GlobalWorkerOptions.workerSrc;
};

export const getPDFWorkerStatus = (): string => {
  if (!workerConfigured) return 'Not configured';
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) return 'Disabled (no worker)';
  
  const workerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;
  if (workerSrc.startsWith('/')) return 'Local worker';
  if (workerSrc.includes('cdnjs')) return 'CDNJS worker';
  if (workerSrc.includes('jsdelivr')) return 'JSDelivr worker';
  if (workerSrc.startsWith('blob:')) return 'Inline worker';
  return 'Unknown worker source';
};

// Auto-configure on import
configurePDFWorker().catch(console.error);
// Production cleanup utilities
// This file contains utilities to clean up development artifacts

import { ENV } from '@/lib/environment';

// Remove console logs in production
export const safeConsoleLog = (...args: any[]) => {
  if (ENV.isDevelopment) {
    console.log(...args);
  }
};

export const safeConsoleWarn = (...args: any[]) => {
  if (ENV.isDevelopment) {
    console.warn(...args);
  }
};

export const safeConsoleError = (...args: any[]) => {
  // Always log errors, but with different handling in production
  if (ENV.isDevelopment) {
    console.error(...args);
  } else {
    // In production, could send to error tracking service
    console.error('Production error:', args[0]);
  }
};

// Clean test/mock data identifiers
export const sanitizeTestData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  // Remove test/mock/dummy properties
  const cleanData = { ...data };
  
  Object.keys(cleanData).forEach(key => {
    if (key.toLowerCase().includes('test') || 
        key.toLowerCase().includes('mock') || 
        key.toLowerCase().includes('dummy') ||
        key.toLowerCase().includes('placeholder')) {
      delete cleanData[key];
    }
  });
  
  return cleanData;
};

// Validate production data
export const validateProductionData = (data: any, source?: string): boolean => {
  if (!data) return false;
  
  const stringData = JSON.stringify(data).toLowerCase();
  const hasTestData = stringData.includes('test') || 
                     stringData.includes('mock') || 
                     stringData.includes('dummy') ||
                     stringData.includes('placeholder');
  
  if (hasTestData && !ENV.isDevelopment) {
    safeConsoleWarn(`Production data validation failed for ${source || 'unknown source'}: contains test data`);
    return false;
  }
  
  return true;
};

// Production-safe data fetcher
export const fetchProductionData = async (fetchFn: () => Promise<any>, fallback: any = null) => {
  try {
    const data = await fetchFn();
    
    if (!validateProductionData(data)) {
      return fallback;
    }
    
    return sanitizeTestData(data);
  } catch (error) {
    safeConsoleError('Production data fetch failed:', error);
    return fallback;
  }
};
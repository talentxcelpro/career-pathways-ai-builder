import { useState, useCallback } from 'react';
import { validateVideoUrl, validateVideoUrls } from '@/utils/videoValidation';

export const useVideoValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    valid: string[];
    invalid: Array<{ url: string; reason: string }>;
  } | null>(null);

  const validateSingleUrl = useCallback(async (url: string) => {
    setIsValidating(true);
    try {
      const result = await validateVideoUrl(url);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateMultipleUrls = useCallback(async (urls: string[]) => {
    setIsValidating(true);
    try {
      const results = await validateVideoUrls(urls);
      setValidationResults(results);
      return results;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setValidationResults(null);
  }, []);

  return {
    isValidating,
    validationResults,
    validateSingleUrl,
    validateMultipleUrls,
    clearResults
  };
};
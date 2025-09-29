import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  input_length: number;
  validated_at: string;
}

interface SecurityValidationOptions {
  inputType?: 'general' | 'email' | 'url' | 'phone' | 'alphanumeric';
  maxLength?: number;
  allowHtml?: boolean;
  autoSanitize?: boolean;
}

export const useSecurityValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateInput = useCallback(async (
    input: string,
    options: SecurityValidationOptions = {}
  ): Promise<ValidationResult | null> => {
    const {
      inputType = 'general',
      maxLength = 1000,
      allowHtml = false,
      autoSanitize = true
    } = options;

    if (!input) {
      return {
        valid: false,
        errors: ['Input cannot be empty'],
        warnings: [],
        input_length: 0,
        validated_at: new Date().toISOString()
      };
    }

    setIsValidating(true);

    try {
      // Call enhanced validation function
      const { data, error } = await supabase.rpc('validate_user_input_enhanced', {
        input_text: input,
        input_type: inputType,
        max_length: maxLength,
        allow_html: allowHtml
      });

      if (error) {
        console.error('Validation error:', error);
        toast({
          title: "Validation Error",
          description: "Failed to validate input. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      const result = data as ValidationResult;

      // Show warnings to user if any
      if (result.warnings && result.warnings.length > 0) {
        toast({
          title: "Input Warnings",
          description: result.warnings.join(', '),
          variant: "default",
        });
      }

      // Show errors if validation failed
      if (!result.valid && result.errors && result.errors.length > 0) {
        toast({
          title: "Input Validation Failed",
          description: result.errors.join(', '),
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Error",
        description: "Failed to validate input. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  const sanitizeHtml = useCallback((html: string): string => {
    // Basic HTML sanitization - remove dangerous elements and attributes
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .replace(/<link\b[^>]*>/gi, '')
      .replace(/<meta\b[^>]*>/gi, '');
  }, []);

  const validateAndSanitize = useCallback(async (
    input: string,
    options: SecurityValidationOptions = {}
  ): Promise<{ valid: boolean; sanitizedInput: string; errors: string[] }> => {
    const validation = await validateInput(input, options);
    
    if (!validation) {
      return {
        valid: false,
        sanitizedInput: input,
        errors: ['Validation failed']
      };
    }

    let sanitizedInput = input;
    
    if (options.autoSanitize !== false && options.allowHtml) {
      sanitizedInput = sanitizeHtml(input);
    }

    return {
      valid: validation.valid,
      sanitizedInput,
      errors: validation.errors || []
    };
  }, [validateInput, sanitizeHtml]);

  return {
    validateInput,
    validateAndSanitize,
    sanitizeHtml,
    isValidating
  };
};
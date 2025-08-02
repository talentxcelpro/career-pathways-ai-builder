import { useCallback, useState } from 'react';
import { validateInput, authRateLimiter, formRateLimiter } from '@/utils/sanitize';
import { useSecurityContext } from '@/components/security/SecurityProvider';

interface ValidationOptions {
  type?: 'email' | 'phone' | 'url' | 'text' | 'password';
  maxLength?: number;
  required?: boolean;
  rateLimitKey?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

export const useSecurityValidation = () => {
  const { logSecurityEvent } = useSecurityContext();
  const [isValidating, setIsValidating] = useState(false);

  const validateSecurely = useCallback(async (
    value: string,
    fieldName: string,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      const {
        type = 'text',
        maxLength = 1000,
        required = false,
        rateLimitKey,
        severity = 'medium'
      } = options;

      // Check required field validation
      if (required && (!value || value.trim().length === 0)) {
        return {
          isValid: false,
          error: `${fieldName} is required`
        };
      }

      // Skip validation for empty optional fields
      if (!required && (!value || value.trim().length === 0)) {
        return {
          isValid: true,
          sanitizedValue: ''
        };
      }

      // Rate limiting check
      if (rateLimitKey) {
        const rateLimitResult = formRateLimiter.checkRateLimit(rateLimitKey);
        if (!rateLimitResult.allowed) {
          await logSecurityEvent('rate_limit_exceeded', `Rate limit exceeded for ${fieldName}`, {
            fieldName,
            rateLimitKey,
            severity: 'high'
          });
          
          return {
            isValid: false,
            error: `Too many attempts. Please try again later.`
          };
        }
      }

      // Enhanced input validation
      const validation = validateInput(value, type, maxLength);
      
      if (!validation.isValid) {
        // Log validation failure for security monitoring
        await logSecurityEvent('input_validation_failed', 
          `Input validation failed for ${fieldName}: ${validation.error}`, {
          fieldName,
          validationType: type,
          severity,
          errorType: validation.error
        });

        return {
          isValid: false,
          error: validation.error
        };
      }

      // Additional server-side validation for critical fields
      if (['email', 'password'].includes(type)) {
        try {
          // This would call the database validation function we created
          // For now, we'll implement client-side validation
          const serverValidation = await validateOnServer(value, type);
          if (!serverValidation.isValid) {
            return serverValidation;
          }
        } catch (error) {
          console.error('Server validation error:', error);
          // Continue with client-side validation if server fails
        }
      }

      return {
        isValid: true,
        sanitizedValue: value.trim()
      };

    } catch (error) {
      console.error('Security validation error:', error);
      
      await logSecurityEvent('validation_system_error', 
        `Security validation system error for ${fieldName}`, {
        fieldName,
        error: error instanceof Error ? error.message : 'Unknown error',
        severity: 'critical'
      });

      return {
        isValid: false,
        error: 'Validation system error. Please try again.'
      };
    } finally {
      setIsValidating(false);
    }
  }, [logSecurityEvent]);

  // Batch validation for multiple fields
  const validateMultiple = useCallback(async (
    fields: Array<{ value: string; name: string; options?: ValidationOptions }>
  ): Promise<{ isValid: boolean; errors: Record<string, string>; sanitizedValues: Record<string, string> }> => {
    const errors: Record<string, string> = {};
    const sanitizedValues: Record<string, string> = {};

    for (const field of fields) {
      const result = await validateSecurely(field.value, field.name, field.options);
      
      if (!result.isValid) {
        errors[field.name] = result.error || 'Validation failed';
      } else {
        sanitizedValues[field.name] = result.sanitizedValue || '';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedValues
    };
  }, [validateSecurely]);

  // Authentication-specific validation with enhanced security
  const validateAuthInput = useCallback(async (
    email: string,
    password: string,
    userIdentifier: string = 'unknown'
  ): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
    // Check auth rate limiting
    const authLimit = authRateLimiter.checkRateLimit(userIdentifier);
    if (!authLimit.allowed) {
      await logSecurityEvent('auth_rate_limit_exceeded', 
        `Authentication rate limit exceeded`, {
        userIdentifier,
        severity: 'high'
      });

      return {
        isValid: false,
        errors: {
          general: 'Too many authentication attempts. Please try again later.'
        }
      };
    }

    const result = await validateMultiple([
      {
        value: email,
        name: 'email',
        options: { type: 'email', required: true, severity: 'high' }
      },
      {
        value: password,
        name: 'password',
        options: { type: 'password', required: true, severity: 'high' }
      }
    ]);

    return {
      isValid: result.isValid,
      errors: result.errors
    };
  }, [validateMultiple, logSecurityEvent]);

  return {
    validateSecurely,
    validateMultiple,
    validateAuthInput,
    isValidating
  };
};

// Helper function for server-side validation
async function validateOnServer(value: string, type: string): Promise<ValidationResult> {
  // This would integrate with the validate_user_input function we created in the database
  // For now, return a successful validation
  return { isValid: true };
}
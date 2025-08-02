import DOMPurify from 'dompurify';

/**
 * Enhanced HTML sanitization with stricter security controls
 * @param html - The HTML string to sanitize
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string, options?: any): string => {
  const defaultOptions: any = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'a', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'target', 'rel'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    FORBID_TAGS: ['script', 'object', 'embed', 'base', 'form', 'input', 'textarea', 'button', 'iframe', 'frame'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'style', 'class', 'id'],
    KEEP_CONTENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
    SANITIZE_DOM: true,
    SAFE_FOR_TEMPLATES: true
  };

  const config = { ...defaultOptions, ...options };
  
  // Additional validation before processing
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Check for suspicious patterns that might bypass DOMPurify
  const suspiciousPatterns = [
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /data:image\/svg\+xml/i,
    /<svg[^>]*>/i,
    /expression\s*\(/i,
    /import\s*\(/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(html)) {
      console.warn('Suspicious content detected and blocked:', pattern);
      return '';
    }
  }
  
  return DOMPurify.sanitize(html, config) as unknown as string;
};

/**
 * Sanitizes text content by removing all HTML tags
 * @param text - The text to sanitize
 * @returns Plain text without HTML
 */
export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) as unknown as string;
};

/**
 * Validates and sanitizes URLs
 * @param url - The URL to validate
 * @returns Sanitized URL or null if invalid
 */
export const sanitizeUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    // Only allow http, https, and mailto protocols
    if (!['http:', 'https:', 'mailto:'].includes(urlObj.protocol)) {
      return null;
    }
    return urlObj.toString();
  } catch {
    return null;
  }
};

/**
 * Creates a safe innerHTML object for React
 * @param html - The HTML to sanitize
 * @param options - Optional DOMPurify configuration
 * @returns Object with __html property for dangerouslySetInnerHTML
 */
export const createSafeHtml = (html: string, options?: any) => {
  return { __html: sanitizeHtml(html, options) };
};

/**
 * Enhanced input validation with pattern matching
 * @param input - The input string to validate
 * @param type - The type of input (email, phone, url, etc.)
 * @param maxLength - Maximum allowed length
 * @returns Validation result with success status and error message
 */
export const validateInput = (
  input: string,
  type: 'email' | 'phone' | 'url' | 'text' | 'password' = 'text',
  maxLength: number = 1000
): { isValid: boolean; error?: string } => {
  // Basic null/undefined check
  if (input === null || input === undefined) {
    return { isValid: false, error: 'Input cannot be null or undefined' };
  }

  // Convert to string if needed
  const inputStr = String(input);

  // Length validation
  if (inputStr.length > maxLength) {
    return { isValid: false, error: `Input exceeds maximum length of ${maxLength} characters` };
  }

  // Basic XSS prevention
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(inputStr)) {
      return { isValid: false, error: 'Input contains potentially dangerous content' };
    }
  }

  // SQL injection prevention
  const sqlPatterns = [
    /('|(\\')|(;|\\x3b)|(;|\\x2d\\x2d))/gi,
    /(union\s+(all\s+)?select)/gi,
    /(drop\s+table)/gi,
    /(delete\s+from)/gi,
    /(insert\s+into)/gi,
    /(update\s+.+\s+set)/gi
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(inputStr)) {
      return { isValid: false, error: 'Input contains invalid characters or patterns' };
    }
  }

  // Type-specific validation
  switch (type) {
    case 'email':
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(inputStr)) {
        return { isValid: false, error: 'Invalid email format' };
      }
      break;

    case 'phone':
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(inputStr.replace(/[\s\-\(\)]/g, ''))) {
        return { isValid: false, error: 'Invalid phone number format' };
      }
      break;

    case 'url':
      try {
        const url = new URL(inputStr);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
        }
      } catch {
        return { isValid: false, error: 'Invalid URL format' };
      }
      break;

    case 'password':
      if (inputStr.length < 8) {
        return { isValid: false, error: 'Password must be at least 8 characters long' };
      }
      break;
  }

  return { isValid: true };
};

/**
 * Rate limiting utility for security-sensitive operations
 */
export class SecurityRateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 300000) { // 5 attempts per 5 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; resetTime: number } {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now - record.lastAttempt > this.windowMs) {
      // Reset or initialize
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return {
        allowed: true,
        remainingAttempts: this.maxAttempts - 1,
        resetTime: now + this.windowMs
      };
    }

    if (record.count >= this.maxAttempts) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: record.lastAttempt + this.windowMs
      };
    }

    // Increment attempt count
    record.count++;
    record.lastAttempt = now;

    return {
      allowed: true,
      remainingAttempts: this.maxAttempts - record.count,
      resetTime: record.lastAttempt + this.windowMs
    };
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Global rate limiter instances
export const authRateLimiter = new SecurityRateLimiter(5, 300000); // 5 attempts per 5 minutes
export const formRateLimiter = new SecurityRateLimiter(10, 60000); // 10 attempts per minute
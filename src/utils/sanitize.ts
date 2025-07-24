import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string, options?: any): string => {
  const defaultOptions: any = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'a', 'img', 'span', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'class', 'id', 'target', 'rel'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ['script', 'object', 'embed', 'base', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    KEEP_CONTENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false
  };

  const config = { ...defaultOptions, ...options };
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
/**
 * URL helper functions for clean, shareable URLs
 */

/**
 * Generate username from full name
 */
export const generateUsername = (fullName: string): string => {
  if (!fullName || fullName.trim().length === 0) {
    return `user${Date.now()}`;
  }
  
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '') // Remove spaces
    .substring(0, 20) || `user${Date.now()}`;
};

/**
 * Generate profile URL from username
 */
export const getCleanProfileUrl = (username: string): string => {
  return `/@${username}`;
};

/**
 * Generate full shareable profile URL
 */
export const getShareableProfileUrl = (username: string): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://talentxcel.in';
  return `${baseUrl}/@${username}`;
};

/**
 * Extract username from clean profile URL
 */
export const extractUsernameFromUrl = (url: string): string | null => {
  const match = url.match(/\/@([^\/\?#]+)/);
  return match ? match[1] : null;
};

/**
 * Generate job URL slug
 */
export const generateJobSlug = (title: string, id: string): string => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  
  return `/jobs/${slug}-${id}`;
};

/**
 * Generate company URL slug
 */
export const generateCompanySlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);
};

/**
 * Validate username format
 */
export const isValidUsername = (username: string): boolean => {
  return /^[a-z0-9]{3,20}$/.test(username);
};

/**
 * Check if URL is a clean profile URL
 */
export const isCleanProfileUrl = (path: string): boolean => {
  return /^\/@[a-z0-9]{3,20}$/.test(path);
};
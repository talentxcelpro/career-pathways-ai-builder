/**
 * Utility functions for generating and working with profile URLs
 */

/**
 * Generate a profile URL from username
 */
export const getProfileUrl = (username: string): string => {
  return `/profile/${username}`;
};

/**
 * Generate a full profile URL for sharing
 */
export const getFullProfileUrl = (username: string): string => {
  return `https://talentxcel.in/profile/${username}`;
};

/**
 * Extract username from profile URL
 */
export const getUsernameFromUrl = (url: string): string | null => {
  const match = url.match(/\/profile\/([^\/\?#]+)/);
  return match ? match[1] : null;
};

/**
 * Check if a URL is a profile URL
 */
export const isProfileUrl = (url: string): boolean => {
  return /\/profile\/[^\/\?#]+/.test(url);
};

/**
 * Generate a valid username from a name
 */
export const generateUsernameFromName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20) || 'user';
};

/**
 * Validate username format
 */
export const isValidUsername = (username: string): boolean => {
  return /^[a-z0-9]{3,20}$/.test(username);
};
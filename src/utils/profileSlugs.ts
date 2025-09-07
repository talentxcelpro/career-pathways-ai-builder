import { supabase } from '@/integrations/supabase/client';

/**
 * Generate a URL-friendly slug from a name
 */
export const generateSlug = (name: string): string => {
  if (!name || name.trim().length === 0) {
    return `user-${Date.now()}`;
  }
  
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Collapse multiple dashes
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
    .substring(0, 50) || `user-${Date.now()}`;
};

/**
 * Check if a slug is available
 */
export const isSlugAvailable = async (slug: string, excludeUserId?: string): Promise<boolean> => {
  try {
    let query = supabase
      .from('profiles')
      .select('id')
      .eq('slug', slug);
    
    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }
    
    const { data, error } = await query.single();
    
    if (error && error.code === 'PGRST116') {
      // No rows returned, slug is available
      return true;
    }
    
    if (error) {
      console.error('Error checking slug availability:', error);
      return false;
    }
    
    // If data exists, slug is taken
    return !data;
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return false;
  }
};

/**
 * Generate a unique slug by appending numbers if needed
 */
export const generateUniqueSlug = async (name: string, excludeUserId?: string): Promise<string> => {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;
  
  while (!(await isSlugAvailable(slug, excludeUserId))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

/**
 * Get profile URL from slug
 */
export const getProfileUrl = (slug: string): string => {
  return `/@${slug}`;
};

/**
 * Get full profile URL for sharing
 */
export const getFullProfileUrl = (slug: string): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://talentxcel.in';
  return `${baseUrl}/@${slug}`;
};

/**
 * Extract slug from profile URL
 */
export const extractSlugFromUrl = (url: string): string | null => {
  const match = url.match(/\/@([^\/\?#]+)/);
  return match ? match[1] : null;
};

/**
 * Validate slug format
 */
export const isValidSlug = (slug: string): boolean => {
  return /^[a-z0-9-]{3,50}$/.test(slug) && !slug.startsWith('-') && !slug.endsWith('-');
};
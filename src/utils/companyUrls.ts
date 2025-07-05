/**
 * Utility functions for company URLs and SEO
 */

export interface Company {
  id: string;
  slug?: string;
  name: string;
}

/**
 * Generate SEO-friendly URL for a company using slug if available, fallback to ID
 */
export const getCompanyUrl = (company: Company): string => {
  if (company.slug) {
    return `/${company.slug}`;
  }
  return `/companies/${company.id}`;
};

/**
 * Generate full canonical URL for a company
 */
export const getCompanyCanonicalUrl = (company: Company, baseUrl: string = 'https://talentxcel.in'): string => {
  const path = getCompanyUrl(company);
  return `${baseUrl}${path}`;
};

/**
 * Generate slug from company name (client-side utility)
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Check if a string looks like a UUID
 */
export const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get company identifier type (slug or id)
 */
export const getIdentifierType = (identifier: string): 'slug' | 'id' => {
  return isUUID(identifier) ? 'id' : 'slug';
};

/**
 * Extract company slug from URL pathname
 */
export const extractSlugFromPath = (pathname: string): string | null => {
  // Remove leading slash and check if it's a valid slug (not a known route)
  const slug = pathname.replace(/^\//, '');
  
  // Skip if it's a known route
  const knownRoutes = [
    'jobs', 'companies', 'profile', 'auth', 'admin', 'employer', 
    'network', 'learning', 'tools', 'career-map', 'resume-builder',
    'dashboard', 'marketplace'
  ];
  
  if (knownRoutes.includes(slug) || slug.includes('/')) {
    return null;
  }
  
  return slug || null;
};
// Domain configuration for custom URL generation
export const DOMAIN_CONFIG = {
  // Use environment variable for custom domain, fallback to window.location.origin
  CUSTOM_DOMAIN: 'https://talentxcel.in', // Replace with actual domain when available
  APP_NAME: 'TalentXcel',
  
  // Fallback to current domain if custom domain is not available
  getBaseUrl: () => {
    if (typeof window !== 'undefined') {
      // In production, use custom domain; in development, use current domain
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname.includes('lovableproject.com');
      return isDevelopment ? window.location.origin : DOMAIN_CONFIG.CUSTOM_DOMAIN;
    }
    return DOMAIN_CONFIG.CUSTOM_DOMAIN;
  }
};

// SEO configuration
export const SEO_CONFIG = {
  defaultTitle: 'TalentXcel - Your Career Growth Platform',
  defaultDescription: 'Connect, Learn, and Grow with TalentXcel - The ultimate platform for career development, networking, and professional growth.',
  defaultImage: '/og-image.jpg', // Add this image to public folder
  twitterHandle: '@talentxcel',
  siteUrl: DOMAIN_CONFIG.CUSTOM_DOMAIN
};
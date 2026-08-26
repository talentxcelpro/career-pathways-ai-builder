/**
 * Company Logo & Intelligence Service
 * Uses Google Favicon CDN (128px), Clearbit, and Logo CDN for high-resolution company branding
 */

export interface CompanyLogoMapping {
  name: string;
  domain?: string;
  logo_url: string;
  industry?: string;
  location?: string;
}

// Canonical company registry with exact Google domain mapping
export const COMPANY_LOGO_MAPPINGS: CompanyLogoMapping[] = [
  // Core Platform Employers
  { 
    name: "chatr Chat", 
    domain: "chatr.chat",
    logo_url: "https://www.google.com/s2/favicons?domain=chatr.chat&sz=128", 
    industry: "Artificial Intelligence & Telecom",
    location: "New Delhi, Delhi NCR, India"
  },
  { 
    name: "Savantis Solutions", 
    domain: "savantis.com",
    logo_url: "https://www.google.com/s2/favicons?domain=savantis.com&sz=128", 
    industry: "IT Services & Consulting",
    location: "Noida, Uttar Pradesh, India"
  },
  { 
    name: "TalentXcel Services", 
    domain: "talentxcel.in",
    logo_url: "https://www.google.com/s2/favicons?domain=talentxcel.in&sz=128", 
    industry: "AI Recruitment & Staffing",
    location: "Noida, Uttar Pradesh, India"
  },
  { 
    name: "TalentXcel Enterprise", 
    domain: "talentxcel.in",
    logo_url: "https://www.google.com/s2/favicons?domain=talentxcel.in&sz=128", 
    industry: "HR Tech & Career AI",
    location: "Gurgaon, Delhi NCR, India"
  }
];

/**
 * Fetch high-res logo from Google Favicon API or domain
 */
export const getGoogleCompanyLogo = (companyName: string, websiteUrl?: string): string => {
  if (websiteUrl) {
    try {
      const cleanUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
      const parsed = new URL(cleanUrl);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;
    } catch (e) {}
  }

  const mapping = COMPANY_LOGO_MAPPINGS.find(
    c => c.name.toLowerCase() === companyName.toLowerCase() ||
         companyName.toLowerCase().includes(c.name.toLowerCase()) ||
         c.name.toLowerCase().includes(companyName.toLowerCase())
  );
  if (mapping?.logo_url) return mapping.logo_url;
  if (mapping?.domain) return `https://www.google.com/s2/favicons?domain=${mapping.domain}&sz=128`;

  // Fallback domain extraction from clean company name
  const cleanDomain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  return `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`;
};

export const getCompanyLogo = (companyName: string): string | null => {
  const mapping = COMPANY_LOGO_MAPPINGS.find(
    company => company.name.toLowerCase() === companyName.toLowerCase()
  );
  return mapping?.logo_url || null;
};

export const generateFallbackLogo = (companyName: string): string => {
  const initials = companyName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials || 'CO')}&size=200&background=0F172A&color=fff&format=png&rounded=true&bold=true`;
};

export const getCompanyLogoWithFallback = (companyName: string, customLogoUrl?: string, websiteUrl?: string): string => {
  if (customLogoUrl && customLogoUrl.startsWith('http')) return customLogoUrl;
  return getGoogleCompanyLogo(companyName, websiteUrl);
};

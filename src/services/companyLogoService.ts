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

// Canonical company registry with Google domain mapping
export const COMPANY_LOGO_MAPPINGS: CompanyLogoMapping[] = [
  // Core Platform Employers
  { 
    name: "chatr Chat", 
    domain: "chatrchat.com",
    logo_url: "https://www.google.com/s2/favicons?domain=chatrchat.com&sz=128", 
    industry: "Artificial Intelligence & Communications",
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
    location: "Gurgaon, Delhi NCR, India"
  },
  { 
    name: "TalentXcel Enterprise", 
    domain: "talentxcel.in",
    logo_url: "https://www.google.com/s2/favicons?domain=talentxcel.in&sz=128", 
    industry: "HR Tech & Career AI",
    location: "Bangalore & Gurgaon, India"
  },

  // Indian IT Giants
  { name: "Tata Consultancy Services", domain: "tcs.com", logo_url: "https://www.google.com/s2/favicons?domain=tcs.com&sz=128", industry: "Technology", location: "Mumbai, India" },
  { name: "Infosys", domain: "infosys.com", logo_url: "https://www.google.com/s2/favicons?domain=infosys.com&sz=128", industry: "Technology", location: "Bangalore, India" },
  { name: "Wipro", domain: "wipro.com", logo_url: "https://www.google.com/s2/favicons?domain=wipro.com&sz=128", industry: "Technology", location: "Bangalore, India" },
  { name: "HCL Technologies", domain: "hcltech.com", logo_url: "https://www.google.com/s2/favicons?domain=hcltech.com&sz=128", industry: "Technology", location: "Noida, India" },
  { name: "Tech Mahindra", domain: "techmahindra.com", logo_url: "https://www.google.com/s2/favicons?domain=techmahindra.com&sz=128", industry: "Technology", location: "Pune, India" },
  { name: "Cognizant", domain: "cognizant.com", logo_url: "https://www.google.com/s2/favicons?domain=cognizant.com&sz=128", industry: "Technology", location: "Chennai, India" },
  { name: "Accenture", domain: "accenture.com", logo_url: "https://www.google.com/s2/favicons?domain=accenture.com&sz=128", industry: "Technology", location: "Bangalore, India" },
  
  // Global Tech Companies
  { name: "Google India", domain: "google.com", logo_url: "https://www.google.com/s2/favicons?domain=google.com&sz=128", industry: "Technology", location: "Bangalore & Hyderabad, India" },
  { name: "Microsoft India", domain: "microsoft.com", logo_url: "https://www.google.com/s2/favicons?domain=microsoft.com&sz=128", industry: "Technology", location: "Hyderabad & Bangalore, India" },
  { name: "Amazon India", domain: "amazon.in", logo_url: "https://www.google.com/s2/favicons?domain=amazon.in&sz=128", industry: "Technology", location: "Bangalore & Hyderabad, India" },
  { name: "IBM India", domain: "ibm.com", logo_url: "https://www.google.com/s2/favicons?domain=ibm.com&sz=128", industry: "Technology", location: "Bangalore, India" },
  { name: "Oracle", domain: "oracle.com", logo_url: "https://www.google.com/s2/favicons?domain=oracle.com&sz=128", industry: "Technology", location: "Bangalore, India" },
  { name: "Adobe", domain: "adobe.com", logo_url: "https://www.google.com/s2/favicons?domain=adobe.com&sz=128", industry: "Technology", location: "Noida & Bangalore, India" },
  { name: "Meta", domain: "meta.com", logo_url: "https://www.google.com/s2/favicons?domain=meta.com&sz=128", industry: "Technology", location: "Gurgaon, India" },
  
  // Indian Unicorns
  { name: "Flipkart", domain: "flipkart.com", logo_url: "https://www.google.com/s2/favicons?domain=flipkart.com&sz=128", industry: "E-commerce", location: "Bangalore, India" },
  { name: "Zomato", domain: "zomato.com", logo_url: "https://www.google.com/s2/favicons?domain=zomato.com&sz=128", industry: "Food Tech", location: "Gurgaon, India" },
  { name: "Swiggy", domain: "swiggy.com", logo_url: "https://www.google.com/s2/favicons?domain=swiggy.com&sz=128", industry: "Food Tech", location: "Bangalore, India" },
  { name: "Razorpay", domain: "razorpay.com", logo_url: "https://www.google.com/s2/favicons?domain=razorpay.com&sz=128", industry: "Fintech", location: "Bangalore, India" },
  { name: "PhonePe", domain: "phonepe.com", logo_url: "https://www.google.com/s2/favicons?domain=phonepe.com&sz=128", industry: "Fintech", location: "Bangalore, India" },
];

/**
 * Fetch high-res logo from Google Favicon API or domain
 */
export const getGoogleCompanyLogo = (companyName: string, websiteUrl?: string): string => {
  if (websiteUrl) {
    try {
      const parsed = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;
    } catch (e) {}
  }

  const mapping = COMPANY_LOGO_MAPPINGS.find(
    c => c.name.toLowerCase() === companyName.toLowerCase() ||
         companyName.toLowerCase().includes(c.name.toLowerCase())
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

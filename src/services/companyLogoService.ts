/**
 * Company Logo Service
 * Provides company logos using a placeholder service and maps to well-known companies
 */

export interface CompanyLogoMapping {
  name: string;
  logo_url: string;
  industry?: string;
}

// Well-known Indian and international companies with reliable logo sources
export const COMPANY_LOGO_MAPPINGS: CompanyLogoMapping[] = [
  // Indian IT Giants
  { name: "Tata Consultancy Services", logo_url: "https://logo.clearbit.com/tcs.com", industry: "Technology" },
  { name: "Infosys", logo_url: "https://logo.clearbit.com/infosys.com", industry: "Technology" },
  { name: "Wipro", logo_url: "https://logo.clearbit.com/wipro.com", industry: "Technology" },
  { name: "HCL Technologies", logo_url: "https://logo.clearbit.com/hcltech.com", industry: "Technology" },
  { name: "Tech Mahindra", logo_url: "https://logo.clearbit.com/techmahindra.com", industry: "Technology" },
  { name: "Cognizant", logo_url: "https://logo.clearbit.com/cognizant.com", industry: "Technology" },
  { name: "Accenture", logo_url: "https://logo.clearbit.com/accenture.com", industry: "Technology" },
  
  // Global Tech Companies
  { name: "Microsoft India", logo_url: "https://logo.clearbit.com/microsoft.com", industry: "Technology" },
  { name: "Google India", logo_url: "https://logo.clearbit.com/google.com", industry: "Technology" },
  { name: "Amazon India", logo_url: "https://logo.clearbit.com/amazon.com", industry: "Technology" },
  { name: "IBM India", logo_url: "https://logo.clearbit.com/ibm.com", industry: "Technology" },
  { name: "Oracle", logo_url: "https://logo.clearbit.com/oracle.com", industry: "Technology" },
  { name: "SAP", logo_url: "https://logo.clearbit.com/sap.com", industry: "Technology" },
  { name: "Adobe", logo_url: "https://logo.clearbit.com/adobe.com", industry: "Technology" },
  { name: "Meta", logo_url: "https://logo.clearbit.com/meta.com", industry: "Technology" },
  
  // Indian Startups & Unicorns
  { name: "Flipkart", logo_url: "https://logo.clearbit.com/flipkart.com", industry: "E-commerce" },
  { name: "Paytm", logo_url: "https://logo.clearbit.com/paytm.com", industry: "Fintech" },
  { name: "Zomato", logo_url: "https://logo.clearbit.com/zomato.com", industry: "Food Tech" },
  { name: "Swiggy", logo_url: "https://logo.clearbit.com/swiggy.com", industry: "Food Tech" },
  { name: "BYJU'S", logo_url: "https://logo.clearbit.com/byjus.com", industry: "EdTech" },
  { name: "Ola", logo_url: "https://logo.clearbit.com/olacabs.com", industry: "Transportation" },
  { name: "Uber India", logo_url: "https://logo.clearbit.com/uber.com", industry: "Transportation" },
  { name: "Myntra", logo_url: "https://logo.clearbit.com/myntra.com", industry: "Fashion" },
  { name: "BigBasket", logo_url: "https://logo.clearbit.com/bigbasket.com", industry: "E-commerce" },
  { name: "Razorpay", logo_url: "https://logo.clearbit.com/razorpay.com", industry: "Fintech" },
  { name: "PhonePe", logo_url: "https://logo.clearbit.com/phonepe.com", industry: "Fintech" },
  { name: "Nykaa", logo_url: "https://logo.clearbit.com/nykaa.com", industry: "Beauty" },
  
  // Banking & Finance
  { name: "State Bank of India", logo_url: "https://logo.clearbit.com/sbi.co.in", industry: "Banking" },
  { name: "HDFC Bank", logo_url: "https://logo.clearbit.com/hdfcbank.com", industry: "Banking" },
  { name: "ICICI Bank", logo_url: "https://logo.clearbit.com/icicibank.com", industry: "Banking" },
  { name: "Axis Bank", logo_url: "https://logo.clearbit.com/axisbank.com", industry: "Banking" },
  { name: "Kotak Mahindra Bank", logo_url: "https://logo.clearbit.com/kotak.com", industry: "Banking" },
  
  // Traditional Indian Companies
  { name: "Reliance Industries", logo_url: "https://logo.clearbit.com/ril.com", industry: "Conglomerate" },
  { name: "Tata Group", logo_url: "https://logo.clearbit.com/tata.com", industry: "Conglomerate" },
  { name: "Aditya Birla Group", logo_url: "https://logo.clearbit.com/adityabirla.com", industry: "Conglomerate" },
  { name: "Mahindra Group", logo_url: "https://logo.clearbit.com/mahindra.com", industry: "Automotive" },
  { name: "Bajaj Group", logo_url: "https://logo.clearbit.com/bajaj.com", industry: "Financial Services" },
  
  // Consulting & Services
  { name: "Deloitte", logo_url: "https://logo.clearbit.com/deloitte.com", industry: "Consulting" },
  { name: "PwC", logo_url: "https://logo.clearbit.com/pwc.com", industry: "Consulting" },
  { name: "EY", logo_url: "https://logo.clearbit.com/ey.com", industry: "Consulting" },
  { name: "KPMG", logo_url: "https://logo.clearbit.com/kpmg.com", industry: "Consulting" },
  
  // Healthcare & Pharma
  { name: "Apollo Hospitals", logo_url: "https://logo.clearbit.com/apollohospitals.com", industry: "Healthcare" },
  { name: "Dr. Reddy's", logo_url: "https://logo.clearbit.com/drreddys.com", industry: "Pharmaceuticals" },
  { name: "Cipla", logo_url: "https://logo.clearbit.com/cipla.com", industry: "Pharmaceuticals" },
  { name: "Sun Pharma", logo_url: "https://logo.clearbit.com/sunpharma.com", industry: "Pharmaceuticals" },
];

/**
 * Get a company logo URL by name
 */
export const getCompanyLogo = (companyName: string): string | null => {
  const mapping = COMPANY_LOGO_MAPPINGS.find(
    company => company.name.toLowerCase() === companyName.toLowerCase()
  );
  return mapping?.logo_url || null;
};

/**
 * Generate a fallback logo URL using company initials
 */
export const generateFallbackLogo = (companyName: string): string => {
  const initials = companyName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Use a placeholder service that generates logos with initials
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=200&background=0F172A&color=fff&format=png&rounded=true&bold=true`;
};

/**
 * Get company logo with fallback
 */
export const getCompanyLogoWithFallback = (companyName: string): string => {
  return getCompanyLogo(companyName) || generateFallbackLogo(companyName);
};

/**
 * Get all companies with their logos
 */
export const getAllCompaniesWithLogos = (): CompanyLogoMapping[] => {
  return COMPANY_LOGO_MAPPINGS;
};

/**
 * Search for companies by industry
 */
export const getCompaniesByIndustry = (industry: string): CompanyLogoMapping[] => {
  return COMPANY_LOGO_MAPPINGS.filter(
    company => company.industry?.toLowerCase().includes(industry.toLowerCase())
  );
};
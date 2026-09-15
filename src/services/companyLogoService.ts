/**
 * Company Logo & Intelligence Service
 * Uses direct Google Favicon API (128px), Google S2, DuckDuckGo, and brand intelligence
 */

import { supabase } from '@/integrations/supabase/client';

export interface CompanyLogoMapping {
  name: string;
  domain: string;
  logo_url?: string;
  industry?: string;
  location?: string;
}

// Canonical company registry with exact Google domain mapping
export const COMPANY_LOGO_MAPPINGS: CompanyLogoMapping[] = [
  { 
    name: "chatr Chat", 
    domain: "chatr.chat",
    logo_url: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://chatr.chat&size=128", 
    industry: "Artificial Intelligence & Telecom",
    location: "New Delhi, Delhi NCR, India"
  },
  { 
    name: "Savantis Solutions", 
    domain: "savantis.com",
    logo_url: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://savantis.com&size=128", 
    industry: "IT Services & Consulting",
    location: "Noida, Uttar Pradesh, India"
  },
  { 
    name: "TalentXcel Services", 
    domain: "talentxcel.in",
    logo_url: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://talentxcel.in&size=128", 
    industry: "AI Recruitment & Staffing",
    location: "Noida, Uttar Pradesh, India"
  },
  { 
    name: "TalentXcel Enterprise", 
    domain: "talentxcel.in",
    logo_url: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://talentxcel.in&size=128", 
    industry: "HR Tech & Career AI",
    location: "Gurgaon, Delhi NCR, India"
  },
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Meta", domain: "meta.com" },
  { name: "Infosys", domain: "infosys.com" },
  { name: "Tata Consultancy Services", domain: "tcs.com" },
  { name: "TCS", domain: "tcs.com" },
  { name: "Wipro", domain: "wipro.com" },
  { name: "Accenture", domain: "accenture.com" },
  { name: "Cognizant", domain: "cognizant.com" },
  { name: "HCL Technologies", domain: "hcltech.com" },
  { name: "HCL", domain: "hcltech.com" },
  { name: "IBM", domain: "ibm.com" },
  { name: "Oracle", domain: "oracle.com" }
];

/**
 * Extracts clean domain name from URL or free text string
 */
export const extractDomain = (input?: string): string => {
  if (!input) return '';
  try {
    let clean = input.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    const url = new URL(clean);
    return url.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return input.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim();
  }
};

/**
 * Resolves the primary domain for a given company
 */
export const resolveCompanyDomain = (companyName: string, websiteUrl?: string): string => {
  if (websiteUrl) {
    const d = extractDomain(websiteUrl);
    if (d && d.includes('.')) return d;
  }

  const cleanName = companyName.toLowerCase().trim();
  const mapping = COMPANY_LOGO_MAPPINGS.find(
    c => c.name.toLowerCase() === cleanName ||
         cleanName.includes(c.name.toLowerCase()) ||
         c.name.toLowerCase().includes(cleanName)
  );
  if (mapping?.domain) return mapping.domain;

  // Derive domain from name (e.g. "Savantis Solutions" -> "savantis.com")
  const firstWord = cleanName.split(/[\s,.-]+/)[0].replace(/[^a-z0-9]/g, '');
  if (firstWord && firstWord.length > 2) {
    return `${firstWord}.com`;
  }

  return `${cleanName.replace(/[^a-z0-9]/g, '')}.com`;
};

/**
 * Build primary Google Favicon V2 URL (returns direct 200 image/png or image/jpeg)
 */
export const buildGoogleLogoUrl = (domain: string): string => {
  const cleanDomain = extractDomain(domain);
  return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${cleanDomain}&size=128`;
};

/**
 * Return ordered fallback logo candidates
 */
export const getCompanyLogoCandidates = (companyName: string, websiteUrl?: string, customLogoUrl?: string): string[] => {
  const candidates: string[] = [];

  if (customLogoUrl && customLogoUrl.startsWith('http')) {
    candidates.push(customLogoUrl);
  }

  const domain = resolveCompanyDomain(companyName, websiteUrl);
  if (domain) {
    candidates.push(buildGoogleLogoUrl(domain));
    candidates.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    candidates.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  }

  return candidates;
};

/**
 * Fetch high-res logo from Google Favicon API
 */
export const getGoogleCompanyLogo = (companyName: string, websiteUrl?: string): string => {
  const domain = resolveCompanyDomain(companyName, websiteUrl);
  return buildGoogleLogoUrl(domain);
};

export const getCompanyLogo = (companyName: string): string | null => {
  const mapping = COMPANY_LOGO_MAPPINGS.find(
    company => company.name.toLowerCase() === companyName.toLowerCase()
  );
  if (mapping?.logo_url) return mapping.logo_url;
  if (mapping?.domain) return buildGoogleLogoUrl(mapping.domain);
  return null;
};

export const generateFallbackLogo = (companyName: string): string => {
  const initials = companyName
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials || 'CO')}&size=200&background=1E293B&color=fff&format=png&rounded=true&bold=true`;
};

export const getCompanyLogoWithFallback = (companyName: string, customLogoUrl?: string, websiteUrl?: string): string => {
  if (customLogoUrl && customLogoUrl.startsWith('http')) return customLogoUrl;
  return getGoogleCompanyLogo(companyName, websiteUrl);
};

/**
 * Persist logo to Supabase companies table so it's permanently stored for all users
 */
export const saveCompanyLogoToDatabase = async (companyId: string, companyName: string, logoUrl: string): Promise<boolean> => {
  try {
    // Try update by id first
    if (companyId && !companyId.startsWith('comp_')) {
      const { error } = await supabase
        .from('companies')
        .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
        .eq('id', companyId);
      if (!error) return true;
    }

    // Try update by company name
    const { error: nameError } = await supabase
      .from('companies')
      .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
      .ilike('name', companyName.trim());

    if (!nameError) return true;

    // If company does not exist in table, insert it
    const { error: insertError } = await supabase
      .from('companies')
      .insert({
        name: companyName.trim(),
        logo_url: logoUrl,
        website_url: companyName.toLowerCase().includes('chatr') ? 'https://chatr.chat' : 
                     companyName.toLowerCase().includes('savantis') ? 'https://savantis.com' : 'https://talentxcel.in',
        is_verified: true,
        verification_status: 'verified',
        updated_at: new Date().toISOString()
      });

    return !insertError;
  } catch (err) {
    console.warn('Failed to save company logo to database:', err);
    return false;
  }
};

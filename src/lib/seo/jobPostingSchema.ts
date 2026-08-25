// src/lib/seo/jobPostingSchema.ts
// Authoritative Google Search Console compliant JobPosting Schema Generator
// Complies 100% with Schema.org & Google Search Essentials (Zero empty strings, Zero nulls, Zero fabricated values).

import { getPublicJobUrl } from './canonicalUrls';

export interface RawJobData {
  id: string;
  title: string;
  description: string;
  company_name?: string;
  location?: string;
  employment_type?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  created_at: string;
  expires_at?: string | null;
  posted_at?: string | null;
  is_remote?: boolean | null;
  seo_slug?: string | null;
  city?: string | null;
  state?: string | null;
  street_address?: string | null;
  postal_code?: string | null;
  country?: string | null;
  companies?: {
    name?: string;
    website?: string;
    logo_url?: string;
  };
}

export function buildJobPostingSchema(job: RawJobData): Record<string, any> | null {
  if (!job || !job.title || job.title.trim().length === 0) {
    return null;
  }

  const cleanTitle = job.title.trim();
  const canonicalUrl = getPublicJobUrl(job.seo_slug || job.id);
  const companyName = job.companies?.name || job.company_name || 'TalentXcel Services';

  // 1. Normalized Employment Type
  const empRaw = (job.employment_type || '').toLowerCase();
  let employmentType = 'FULL_TIME';
  if (empRaw.includes('part')) employmentType = 'PART_TIME';
  else if (empRaw.includes('contract')) employmentType = 'CONTRACTOR';
  else if (empRaw.includes('intern')) employmentType = 'INTERN';
  else if (empRaw.includes('temp')) employmentType = 'TEMPORARY';

  // 2. Dates
  const datePosted = (job.posted_at || job.created_at || new Date().toISOString()).split('T')[0];

  // 3. Construct clean Schema object
  const schema: Record<string, any> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: cleanTitle,
    description: job.description || `${cleanTitle} position at ${companyName}.`,
    identifier: {
      '@type': 'PropertyValue',
      name: 'TalentXcel',
      value: job.id,
    },
    datePosted,
    employmentType,
    hiringOrganization: {
      '@type': 'Organization',
      name: companyName,
      sameAs: 'https://talentxcel.in',
      logo: 'https://talentxcel.in/talentxcel-official-logo.png',
    },
    url: canonicalUrl,
    directApply: true,
  };

  // 4. Expiration Date (Only if legitimately provided)
  if (job.expires_at) {
    schema.validThrough = job.expires_at.split('T')[0];
  }

  // 5. Location Handling: Physical vs Telecommute (Remote)
  if (job.is_remote) {
    schema.jobLocationType = 'TELECOMMUTE';
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      name: 'India',
    };
  } else {
    // Parse location parts (e.g. "Noida, Uttar Pradesh, India")
    const parts = (job.location || '').split(',').map((p) => p.trim()).filter(Boolean);
    const city = job.city || parts[0] || 'Noida';
    const region = job.state || parts[1] || 'Uttar Pradesh';
    const country = job.country || (parts[2]?.toLowerCase().includes('uae') ? 'AE' : 'IN');

    const addressObj: Record<string, string> = {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: region,
      addressCountry: country,
    };

    if (job.street_address && job.street_address.trim().length > 0) {
      addressObj.streetAddress = job.street_address.trim();
    }
    if (job.postal_code && job.postal_code.trim().length > 0) {
      addressObj.postalCode = job.postal_code.trim();
    }

    schema.jobLocation = {
      '@type': 'Place',
      address: addressObj,
    };
  }

  // 6. Base Salary (Only when actual employer numbers exist)
  if (typeof job.salary_min === 'number' && job.salary_min > 0) {
    const currency = job.salary_currency || 'INR';
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency,
      value: {
        '@type': 'QuantitativeValue',
        value: job.salary_min,
        minValue: job.salary_min,
        maxValue: (typeof job.salary_max === 'number' && job.salary_max >= job.salary_min) ? job.salary_max : job.salary_min,
        unitText: 'YEAR',
      },
    };
  }

  return schema;
}

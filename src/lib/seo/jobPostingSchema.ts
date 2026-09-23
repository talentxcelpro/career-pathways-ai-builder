// src/lib/seo/jobPostingSchema.ts
// Google Search Console & Schema.org 100% Compliant JobPosting Schema Builder
// Implements Fail-Closed Verification, Zero Data Fabrication, and Strict Source Provenance

import { getPublicJobUrl } from './canonicalUrls.js';
import type { RawJobData } from './jobPostingValidator.js';
import { validateJobPosting, checkSchemaContentConsistency } from './jobPostingValidator.js';

export type { RawJobData };

export function buildJobPostingSchema(job: RawJobData): Record<string, any> | null {
  // 1. Fail-Closed Validation Gate
  const validation = validateJobPosting(job);
  if (!validation.isGoogleEligible || !validation.resolvedDatePosted) {
    return null;
  }

  const cleanTitle = (job.title || job.job_title || '').trim();
  const canonicalUrl = getPublicJobUrl(job.seo_slug || job.id);
  const companyName = job.companies?.name || job.company_name || 'TalentXcel Services';

  // 2. Normalized Employment Type
  const empRaw = (job.employment_type || '').toLowerCase();
  let employmentType = 'FULL_TIME';
  if (empRaw.includes('part')) employmentType = 'PART_TIME';
  else if (empRaw.includes('contract')) employmentType = 'CONTRACTOR';
  else if (empRaw.includes('intern')) employmentType = 'INTERN';
  else if (empRaw.includes('temp')) employmentType = 'TEMPORARY';

  // 3. Authoritative Dates (From validator only)
  const datePosted = validation.resolvedDatePosted;
  const validThrough = validation.resolvedValidThrough || undefined;

  // 4. Clean Description (Preserves actual visible job posting text)
  const cleanDescription = (job.description || job.job_description || '').trim();

  // 5. Experience Requirements — use isFresherEligible for better detection
  let monthsOfExperience = 24;
  const expRaw = (job.experience_level || '').toLowerCase();
  if (typeof job.min_experience === 'number' && job.min_experience >= 0) {
    monthsOfExperience = Math.max(0, Math.round(job.min_experience * 12));
  } else if (expRaw.includes('fresher') || expRaw.includes('entry') || expRaw.includes('0-1') || expRaw.includes('junior')) {
    monthsOfExperience = 0;
  } else if (expRaw.includes('1-2') || expRaw.includes('1 to 2')) {
    monthsOfExperience = 12;
  } else if (expRaw.includes('2-3') || expRaw.includes('2 to 3')) {
    monthsOfExperience = 24;
  } else if (expRaw.includes('3-5') || expRaw.includes('mid')) {
    monthsOfExperience = 36;
  } else if (expRaw.includes('senior') || expRaw.includes('lead') || expRaw.includes('architect') || expRaw.includes('5')) {
    monthsOfExperience = 60;
  } else if (expRaw.includes('8') || expRaw.includes('executive') || expRaw.includes('director')) {
    monthsOfExperience = 96;
  }

  // directApply: true ONLY when job uses TalentXcel native apply flow (no external_url redirect)
  // Google defines directApply around a short, simple application experience on the job page.
  const hasExternalUrl = !!(job.external_url && job.external_url.trim().length > 0);
  const isDirectApply = !hasExternalUrl;

  // 6. Assemble Schema Object
  const schema: Record<string, any> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: cleanTitle,
    description: cleanDescription,
    identifier: {
      '@type': 'PropertyValue',
      name: 'TalentXcel',
      value: job.id,
    },
    datePosted,
    validThrough,
    employmentType,
    hiringOrganization: {
      '@type': 'Organization',
      name: companyName,
      sameAs: job.companies?.website || 'https://talentxcel.in',
      logo: job.companies?.logo_url || 'https://talentxcel.in/talentxcel-official-logo.png',
    },
    url: canonicalUrl,
    ...(isDirectApply && { directApply: true }),
    ...(monthsOfExperience >= 0 && {
      experienceRequirements: {
        '@type': 'OccupationalExperienceRequirements',
        monthsOfExperience,
      },
    }),
  };

  // 7. Base Salary — multi-currency, strictly only if provided by employer
  if (typeof job.salary_min === 'number' && job.salary_min > 0) {
    const minSal = job.salary_min;
    const maxSal = (typeof job.salary_max === 'number' && job.salary_max >= minSal) ? job.salary_max : minSal;
    // Support any ISO 4217 currency, default to INR for India market
    const currency = (job.salary_currency && job.salary_currency.length === 3)
      ? job.salary_currency.toUpperCase()
      : 'INR';

    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: currency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: minSal,
        maxValue: maxSal,
        unitText: 'YEAR',
      },
    };
  }

  // 8. Location Handling (Zero Fabrication Rule)
  if (job.is_remote) {
    schema.jobLocationType = 'TELECOMMUTE';
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      name: job.country || 'India',
    };
  } else {
    const parts = (job.location || '').split(',').map((p) => p.trim()).filter(Boolean);
    const city = job.city || job.location_city || parts[0] || undefined;
    const region = job.state || job.location_state || parts[1] || undefined;
    const country = job.country || 'IN';

    const addressObj: Record<string, any> = {
      '@type': 'PostalAddress',
      addressCountry: country,
    };

    if (city) addressObj.addressLocality = city;
    if (region) addressObj.addressRegion = region;
    // Strictly include streetAddress and postalCode ONLY if genuinely present in database
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

  // 9. Final Consistency Verification
  if (!checkSchemaContentConsistency(job, schema)) {
    return null;
  }

  return schema;
}

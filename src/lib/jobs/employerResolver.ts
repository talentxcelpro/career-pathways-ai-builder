/**
 * TalentXcel Employer & Government Organization Entity Resolver
 * Normalizes ministry, department, PSU, and corporate variations into canonical entities.
 */

import { OrganizationEntity, EmployerType } from '@/types/jobs/globalJob';

const CANONICAL_GOVERNMENT_ENTITIES: Record<string, Partial<OrganizationEntity>> = {
  'upsc': {
    legal_name: 'Union Public Service Commission',
    display_name: 'UPSC',
    website: 'https://upsc.gov.in',
    country_code: 'IN',
    organization_type: 'GOVERNMENT',
    verification_status: 'GOVERNMENT_VERIFIED',
    headquarters_city: 'New Delhi',
  },
  'ssc': {
    legal_name: 'Staff Selection Commission',
    display_name: 'SSC',
    website: 'https://ssc.gov.in',
    country_code: 'IN',
    organization_type: 'GOVERNMENT',
    verification_status: 'GOVERNMENT_VERIFIED',
    headquarters_city: 'New Delhi',
  },
  'ibps': {
    legal_name: 'Institute of Banking Personnel Selection',
    display_name: 'IBPS',
    website: 'https://www.ibps.in',
    country_code: 'IN',
    organization_type: 'GOVERNMENT',
    verification_status: 'GOVERNMENT_VERIFIED',
    headquarters_city: 'Mumbai',
  },
  'ntpc': {
    legal_name: 'NTPC Limited',
    display_name: 'NTPC',
    website: 'https://www.ntpc.co.in',
    country_code: 'IN',
    organization_type: 'PSU',
    verification_status: 'GOVERNMENT_VERIFIED',
    headquarters_city: 'New Delhi',
  },
  'iocl': {
    legal_name: 'Indian Oil Corporation Limited',
    display_name: 'Indian Oil (IOCL)',
    website: 'https://iocl.com',
    country_code: 'IN',
    organization_type: 'PSU',
    verification_status: 'GOVERNMENT_VERIFIED',
    headquarters_city: 'New Delhi',
  },
  'usajobs': {
    legal_name: 'U.S. Office of Personnel Management',
    display_name: 'USAJOBS / U.S. Federal Government',
    website: 'https://www.usajobs.gov',
    country_code: 'US',
    organization_type: 'GOVERNMENT',
    verification_status: 'GOVERNMENT_VERIFIED',
    headquarters_city: 'Washington, DC',
  },
};

export function resolveOrganizationEntity(
  rawName: string,
  countryCode = 'IN',
  hintType?: EmployerType
): OrganizationEntity {
  const clean = (rawName || '').trim();
  const lower = clean.toLowerCase();

  // 1. Check exact or alias match against known entities
  for (const [key, entity] of Object.entries(CANONICAL_GOVERNMENT_ENTITIES)) {
    if (lower.includes(key)) {
      return {
        id: `org-${key}`,
        legal_name: entity.legal_name || clean,
        display_name: entity.display_name || clean,
        website: entity.website || 'https://india.gov.in',
        country_code: entity.country_code || countryCode,
        organization_type: entity.organization_type || 'GOVERNMENT',
        verification_status: entity.verification_status || 'GOVERNMENT_VERIFIED',
        headquarters_city: entity.headquarters_city,
      };
    }
  }

  // 2. Infer organization type from keywords
  let orgType: EmployerType = hintType || 'PRIVATE';
  let verification: OrganizationEntity['verification_status'] = 'UNVERIFIED';

  if (
    lower.includes('ministry') ||
    lower.includes('department of') ||
    lower.includes('commission') ||
    lower.includes('government of') ||
    lower.includes('govt of') ||
    lower.includes('sarkari') ||
    lower.includes('board of') ||
    lower.includes('pradesh') ||
    lower.includes('police')
  ) {
    orgType = 'GOVERNMENT';
    verification = 'GOVERNMENT_VERIFIED';
  } else if (
    lower.includes('limited') && (lower.includes('corporation') || lower.includes('undertaking') || lower.includes('bharat') || lower.includes('national')) ||
    lower.includes('psu')
  ) {
    orgType = 'PSU';
    verification = 'GOVERNMENT_VERIFIED';
  } else if (lower.includes('university') || lower.includes('institute of') || lower.includes('hospital')) {
    orgType = 'PUBLIC_INSTITUTION';
    verification = 'BUSINESS_VERIFIED';
  }

  const slug = lower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return {
    id: `org-${slug || 'entity'}`,
    legal_name: clean || 'Hiring Organization',
    display_name: clean || 'Hiring Organization',
    website: orgType === 'GOVERNMENT' ? 'https://india.gov.in' : 'https://talentxcel.in',
    country_code: countryCode,
    organization_type: orgType,
    verification_status: verification,
  };
}

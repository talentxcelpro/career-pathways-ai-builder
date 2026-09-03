// src/lib/seo/regionalTaxonomy.ts
// TalentXcel Global Organic Acquisition Operating System (GO-AOS)
// Master Regional Markets, Currency Normalization, Locales & Reserved Root Slugs

import { AudienceSegment, BusinessSegment } from './acquisitionTaxonomy';
import { AcquisitionSurfaceId } from '@/lib/acquisition-os/types';

export type RegionalMarketId =
  | 'INDIA'
  | 'UAE'
  | 'UK'
  | 'USA'
  | 'EUROPE'
  | 'REST_OF_WORLD';

export const ALL_REGIONAL_MARKETS: RegionalMarketId[] = [
  'INDIA',
  'UAE',
  'UK',
  'USA',
  'EUROPE',
  'REST_OF_WORLD',
];

export type AcquisitionType =
  | 'ORGANIC_B2C'
  | 'ORGANIC_B2B'
  | 'ORGANIC_B2B2C';

export const ALL_ACQUISITION_TYPES: AcquisitionType[] = [
  'ORGANIC_B2C',
  'ORGANIC_B2B',
  'ORGANIC_B2B2C',
];

// ==========================================
// 1. RESERVED ROOT SLUG REGISTRY
// Prevents user handles from colliding with regional or core product routes
// ==========================================
export const RESERVED_ROOT_SLUGS: ReadonlySet<string> = new Set([
  // Regional prefixes
  'uae',
  'uk',
  'usa',
  'europe',
  'world',
  'india',
  // Core product surfaces & landing hubs
  'jobs',
  'resume',
  'tools',
  'companies',
  'company',
  'employer',
  'employers',
  'hire',
  'learning',
  'network',
  'passport',
  'career-map',
  'colleges',
  'services',
  'rankings',
  'claim1',
  'topics',
  'topic',
  'resources',
  'skills',
  'roles',
  'locations',
  'industries',
  // System, auth & legal routes
  'admin',
  'api',
  'auth',
  'login',
  'signup',
  'register',
  'terms',
  'privacy',
  'privacy-policy',
  'score',
  'b',
  'platform',
  'marketplace',
  'dashboard',
]);

/**
 * Validates whether a candidate slug is reserved by the platform architecture
 */
export function isReservedRootSlug(candidate: string): boolean {
  if (!candidate) return true;
  const clean = candidate.toLowerCase().trim().replace(/^[@/]+/, '');
  return RESERVED_ROOT_SLUGS.has(clean);
}

// ==========================================
// 2. REGIONAL MARKET CATALOG & METADATA
// ==========================================
export interface RegionalMarketConfig {
  id: RegionalMarketId;
  name: string;
  urlPrefix: string;
  flagEmoji: string;
  defaultCountryCode: string;
  defaultCurrency: string;
  defaultCurrencySymbol: string;
  defaultLocale: string;
  primaryAudiences: AudienceSegment[];
  primaryBusinessSegments: BusinessSegment[];
  primarySurfaces: AcquisitionSurfaceId[];
  strategicFocus: string;
  featuredCountries: Array<{ code: string; name: string; currency: string; locale: string }>;
}

export const REGIONAL_MARKETS: Record<RegionalMarketId, RegionalMarketConfig> = {
  INDIA: {
    id: 'INDIA',
    name: 'India & South Asia',
    urlPrefix: '', // Canonical root '/'
    flagEmoji: '🇮🇳',
    defaultCountryCode: 'in',
    defaultCurrency: 'INR',
    defaultCurrencySymbol: '₹',
    defaultLocale: 'en-IN',
    primaryAudiences: ['STUDENT', 'FRESHER', 'JOB_SEEKER', 'EMPLOYER', 'COLLEGE', 'TRAINING_COMPANY'],
    primaryBusinessSegments: ['B2C_STUDENT', 'B2C_JOB_SEEKER', 'B2B_EMPLOYER', 'B2B_COLLEGE', 'B2B_TRAINING'],
    primarySurfaces: ['JOBS', 'RESUME_BUILDER', 'COLLEGES', 'LEARNING', 'EMPLOYER'],
    strategicFocus: 'High-volume student-to-job transition, campus placement OS, campus cohort onboarding',
    featuredCountries: [{ code: 'in', name: 'India', currency: 'INR', locale: 'en-IN' }],
  },
  UAE: {
    id: 'UAE',
    name: 'United Arab Emirates & Middle East',
    urlPrefix: '/uae',
    flagEmoji: '🇦🇪',
    defaultCountryCode: 'ae',
    defaultCurrency: 'AED',
    defaultCurrencySymbol: 'AED',
    defaultLocale: 'en-AE',
    primaryAudiences: ['PROFESSIONAL', 'CAREER_PROFESSIONAL', 'EMPLOYER', 'RECRUITER', 'COMPANY', 'TRAINING_COMPANY'],
    primaryBusinessSegments: ['B2B_EMPLOYER', 'B2C_PROFESSIONAL', 'B2B_COMPANY', 'B2B_TRAINING'],
    primarySurfaces: ['EMPLOYER', 'JOBS', 'COMPANIES', 'SERVICES', 'CAREER_TOOLS'],
    strategicFocus: 'High-value expat tech relocation, corporate hiring packages, tax-free salary benchmarks',
    featuredCountries: [
      { code: 'ae', name: 'United Arab Emirates', currency: 'AED', locale: 'en-AE' },
      { code: 'sa', name: 'Saudi Arabia', currency: 'SAR', locale: 'en-SA' },
      { code: 'qa', name: 'Qatar', currency: 'QAR', locale: 'en-QA' },
    ],
  },
  UK: {
    id: 'UK',
    name: 'United Kingdom',
    urlPrefix: '/uk',
    flagEmoji: '🇬🇧',
    defaultCountryCode: 'gb',
    defaultCurrency: 'GBP',
    defaultCurrencySymbol: '£',
    defaultLocale: 'en-GB',
    primaryAudiences: ['JOB_SEEKER', 'EMPLOYER', 'COLLEGE', 'RECRUITER', 'PROFESSIONAL'],
    primaryBusinessSegments: ['B2B_EMPLOYER', 'B2B_COLLEGE', 'B2C_JOB_SEEKER', 'B2C_PROFESSIONAL'],
    primarySurfaces: ['JOBS', 'EMPLOYER', 'COLLEGES', 'RESUME_BUILDER', 'COMPANIES'],
    strategicFocus: 'High-LTV employer job slots, university graduate schemes, visa-sponsored career pathways',
    featuredCountries: [{ code: 'gb', name: 'United Kingdom', currency: 'GBP', locale: 'en-GB' }],
  },
  USA: {
    id: 'USA',
    name: 'United States of America',
    urlPrefix: '/usa',
    flagEmoji: '🇺🇸',
    defaultCountryCode: 'us',
    defaultCurrency: 'USD',
    defaultCurrencySymbol: '$',
    defaultLocale: 'en-US',
    primaryAudiences: ['PROFESSIONAL', 'EMPLOYER', 'RECRUITER', 'STUDENT', 'COMPANY'],
    primaryBusinessSegments: ['B2B_EMPLOYER', 'B2C_PROFESSIONAL', 'B2B_COMPANY', 'B2B_SERVICES'],
    primarySurfaces: ['EMPLOYER', 'RESUME_BUILDER', 'CAREER_TOOLS', 'JOBS', 'SERVICES'],
    strategicFocus: 'Direct enterprise recruitment subscriptions, remote US roles, high-ticket career services',
    featuredCountries: [{ code: 'us', name: 'United States', currency: 'USD', locale: 'en-US' }],
  },
  EUROPE: {
    id: 'EUROPE',
    name: 'European Union Tech Markets',
    urlPrefix: '/europe',
    flagEmoji: '🇪🇺',
    defaultCountryCode: 'de',
    defaultCurrency: 'EUR',
    defaultCurrencySymbol: '€',
    defaultLocale: 'en-DE',
    primaryAudiences: ['JOB_SEEKER', 'EMPLOYER', 'COLLEGE', 'PROFESSIONAL'],
    primaryBusinessSegments: ['B2B_EMPLOYER', 'B2C_JOB_SEEKER', 'B2C_PROFESSIONAL', 'B2B_COLLEGE'],
    primarySurfaces: ['JOBS', 'EMPLOYER', 'COMPANIES', 'LEARNING', 'COLLEGES'],
    strategicFocus: 'Country/language-specific tech hubs (Berlin, Amsterdam, Paris, Dublin, Madrid)',
    featuredCountries: [
      { code: 'de', name: 'Germany', currency: 'EUR', locale: 'de-DE' },
      { code: 'fr', name: 'France', currency: 'EUR', locale: 'fr-FR' },
      { code: 'nl', name: 'Netherlands', currency: 'EUR', locale: 'nl-NL' },
      { code: 'ie', name: 'Ireland', currency: 'EUR', locale: 'en-IE' },
      { code: 'es', name: 'Spain', currency: 'EUR', locale: 'es-ES' },
      { code: 'ch', name: 'Switzerland', currency: 'CHF', locale: 'de-CH' },
    ],
  },
  REST_OF_WORLD: {
    id: 'REST_OF_WORLD',
    name: 'Rest of World / Global Emerging Hubs',
    urlPrefix: '/world',
    flagEmoji: '🌎',
    defaultCountryCode: 'ca',
    defaultCurrency: 'USD',
    defaultCurrencySymbol: '$',
    defaultLocale: 'en-US',
    primaryAudiences: ['JOB_SEEKER', 'EMPLOYER', 'PROFESSIONAL'],
    primaryBusinessSegments: ['B2C_JOB_SEEKER', 'B2B_EMPLOYER', 'B2C_PROFESSIONAL'],
    primarySurfaces: ['JOBS', 'EMPLOYER', 'RESUME_BUILDER', 'CAREER_PASSPORT'],
    strategicFocus: 'Global remote employment demand, international digital credential verification',
    featuredCountries: [
      { code: 'ca', name: 'Canada', currency: 'CAD', locale: 'en-CA' },
      { code: 'au', name: 'Australia', currency: 'AUD', locale: 'en-AU' },
      { code: 'sg', name: 'Singapore', currency: 'SGD', locale: 'en-SG' },
      { code: 'nz', name: 'New Zealand', currency: 'NZD', locale: 'en-NZ' },
    ],
  },
};

// ==========================================
// 3. CURRENCY & LOCALE SEPARATION HELPERS
// Country determines currency, while Market defines strategy
// ==========================================
export function resolveCountryCurrency(countryCode: string): { currency: string; symbol: string } {
  const code = (countryCode || '').toLowerCase();
  switch (code) {
    case 'in': return { currency: 'INR', symbol: '₹' };
    case 'ae': return { currency: 'AED', symbol: 'AED' };
    case 'gb': return { currency: 'GBP', symbol: '£' };
    case 'us': return { currency: 'USD', symbol: '$' };
    case 'de':
    case 'fr':
    case 'nl':
    case 'ie':
    case 'es':
    case 'it':
      return { currency: 'EUR', symbol: '€' };
    case 'ch': return { currency: 'CHF', symbol: 'CHF' };
    case 'ca': return { currency: 'CAD', symbol: 'CA$' };
    case 'au': return { currency: 'AUD', symbol: 'A$' };
    case 'sg': return { currency: 'SGD', symbol: 'S$' };
    default: return { currency: 'USD', symbol: '$' };
  }
}

export function resolveCountryLocale(countryCode: string): string {
  const code = (countryCode || '').toLowerCase();
  switch (code) {
    case 'in': return 'en-IN';
    case 'ae': return 'en-AE';
    case 'gb': return 'en-GB';
    case 'us': return 'en-US';
    case 'de': return 'de-DE';
    case 'fr': return 'fr-FR';
    case 'es': return 'es-ES';
    case 'nl': return 'nl-NL';
    case 'ca': return 'en-CA';
    case 'au': return 'en-AU';
    case 'sg': return 'en-SG';
    default: return 'en-US';
  }
}

export function getRegionalMarketById(marketId: RegionalMarketId): RegionalMarketConfig {
  return REGIONAL_MARKETS[marketId] || REGIONAL_MARKETS.INDIA;
}

export function getRegionalMarketByPrefix(prefix: string): RegionalMarketConfig {
  const clean = (prefix || '').toLowerCase().replace(/^\/+|\/+$/g, '');
  if (clean === 'uae') return REGIONAL_MARKETS.UAE;
  if (clean === 'uk') return REGIONAL_MARKETS.UK;
  if (clean === 'usa') return REGIONAL_MARKETS.USA;
  if (clean === 'europe') return REGIONAL_MARKETS.EUROPE;
  if (clean === 'world') return REGIONAL_MARKETS.REST_OF_WORLD;
  return REGIONAL_MARKETS.INDIA;
}

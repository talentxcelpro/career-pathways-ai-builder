// src/lib/seo/brandIntelligence/brandQueryClassifier.ts
// TalentXcel Deterministic Brand Query Classifier
// Multi-dimensional: a single query can be BRAND_JOBS + geo=Dubai simultaneously.
// BRAND_SEED_QUERIES: test fixtures ONLY. Never fabricate production impressions/clicks.

import { normalizeAcquisitionQuery } from '@/lib/seo/queryAudienceMapper';

// ==========================================
// 1. BRAND SUBCATEGORY TAXONOMY (9 classes)
// ==========================================
export type BrandSubCategory =
  | 'BRAND_NAVIGATION'   // "talentxcel", "talentxcel app" — pure brand lookup
  | 'BRAND_PRODUCT'      // "talentxcel resume builder", "talentxcel ATS"
  | 'BRAND_JOBS'         // "talentxcel jobs", "talentxcel vacancies"
  | 'BRAND_EMPLOYER'     // "talentxcel employer", "talentxcel post job"
  | 'BRAND_LOCATION'     // "talentxcel jobs dubai", "talentxcel india" (augments BRAND_JOBS)
  | 'BRAND_PERSON'       // "talentxcel founder", "talentxcel CEO", "talentxcel team"
  | 'BRAND_REPUTATION'   // "talentxcel reviews", "talentxcel scam", "talentxcel legit"
  | 'BRAND_SUPPORT'      // "talentxcel login", "talentxcel contact", "talentxcel help"
  | 'BRAND_COMPARISON';  // "talentxcel vs naukri", "talentxcel alternatives"

export const ALL_BRAND_SUBCATEGORIES: BrandSubCategory[] = [
  'BRAND_NAVIGATION',
  'BRAND_PRODUCT',
  'BRAND_JOBS',
  'BRAND_EMPLOYER',
  'BRAND_LOCATION',
  'BRAND_PERSON',
  'BRAND_REPUTATION',
  'BRAND_SUPPORT',
  'BRAND_COMPARISON',
];

// ==========================================
// 2. BRAND CLASSIFICATION RESULT
// ==========================================
export interface BrandClassificationResult {
  isBranded: boolean;
  // Multi-dimensional: one query can have multiple sub-categories
  subCategories: BrandSubCategory[];
  // Primary sub-category (highest confidence match)
  primarySubCategory: BrandSubCategory | null;
  // Inferred product surface for brand+product queries
  productSignal: string | null;
  // Geo signal extracted from the query
  geoSignal: string | null;
  // Competitor mentioned in query (for BRAND_COMPARISON)
  competitorMentioned: string | null;
  confidence: number; // 0.00–1.00
}

// ==========================================
// 3. RULE TABLES — deterministic, not NLP
// ==========================================

/** Primary brand trigger token — query must contain this to be classified as branded */
const BRAND_TOKEN = 'talentxcel';

/** Rule → sub-category mapping ordered by specificity (most specific first) */
const PRODUCT_TOKENS = [
  'resume builder', 'resume studio', 'ats scanner', 'ats', 'resume', 'cv maker',
  'career tools', 'career map', 'career passport', 'learning', 'courses',
  'network', 'ranking', 'companies', 'college', 'global programs', 'scholarships',
];

const JOB_TOKENS = [
  'job', 'jobs', 'vacancy', 'vacancies', 'opening', 'openings',
  'career', 'careers', 'hiring', 'internship',
];

const EMPLOYER_TOKENS = [
  'employer', 'post job', 'hire', 'staffing', 'recruiter', 'recruitment',
  'talent acquisition', 'b2b', 'enterprise',
];

const PERSON_TOKENS = [
  'founder', 'ceo', 'cto', 'team', 'who created', 'who made',
  'arshid', 'investor',
];

const REPUTATION_TOKENS = [
  'review', 'reviews', 'scam', 'legit', 'real', 'fake', 'trustworthy',
  'rating', 'complaint', 'experience', 'feedback',
];

const SUPPORT_TOKENS = [
  'login', 'sign in', 'sign up', 'signup', 'password', 'forgot',
  'contact', 'support', 'help', 'customer service', 'email',
  'not working', 'error', 'issue',
];

const COMPARISON_TOKENS = [
  'vs', 'versus', 'alternative', 'alternatives', 'better than', 'like',
  'similar to', 'competitor', 'compare',
  'naukri', 'linkedin', 'indeed', 'monster', 'shine', 'glassdoor',
  'internshala', 'hirist', 'iimjobs',
];

/** Geo token detection — returns extracted geo label or null */
function extractGeoSignal(q: string): string | null {
  // Detect common geo terms — integrates with the existing geoEntityResolver
  const geoPatterns = [
    /\b(dubai|abu dhabi|sharjah|uae|emirates)\b/,
    /\b(india|delhi|mumbai|bangalore|bengaluru|hyderabad|chennai|pune|kolkata|noida|gurugram|gurgaon)\b/,
    /\b(uk|london|manchester|birmingham|england|britain)\b/,
    /\b(usa|us|new york|california|texas|seattle|silicon valley)\b/,
    /\b(europe|germany|france|netherlands|amsterdam|berlin)\b/,
    /\b(singapore|malaysia|australia|canada|gulf|mena|global|worldwide)\b/,
  ];
  for (const pat of geoPatterns) {
    const m = q.match(pat);
    if (m) return m[1];
  }
  return null;
}

/** Competitor detection — returns competitor name or null */
function extractCompetitorSignal(q: string): string | null {
  const competitors = [
    'naukri', 'linkedin', 'indeed', 'monster', 'shine', 'glassdoor',
    'internshala', 'hirist', 'iimjobs', 'apna', 'foundit', 'timesjobs',
  ];
  for (const c of competitors) {
    if (q.includes(c)) return c;
  }
  return null;
}

function tokenMatches(q: string, tokens: string[]): boolean {
  return tokens.some(t => q.includes(t));
}

// ==========================================
// 4. MAIN CLASSIFIER — deterministic, multi-dimensional
// ==========================================

/**
 * Classifies whether a search query targets the TalentXcel brand.
 * Multi-dimensional: a query can match BRAND_JOBS + BRAND_LOCATION simultaneously.
 * Does NOT invent impressions, clicks, or metrics — classification only.
 */
export function classifyBrandQuery(rawQuery: string): BrandClassificationResult {
  const q = normalizeAcquisitionQuery(rawQuery);

  if (!q.includes(BRAND_TOKEN)) {
    return {
      isBranded: false,
      subCategories: [],
      primarySubCategory: null,
      productSignal: null,
      geoSignal: null,
      competitorMentioned: null,
      confidence: 0,
    };
  }

  const subCategories: BrandSubCategory[] = [];
  let productSignal: string | null = null;
  const geoSignal = extractGeoSignal(q);
  const competitorMentioned = extractCompetitorSignal(q);

  // Evaluate each dimension independently (multi-dimensional)
  if (tokenMatches(q, COMPARISON_TOKENS)) {
    subCategories.push('BRAND_COMPARISON');
  }

  if (tokenMatches(q, REPUTATION_TOKENS)) {
    subCategories.push('BRAND_REPUTATION');
  }

  if (tokenMatches(q, SUPPORT_TOKENS)) {
    subCategories.push('BRAND_SUPPORT');
  }

  if (tokenMatches(q, PERSON_TOKENS)) {
    subCategories.push('BRAND_PERSON');
  }

  if (tokenMatches(q, EMPLOYER_TOKENS)) {
    subCategories.push('BRAND_EMPLOYER');
  }

  if (tokenMatches(q, JOB_TOKENS)) {
    subCategories.push('BRAND_JOBS');
  }

  // BRAND_LOCATION augments BRAND_JOBS (not mutually exclusive)
  if (geoSignal) {
    subCategories.push('BRAND_LOCATION');
  }

  // Detect product with most specific match first
  const matchedProduct = PRODUCT_TOKENS.find(t => q.includes(t));
  if (matchedProduct) {
    subCategories.push('BRAND_PRODUCT');
    productSignal = matchedProduct;
  }

  // Default to BRAND_NAVIGATION if no other category matched
  if (subCategories.length === 0) {
    subCategories.push('BRAND_NAVIGATION');
  }

  // Primary = first in priority order: COMPARISON → REPUTATION → EMPLOYER → PRODUCT → JOBS → SUPPORT → PERSON → LOCATION → NAVIGATION
  const PRIORITY: BrandSubCategory[] = [
    'BRAND_COMPARISON',
    'BRAND_REPUTATION',
    'BRAND_EMPLOYER',
    'BRAND_PRODUCT',
    'BRAND_JOBS',
    'BRAND_SUPPORT',
    'BRAND_PERSON',
    'BRAND_LOCATION',
    'BRAND_NAVIGATION',
  ];
  const primarySubCategory = PRIORITY.find(p => subCategories.includes(p)) ?? subCategories[0];

  // Confidence: 0.99 if brand token is exact word, lower if partial
  const confidence = q.split(/\s+/).includes(BRAND_TOKEN) ? 0.99 : 0.92;

  return {
    isBranded: true,
    subCategories: Array.from(new Set(subCategories)),
    primarySubCategory,
    productSignal,
    geoSignal,
    competitorMentioned,
    confidence,
  };
}

/**
 * Convenience boolean test — is this query branded?
 */
export function isBrandedQuery(rawQuery: string): boolean {
  return classifyBrandQuery(rawQuery).isBranded;
}

/**
 * Resolves the best landing page for a branded query using existing GO-AOS logic.
 * Routes brand+product to the product surface; brand+jobs+geo to the regional jobs page.
 */
export function resolveBrandedLandingPage(result: BrandClassificationResult): string {
  const { subCategories, productSignal, geoSignal } = result;

  if (!result.isBranded) return '/about/talentxcel';

  // BRAND_JOBS + BRAND_LOCATION → regional jobs
  if (subCategories.includes('BRAND_JOBS') && geoSignal) {
    const geoSlug = geoSignal.toLowerCase().replace(/\s+/g, '-');
    const geoToMarket: Record<string, string> = {
      dubai: '/uae', 'abu dhabi': '/uae', sharjah: '/uae', uae: '/uae', emirates: '/uae',
      uk: '/uk', london: '/uk', manchester: '/uk',
      usa: '/usa', us: '/usa', 'new york': '/usa',
      europe: '/europe', germany: '/europe', france: '/europe',
    };
    const marketPrefix = Object.entries(geoToMarket).find(([k]) => geoSlug.includes(k))?.[1] ?? '';
    return marketPrefix ? `${marketPrefix}/jobs` : '/jobs';
  }

  // BRAND_LOCATION (pure brand + geo, e.g. "talentxcel dubai") → regional portal
  if (subCategories.includes('BRAND_LOCATION') && geoSignal) {
    const geoSlug = geoSignal.toLowerCase().replace(/\s+/g, '-');
    const geoToMarket: Record<string, string> = {
      dubai: '/uae', 'abu dhabi': '/uae', sharjah: '/uae', uae: '/uae', emirates: '/uae',
      uk: '/uk', london: '/uk', manchester: '/uk',
      usa: '/usa', us: '/usa', 'new york': '/usa',
      europe: '/europe', germany: '/europe', france: '/europe',
    };
    const marketPrefix = Object.entries(geoToMarket).find(([k]) => geoSlug.includes(k))?.[1] ?? '';
    return marketPrefix || '/about/talentxcel';
  }

  // BRAND_JOBS → jobs index
  if (subCategories.includes('BRAND_JOBS')) return '/jobs';

  // BRAND_EMPLOYER → hire portal
  if (subCategories.includes('BRAND_EMPLOYER')) return '/hire';

  // BRAND_PRODUCT → specific product route
  if (subCategories.includes('BRAND_PRODUCT') && productSignal) {
    if (productSignal.includes('resume') || productSignal.includes('ats') || productSignal.includes('cv')) return '/resume';
    if (productSignal.includes('learning') || productSignal.includes('course')) return '/learning';
    if (productSignal.includes('college') || productSignal.includes('global programs')) return '/colleges';
    if (productSignal.includes('network')) return '/network';
    if (productSignal.includes('career map')) return '/career-map';
    if (productSignal.includes('career passport')) return '/passport';
    if (productSignal.includes('career tools')) return '/tools';
    if (productSignal.includes('compan')) return '/companies';
    if (productSignal.includes('ranking')) return '/rankings';
    if (productSignal.includes('scholarship')) return '/colleges/scholarships';
  }

  // BRAND_SUPPORT → help
  if (subCategories.includes('BRAND_SUPPORT')) return '/help';

  // BRAND_REPUTATION | BRAND_COMPARISON | BRAND_PERSON | BRAND_NAVIGATION → canonical brand page
  return '/about/talentxcel';
}

// ==========================================
// 5. BRAND SEED QUERIES — TEST FIXTURES ONLY
// ⚠ DO NOT use to fabricate production metrics.
// ==========================================
export interface BrandSeedQuery {
  query: string;
  expectedPrimary: BrandSubCategory;
  expectedSubCategories: BrandSubCategory[];
  expectedGeo: string | null;
}

export const BRAND_SEED_QUERIES: BrandSeedQuery[] = [
  // Navigation
  { query: 'talentxcel', expectedPrimary: 'BRAND_NAVIGATION', expectedSubCategories: ['BRAND_NAVIGATION'], expectedGeo: null },
  { query: 'talentxcel app', expectedPrimary: 'BRAND_NAVIGATION', expectedSubCategories: ['BRAND_NAVIGATION'], expectedGeo: null },
  // Support
  { query: 'talentxcel login', expectedPrimary: 'BRAND_SUPPORT', expectedSubCategories: ['BRAND_SUPPORT'], expectedGeo: null },
  { query: 'talentxcel sign up', expectedPrimary: 'BRAND_SUPPORT', expectedSubCategories: ['BRAND_SUPPORT'], expectedGeo: null },
  { query: 'talentxcel contact', expectedPrimary: 'BRAND_SUPPORT', expectedSubCategories: ['BRAND_SUPPORT'], expectedGeo: null },
  // Product
  { query: 'talentxcel resume builder', expectedPrimary: 'BRAND_PRODUCT', expectedSubCategories: ['BRAND_PRODUCT'], expectedGeo: null },
  { query: 'talentxcel ATS', expectedPrimary: 'BRAND_PRODUCT', expectedSubCategories: ['BRAND_PRODUCT'], expectedGeo: null },
  { query: 'talentxcel resume', expectedPrimary: 'BRAND_PRODUCT', expectedSubCategories: ['BRAND_PRODUCT'], expectedGeo: null },
  { query: 'talentxcel network', expectedPrimary: 'BRAND_PRODUCT', expectedSubCategories: ['BRAND_PRODUCT'], expectedGeo: null },
  // Jobs
  { query: 'talentxcel jobs', expectedPrimary: 'BRAND_JOBS', expectedSubCategories: ['BRAND_JOBS'], expectedGeo: null },
  { query: 'talentxcel vacancies', expectedPrimary: 'BRAND_JOBS', expectedSubCategories: ['BRAND_JOBS'], expectedGeo: null },
  { query: 'talentxcel careers', expectedPrimary: 'BRAND_JOBS', expectedSubCategories: ['BRAND_JOBS'], expectedGeo: null },
  // Jobs + Location (multi-dimensional)
  { query: 'talentxcel jobs dubai', expectedPrimary: 'BRAND_JOBS', expectedSubCategories: ['BRAND_JOBS', 'BRAND_LOCATION'], expectedGeo: 'dubai' },
  { query: 'talentxcel jobs india', expectedPrimary: 'BRAND_JOBS', expectedSubCategories: ['BRAND_JOBS', 'BRAND_LOCATION'], expectedGeo: 'india' },
  { query: 'talentxcel jobs bangalore', expectedPrimary: 'BRAND_JOBS', expectedSubCategories: ['BRAND_JOBS', 'BRAND_LOCATION'], expectedGeo: 'bangalore' },
  // Location (pure brand + geo)
  { query: 'talentxcel dubai', expectedPrimary: 'BRAND_LOCATION', expectedSubCategories: ['BRAND_LOCATION'], expectedGeo: 'dubai' },
  { query: 'talentxcel india', expectedPrimary: 'BRAND_LOCATION', expectedSubCategories: ['BRAND_LOCATION'], expectedGeo: 'india' },
  // Employer
  { query: 'talentxcel employer', expectedPrimary: 'BRAND_EMPLOYER', expectedSubCategories: ['BRAND_EMPLOYER'], expectedGeo: null },
  { query: 'talentxcel post job', expectedPrimary: 'BRAND_EMPLOYER', expectedSubCategories: ['BRAND_EMPLOYER'], expectedGeo: null },
  { query: 'talentxcel hire', expectedPrimary: 'BRAND_EMPLOYER', expectedSubCategories: ['BRAND_EMPLOYER'], expectedGeo: null },
  // Person
  { query: 'talentxcel founder', expectedPrimary: 'BRAND_PERSON', expectedSubCategories: ['BRAND_PERSON'], expectedGeo: null },
  { query: 'talentxcel ceo', expectedPrimary: 'BRAND_PERSON', expectedSubCategories: ['BRAND_PERSON'], expectedGeo: null },
  { query: 'talentxcel team', expectedPrimary: 'BRAND_PERSON', expectedSubCategories: ['BRAND_PERSON'], expectedGeo: null },
  // Reputation
  { query: 'talentxcel reviews', expectedPrimary: 'BRAND_REPUTATION', expectedSubCategories: ['BRAND_REPUTATION'], expectedGeo: null },
  { query: 'talentxcel scam', expectedPrimary: 'BRAND_REPUTATION', expectedSubCategories: ['BRAND_REPUTATION'], expectedGeo: null },
  { query: 'talentxcel legit', expectedPrimary: 'BRAND_REPUTATION', expectedSubCategories: ['BRAND_REPUTATION'], expectedGeo: null },
  // Comparison
  { query: 'talentxcel vs naukri', expectedPrimary: 'BRAND_COMPARISON', expectedSubCategories: ['BRAND_COMPARISON'], expectedGeo: null },
  { query: 'talentxcel vs linkedin', expectedPrimary: 'BRAND_COMPARISON', expectedSubCategories: ['BRAND_COMPARISON'], expectedGeo: null },
  { query: 'talentxcel alternatives', expectedPrimary: 'BRAND_COMPARISON', expectedSubCategories: ['BRAND_COMPARISON'], expectedGeo: null },
  { query: 'talentxcel review', expectedPrimary: 'BRAND_REPUTATION', expectedSubCategories: ['BRAND_REPUTATION'], expectedGeo: null },
];

/**
 * Test runner for brand classifier correctness.
 * Returns pass/fail count — zero external dependencies.
 */
export function runBrandClassifierSelfTest(): { passed: number; failed: number; failures: string[] } {
  const failures: string[] = [];
  for (const seed of BRAND_SEED_QUERIES) {
    const result = classifyBrandQuery(seed.query);
    if (!result.isBranded) {
      failures.push(`"${seed.query}": expected branded, got not-branded`);
      continue;
    }
    if (result.primarySubCategory !== seed.expectedPrimary) {
      failures.push(`"${seed.query}": expected primary=${seed.expectedPrimary}, got ${result.primarySubCategory}`);
    }
    for (const expected of seed.expectedSubCategories) {
      if (!result.subCategories.includes(expected)) {
        failures.push(`"${seed.query}": missing expected sub-category=${expected}`);
      }
    }
    if (seed.expectedGeo !== null && result.geoSignal !== seed.expectedGeo) {
      failures.push(`"${seed.query}": expected geo=${seed.expectedGeo}, got ${result.geoSignal}`);
    }
  }
  return { passed: BRAND_SEED_QUERIES.length - failures.length, failed: failures.length, failures };
}

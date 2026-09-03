// src/lib/seo/queryAudienceMapper.ts
// TalentXcel Global Organic Acquisition Operating System (GO-AOS)
// Multi-Dimensional Semantic Query -> Geo -> Intent -> Audience -> Business Segment -> Acquisition Type -> Product -> Content Gap Mapper
// Zero Hardcoded Cities — Fully Dynamic with Provenance & Confidence Tracking

import { AcquisitionSurfaceId } from '@/lib/acquisition-os/types';
import { 
  SearchIntentCategory, 
  AudienceSegment, 
  BusinessSegment, 
  AcquisitionEventType,
  PRODUCT_CONVERSION_REGISTRY 
} from './acquisitionTaxonomy';
import { RegionalMarketId, AcquisitionType, REGIONAL_MARKETS } from './regionalTaxonomy';
import { resolveGeoEntityFromQuery, ResolvedGeoEntity } from './geoEntityResolver';

export type ContentGapStatus = 'OPTIMIZE_EXISTING' | 'CREATE_CANONICAL' | 'CONSOLIDATE_PARENT';

export interface ProvenanceInference<T> {
  value: T;
  confidence: number; // 0.00 to 1.00
  provenance: string;
  evidenceSnippet?: string;
}

export interface QueryAcquisitionMapping {
  rawQuery: string;
  normalizedQuery: string;
  intentCategory: SearchIntentCategory;
  primaryAudience: AudienceSegment;
  secondaryAudiences: AudienceSegment[];
  businessSegment: BusinessSegment;
  acquisitionType: AcquisitionType;
  productSurface: AcquisitionSurfaceId;
  recommendedLandingPage: string;
  primaryConversion: AcquisitionEventType;
  businessGoal: string;
  matchConfidence: number; // 0.00 to 1.00

  // Regional & Geographic Inferences
  geo: ResolvedGeoEntity;
  market: RegionalMarketId;
  countryCode: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  contentGapStatus: ContentGapStatus;

  // Complete Audit Trace of Inferences
  inferences: {
    geo: ProvenanceInference<string>;
    intent: ProvenanceInference<SearchIntentCategory>;
    audience: ProvenanceInference<AudienceSegment>;
    businessSegment: ProvenanceInference<BusinessSegment>;
    acquisitionType: ProvenanceInference<AcquisitionType>;
    product: ProvenanceInference<AcquisitionSurfaceId>;
    contentGap: ProvenanceInference<ContentGapStatus>;
  };
}

/**
 * Normalizes query string for uniform tokenization and matching
 */
export function normalizeAcquisitionQuery(query: string): string {
  return (query || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Classifies query into one of the 20 Search Intent Categories with provenance
 */
export function classifySearchIntentCategoryWithEvidence(query: string): ProvenanceInference<SearchIntentCategory> {
  const q = normalizeAcquisitionQuery(query);

  if (q.includes('talentxcel') || q.includes('chatr') || q.includes('savantis')) {
    return { value: 'BRAND', confidence: 0.99, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'TalentXcel branded entity' };
  }
  if (q.includes('college placement') || q.includes('campus hiring') || q.includes('tpo software') || q.includes('campus recruitment')) {
    return { value: 'COLLEGE', confidence: 0.96, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'Institutional placement software keyword' };
  }
  if (q.includes('training') || q.includes('vocational') || q.includes('certification partner') || q.includes('coaching institute')) {
    return { value: 'TRAINING', confidence: 0.92, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'Vocational training keyword' };
  }
  if (q.includes('hire') || q.includes('recruiter') || q.includes('staffing') || q.includes('post job') || q.includes('employer')) {
    return { value: 'HIRING', confidence: 0.97, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'B2B Employer hiring intent' };
  }
  if (q.includes('ats') || q.includes('resume score') || q.includes('resume checker') || q.includes('resume scanner')) {
    return { value: 'ATS', confidence: 0.98, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'ATS utility scanner keyword' };
  }
  if (q.includes('resume') || q.includes('cv maker') || q.includes('curriculum vitae')) {
    return { value: 'RESUME', confidence: 0.95, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'Resume builder keyword' };
  }
  if (q.includes('salary') || q.includes('pay scale') || q.includes('compensation') || q.includes('in-hand')) {
    return { value: 'SALARY', confidence: 0.94, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'Compensation calculator keyword' };
  }
  if (q.includes('interview') || q.includes('mock test') || q.includes('questions and answers')) {
    return { value: 'INTERVIEW', confidence: 0.91, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'Interview prep tool keyword' };
  }
  if (q.includes('career map') || q.includes('career path') || q.includes('how to become') || q.includes('career switch')) {
    return { value: 'CAREER_EXPLORATION', confidence: 0.90, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'Career roadmap keyword' };
  }
  if (q.includes('course') || q.includes('learn') || q.includes('tutorial') || q.includes('syllabus')) {
    return { value: 'LEARNING', confidence: 0.90, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'Education & course keyword' };
  }
  if (q.includes('passport') || q.includes('portfolio') || q.includes('credentials') || q.includes('digital profile')) {
    return { value: 'CAREER_PASSPORT', confidence: 0.93, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'Digital identity passport keyword' };
  }
  if (q.includes('network') || q.includes('connect with') || q.includes('professionals in') || q.includes('peers')) {
    return { value: 'NETWORKING', confidence: 0.89, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'Professional networking keyword' };
  }
  if (q.includes('company') || q.includes('reviews') || q.includes('work culture') || q.includes('overview')) {
    return { value: 'COMPANY', confidence: 0.88, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'Corporate profile keyword' };
  }
  if (q.includes('college') || q.includes('university') || q.includes('admission') || q.includes('cutoff')) {
    return { value: 'COLLEGE', confidence: 0.90, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'Higher education keyword' };
  }
  if (q.includes('executive resume') || q.includes('coaching service') || q.includes('consulting')) {
    return { value: 'B2B_SERVICES', confidence: 0.91, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'Executive career service keyword' };
  }
  if (q.includes('job') || q.includes('vacancy') || q.includes('openings') || q.includes('fresher jobs') || q.includes('remote jobs')) {
    return { value: 'JOB_SEARCH', confidence: 0.95, provenance: 'TAXONOMY_SEMANTIC_MATCH', evidenceSnippet: 'Transactional job vacancy keyword' };
  }

  return { value: 'JOB_SEARCH', confidence: 0.75, provenance: 'DEFAULT_FALLBACK', evidenceSnippet: 'Default transactional job intent' };
}

export function classifySearchIntentCategory(query: string): SearchIntentCategory {
  return classifySearchIntentCategoryWithEvidence(query).value;
}

/**
 * Classifies audience segments from query tokens with evidence
 */
export function classifyQueryAudience(query: string): AudienceSegment[] {
  const q = normalizeAcquisitionQuery(query);
  const audiences: AudienceSegment[] = [];

  // B2B College signals
  if (q.includes('college') || q.includes('campus') || q.includes('placement cell') || q.includes('tpo') || q.includes('university')) {
    audiences.push('COLLEGE');
  }

  // B2B Employer & Recruiter signals
  if (q.includes('hire') || q.includes('recruiter') || q.includes('hiring manager') || q.includes('post job') || q.includes('staffing') || q.includes('employer')) {
    audiences.push('EMPLOYER');
    audiences.push('RECRUITER');
  }

  // Training provider signals
  if (q.includes('training institute') || q.includes('coaching') || q.includes('upskilling partner')) {
    audiences.push('TRAINING_COMPANY');
    audiences.push('LEARNING_PROVIDER');
  }

  // Fresher & Student signals
  if (q.includes('fresher') || q.includes('freshers') || q.includes('graduate') || q.includes('entry level') || q.includes('0-1 years')) {
    audiences.push('FRESHER');
    audiences.push('STUDENT');
  }
  if (q.includes('intern') || q.includes('internship')) {
    audiences.push('INTERNSHIP_SEEKER');
    audiences.push('STUDENT');
  }

  // Remote seekers
  if (q.includes('remote') || q.includes('work from home') || q.includes('wfh')) {
    audiences.push('REMOTE_SEEKER');
  }

  // Experienced professionals
  if (q.includes('senior') || q.includes('lead') || q.includes('manager') || q.includes('executive') || q.includes('experienced') || q.includes('director')) {
    audiences.push('PROFESSIONAL');
    audiences.push('CAREER_PROFESSIONAL');
  }

  if (audiences.length === 0) {
    audiences.push('JOB_SEEKER');
  }

  return Array.from(new Set(audiences));
}

/**
 * Classifies overarching business segment
 */
export function classifyQueryBusinessSegment(query: string, audiences: AudienceSegment[]): BusinessSegment {
  if (audiences.includes('COLLEGE')) return 'B2B_COLLEGE';
  if (audiences.includes('EMPLOYER') || audiences.includes('RECRUITER')) return 'B2B_EMPLOYER';
  if (audiences.includes('TRAINING_COMPANY') || audiences.includes('LEARNING_PROVIDER')) return 'B2B_TRAINING';
  if (audiences.includes('COMPANY')) return 'B2B_COMPANY';
  if (audiences.includes('STUDENT') || audiences.includes('FRESHER') || audiences.includes('INTERNSHIP_SEEKER')) return 'B2C_STUDENT';
  if (audiences.includes('PROFESSIONAL') || audiences.includes('CAREER_PROFESSIONAL')) return 'B2C_PROFESSIONAL';
  
  return 'B2C_JOB_SEEKER';
}

/**
 * Classifies acquisition type (ORGANIC_B2C | ORGANIC_B2B | ORGANIC_B2B2C)
 */
export function classifyAcquisitionType(businessSegment: BusinessSegment): AcquisitionType {
  if (businessSegment === 'B2B_COLLEGE' || businessSegment === 'B2B_TRAINING' || businessSegment === 'B2B_EDUCATION') {
    return 'ORGANIC_B2B2C'; // Institutional partnership that funnels students into TalentXcel
  }
  if (businessSegment === 'B2B_EMPLOYER' || businessSegment === 'B2B_COMPANY' || businessSegment === 'B2B_SERVICES') {
    return 'ORGANIC_B2B'; // Direct employer/corporate acquisition
  }
  return 'ORGANIC_B2C'; // Direct candidate/learner acquisition
}

/**
 * Performs Content Gap Check: Determines whether existing canonical page serves query or a new page is needed
 */
export function evaluateContentGap(product: AcquisitionSurfaceId, geo: ResolvedGeoEntity, intent: SearchIntentCategory): ContentGapStatus {
  // If query targets a specific city without active jobs matrix or an employer lead page
  if (intent === 'HIRING' || intent === 'EMPLOYER') {
    return 'OPTIMIZE_EXISTING'; // Core /hire or /:region/employers already exists
  }
  if (product === 'RESUME_BUILDER' || product === 'CAREER_TOOLS') {
    return 'OPTIMIZE_EXISTING'; // Single authoritative utility tools exist
  }
  if (geo.cityName && geo.market !== 'INDIA') {
    return 'CREATE_CANONICAL'; // Emerging international location demand
  }
  return 'OPTIMIZE_EXISTING';
}

/**
 * Constructs Regional Destination URL based on Market, Country, Product, and City
 */
export function resolveRegionalDestination(
  product: AcquisitionSurfaceId,
  geo: ResolvedGeoEntity,
  intent: SearchIntentCategory
): string {
  const marketCfg = REGIONAL_MARKETS[geo.market] || REGIONAL_MARKETS.INDIA;
  const prefix = marketCfg.urlPrefix; // e.g. '', '/uae', '/uk', '/usa', '/europe', '/world'

  // 1. Employer Acquisition
  if (product === 'EMPLOYER' || intent === 'HIRING') {
    return prefix ? `${prefix}/employers` : '/hire';
  }

  // 2. Colleges & Universities
  if (product === 'COLLEGES') {
    return prefix ? `${prefix}/colleges` : '/colleges';
  }

  // 3. Resume Builder & ATS
  if (product === 'RESUME_BUILDER') {
    return intent === 'ATS' ? '/resume/ats-scanner' : '/resume';
  }

  // 4. Tools
  if (product === 'CAREER_TOOLS') {
    return '/tools';
  }

  // 5. Jobs Surface
  if (product === 'JOBS') {
    if (geo.citySlug) {
      if (geo.market === 'INDIA') {
        return `/jobs/${geo.citySlug}`;
      }
      return prefix ? `${prefix}/jobs/${geo.citySlug}` : `/jobs/${geo.citySlug}`;
    }
    return prefix ? `${prefix}/jobs` : '/jobs';
  }

  // 6. Companies
  if (product === 'COMPANIES') {
    return prefix ? `${prefix}/companies` : '/companies';
  }

  return prefix ? `${prefix}/jobs` : '/jobs';
}

/**
 * The Master Unified Multi-Dimensional Acquisition Mapping Engine
 */
export function mapQueryToRegionalProduct(rawQuery: string, countryHint?: string): QueryAcquisitionMapping {
  const norm = normalizeAcquisitionQuery(rawQuery);
  const geo = resolveGeoEntityFromQuery(norm, countryHint);
  const intentInf = classifySearchIntentCategoryWithEvidence(norm);
  const audiences = classifyQueryAudience(norm);
  const primaryAudience = audiences[0] || 'JOB_SEEKER';
  const businessSegment = classifyQueryBusinessSegment(norm, audiences);
  const acquisitionType = classifyAcquisitionType(businessSegment);

  let product: AcquisitionSurfaceId = 'JOBS';
  let productConf = 0.85;

  // Determine Product Surface based on semantic intent & business segment
  if (businessSegment === 'B2B_COLLEGE' || intentInf.value === 'COLLEGE') {
    product = 'COLLEGES';
    productConf = 0.95;
  } else if (businessSegment === 'B2B_EMPLOYER' || intentInf.value === 'HIRING' || intentInf.value === 'EMPLOYER') {
    product = 'EMPLOYER';
    productConf = 0.97;
  } else if (intentInf.value === 'RESUME') {
    product = 'RESUME_BUILDER';
    productConf = 0.95;
  } else if (intentInf.value === 'ATS') {
    product = 'RESUME_BUILDER';
    productConf = 0.98;
  } else if (intentInf.value === 'SALARY' || intentInf.value === 'INTERVIEW') {
    product = 'CAREER_TOOLS';
    productConf = 0.92;
  } else if (intentInf.value === 'LEARNING' || intentInf.value === 'TRAINING') {
    product = 'LEARNING';
    productConf = 0.91;
  } else if (intentInf.value === 'CAREER_EXPLORATION') {
    product = 'CAREER_MAP';
    productConf = 0.92;
  } else if (intentInf.value === 'CAREER_PASSPORT' || intentInf.value === 'PROFESSIONAL_IDENTITY') {
    product = 'CAREER_PASSPORT';
    productConf = 0.93;
  } else if (intentInf.value === 'NETWORKING') {
    product = 'NETWORK';
    productConf = 0.90;
  } else if (intentInf.value === 'COMPANY') {
    product = 'COMPANIES';
    productConf = 0.89;
  } else if (intentInf.value === 'B2B_SERVICES') {
    product = 'SERVICES';
    productConf = 0.92;
  } else {
    product = 'JOBS';
    productConf = 0.88;
  }

  const landingPage = resolveRegionalDestination(product, geo, intentInf.value);
  const contentGap = evaluateContentGap(product, geo, intentInf.value);
  const def = PRODUCT_CONVERSION_REGISTRY[product];

  const overallConfidence = Math.round(
    ((geo.confidenceScore * 0.25) + (intentInf.confidence * 0.25) + (productConf * 0.30) + 0.20) * 100
  ) / 100;

  return {
    rawQuery,
    normalizedQuery: norm,
    intentCategory: intentInf.value,
    primaryAudience,
    secondaryAudiences: audiences.slice(1),
    businessSegment,
    acquisitionType,
    productSurface: product,
    recommendedLandingPage: landingPage,
    primaryConversion: def.primaryConversion,
    businessGoal: def.businessGoal,
    matchConfidence: overallConfidence,

    geo,
    market: geo.market,
    countryCode: geo.countryCode,
    currency: geo.currency,
    currencySymbol: geo.currencySymbol,
    locale: geo.locale,
    contentGapStatus: contentGap,

    inferences: {
      geo: { value: `${geo.cityName || geo.countryName} (${geo.market})`, confidence: geo.confidenceScore, provenance: geo.provenance, evidenceSnippet: geo.evidenceSnippet },
      intent: intentInf,
      audience: { value: primaryAudience, confidence: 0.92, provenance: 'TOKEN_HEURISTIC' },
      businessSegment: { value: businessSegment, confidence: 0.94, provenance: 'AUDIENCE_TAXONOMY_MAP' },
      acquisitionType: { value: acquisitionType, confidence: 0.96, provenance: 'BUSINESS_SEGMENT_DERIVATION' },
      product: { value: product, confidence: productConf, provenance: 'SURFACE_REGISTRY_MAP' },
      contentGap: { value: contentGap, confidence: 0.90, provenance: 'PAGE_INDEX_AUDIT' },
    },
  };
}

/**
 * Backward compatibility alias for mapQueryToRegionalProduct
 */
export function mapQueryToProduct(rawQuery: string): QueryAcquisitionMapping {
  return mapQueryToRegionalProduct(rawQuery);
}

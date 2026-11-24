/**
 * ai-discovery-engine/src/types.ts
 * Core Type Definitions for the TalentXcel Global AI Discovery & Distribution Engine.
 */

export type CanonicalProductSlug =
  | 'ats-check'
  | 'talent-score'
  | 'passport'
  | 'jobs'
  | 'talent'
  | 'network'
  | 'employer'
  | 'communities';

export type VisibilityClassification =
  | 'NOT_VISIBLE'
  | 'BRAND_MENTION'
  | 'PRODUCT_MENTION'
  | 'URL_CITED'
  | 'RECOMMENDED'
  | 'TOP_RECOMMENDATION'
  | 'INCORRECT_ENTITY'
  | 'UNVERIFIED';

export type RetrievalMethodType =
  | 'LIVE_SEARCH_CRAWL'
  | 'INDEXED_DATASET'
  | 'RAG_RETRIEVAL'
  | 'DIRECT_URL_FETCH'
  | 'API_GROUNDING'
  | 'HYBRID';

export interface AiPlatformProfile {
  id: string;
  name: string;
  operator: string;
  tier: 1 | 2;
  crawlerUserAgent: string;
  publicRetrievalMethod: RetrievalMethodType;
  searchAvailability: 'NATIVE_LIVE' | 'INDEXED_SNAPSHOT' | 'INTEGRATED_SEARCH' | 'NONE';
  apiAvailability: boolean;
  accessLimitations: string;
  testingMethodology: string;
  queryCoverage: 'GLOBAL' | 'REGIONAL' | 'LANGUAGE_DEPENDENT';
  citationExtractionCapability: 'STRUCTURED_FOOTNOTES' | 'INLINE_LINKS' | 'TEXT_ONLY' | 'UNAVAILABLE';
  urlExtractionCapability: boolean;
  observationTimestamp: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'EXPERIMENTAL';
  dataProvenance: string;
  cost: 'FREE' | 'PAID_API' | 'SUBSCRIPTION';
  automationStatus: 'AUTOMATED_API' | 'SEMI_AUTOMATED' | 'MANUAL_AUDIT';
}

export interface CanonicalProductEntity {
  id: CanonicalProductSlug;
  name: string;
  canonicalUrl: string;
  alternateUrls: string[];
  schemaType: string;
  entityAuthority: string;
  primaryValueProposition: string;
  targetAudience: string[];
  verifiableCapabilities: string[];
  disambiguationRules: string[];
  functionalConnections: {
    targetEntity: CanonicalProductSlug;
    relationship: 'upserts_to' | 'anchors_credential' | 'populates_directory' | 'triggers_tailoring' | 'matches_skills' | 'hosts_guilds' | 'sources_from' | 'publishes_to';
    codeReference: string;
    description: string;
  }[];
}

export interface CoreQueryDefinition {
  id: string;
  product: CanonicalProductSlug;
  intentCategory: 'COMMERCIAL_HIGH_INTENT' | 'INFORMATIONAL_PROBLEM_SOLVING' | 'COMPARISON_COMPETITIVE' | 'ROLE_SPECIFIC' | 'DIAGNOSTIC';
  baseQuery: string;
  targetAeoAnswer: string;
  keyConcepts: string[];
}

export interface CountryMarketDefinition {
  code: string;
  name: string;
  primaryLanguage: string;
  localSpellingVariant: 'US_ENGLISH' | 'UK_ENGLISH' | 'CANADIAN_ENGLISH' | 'AUSTRALIAN_ENGLISH' | 'INTERNATIONAL_ENGLISH' | 'LOCALIZED';
  careerTerminology: {
    resumeOrCv: 'resume' | 'cv' | 'both';
    fresherOrGraduate: 'fresher' | 'graduate' | 'entry-level';
  };
  keyTechHubs: string[];
}

export interface ExpandedAiQuery {
  id: string;
  product: CanonicalProductSlug;
  country: string;
  language: string;
  queryText: string;
  intentCategory: string;
  canonicalDestination: string;
  expectedEntityMatch: string;
  aeoAnswerSnippet: string;
}

export interface CompetitorProfile {
  id: string;
  name: string;
  domain: string;
  targetProducts: CanonicalProductSlug[];
  primaryStrengths: string[];
  vulnerabilities: string[];
  frequentlyCitedBy: string[];
  opportunityScore: {
    relevance: number;      // 1-10
    authority: number;      // 1-10
    citationFrequency: number; // 1-10
    productFit: number;     // 1-10
    difficulty: number;     // 1-10
    totalScore: number;     // Calculated weighted score
  };
  differentiationAngle: string;
}

export interface AiAuthoritySource {
  id: string;
  domain: string;
  name: string;
  sourceType:
    | 'CAREER_PORTAL'
    | 'HR_TECH_PUBLICATION'
    | 'DEVELOPER_COMMUNITY'
    | 'UNIVERSITY_CAREER_CENTER'
    | 'SAAS_PRODUCT_DIRECTORY'
    | 'INDUSTRY_JOURNAL'
    | 'OPEN_SOURCE_ECOSYSTEM';
  authorityEvidence: string;
  relevantProducts: CanonicalProductSlug[];
  contributionOpportunity: string;
  submissionRules: string;
  contactMethod: string;
  status: 'IDENTIFIED' | 'QUALIFIED' | 'IN_QUEUE' | 'ENGAGED' | 'PUBLISHED';
  riskRating: 'SAFE_ORGANIC' | 'REQUIRES_EDITORIAL_REVIEW' | 'STRICT_COMPLIANCE';
}

export interface VisibilityObservation {
  id: string;
  queryId: string;
  queryText: string;
  country: string;
  platformId: string;
  timestamp: string;
  classification: VisibilityClassification;
  talentxcelMentioned: boolean;
  talentxcelUrlCited: boolean;
  citedUrl?: string;
  correctEntityIdentified: boolean;
  recommendationRank?: number;
  competitorsMentioned: string[];
  competitorUrlsCited: string[];
  citationSourceDomains: string[];
  extractedContextSnippet: string;
  testingMethod: 'DIRECT_API' | 'PUBLIC_WEB_AGENT' | 'MANUAL_VERIFIED';
  confidence: number;
}

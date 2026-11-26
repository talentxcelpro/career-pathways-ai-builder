// src/lib/seo/demandIntelligence/types.ts
// Core domain types for the TalentXcel Global Search Demand Intelligence & Opportunity Engine.

export type SourceAttribution =
  | 'VERIFIED_GSC'
  | 'VERIFIED_GA4'
  | 'VERIFIED_FIRST_PARTY_DB'
  | 'PUBLIC_SUGGEST_VERIFIED'
  | 'DISCOVERY_CORPUS_CSV'
  | 'TAXONOMY_EXPANSION_LINKEDIN_INSPIRED'
  | 'TAXONOMY_EXPANSION_NAUKRI_INSPIRED'
  | 'TAXONOMY_EXPANSION_INDEED_INSPIRED';

export type QualificationStatus =
  | 'DISCOVERED'
  | 'NORMALIZED'
  | 'CLUSTERED'
  | 'SCORED'
  | 'RECOMMENDED'
  | 'APPROVED'
  | 'QUALIFIED_FOR_INDEX'
  | 'PUBLISHED'
  | 'NOINDEX_MONITOR'
  | 'REJECTED_THIN'
  | 'ARCHIVED';

export const SEO_OPPORTUNITY_TYPES = [
  'role-city-job',
  'role-country-job',
  'remote-role-job',
  'hybrid-role-job',
  'fresher-role-job',
  'internship-role',
  'skill-job',
  'skill-career',
  'industry-job',
  'industry-career-guide',
  'salary-benchmark',
  'interview-prep',
  'ats-check',
  'resume-template',
  'talentscore-assessment',
  'career-passport',
  'career-transition',
  'recruiter-os',
  'employer-brand',
  'talent-discovery',
  'college-placement',
  'learning-path',
  'community-discussion',
  'global-visa-jobs',
  'city-employment-hub',
] as const;

export type SeoOpportunityType = (typeof SEO_OPPORTUNITY_TYPES)[number];

export type GscOpportunityCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M';

export type SearchIntentType =
  | 'job_search'
  | 'fresher_entry'
  | 'internship'
  | 'remote_work'
  | 'salary_benchmark'
  | 'resume_ats'
  | 'assessment_score'
  | 'career_passport'
  | 'career_roadmap'
  | 'skill_learning'
  | 'interview_prep'
  | 'company_research'
  | 'college_placement'
  | 'government_jobs'
  | 'recruiter_b2b'
  | 'community_network'
  | 'visa_international';

export type EmploymentTypeTag =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'freelance'
  | 'internship'
  | 'apprenticeship'
  | 'unknown';

export type WorkModeTag = 'remote' | 'hybrid' | 'onsite' | 'flexible' | 'unknown';

export type SeniorityTag =
  | 'intern'
  | 'fresher'
  | 'graduate'
  | 'trainee'
  | 'entry_level'
  | 'junior'
  | 'associate'
  | 'mid_level'
  | 'senior'
  | 'lead'
  | 'principal'
  | 'manager'
  | 'director'
  | 'executive'
  | 'unknown';

export interface EntityExtractionItem {
  type: 'role' | 'skill' | 'industry' | 'country' | 'city' | 'product' | 'modifier' | 'seniority';
  value: string;
  slug: string;
}

export interface SemanticRelationEdge {
  from: string;
  to: string;
  relation: 'IN_INDUSTRY' | 'USES_SKILL' | 'LOCATED_IN' | 'HAS_SENIORITY' | 'ROUTES_TO_SURFACE';
}

export interface NormalizedKeywordResult {
  rawKeyword: string;
  normalizedKeyword: string;
  dedupKey: string;
  keywordHash: string;
  tokens: string[];
  isValid: boolean;
  invalidReason?: string;
}

export interface ClassifiedKeyword {
  rawKeyword: string;
  normalizedKeyword: string;
  dedupKey: string;
  keywordHash: string;
  source: string;
  sourceType: SourceAttribution;
  language: string;
  countryCode: string;
  regionCode?: string | null;
  isExplicitGeo?: boolean;
  citySlug: string | null;
  industrySlug: string | null;
  jobRoleSlug: string | null;
  skillSlug: string | null;
  seniority: SeniorityTag;
  employmentType: EmploymentTypeTag;
  workMode: WorkModeTag;
  searchIntent: SearchIntentType;
  opportunityType: SeoOpportunityType;
  clusterKey: string;
  clusterName: string;
  clusterType: string;
  recommendedDestination: string;
  recommendedCanonicalUrl: string;
  isClassified: boolean;
  classificationConfidence: number;
  entities: EntityExtractionItem[];
  semanticRelations: SemanticRelationEdge[];
}

export interface ScoringWeights {
  demandEvidence: number;
  gscOpportunity: number;
  talentxcelRelevance: number;
  inventoryAvailability: number;
  conversionPotential: number;
  contentQualityGap: number;
  competition: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  demandEvidence: 0.25,
  gscOpportunity: 0.20,
  talentxcelRelevance: 0.20,
  inventoryAvailability: 0.15,
  conversionPotential: 0.10,
  contentQualityGap: 0.05,
  competition: 0.05,
};

export interface OpportunityScoreInput {
  classified: ClassifiedKeyword;
  searchVolumeStatus: 'verified' | 'unknown';
  verifiedMonthlyVolume?: number | null;
  gscImpressions?: number | null;
  gscClicks?: number | null;
  gscCtr?: number | null;
  gscPosition?: number | null;
  ga4Conversions?: number | null;
  liveInventoryCount?: number | null;
  existingContentScore?: number | null;
  competitionIndex?: number | null;
}

export interface ScoreBreakdown {
  demandEvidenceScore: number;
  gscOpportunityScore: number;
  talentxcelRelevanceScore: number;
  inventoryAvailabilityScore: number;
  conversionPotentialScore: number;
  contentQualityGapScore: number;
  competitionScore: number;
  compositeScore: number;
  dataConfidence: number;
  demandStatus: 'VERIFIED' | 'UNKNOWN';
  weightsUsed: ScoringWeights;
  explainability: string[];
}

export interface GscTelemetryRow {
  query: string;
  pageUrl: string;
  propertyUrl: string;
  country: string;
  device: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  priorImpressions?: number | null;
  priorClicks?: number | null;
  priorPosition?: number | null;
  ga4Sessions?: number | null;
  ga4Conversions?: number | null;
  observationDate: string;
}

export interface GscMonitoringSummary {
  rowsEvaluated: number;
  incompleteRowsHandled: number;
  byCode: Record<string, number>;
  emergingOrNewQueries: number;
  decliningQueries: number;
  ctrOpportunities: number;
  cannibalizationAlerts: number;
  countryOpportunities: number;
  positionMovements: number;
  mobileOpportunities: number;
  pagesGainingImpressions: number;
}

export interface Phase12RegressionAlert {
  alertKey: string;
  category:
    | 'UNEXPECTED_NOINDEX_ON_QUALIFIED'
    | 'SSR_CLIENT_PARITY_MISMATCH'
    | 'SITEMAP_HTTP_OR_XML_FAILURE'
    | 'CANONICAL_CONFLICT'
    | 'MISSING_DESTINATION_PAGE'
    | 'REDIRECT_LOOP_OR_CHAIN'
    | 'INVALID_SPA_FALLTHROUGH'
    | 'HIGH_IMP_DECLINING_CLICKS'
    | 'CONVERSION_TELEMETRY_REGRESSION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  target: string;
  detail: string;
}

export interface GscDetectedOpportunity {
  opportunityKey: string;
  code: GscOpportunityCode;
  codeLabel: string;
  query: string;
  normalizedQuery: string;
  pageUrl: string;
  recommendedDestination: string;
  country: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  ga4Conversions: number;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  severityScore: number;
  recommendedAction: string;
  evidence: Record<string, unknown>;
}

export interface PageQualificationInput {
  pageUrl: string;
  pageType: SeoOpportunityType | string;
  primaryKeyword: string;
  clusterKey: string;
  realInventoryCount: number;
  profileAggregateCount?: number;
  courseCount?: number;
  uniqueContentScore: number;
  relevanceScore: number;
  opportunityScore: number;
  hasUtilityExperience?: boolean;
  canonicalTargetUrl?: string;
  competingUrls?: string[];
  jaccardOverlapRatio?: number;
}

export interface PageQualificationResult {
  pageUrl: string;
  pageType: string;
  primaryKeyword: string;
  qualificationStatus: QualificationStatus;
  indexationScore: number;
  cannibalizationTarget: string | null;
  reason: string;
  sitemapEligible: boolean;
  robotsMeta: 'index, follow' | 'noindex, follow' | 'noindex, nofollow';
}

export interface InternalLinkRecommendation {
  recommendationKey: string;
  sourcePageUrl: string;
  targetPageUrl: string;
  anchorText: string;
  linkType: 'HUB_TO_SPOKE' | 'SPOKE_TO_HUB' | 'CROSS_SURFACE_FUNNEL' | 'ORPHAN_RESCUE';
  priorityScore: number;
  reason: string;
}

export interface ContentBrief {
  briefKey: string;
  targetUrl: string;
  opportunityType: SeoOpportunityType;
  primaryKeyword: string;
  supportingKeywords: string[];
  targetIntent: SearchIntentType;
  recommendedTitle: string;
  metaDescription: string;
  outline: Array<{ heading: string; purpose: string; dataGroundedFrom: string }>;
  faqQuestions: Array<{ question: string; groundingNote: string }>;
  internalLinks: string[];
  evidenceSummary: Record<string, unknown>;
  estimatedImpactScore: number;
}

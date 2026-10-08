// src/lib/domain-seo/types.ts
/**
 * TalentXcel Dedicated Subdomain SEO Architecture - Type Definitions
 * 
 * Defines the unified data contracts for running 10 dedicated domain SEO growth engines
 * connected to one shared Global Career Intelligence Core.
 */

export type SubdomainId =
  | 'CORE'
  | 'JOBS'
  | 'LEARNING'
  | 'PASSPORT'
  | 'GOVERNMENT'
  | 'EMPLOYERS'
  | 'EMPLOYER_ALIAS'
  | 'COLLEGES'
  | 'CAREERS'
  | 'SALARY'
  | 'RESUME';

export type SearchIntentCategory =
  | 'JOB_SEEKING'
  | 'SALARY_BENCHMARK'
  | 'CAREER_EXPLORATION'
  | 'RESUME_OPTIMIZATION'
  | 'SKILL_ACQUISITION'
  | 'COLLEGE_ADMISSION'
  | 'GOVERNMENT_EXAM'
  | 'EMPLOYER_BRAND'
  | 'PROFILE_VERIFICATION'
  | 'GENERAL_CAREER';

export interface DomainDemandCluster {
  id: string;
  queryPattern: string;
  sampleQueries: string[];
  intentCategory: SearchIntentCategory;
  estimatedMonthlySearches: number;
  priority: 'P0' | 'P1' | 'P2';
  requiredEvidenceTypes: string[];
  conversionAction: string;
}

export interface DomainPageArchetype {
  archetypeId: string;
  name: string;
  pathPattern: string;
  primarySchemaType: string;
  minWordCount: number;
  minInventoryCount: number;
  requiresUniqueData: boolean;
  crawlFrequency: 'daily' | 'weekly' | 'monthly';
  priorityWeight: number; // 0.0 to 1.0 for sitemap priority
  governorMinScore: number;
}

export interface DomainLinkDirective {
  targetUniverse: SubdomainId;
  relationship: 'PREREQUISITE' | 'COMPENSATION' | 'OPPORTUNITY' | 'CREDENTIAL' | 'AUTHORITY' | 'ALUMNI';
  anchorTextPattern: string;
  maxInboundPerEntity: number;
}

export interface DomainExperimentDef {
  experimentId: string;
  name: string;
  subdomainId: SubdomainId;
  targetArchetype: string;
  hypothesis: string;
  variantAControl: string;
  variantBTreatment: string;
  targetMetric: 'CTR' | 'REGISTRATION_YIELD' | 'APPLICATION_YIELD' | 'INDEXATION_SPEED';
  minSampleClicks: number;
  status: 'ACTIVE' | 'WINNER' | 'LOSER' | 'INCONCLUSIVE';
  observedLiftPct: number;
}

export interface DomainStaircaseMilestone {
  step: number;
  targetDailyRegistrations: number;
  requiredDailyClicks: number;
  dominantSurface: string;
  achieved: boolean;
}

export interface DomainSeoConfig {
  subdomainId: SubdomainId;
  hostname: string;
  primaryOrigin: string;
  canonicalOrigin: string;
  isAlias: boolean;
  aliasOf?: SubdomainId;
  sitemapFilename: string;
  robotsPolicy: {
    publicDirectives: 'index, follow';
    privateDirectives: 'noindex, follow' | 'noindex, nofollow';
    disallowedPaths: string[];
    sitemapUrl: string;
  };
  purpose: string;
  authoritativeEntities: string[];
  demandClusters: DomainDemandCluster[];
  pageArchetypes: DomainPageArchetype[];
  internalLinkDirectives: DomainLinkDirective[];
  kpis: {
    primaryKpiName: string;
    secondaryKpis: string[];
    targetYieldPer1kClicks: number;
    expectedApplicationRatePct: number;
  };
  staircaseMilestones: DomainStaircaseMilestone[];
  experiments: DomainExperimentDef[];
  geographicExpansion: {
    primaryCountries: string[];
    priorityStatesIndia: string[];
    tier1Metros: string[];
    tier2Hubs: string[];
  };
  occupationExpansion: {
    minEvidenceTier: 'HIGH' | 'MEDIUM' | 'BASIC';
    requiredEvidenceTypes: string[];
    maxInitialOccupations: number;
  };
}

export interface DomainTelemetrySnapshot {
  subdomainId: SubdomainId;
  hostname: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  indexedUrls: number;
  indexationRate: number; // percentage of eligible urls indexed
  registrations: number;
  registrationYieldPer1k: number;
  applications: number;
  applicationYieldPer1k: number;
  matches: number;
  matchYieldPer1k: number;
  topQueries: Array<{ query: string; impressions: number; clicks: number; position: number }>;
  topPages: Array<{ path: string; impressions: number; clicks: number }>;
  topOccupations: string[];
  topCities: string[];
  topCountries: string[];
}

export interface DomainWinnerReport {
  subdomainId: SubdomainId;
  bestOccupation: string;
  bestCity: string;
  bestCountry: string;
  bestQueryCluster: string;
  bestPageArchetype: string;
  bestTitlePattern: string;
  bestCta: string;
  transferablePatterns: string[];
}

export interface CrossDomainRankingItem {
  rank: number;
  subdomainId: SubdomainId;
  hostname: string;
  registrationYieldPer1k: number;
  applicationYieldPer1k: number;
  matchYieldPer1k: number;
  status: 'DOMINANT' | 'STRONG' | 'DEVELOPING' | 'EMERGING';
}

export interface SeoOpportunityCandidate {
  id: string;
  subdomainId: SubdomainId;
  authoritativeDomain: string;
  queryIntent: string;
  entity: string;
  location: string;
  country: string;
  pageArchetype: string;
  targetUrl: string;
  demandScore: number;
  evidenceScore: number;
  conversionPotential: number;
  compositeOpportunityScore: number;
  evidenceBacked: boolean;
  isBuildable: boolean;
  isIndexable: boolean;
}

export type ExpansionTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

export type ExpansionWaveId = 'WAVE_0' | 'WAVE_1' | 'WAVE_2' | 'WAVE_3' | 'WAVE_4';

export interface DomainInventoryTarget {
  subdomainId: SubdomainId;
  name: string;
  tier: ExpansionTier;
  currentBaseline: number;
  phase1TargetMin: number;
  phase1TargetMax: number;
  conversionYieldPer1k: number;
  primaryConversionMetric: string;
  dominantQueryFormat: string;
  requiredEvidenceRule: string;
}

export interface QualifiedInventoryEntry {
  url: string;
  subdomainId: SubdomainId;
  canonicalOrigin: string;
  path: string;
  occupation: string;
  industry: string;
  intent: SearchIntentCategory;
  location?: string;
  experienceTier?: string;
  evidenceType: string;
  evidenceScore: number;
  governorApproved: boolean;
  wave: ExpansionWaveId;
  priority: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface QualityGovernorResult {
  isApproved: boolean;
  compositeScore: number;
  doorwayRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  thinContentRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  evidenceType: string;
  evidenceCount: number;
  rationale: string;
}

export interface InfrastructureCapacityMetrics {
  totalCombinatorialNodes: number;
  industryVerticalsCount: number;
  occupationsCount: number;
  locationsCount: number;
  entityDimensionsCount: number;
  higherEdInstitutionsCount: number;
  theoreticalMaxPages: number;
  qualifiedInventoryCeiling: number;
}

export interface WaveReleaseStatus {
  waveId: ExpansionWaveId;
  name: string;
  totalQualifiedUrls: number;
  isReleased: boolean;
  gscIndexingGatePassed: boolean;
  minIndexingRateRequiredPct: number;
  domainCounts: Record<SubdomainId, number>;
  fourGatesEvaluation?: WaveFourGateEvaluation;
}

export interface WaveFourGateEvaluation {
  waveId: ExpansionWaveId;
  gate1_indexation: {
    name: 'GSC Indexation Rate';
    requiredPct: number;
    observedPct: number;
    passed: boolean;
  };
  gate2_impressions: {
    name: 'Search Impressions Growth';
    baselineImpressions: number;
    observedImpressions: number;
    growthPct: number;
    passed: boolean;
  };
  gate3_searchQuality: {
    name: 'Search Quality & Soft-404 Signals';
    soft404RatePct: number; // Must be <= 1.5%
    crawledNotIndexedRatePct: number; // Must be <= 15%
    duplicateSignalsDetected: boolean;
    passed: boolean;
  };
  gate4_businessOutcome: {
    name: 'Business Outcomes (Registrations & Applications)';
    baselineRegistrations: number;
    observedRegistrations: number;
    baselineApplications: number;
    observedApplications: number;
    registrationGrowthPct: number;
    applicationGrowthPct: number;
    passed: boolean;
  };
  allGatesPassed: boolean;
  verdict: 'APPROVED_FOR_NEXT_WAVE' | 'HOLD_FOR_IMPROVEMENT' | 'FREEZE_FAILED_ARCHETYPES';
  archetypeFeedbackActions: {
    winnersToExpand: string[];
    weakToImprove: string[];
    failedToFreeze: string[];
  };
}

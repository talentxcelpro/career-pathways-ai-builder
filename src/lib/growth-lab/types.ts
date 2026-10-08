// src/lib/growth-lab/types.ts
// TalentXcel Global SEO Growth Lab & Experiment Engine
// Complete type system for empirical multi-surface SEO experimentation.

export type ExperimentUniverse =
  | 'JOBS'
  | 'GOVERNMENT'
  | 'CAREERS'
  | 'LEARNING'
  | 'SALARY'
  | 'RESUME'
  | 'COLLEGES'
  | 'EMPLOYERS'
  | 'SKILLS'
  | 'LOCATIONS'
  | 'EDITORIAL'
  | 'VIDEO'
  | 'IMAGE'
  | 'DISCOVER'
  | 'AI_SEARCH'
  | 'INTERNATIONAL';

export type ExperimentStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'WINNER'
  | 'LOSER'
  | 'INCONCLUSIVE';

export type ExperimentType =
  | 'TITLE_TEST'
  | 'META_DESCRIPTION_TEST'
  | 'HEADING_TEST'
  | 'INTRODUCTION_TEST'
  | 'INTERNAL_LINK_TEST'
  | 'ANCHOR_TEXT_TEST'
  | 'BREADCRUMB_TEST'
  | 'SCHEMA_TEST'
  | 'CONTENT_STRUCTURE_TEST'
  | 'PAGE_DEPTH_TEST'
  | 'ENTITY_LINKING_TEST'
  | 'LOCATION_LINKING_TEST'
  | 'OCCUPATION_LINKING_TEST'
  | 'SITEMAP_DISCOVERY_TEST'
  | 'INDEXATION_COHORT_TEST'
  | 'FRESHNESS_TEST'
  | 'VIDEO_TEST'
  | 'IMAGE_TEST'
  | 'EDITORIAL_TEST'
  | 'INTERNATIONAL_TEST'
  | 'AUTHORITY_DIGITAL_PR_TEST';

export type SearchEngineChannel = 'GOOGLE' | 'BING' | 'INDEXNOW' | 'DUCKDUCKGO' | 'OTHER';

export interface ExperimentVariant {
  variantId: 'control' | 'treatment';
  label: string;
  titlePattern?: string;
  metaDescriptionPattern?: string;
  headingPattern?: string;
  introSnippetPattern?: string;
  schemaType?: string;
  internalLinkGraphPattern?: string;
  mediaAssetType?: 'NONE' | 'VIDEO' | 'INFOGRAPHIC' | 'CHART' | 'ROADMAP_SVG';
  sampleUrls: string[];
}

export interface ExperimentMetrics {
  impressions: number;
  clicks: number;
  ctr: number;                   // In percentage e.g. 3.2%
  avgPosition: number;
  sessions: number;
  registrations: number;
  applications: number;
  matches: number;
  paidConversions: number;
  // Master KPI: Qualified Registrations per 1,000 Organic Clicks
  registrationsPer1kClicks: number;
  applicationsPer1kClicks: number;
  matchesPer1kClicks: number;
  sessionToRegistrationRatePct: number;
  applicationRatePct: number;
}

export interface SeoExperiment {
  experimentId: string;
  name: string;
  universe: ExperimentUniverse;
  experimentType: ExperimentType;
  domain: string;
  country: string;
  region?: string;
  city?: string;
  industry?: string;
  occupation?: string;
  intent: string;
  pageType: string;
  hypothesis: string;
  control: ExperimentVariant;
  treatment: ExperimentVariant;
  startDate: string;              // ISO date string
  endDate?: string;
  status: ExperimentStatus;
  trafficCohort: string;          // e.g. '10%_CANARY', '50%_SPLIT', '100%_PILOT'
  successMetric: 'REGISTRATIONS_PER_1K_CLICKS' | 'CTR_LIFT' | 'APPLICATIONS_PER_CLICK' | 'MATCHES_PER_CLICK';
  minimumSample: {
    minClicks: number;
    minDays: number;
  };
  winnerRule: string;
  rollbackRule: string;
  controlMetrics: ExperimentMetrics;
  treatmentMetrics: ExperimentMetrics;
  liftPct?: {
    ctrLiftPct: number;
    registrationLiftPct: number;
    applicationLiftPct: number;
  };
  winnerPattern?: string;         // e.g., '[Occupation] + Fresher + [City] + Jobs'
}

export interface QueryAttributionRecord {
  query: string;
  gscQueryCluster: string;
  landingPage: string;
  domain: string;
  universe: ExperimentUniverse;
  pageType: string;
  country: string;
  city?: string;
  occupation?: string;
  industry?: string;
  intent: string;
  device?: 'MOBILE' | 'DESKTOP' | 'TABLET';
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  sessions: number;
  registrations: number;
  applications: number;
  matches: number;
  // Computed yields
  registrationsPer1kClicks: number;
  applicationsPer1kClicks: number;
  matchesPer1kClicks: number;
}

export interface YieldRankingItem {
  key: string;                    // The entity, intent, or page URL
  label: string;
  clicks: number;
  registrations: number;
  applications: number;
  matches: number;
  registrationsPer1kClicks: number;
  applicationsPer1kClicks: number;
  matchesPer1kClicks: number;
}

export interface Top20YieldReport {
  timestamp: string;
  topIntentsByRegistrationYield: YieldRankingItem[];
  topIntentsByApplicationYield: YieldRankingItem[];
  topIntentsByMatchYield: YieldRankingItem[];
  topPagesByRegistrationYield: YieldRankingItem[];
  topOccupationsByRegistrationYield: YieldRankingItem[];
  topCitiesByRegistrationYield: YieldRankingItem[];
  topCountriesByRegistrationYield: YieldRankingItem[];
  topArchetypesByRegistrationYield: YieldRankingItem[];
}

export interface StaircaseMilestone {
  stageNumber: number;
  targetDailyRegistrations: number;
  gateDescription: string;
  requiredDailyClicks: number;
  requiredDailyImpressions: number;
  status: 'ACHIEVED' | 'CURRENT_FOCUS' | 'QUEUED';
}

export interface GrowthStaircaseStatus {
  currentDailyRegistrations: number;
  currentObservedStep: StaircaseMilestone;
  nextStep: StaircaseMilestone;
  longTermNorthStarTarget: number; // 50,000
  dailyRegistrationGap: number;     // 50,000 - current
  topGrowthSurfacesToCloseGap: {
    surface: ExperimentUniverse;
    observedYieldPer1kClicks: number;
    estimatedClicksNeededForNextStep: number;
  }[];
}

export interface GoogleJobValidationResult {
  jobId: string;
  canonicalUrl: string;
  title: string;
  companyName: string;
  location: string;
  hasJobPostingSchema: boolean;
  hasValidDates: boolean;
  datePosted: string;
  validThrough?: string;
  hasSalary: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  hasApplyUrl: boolean;
  applyUrl?: string;
  isExpired: boolean;
  isValidForGoogleJobs: boolean;
  errors: string[];
}

// src/lib/ai-discovery/types.ts
// Authoritative Data Contracts for AI Engine Discovery & Generative Engine Optimization (AEO/GEO)

export type MetricStatus = 'OBSERVED' | 'ESTIMATED' | 'INSUFFICIENT_DATA';

export type AiPlatform = 
  | 'CHATGPT' 
  | 'GEMINI' 
  | 'CLAUDE' 
  | 'PERPLEXITY' 
  | 'COPILOT' 
  | 'OTHER_AI' 
  | 'UNKNOWN';

/**
 * 1. Technical Discovery Lifecycle State Machine (Search & Crawl Indexing)
 * Strictly separates crawler/indexing presence from commercial acquisition:
 * CRAWLED != DISCOVERED != INDEXED != SURFACED != AI_REFERRAL != CONVERTED
 */
export type DiscoveryLifecycleState = 
  | 'CRAWLED' 
  | 'DISCOVERED' 
  | 'INDEXED' 
  | 'ELIGIBLE_FOR_SEARCH' 
  | 'SURFACED' 
  | 'AI_REFERRAL_OBSERVED' 
  | 'CONVERTED';

/**
 * 2. Commercial Acquisition Funnel State Machine (Conversion Tracking)
 * Strictly decoupled from the crawler discovery lifecycle.
 */
export type AcquisitionFunnelStage = 
  | 'REFERRAL' 
  | 'LANDING' 
  | 'SIGNUP' 
  | 'VERIFIED' 
  | 'ACTIVATED' 
  | 'CUSTOMER';

/**
 * Dynamic Funnel Stage Metric.
 * Decouples stage-to-stage step conversion (Ci / Ci-1) from overall conversion (Cfinal / Clanding).
 * Never mixes denominators.
 */
export interface DynamicFunnelStage {
  stageName: AcquisitionFunnelStage;
  stageIndex: number;
  count: number;
  conversionFromPreviousPct: number | null; // e.g. Signup -> Verified
  overallConversionFromLandingPct: number;  // e.g. Stage -> Landing
}

/**
 * Immutable Discovery Evidence Ledger Record.
 * Immutably logs verified empirical observations.
 */
export interface DiscoveryEvidenceRecord {
  id: string;
  platform: AiPlatform;
  entityName: string;
  canonicalUrl: string;
  observedReferral: boolean;
  crawlerAccessVerified: boolean;
  searchAppearance: 'OBSERVED' | 'UNKNOWN';
  citationObserved: 'OBSERVED' | 'NOT_OBSERVED' | 'UNKNOWN';
  aiRecommendation: 'OBSERVED' | 'UNKNOWN';
  timestamp: string;
  evidencePayload: {
    referrerDomain?: string;
    userAgentSnippet?: string;
    observedQuerySnippet?: string;
    responseStatus?: number;
    verificationNotes?: string;
  };
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PlatformPerformanceBreakdown {
  platform: AiPlatform;
  visits: number;
  signups: number;
  leads: number;
  customers: number;
  revenue: number;
}

export interface AiDiscoveredLandingPage {
  url: string;
  primaryPlatform: AiPlatform;
  visits: number;
  signups: number;
  conversionRatePct: number;
}

export interface AiDiscoveryMetrics {
  crawlSignals: number;
  referralVisits: number;
  uniqueSessions: number;
  platformBreakdown: Record<AiPlatform, PlatformPerformanceBreakdown>;
  topLandingPages: AiDiscoveredLandingPage[];
  funnelStages: DynamicFunnelStage[];
  assistedConversions: number;
  directConversions: number;
  // Rigorous decoupled rates:
  signupFromLandingRatePct: number;
  verifiedFromSignupRatePct: number;
  activatedFromVerifiedRatePct: number;
  customerFromActivatedRatePct: number;
  overallLandingToCustomerRatePct: number;
  revenueStatus: MetricStatus;
  revenueUsd: number;
}

export type AiAttributionMode = 
  | 'AI_REFERRAL_OBSERVED' 
  | 'AI_REFERRAL_SELF_REPORTED' 
  | 'AI_REFERRAL_ASSISTED' 
  | 'UNKNOWN';

// src/lib/ai-discovery/types.ts
// Authoritative Data Contracts for AI Engine Discovery & Generative Engine Optimization (AEO/GEO)

export type AiPlatform = 
  | 'CHATGPT' 
  | 'GEMINI' 
  | 'CLAUDE' 
  | 'PERPLEXITY' 
  | 'COPILOT' 
  | 'OTHER_AI' 
  | 'UNKNOWN';

export type DiscoveryTelemetryState = 
  | 'CRAWLABLE' 
  | 'DISCOVERED' 
  | 'INDEXED' 
  | 'SURFACED' 
  | 'AI_REFERRAL' 
  | 'SIGNUP' 
  | 'CUSTOMER';

/**
 * Immutable Discovery Evidence Ledger Record.
 * Strictly separates distinct empirical observation states:
 * Crawlable != Discovered != Indexed != Surfaced != AI_Referral != Customer
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
  assistedConversions: number;
  directConversions: number;
  signupRate: number; // percentage
  activationRate: number; // percentage
  leadRate: number; // percentage
  customerRate: number; // percentage
  revenue: number; // currency amount in USD / converted
}

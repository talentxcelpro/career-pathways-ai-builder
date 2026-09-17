/**
 * src/lib/growth-os/types.ts
 *
 * Authoritative Type Definitions for TalentXcel Global Growth OS (1M Target).
 * Governs Engine A (Discovery & Product Magnets) and Engine B (Entity & Citations).
 *
 * Strict Invariant: Does NOT modify frozen UDX v4.0 resolution architecture.
 */

// ── 1. The 10 Global Priority Markets ────────────────────────────────────────

export type GlobalMarketCode = 
  | 'IN'  // India (Domestic anchor / Tier-2 depth)
  | 'US'  // United States (High-intent tech salaries / remote)
  | 'GB'  // United Kingdom (Tech & finance career mobility)
  | 'CA'  // Canada (Tech immigration & tech pathways)
  | 'AU'  // Australia (Skilled migration & regional tech)
  | 'SG'  // Singapore (SE Asia fintech & regional headquarters)
  | 'AE'  // United Arab Emirates (Gulf tech talent hub)
  | 'DE'  // Germany (EU engineering & Blue Card pathways)
  | 'NL'  // Netherlands (EU tech ecosystem & English-first)
  | 'IE'; // Ireland (EU tech multinational hub)

export interface MarketProfile {
  code: GlobalMarketCode;
  name: string;
  currency: string;
  primaryLanguage: string;
  demandClusters: string[];
  keyHiringHubs: string[];
  activeSupplyVerification: boolean;
}

// ── 2. The 10 Global Product Magnets ─────────────────────────────────────────

export type ProductMagnetId =
  | 'ATS_SCANNER'          // /resume/ats-checker
  | 'SALARY_INTELLIGENCE'  // /tools/salary
  | 'IN_HAND_CALCULATOR'   // /tools/in-hand-salary
  | 'CAREER_TRANSITION'    // /career/change-career
  | 'JOB_SKILL_MATCHER'    // /jobs/match
  | 'INTERVIEW_SIMULATOR'  // /tools/interview
  | 'CAREER_PASSPORT'      // /career-passport
  | 'COLLEGE_INTELLIGENCE' // /colleges
  | 'UDX_DISCOVERY'        // /discovery
  | 'CAREER_ROADMAPS';     // /career/

export interface ProductMagnetMeta {
  id: ProductMagnetId;
  name: string;
  path: string;
  freeTierUtility: string;
  instantResultType: string;
  diagnosticCardType: DiagnosticType;
  nextIntentAction: string;
  targetMonthlyUniques: number;
}

// ── 3. Diagnostic Viral Loop Types ──────────────────────────────────────────

export type DiagnosticType =
  | 'RESUME_ATS_SCORE'
  | 'SALARY_PERCENTILE'
  | 'SKILL_OVERLAP_MATRIX'
  | 'COLLEGE_ROI_ANALYSIS'
  | 'INTERVIEW_READINESS_INDEX';

export interface DiagnosticCardPayload {
  cardId: string;
  type: DiagnosticType;
  subjectTitle: string;
  headlineScore: string | number;
  subtext: string;
  keyInsights: string[];
  benchmarkedAgainst: string;
  shareableUrl: string;
  createdAt: string;
}

// ── 4. AI & Multi-Channel Discovery Telemetry ───────────────────────────────

export type DiscoveryChannel =
  | 'ORGANIC_SEARCH_GOOGLE'
  | 'ORGANIC_SEARCH_BING'
  | 'AI_COPILOT_BING'
  | 'AI_PERPLEXITY'
  | 'AI_CHATGPT'
  | 'AI_CLAUDE'
  | 'AGENT_API_UDX'
  | 'INTERACTIVE_TOOLS'
  | 'DIRECT_BRANDED'
  | 'SOCIAL_CREATOR'
  | 'INSTITUTIONAL_PARTNER'
  | 'DIAGNOSTIC_REFERRAL';

export interface ChannelAcquisitionMetric {
  channel: DiscoveryChannel;
  monthlyTarget: number;
  actualUniques: number;
  impressions: number;
  clicks: number;
  aiCitations: number;
  toolCompletions: number;
  signups: number;
  verifiedOutcomes: number;
}

// ── 5. Public Research Dataset Infrastructure ────────────────────────────────

export interface PublicDataset {
  datasetId: string;
  slug: string;
  title: string;
  subtitle: string;
  observationPeriod: {
    start: string;
    end: string;
  };
  sampleSize: number;
  methodology: string;
  limitations: string[];
  sources: string[];
  evidenceIds: string[];
  keyMetrics: Record<string, string | number>;
  csvDownloadUrl: string;
  jsonApiUrl: string;
  publishedAt: string;
  version: string;
}

// ── 6. Citation Graph Types ──────────────────────────────────────────────────

export type CitationType =
  | 'EDITORIAL_PRESS'
  | 'ACADEMIC_RESEARCH'
  | 'GOVERNMENT_STATUTORY'
  | 'AI_SEARCH_GROUNDING'
  | 'INDUSTRY_REPORT'
  | 'DATASET_DOWNLOAD';

export interface CitationRecord {
  citationId: string;
  datasetId: string;
  claim: string;
  citingEntity: string;
  citingDomain: string;
  citationType: CitationType;
  firstObservedAt: string;
  corroborationStatus: 'OBSERVED' | 'VERIFIED_EXTERNAL' | 'DISPUTED';
}

// ── 7. The 1M Growth Ladder ──────────────────────────────────────────────────

export type LadderMilestone = '100K' | '250K' | '500K' | '750K' | '1M';

export interface GrowthScorecard {
  windowStart: string;
  windowEnd: string;
  currentMilestone: LadderMilestone;
  totalMonthlyUniques: number;
  newVsReturningRatio: number;
  channelBreakdown: Record<DiscoveryChannel, number>;
  toolStarts: number;
  toolCompletions: number;
  activeIntentsResolved: number;
  verifiedOutcomes: number;
  totalCitationsTracked: number;
}

// ── 8. Daily Executive Growth Record (Single Source of Truth for 1M Ladder) ──

export interface DailyExecutiveGrowthRecord {
  date: string;                     // YYYY-MM-DD
  uniqueVisitors: number;           // Total distinct client entities
  qualifiedVisitors: number;        // Visitors engaging with tool/search/intent
  countries: number;                // Unique country origins
  organicVisitors: number;          // Google + Bing search
  aiVisitors: number;               // Bing Copilot, Perplexity, ChatGPT, Claude
  toolCompletions: number;          // Diagnostic completions
  newUsers: number;                 // New accounts created
  activatedUsers: number;           // Profile completed / passport minted
  returningUsers: number;           // Re-engagement
  resolvedIntents: number;          // UDX intents resolved
  actionsCompleted: number;         // Actions executed
  verifiedOutcomes: number;         // Real-world verified outcomes (TVO verified)
  newCitations: number;             // New external references tracked
  newExternalEntities: number;      // New third-party entities reconciled
}


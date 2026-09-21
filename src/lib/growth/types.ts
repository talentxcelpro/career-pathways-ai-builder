/**
 * TalentXcel Global Acquisition Engine (TX-GAE) — Core Types & Contracts
 * =========================================================================
 * 
 * 10 Immutable Production Invariants:
 *  1. TARGET                  ≠ ACTUAL                 (Capacity targets != achieved telemetry)
 *  2. REQUEST                 ≠ VISITOR                (Page hits != human visitors)
 *  3. BOT                     ≠ HUMAN                  (Spiders & crawlers excluded from funnel)
 *  4. AI CRAWLER              ≠ AI REFERRAL            (Scrapers fetching datasets != human traffic)
 *  5. SIGNUP                  ≠ VERIFIED OUTCOME       (Account registration != verified employment)
 *  6. SHARE                   ≠ REFERRAL VISITOR       (Link generation != recipient arrival)
 *  7. BUILD_PROPOSAL          ≠ AUTO_PUBLISH           (Demand signal != automatic page generation)
 *  8. SEARCH SIGNAL           ≠ HUMAN INTENT           (GSC demand != confirmed human resolution)
 *  9. BENCHMARK               ≠ VERIFIED SUPPLY        (BLS wage models != active job supply)
 * 10. GLOBAL REGISTRY (34)    ≠ OBSERVED COVERAGE (32) (Active registry != empirical signals)
 */

export type RequestClassification = 'HUMAN' | 'BOT_CRAWLER' | 'UNKNOWN';

export type GrowthEventType =
  | 'growth_impression'
  | 'growth_click'
  | 'growth_landing'
  | 'growth_engagement'
  | 'growth_tool_start'
  | 'growth_tool_complete'
  | 'growth_signup_start'
  | 'growth_signup'
  | 'growth_activation'
  | 'growth_share_generated'
  | 'growth_referral_click'
  | 'growth_referral';

export type UDXOutcomeEventType =
  | 'udx_action_commenced'
  | 'udx_outcome_pending'
  | 'udx_outcome_observed'
  | 'udx_outcome_verified';

export interface PrivacySafeAcquisitionEvent {
  eventId: string;
  visitorId: string;
  sessionId: string;
  userId?: string | null;
  requestType: RequestClassification;
  source: string;
  medium: string;
  campaign?: string | null;
  country: string;
  landingPage: string;
  product: string;
  intentId?: string | null;
  timestamp: string;
  eventType: GrowthEventType;
  // Strictly NO raw resume text, phone numbers, salary numbers, or PII permitted
  metadata?: Record<string, string | number | boolean>;
}

export type AIReferralConfidence =
  | 'AI_REFERRAL_CONFIRMED'  // Verified browser navigation with confirmed AI referrer or explicit UTM
  | 'AI_REFERRAL_LIKELY'     // Multiple independent signals (e.g. conversational search referrer + human session)
  | 'AI_REFERRAL_UNKNOWN';   // Default for direct or unattributed traffic; NEVER guessed as AI

export type AICrawlerStatus =
  | 'AI_CRAWLER_OBSERVED'    // GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.
  | 'AI_CRAWLER_UNKNOWN';

export interface AIInteractionClassification {
  trafficClass: 'HUMAN_REFERRAL' | 'AUTOMATED_CRAWLER' | 'STANDARD_WEB';
  referralConfidence: AIReferralConfidence;
  crawlerStatus?: AICrawlerStatus;
  detectedAgent?: string;
  originatingPlatform?: 'ChatGPT' | 'Claude' | 'Perplexity' | 'Gemini' | 'Copilot' | 'GoogleAI' | 'Other' | null;
}

export type GovernanceWorkflowState =
  | 'BUILD_PROPOSAL'         // UDX detected demand + candidate magnet identified
  | 'GOVERNANCE_CHECK'       // Quality, reality, anti-thin-content verification in flight
  | 'REVIEW_REQUIRED'        // High-impact or unverified evidence requires manual approval
  | 'AUTO_ALLOWED'           // Proven utility with complete first-party evidence
  | 'PUBLISHED'              // Actively indexed canonical acquisition surface
  | 'REJECTED';              // Blocked doorway page or zero-utility pattern

export type GovernanceDecision = 'BUILD' | 'WAIT_FOR_EVIDENCE' | 'MERGE' | 'DO_NOT_BUILD' | 'UPDATE_OR_REMOVE';

export interface AcquisitionGovernanceRecord {
  proposalId: string;
  canonicalQuery: string;
  targetProduct: string;
  targetLandingPath: string;
  country: string;
  searchDemand: number;
  evidenceConfidence: number;
  workflowState: GovernanceWorkflowState;
  decision: GovernanceDecision;
  decisionRationale: string;
  createdAt: string;
  approvedAt?: string | null;
}

export interface DualViralMetrics {
  sharesGenerated: number;
  referralClicks: number;
  referredNewVisitors: number;
  referredSignups: number;
  referredActivations: number;
  eligibleUsers: number;
  kVisit: number;   // referredNewVisitors / eligibleUsers
  kSignup: number;  // referredSignups / eligibleUsers
  isViralCompounding: boolean; // Strictly true ONLY when kSignup > 1.0 empirically
}

export interface ChannelMixItem {
  channel: string;
  sharePercent: number;
  description: string;
}

export interface ChannelDistributionTarget {
  organicSearch: number; // e.g. 74%
  productTools: number;  // e.g. 10%
  aiDiscovery: number;   // e.g. 5%
  socialVideo: number;   // e.g. 5%
  partnersColleges: number; // e.g. 4%
  referrals: number;     // e.g. 2%
}

export interface ChannelDistributionActual {
  organicSearch: number;
  productTools: number;
  aiDiscovery: number;
  socialVideo: number;
  partnersColleges: number;
  referrals: number;
  directWeb: number;
  unknown: number;
}

export interface OperatingCapacityTargets {
  dailyPageRequests: number;     // Target: 1,000,000+
  dailyHumanRequests: number;    // Target: 850,000+
  dailyUniqueVisitors: number;   // Target: 50,000 - 250,000
  dailyProductEngagements: number; // Target: 20,000+
  dailySignups: number;          // Target: 1,000 - 5,000
  dailyActivations: number;      // Target: 750 - 3,500
  dailyReferredVisitors: number; // Target: 5,000+
}

export interface EmpiricalTelemetryActuals {
  dailyPageRequests: number;
  dailyHumanRequests: number;
  dailyBotRequests: number;
  dailyUniqueVisitors: number;
  dailySessions: number;
  dailyNewUsers: number;
  dailyToolStarts: number;
  dailyToolCompletions: number;
  dailySignups: number;
  dailyActivations: number;
  dailyReturningUsers: number;
  dailyAIReferralsConfirmed: number;
  dailyAICrawlerRequests: number;
  dailySharesGenerated: number;
  dailyReferredVisitors: number;
  dailyReferredSignups: number;
  viralMetrics: DualViralMetrics;
}

export interface InfrastructureThresholds {
  p95LatencyMsThreshold: number;        // Default: 800ms
  dbConnectionPressureThreshold: number; // Default: 80%
  cacheHitRateThreshold: number;         // Default: 70%
  errorRateThreshold: number;            // Default: 1.0%
}

export interface InfrastructureHealthReport {
  state: 'HEALTHY' | 'DEGRADED' | 'THROTTLED';
  p95LatencyMs: number;
  dbConnectionPressurePercent: number;
  cacheHitRatePercent: number;
  errorRatePercent: number;
  activeThrottle: boolean;
  throttleReason?: string | null;
  lastCheckedAt: string;
}

export interface SupportedCurrencyMeta {
  code: string;        // 'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'SGD', 'AED', 'INR'
  symbol: string;
  name: string;
  countries: string[];
  salaryUnit: string;
  hasVerifiedData: boolean;
  unverifiedFallbackMessage: string;
}

export interface ProductMagnetDefinition {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  primaryRoute: string;      // /web
  embedRoute: string;        // /embed
  apiRoute: string;          // /api
  shareRoutePrefix: string;  // /t/:tool/
  supportedCurrencies: string[];
  diagnosticType: string;
  valueProposition: string;
  freeDiagnosticDeliverable: string;
  signupRetentionGate: string;
}

/**
 * Hard Invariant 2: Requests != Unique Visitors != New Users != Signups
 */
export function assertTrafficSeparation(requests: number, visitors: number, users: number): void {
  if (requests > 0 && requests === users && requests === visitors) {
    throw new Error('Traffic conflation violation: page requests cannot be labeled as users or visitors.');
  }
}

/**
 * Hard Invariant 4: AI Crawler != Unique Visitor != Signup
 */
export function assertCrawlerNotVisitor(isCrawler: boolean, visitorIncrement: number): number {
  if (isCrawler) {
    return 0; // Crawlers are never counted in human visitor or signup metrics
  }
  return Math.max(0, visitorIncrement);
}

/**
 * Hard Invariant 5: Growth Signup != UDX Verified Outcome
 */
export function assertSignupNotOutcome(eventType: GrowthEventType | UDXOutcomeEventType): boolean {
  if (eventType === 'growth_signup' || eventType === 'growth_activation') {
    return false; // Signups are strictly acquisition events, NEVER employment outcomes
  }
  return eventType === 'udx_outcome_verified';
}

// src/lib/autonomous-os/types.ts
// TalentXcel Autonomous Distribution & Growth OS — Core Type Contracts

export type OSMode = 'RUNNING' | 'PAUSED' | 'SAFE_MODE' | 'DEGRADED';
export type OpportunityPriority = 'P0' | 'P1' | 'P2' | 'P3' | 'WATCH' | 'REJECT';
export type ActionApprovalState = 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'SCHEDULED' | 'EXECUTING' | 'MEASURING' | 'COMPLETED' | 'PAUSED' | 'REJECTED' | 'ROLLBACK';
export type ChannelType = 'SEARCH_ORGANIC' | 'AI_DISCOVERY_GEO' | 'PRODUCT_LED_UTILITY' | 'PUBLIC_UGC_OBJECTS' | 'REFERRAL_VIRAL' | 'EXTERNAL_COMMUNITY' | 'DIRECT';

export interface GrowthSignal {
  signalId: string;
  source: 'GOOGLE_SEARCH_CONSOLE' | 'FIRST_PARTY_ANALYTICS' | 'PRODUCT_TELEMETRY' | 'AUTH_EVENT' | 'ATS_SCAN' | 'SALARY_CALC' | 'PASSPORT_UGC' | 'REFERRAL_SHARE' | 'AI_CITATION';
  timestampIso: string;
  query?: string;
  landingUrl: string;
  country: string;
  device?: string;
  surface: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  position?: number;
  signupsCount: number;
  activationsCount: number;
  retentionDay7Pct?: number;
  sharesCount: number;
  referralsCount: number;
  conversionRatePct: number;
  confidenceScore: number;
  status: 'VERIFIED' | 'ESTIMATED' | 'UNKNOWN';
}

export interface GrowthOpportunity {
  opportunityId: string;
  title: string;
  channel: ChannelType;
  surface: string;
  targetQueryOrEntity: string;
  canonicalUrl: string;
  priority: OpportunityPriority;
  demandScore: number;
  intentMultiplier: number;
  conversionPotentialScore: number;
  productUtilityScore: number;
  distributionPotentialScore: number;
  competitiveGapScore: number;
  evidenceConfidence: number;
  compositeOpportunityScore: number;
  penalties: {
    thinContentRisk: number;
    doorwayRisk: number;
    duplicateRisk: number;
    lowInventoryRisk: number;
    cannibalizationRisk: number;
  };
  decision: 'OPTIMIZE_PAGE' | 'CREATE_KNOWLEDGE_OBJECT' | 'STRENGTHEN_INTERNAL_LINKS' | 'AMPLIFY_REFERRAL_LOOP' | 'PAUSE_UNDERPERFORMING' | 'REJECT_POLICY_RISK';
  decisionReason: string;
  recommendedAction: string;
  expectedUserGain: number;
  confidence: number;
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface CampaignAction {
  actionId: string;
  opportunityId: string;
  title: string;
  channel: ChannelType;
  targetAudience: string;
  objective: string;
  expectedOutcome: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  approvalState: ActionApprovalState;
  autonomousExecutable: boolean;
  requiresAdminReview: boolean;
  createdAtIso: string;
  executedAtIso?: string;
  attributionWindowDays: number;
  result?: {
    visitorsAcquired: number;
    signupsAcquired: number;
    activationsAcquired: number;
    viralKFactorObserved: number;
    causalConfidence: number;
    status: 'SUCCESS_WINNER' | 'MODERATE' | 'FAILURE_REVERTED' | 'MEASURING';
  };
}

export interface GrowthExperiment {
  experimentId: string;
  title: string;
  hypothesis: string;
  targetSurfaceOrTool: string;
  controlDescription: string;
  variantDescription: string;
  sampleSize: number;
  baselineConversionRatePct: number;
  variantConversionRatePct: number;
  relativeLiftPct: number;
  statisticalConfidence: number; // 0 to 1
  status: 'RUNNING' | 'WINNING' | 'LOSING' | 'NEEDS_SAMPLE' | 'COMPLETED_APPLIED' | 'REVERTED';
  startedAtIso: string;
  concludedAtIso?: string;
}

export interface AttributionFunnelEvent {
  discoveryTouchpoint: string;
  landingUrl: string;
  channel: ChannelType;
  visitors: number;
  engagements: number;
  signups: number;
  activations: number;
  retained7Day: number;
  referralsInitiated: number;
  signupConversionRatePct: number;
  activationRatePct: number;
}

export interface AutonomousDecision {
  decisionId: string;
  timestampIso: string;
  triggerEvent: string;
  opportunityName: string;
  evidenceSummary: string;
  activationRateObserved: number;
  measuredKFactor: number;
  decisionTaken: string;
  reasoning: string;
  actionGenerated: string;
  expectedImpact: string;
  confidenceScore: number;
  policyStatus: 'PASSED_SAFE' | 'REQUIRES_APPROVAL' | 'REJECTED_ANTI_SPAM';
}

export interface OneMillionUserTrajectoryModel {
  targetUsers: number;
  timelineDays: number;
  daysElapsed: number;
  currentRegisteredUsers: number;
  currentActivatedUsers: number;
  currentRetainedUsers: number;
  requiredDailyNewUsers: number;
  currentDailyAcquisitionRunRate: number;
  organicGrowthContributionPct: number;
  referralViralContributionPct: number;
  productUtilityContributionPct: number;
  aiGeoContributionPct: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';
  recommendedMixAdjustments: string[];
}

export interface AutonomousOsState {
  version: string;
  mode: OSMode;
  safeModeActive: boolean;
  lastCycleTimestampIso: string;
  nextScheduledCycleIso: string;
  totalDecisionsMade: number;
  totalActionsExecutedToday: number;
  northStarMetrics: {
    totalRegisteredUsers: number;
    totalActivatedUsers: number;
    totalRetainedUsers: number;
    activeReferralLoopsCount: number;
    combinedKFactorMeasured: number;
    monthlyRunRateProjection: number;
  };
  channelPerformance: Record<ChannelType, {
    visitors: number;
    signups: number;
    activations: number;
    conversionRatePct: number;
    contributionPct: number;
  }>;
  activeOpportunities: GrowthOpportunity[];
  actionQueue: CampaignAction[];
  experiments: GrowthExperiment[];
  decisionLog: AutonomousDecision[];
  trajectory: OneMillionUserTrajectoryModel;
}

/**
 * UDX World Observatory — Data Types & Contracts
 * 
 * Epistemic Classification System:
 * - OBSERVED: Directly measured from a verified sensor (GSC API, Supabase jobs table).
 * - MODELED: Calculated/clustered from multiple empirical observations.
 * - HYPOTHESIS: UDX thesis being tested with defined evidence and testStatus.
 */

export type EpistemicStatus = 'OBSERVED' | 'MODELED' | 'HYPOTHESIS';

export interface EpistemicValue<T = any> {
  value: T;
  status: EpistemicStatus;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number; // 0.0 - 1.0
  evidenceCount?: number;
  evidenceIds?: string[];
  source?: string;
  methodology?: string;
  testStatus?: 'UNTESTED' | 'TESTING' | 'VALIDATED' | 'FALSIFIED';
}

export interface WorldEvidenceCoverage {
  totalIntents: number;
  serpObservations: number;
  aiObservations: number;
  marketObservations: number;
  supplyObservations: number;
  outcomeObservations: number;
  evidenceCoveragePercent: number;
}

export interface HumanGoal {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  totalVolume: number;
  totalImpressions: number;
  totalClicks: number;
  familyCount: number;
  intentCount: number;
  queryCount: number;
}

export interface IntentFamily {
  id: string;
  goalId: string;
  name: string;
  slug: string;
  description: string;
  dominantEntity: string;
  marketShare: Record<string, number>;
  totalImpressions: number;
  totalClicks: number;
  intentCount: number;
  queryCount: number;
  unmetNeedSummary: string;
}

export interface WinnerExplainability {
  entityName: string;
  observedVisibility: EpistemicValue<string>;
  observationCount: number;
  inventoryCoverage: EpistemicValue<string>;
  pageFreshness: EpistemicValue<string>;
  domainAuthority: EpistemicValue<string>;
  compositeConfidence: number;
  evidenceChain: string[];
}

export interface CompetitiveWinner {
  entityId: string;
  entityName: string;
  visibilityShare: EpistemicValue<number>; // e.g. 42% modeled
  primaryAdvantage: string;
  primaryFailureMode: string;
  explainability: WinnerExplainability;
  evidenceIds: string[];
}

export interface IntentFailureMode {
  id: string;
  title: string;
  description: string;
  affectedEntity: string;
  userImpact: string;
  frequencyRate: EpistemicValue<string>; // e.g. 83.4% with HYPOTHESIS status
  evidenceIds: string[];
}

export interface CandidatePersona {
  id: string;
  title: string;
  education: string;
  experience: string;
  currentIncome: string;
  targetIncome: string;
  location: string;
  targetTimeframe: string;
}

export interface ExecutableStep {
  order: number;
  label: string;
  description: string;
  actionType: 'ASSESS_SKILLS' | 'CALIBRATE_RESUME' | 'APPLY_VERIFIED' | 'EMPLOYER_MATCH' | 'DIRECT_ROUTE';
  targetRoute: string;
  actionButtonText: string;
  advantage: string;
}

export interface ExecutablePath {
  persona: CandidatePersona;
  intentSummary: string;
  worldMatchSummary: {
    verifiedRolesCount: number;
    relevantEmployersCount: number;
    skillClustersCount: number;
  };
  steps: ExecutableStep[];
  expectedOutcome: {
    probabilityRange: string;
    projectedTimeToOutcome: string;
    epistemicStatus: EpistemicStatus;
    evidenceIds: string[];
    assumptions: string[];
  };
}

export interface BetterPathHypothesis {
  intentId: string;
  currentInternetFlow: {
    steps: { order: number; label: string; description: string; friction: string }[];
    totalFrictionScore: EpistemicValue<number>;
    avgTimeToOutcome: EpistemicValue<string>;
    satisfactionRate: EpistemicValue<number>;
  };
  udxFlow: {
    steps: { order: number; label: string; description: string; advantage: string }[];
    projectedTimeToOutcome: EpistemicValue<string>;
    projectedSatisfactionRate: EpistemicValue<number>;
  };
  executablePath: ExecutablePath;
  requiredTalentXcelAction: {
    actionType: 'VERIFIED_INVENTORY_MATCH' | 'EMPLOYER_INTAKE' | 'SKILL_GATE' | 'SALARY_BENCHMARK';
    description: string;
    status: 'LIVE_VERIFIED' | 'NEEDS_EXPANSION' | 'ACTION_REQUIRED';
    verifiedCount?: number;
    targetPath: string;
  };
}

export interface WorldIntent {
  id: string;
  familyId: string;
  goalId: string;
  canonicalQuery: string;
  category: string;
  audience: string;
  rawQueries: string[];
  queryCount: number;
  totalImpressions: number;
  totalClicks: number;
  avgPosition: number;
  commercialIntent: 'HIGH' | 'MEDIUM' | 'LOW';
  topWinners: CompetitiveWinner[];
  failureModes: IntentFailureMode[];
  talentxcelState: {
    verifiedJobsCount: number;
    landingPage: string;
    hasTruthfulSupply: boolean;
    satisfactionScore: number;
    zeroInventoryFallbackActive: boolean;
  };
  betterPath: BetterPathHypothesis;
}

export interface EvidenceStoreEntry {
  id: string;
  sensor: 'GSC_TELEMETRY' | 'SERP_OBSERVATION' | 'USER_BEHAVIOR' | 'INDUSTRY_BENCHMARK' | 'FIRST_PARTY_DB';
  timestamp: string;
  title: string;
  metric: string;
  value: string | number;
  sampleSize: number;
  confidence: number; // 0.0 to 1.0
  verificationMethod: string;
  provenanceSource: string;
  notes: string;
}

export interface CompetitiveEntity {
  id: string;
  name: string;
  domain: string;
  type: 'AGGREGATOR' | 'PROFESSIONAL_NETWORK' | 'CLASSIFIEDS' | 'INTENT_OS';
  estimatedMarketCoverage: number;
  observedStrengths: string[];
  observedWeaknesses: string[];
  observedFailureModes: {
    title: string;
    description: string;
    frequencyRate: string;
    evidenceIds: string[];
  }[];
  evidenceIds: string[];
}

export interface WorldObservatoryPayload {
  success: boolean;
  timestamp: string;
  summary: {
    totalEntitiesProcessed: number;
    totalHumanGoals: number;
    totalIntentFamilies: number;
    totalCanonicalIntents: number;
    totalSearchVolume: number;
    totalClicks: number;
    avgPosition: number;
    verifiedSupplyCoverage: number;
  };
  evidenceCoverage: WorldEvidenceCoverage;
  goals: HumanGoal[];
  families: IntentFamily[];
  canonicalIntents: WorldIntent[];
  competitiveEntities: CompetitiveEntity[];
  evidenceStore: EvidenceStoreEntry[];
}

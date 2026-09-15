/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Outcome Types
 * 
 * Defines terminal outcome verification records, maturity stages,
 * and closed-loop metrics.
 * 
 * CONTRACT:
 * Action execution != Outcome verified.
 * Lifecycle: ACTION_COMPLETED -> OUTCOME_PENDING -> OUTCOME_OBSERVED -> OUTCOME_VERIFIED
 */

export type OutcomeStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUCCESS'
  | 'PARTIAL'
  | 'FAILED'
  | 'EXPIRED'
  | 'UNKNOWN';

export type OutcomeMaturityLevel =
  | 'OUTCOME_PENDING'
  | 'OUTCOME_OBSERVED'
  | 'OUTCOME_VERIFIED';

export interface OutcomeRecord {
  outcomeId: string;
  intentId: string;
  pathId: string;
  actionId: string;
  actionStatus?: string; // 'ACTION_COMPLETED' required for learning
  maturityLevel?: OutcomeMaturityLevel;
  expectedOutcome: string;
  actualOutcome: string;
  status: OutcomeStatus;
  timeToOutcomeHours: number;
  qualityScore: number; // 0 to 100
  actualLift?: number;
  evidenceId?: string;
  downstreamData?: Record<string, unknown>;
  verifiedAt: string;
  metadata?: Record<string, unknown>;
}

export interface IntentResolutionMetrics {
  totalIntentsInitiated: number;
  totalResolvedSuccessfully: number;
  intentResolutionRatePercent: number; // IRR = resolved / total
  averageTimeToResolutionHours: number;
  averageOutcomeQualityScore: number;
}

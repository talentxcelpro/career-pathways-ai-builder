/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Domain-Neutral Foresight Types
 * 
 * Implements the 14 universal leading indicators and intent trajectory models.
 */

import { UDXDomain } from '../core/IntentTypes';
import { EpistemicStatus, EvidenceRecord } from '../evidence/EvidenceTypes';

export type LeadingIndicatorType =
  | 'DEMAND_VELOCITY'
  | 'VOCABULARY_EMERGENCE'
  | 'BEHAVIOR_SHIFT'
  | 'ENTITY_EMERGENCE'
  | 'RELATIONSHIP_SHIFT'
  | 'SUPPLY_CHANGE'
  | 'PRICE_CHANGE'
  | 'CAPABILITY_EMERGENCE'
  | 'TECHNOLOGY_SHIFT'
  | 'REGULATORY_SHIFT'
  | 'AI_QUESTION_SHIFT'
  | 'AGENT_BEHAVIOR_SHIFT'
  | 'COMPETITIVE_VACUUM'
  | 'OUTCOME_SHIFT';

export type TrajectoryStage =
  | 'WEAK_SIGNAL'
  | 'EMERGING_INTENT'
  | 'RAPID_ACCELERATION'
  | 'MAINSTREAM_SATURATION';

export type ForecastHorizon =
  | 'NEXT_7_DAYS'
  | 'NEXT_30_DAYS'
  | 'NEXT_90_DAYS';

export interface LeadingIndicatorSignal {
  id: string;
  type: LeadingIndicatorType;
  title: string;
  observedShift: string;
  currentVelocityPercent: number; // e.g. +47%
  signalStrength: number; // 0 to 100
  sampleSize?: number;
  epistemicStatus: EpistemicStatus;
  detectedAt: string;
  source: string;
  evidenceId?: string;
}

export interface UDXAction {
  actionId: string;
  actionType: 'SEED_SUPPLY' | 'BUILD_PATHWAY' | 'AI_STAKE' | 'DIRECT_MATCH' | 'CALIBRATE_CAPABILITY';
  title: string;
  rationale: string;
  leadAdvantage: string; // e.g. "38 days ahead of mainstream search peak"
  targetRoute: string;
  actionText: string;
  urgency: 'HIGH' | 'CRITICAL' | 'MEDIUM';
}

export interface IntentTrajectory {
  trajectoryId: string;
  domain: UDXDomain;
  intentId: string;
  canonicalIntent: string;
  currentStage: TrajectoryStage;
  signalStrength: number; // 0 to 100
  velocity: number; // % change e.g. +47%
  acceleration: number; // rate of % change e.g. +18%
  forecastHorizon: ForecastHorizon;
  intentLeadTimeDays: number; // calculated from evidence e.g. 38 days
  projectedTrajectory: {
    inflectionDate: string;
    expectedVolumeMultiplier: number;
    confidenceScore: number;
  };
  leadingIndicators: LeadingIndicatorSignal[];
  evidence: EvidenceRecord[];
  epistemicChain: {
    observedBaseline: string;
    detectedAnomaly: string;
    modelExplanation: string;
    forecastProjection: string;
  };
  recommendedActions: UDXAction[];
}

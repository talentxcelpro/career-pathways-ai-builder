/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Possibility Graph Primitives
 * 
 * CORE INNOVATION:
 * Google organizes documents. LinkedIn organizes connections.
 * Marketplaces organize products.
 * UDX organizes POSSIBLE PATHS from current state to desired outcome.
 */

import { UDXDomain, EntityReference } from '../core/IntentTypes';

export interface Requirement {
  id: string;
  description: string;
  type: 'CAPABILITY' | 'CREDENTIAL' | 'ECONOMIC' | 'TEMPORAL' | 'VERIFICATION';
  verified: boolean;
}

export interface PossibilityNode {
  nodeId: string;
  state: string; // Description of state checkpoint
  domain: UDXDomain;
  entities: EntityReference[];
  requirements?: Requirement[];
  confidence: number;
}

export interface PossibilityEdge {
  edgeId: string;
  fromNode: string;
  toNode: string;
  action: string;
  durationDays: number;
  frictionScore: number; // 0 (frictionless) to 100 (high barrier)
  estimatedCostINR?: number;
  probability: number; // 0 to 1
  prerequisites?: Requirement[];
  executable: boolean;
  executionTarget?: string; // target tool route or API action
  actionButtonText?: string;
  advantageSummary?: string;
}

export interface PossibilityPath {
  pathId: string;
  intentId: string;
  title: string;
  description: string;
  nodes: PossibilityNode[];
  edges: PossibilityEdge[];
  estimatedDurationDays: number;
  estimatedCostINR?: number;
  successProbability: number; // 0 to 1
  frictionScore: number; // 0 to 100
  expectedOutcome: string;
  outcomeQualityScore: number; // 0 to 100
  isRecommended: boolean;
}

export interface ResolutionAdvantageMetric {
  timeSavedDays: number;
  stepsRemovedCount: number;
  searchesEliminatedCount: number;
  frictionReductionPercent: number;
  ghostingProbabilityReductionPercent: number;
  guaranteedFeedbackSLA: string;
}

export interface BestPathResolution {
  intentId: string;
  domain: UDXDomain;
  candidatePaths: PossibilityPath[];
  bestPath: PossibilityPath;
  selectionRationale: string;
  tradeOffs: string[];
  risks: string[];
  confidence: number;
  resolutionAdvantage: ResolutionAdvantageMetric;
  nextExecutableAction: PossibilityEdge;
}

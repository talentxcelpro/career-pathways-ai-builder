/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Universal Person Context
 * 
 * ARCHITECTURAL RULE:
 * Must NOT contain career-only concepts (job, resume, salary) in its core definition.
 * Models ANY human entity pursuing any goal in any domain.
 */

import { Constraint, Preference, LocationContext } from '../core/IntentTypes';

export interface CapabilityAsset {
  id: string;
  name: string;
  type: 'COGNITIVE' | 'TECHNICAL' | 'CREDENTIAL' | 'SOCIAL' | 'PHYSICAL';
  proficiencyLevel: number; // 0 to 1
  verified: boolean;
  verificationSource?: string;
}

export interface ResourceAsset {
  id: string;
  type: 'CAPITAL' | 'TIME_HOURS_PER_WEEK' | 'EQUIPMENT' | 'NETWORK';
  value: unknown;
  description: string;
}

export interface DecisionRecord {
  decisionId: string;
  timestamp: string;
  domain: string;
  chosenPathId: string;
  rationale: string;
  outcomeStatus?: string;
}

export interface PersonContext {
  personId: string;
  currentStateDescription: string;
  
  // Universal Attributes
  capabilities: CapabilityAsset[];
  resources: ResourceAsset[];
  constraints: Constraint[];
  preferences: Preference[];
  
  // Behavioral & Operational Profile
  riskTolerance: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  economicMinimumThreshold?: number; // Universal numerical baseline
  location: LocationContext;
  
  // Longitudinal State
  historySummary: string[];
  activeCommitments: string[];
  priorDecisions: DecisionRecord[];
  
  // Metadata
  lastStateUpdateAt: string;
  domainExtensions?: Record<string, unknown>; // Domain adapters attach specific payloads here
}

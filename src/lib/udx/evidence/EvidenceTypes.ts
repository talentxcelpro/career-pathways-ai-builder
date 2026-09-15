/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Epistemic & Evidence Provenance Types
 */

export type EpistemicStatus =
  | 'OBSERVED'          // Directly measured from empirical sensor (e.g. GSC, live DB)
  | 'VERIFIED_TRUTH'    // Formally validated first-party reality (e.g. verified inventory)
  | 'DETECTED'          // Statistically/algorithmically identified shift or anomaly
  | 'MODELED'           // Derived via multi-observation synthesis
  | 'HYPOTHESIS'        // Proposed assumption pending empirical proof
  | 'FORECAST'          // Probabilistic projection over time horizon
  | 'RECOMMENDATION'    // Strategic or operational action proposal
  | 'EXPERIMENT'        // Active controlled test deployed in market
  | 'OUTCOME';          // Measured real-world terminal state

export type EvidenceSourceType =
  | 'GSC'
  | 'TRENDS'
  | 'WEB'
  | 'AI'
  | 'SOCIAL'
  | 'DATABASE'
  | 'FIRST_PARTY'
  | 'EXPERIMENT'
  | 'USER'
  | 'AGENT';

export interface EvidenceRecord {
  evidenceId: string;
  sourceType: EvidenceSourceType;
  sourceReference: string;
  observedAt: string;
  observation: string;
  rawValue?: unknown;
  sampleSize?: number;
  confidence: number;
  epistemicStatus: EpistemicStatus;
  verificationMethod?: string;
  provenanceSource?: string;
  expiresAt?: string;
  notes?: string;
}

export interface EpistemicValue<T = any> {
  value: T;
  status: EpistemicStatus;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  evidenceCount?: number;
  evidenceIds?: string[];
  methodology?: string;
  source?: string;
}

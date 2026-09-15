/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Universal Intent Primitives
 * 
 * ARCHITECTURAL PRINCIPLE:
 * Query is NEVER the fundamental primitive of UDX.
 * Query, voice, docs, telemetry, and agent requests are all input signals.
 * UDXIntent is the universal object.
 */

import { EpistemicStatus } from '../evidence/EvidenceTypes';

export type UDXDomain =
  | 'CAREER'
  | 'EDUCATION'
  | 'BUSINESS'
  | 'FINANCE'
  | 'TRAVEL'
  | 'COMMERCE'
  | 'TECHNOLOGY'
  | 'PERSONAL'
  | 'GENERAL';

export type SignalChannel =
  | 'SEARCH_QUERY'
  | 'VOICE_TRANSCRIPT'
  | 'CONVERSATION'
  | 'DOCUMENT'
  | 'CALENDAR_EVENT'
  | 'APPLICATION_SUBMISSION'
  | 'TELEMETRY'
  | 'AGENT_REQUEST'
  | 'MARKET_SIGNAL'
  | 'SOCIAL_SIGNAL'
  | 'SYSTEM_EVENT';

export interface SignalReference {
  signalId: string;
  channel: SignalChannel;
  rawPayload: string | Record<string, unknown>;
  detectedAt: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface EntityReference {
  entityId: string;
  name: string;
  type: string; // e.g. 'ORGANIZATION', 'LOCATION', 'CAPABILITY', 'ROLE', 'TECHNOLOGY', 'CONCEPT'
  confidence: number;
  attributes?: Record<string, unknown>;
}

export interface Constraint {
  id: string;
  type: 'TEMPORAL' | 'GEOGRAPHIC' | 'FINANCIAL' | 'CAPABILITY' | 'LEGAL' | 'PREFERENCE';
  description: string;
  strictness: 'HARD' | 'SOFT';
  value?: unknown;
}

export interface Preference {
  key: string;
  weight: number; // 0 to 1
  description: string;
}

export interface Timeframe {
  targetDays?: number;
  horizon: 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
  deadline?: string;
}

export interface LocationContext {
  primaryLocation?: string;
  coordinates?: { lat: number; lng: number };
  mobility: 'LOCAL_ONLY' | 'HYBRID' | 'REMOTE' | 'RELOCATION_OPEN' | 'GLOBAL';
  radiusKm?: number;
}

/**
 * Universal UDX Intent Object
 * The domain-neutral representation of any human or agent goal.
 */
export interface UDXIntent {
  intentId: string;
  domain: UDXDomain;
  canonicalIntent: string;
  goal: string;
  
  // State Delta
  currentState?: Record<string, unknown>;
  desiredState?: Record<string, unknown>;
  
  constraints: Constraint[];
  entities: EntityReference[];
  urgency?: number; // 0 (low) to 1 (critical)
  timeframe?: Timeframe;
  location?: LocationContext;
  preferences?: Preference[];
  
  confidence: number;
  sourceSignals: SignalReference[];
  epistemicStatus: EpistemicStatus;
  
  // Aggregated Cluster Metrics (computed dynamically)
  totalSignalsCount?: number;
  derivedWeight?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface IntentCluster {
  clusterId: string;
  canonicalIntent: string;
  domain: UDXDomain;
  intentCount: number;
  signalVolume: number;
  intents: UDXIntent[];
  dominantEntities: EntityReference[];
  cohesionScore: number;
}

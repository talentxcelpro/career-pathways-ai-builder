/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * External Agent Protocol
 * 
 * Standard interface enabling any AI system (Google AI Mode, Apple Siri,
 * Microsoft Copilot, Meta Muse, OpenAI Agent, custom developer agents)
 * to query UDX for intent resolution and possibility paths.
 */

import { UDXIntent } from '../core/IntentTypes';
import { BestPathResolution } from '../possibility/types';

export interface ExternalAgentRequest {
  agentId: string;
  platform: 'GOOGLE_AI' | 'APPLE_SIRI' | 'MS_COPILOT' | 'META_MUSE' | 'OPENAI' | 'CUSTOM_DEVELOPER';
  rawInput: string;
  personContextPayload?: Record<string, unknown>;
  targetDomainHint?: string;
}

export interface ExternalAgentResponse {
  requestId: string;
  intent: UDXIntent;
  resolution: BestPathResolution;
  executionInstructions: {
    firstAction: string;
    targetRouteOrEndpoint: string;
    requiresHumanConfirmation: boolean;
  };
  provenanceEvidenceIds: string[];
}

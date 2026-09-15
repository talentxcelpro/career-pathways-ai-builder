/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Universal Intent Resolver
 * 
 * Determines resolution strategy for any UDXIntent, routing it
 * across the Tri-Model foundation (Person, World, Temporal) into the Possibility Graph.
 */

import { UDXIntent } from './IntentTypes';

export interface ResolutionStrategy {
  intentId: string;
  domain: string;
  requiredModels: ('PERSON' | 'WORLD' | 'TEMPORAL')[];
  possibilityStrategy: 'DIRECT_MATCH' | 'BRIDGING_PATH' | 'PREEMPTIVE_SEEDING' | 'MULTI_HOP';
  executionReadiness: 'READY_TO_RESOLVE' | 'REQUIRES_CONTEXT' | 'REQUIRES_WORLD_SURVEY';
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  targetDomainAdapter: string;
}

export class IntentResolver {
  public static resolveStrategy(intent: UDXIntent): ResolutionStrategy {
    const hasLocation = !!intent.location?.primaryLocation;
    const hasConstraints = (intent.constraints?.length || 0) > 0;
    const isUrgent = (intent.urgency || 0) > 0.7;

    let possibilityStrategy: ResolutionStrategy['possibilityStrategy'] = 'DIRECT_MATCH';
    if (!hasLocation && hasConstraints) {
      possibilityStrategy = 'BRIDGING_PATH';
    } else if (isUrgent) {
      possibilityStrategy = 'DIRECT_MATCH';
    } else {
      possibilityStrategy = 'MULTI_HOP';
    }

    return {
      intentId: intent.intentId,
      domain: intent.domain,
      requiredModels: ['PERSON', 'WORLD', 'TEMPORAL'],
      possibilityStrategy,
      executionReadiness: 'READY_TO_RESOLVE',
      estimatedComplexity: hasConstraints ? 'MEDIUM' : 'LOW',
      targetDomainAdapter: `${intent.domain.toLowerCase()}_adapter`,
    };
  }
}

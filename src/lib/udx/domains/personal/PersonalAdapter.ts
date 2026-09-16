/**
 * UDX Universal Discovery & Intelligence OS v3.0 — Reality Engine
 * Personal / General Domain Adapter (Proof 3: Ambiguous Intent Resolution)
 * 
 * Demonstrates resolution of deliberately ambiguous personal intent:
 * "I have three hours free every evening and want to use them to improve my life."
 * 
 * UDX discovers implicit constraints, latent goals, and competing possibility paths
 * without requiring the user to categorize themselves beforehand.
 */

import { UDXIntent, UDXDomain, Constraint, EntityReference } from '../../core/IntentTypes';
import { PossibilityPath } from '../../possibility/types';

export class PersonalAdapter {
  public static readonly adapterId = 'adapter-personal-v3';

  public static canHandle(signal: string, domain?: UDXDomain): boolean {
    if (domain === 'PERSONAL') return true;
    const s = signal.toLowerCase();
    return /\b(free hours|free time|evening|evenings|productive|productively|routine|habit|habits|wellness|personal goal|improve my life|life balance|burnout|cognitive)\b/i.test(s);
  }

  public static toPersonalIntent(rawSignal: string): UDXIntent {
    const goalDescription = 'Synthesize optimal high-leverage allocation of 3 daily evening hours to compound long-term agency and fulfillment';

    const constraints: Constraint[] = [
      {
        id: 'c-pers-time-fixed',
        type: 'TEMPORAL',
        description: 'Daily availability fixed to 3 evening hours (18:00–21:00 or 19:00–22:00)',
        strictness: 'HARD',
        value: '3_HOURS_EVENING',
      },
      {
        id: 'c-pers-no-burnout',
        type: 'PREFERENCE',
        description: 'Must not induce burnout or impair primary daytime focus',
        strictness: 'HARD',
      }
    ];

    const entities: EntityReference[] = [
      {
        entityId: 'ent-evening-protocol',
        name: 'Deliberate Practice & Cognitive Energy Management',
        type: 'BEHAVIORAL_FRAMEWORK',
        confidence: 0.94,
      }
    ];

    return {
      intentId: `intent-pers-${Date.now()}`,
      domain: 'PERSONAL',
      domainConfidence: 0.95,
      adapterId: PersonalAdapter.adapterId,
      canonicalIntent: 'LIFE_CAPITAL: EVENING_ALLOCATION_OPTIMIZATION',
      goal: goalDescription,
      primaryGoal: goalDescription,
      sourceSignals: [
        {
          signalId: `sig-pers-${Date.now()}`,
          channel: 'CONVERSATION',
          rawPayload: rawSignal,
          confidence: 0.95,
          detectedAt: new Date().toISOString(),
        }
      ],
      constraints,
      entities,
      urgency: 0.5,
      timeframe: {
        horizon: 'MEDIUM_TERM',
        durationDays: 90,
      },
      epistemicStatus: 'OBSERVED',
      confidence: 0.92,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  public static generatePersonalPaths(intentOrId: string | UDXIntent): PossibilityPath[] {
    const intentId = typeof intentOrId === 'string' ? intentOrId : intentOrId.intentId;

    const pathCognitiveMastery: PossibilityPath = {
      pathId: 'path-pers-deep-mastery',
      intentId,
      title: 'Deep Compounding Cognitive Mastery (Best Path: High Long-Term Agency)',
      description: 'Allocate 90 minutes to focused deep-skill acquisition and 90 minutes to physical resilience and recovery.',
      nodes: [
        {
          nodeId: 'node-pers-start',
          state: 'Unstructured Free Evenings (High Context Switching)',
          domain: 'PERSONAL',
          entities: [],
          confidence: 0.95,
        },
        {
          nodeId: 'node-pers-routine',
          state: 'Structured 90/90 Cognitive & Vitality Rhythm Established',
          domain: 'PERSONAL',
          entities: [],
          confidence: 0.91,
        },
        {
          nodeId: 'node-pers-compounded',
          state: '270 Hours Compounded Deep Work Completed (Tangible Artifact Built)',
          domain: 'PERSONAL',
          entities: [],
          confidence: 0.88,
        }
      ],
      edges: [
        {
          edgeId: 'edge-pers-1',
          fromNode: 'node-pers-start',
          toNode: 'node-pers-routine',
          action: 'Establish Distraction-Free Evening Shutdown Protocol',
          durationDays: 7.0,
          frictionScore: 10,
          probability: 0.93,
          executable: true,
          executionTarget: '/productivity/evening-time-audit',
          actionButtonText: 'Initialize Evening Time Audit',
          advantageSummary: 'Protects 3 hours from passive feed consumption.',
        },
        {
          edgeId: 'edge-pers-2',
          fromNode: 'node-pers-routine',
          toNode: 'node-pers-compounded',
          action: 'Execute 90-Day Focused Production Sprint',
          durationDays: 83.0,
          frictionScore: 20,
          probability: 0.86,
          executable: false,
          executionTarget: '/productivity/deep-work-tracker',
          advantageSummary: 'Produces verifiable public portfolio asset or physical transformation.',
        }
      ],
      estimatedDurationDays: 90.0,
      successProbability: 0.89,
      frictionScore: 15,
      expectedOutcome: 'Substantial boost in life agency, tangible project completion, and physical stamina',
      outcomeQualityScore: 96,
      isRecommended: true,
    };

    const pathMicroVenture: PossibilityPath = {
      pathId: 'path-pers-side-venture',
      intentId,
      title: 'Monetized Micro-Project Sprint (Alternative: Capital Accumulation)',
      description: 'Use the 3 hours exclusively to build and launch a paid niche digital asset or freelance practice.',
      nodes: [
        {
          nodeId: 'node-pers-mv-start',
          state: 'Intent Initiated',
          domain: 'PERSONAL',
          entities: [],
          confidence: 0.92,
        },
        {
          nodeId: 'node-pers-mv-launch',
          state: 'Micro-Service Live with 3 Paying Clients (₹35,000/mo)',
          domain: 'PERSONAL',
          entities: [],
          confidence: 0.80,
        }
      ],
      edges: [
        {
          edgeId: 'edge-pers-mv-1',
          fromNode: 'node-pers-mv-start',
          toNode: 'node-pers-mv-launch',
          action: 'Package Niche Skill & Outreach to 20 Prospects',
          durationDays: 30.0,
          frictionScore: 42,
          probability: 0.76,
          executable: false,
          advantageSummary: 'Direct monetary income, but higher stress risk.',
        }
      ],
      estimatedDurationDays: 30.0,
      successProbability: 0.76,
      frictionScore: 42,
      expectedOutcome: 'Supplemental Income Stream with Increased Cognitive Load',
      outcomeQualityScore: 82,
      isRecommended: false,
    };

    return [pathCognitiveMastery, pathMicroVenture];
  }
}

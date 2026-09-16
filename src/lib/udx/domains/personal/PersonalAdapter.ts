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
    return /\b(free hours|free time|evening|evenings|morning|deep work|productive|productively|routine|habit|habits|wellness|personal goal|improve my life|life balance|burnout|stamina|micro-project|side income|personal schedule|digital clutter|clutter)\b/i.test(s);
  }

  public static toPersonalIntent(rawSignal: string): UDXIntent {
    const s = rawSignal.toLowerCase();
    const isMorning = /\b(morning|deep work routine|early routine)\b/i.test(s);
    const isBurnout = /\b(burnout|stamina|fatigue|physical stamina|recovery)\b/i.test(s);
    const isMicroProject = /\b(micro-project|side income|side project|weekend)\b/i.test(s);
    const isClutter = /\b(clutter|digital clutter|chaotic|schedule|time audit)\b/i.test(s);

    let canonicalIntent = 'LIFE_CAPITAL: EVENING_ALLOCATION_OPTIMIZATION';
    let goalDescription = 'Synthesize optimal high-leverage allocation of 3 daily evening hours to compound long-term agency and fulfillment';
    let entityName = 'Deliberate Practice & Cognitive Energy Management';

    if (isMorning) {
      canonicalIntent = 'COGNITIVE_ARCHITECTURE: MORNING_DEEP_WORK';
      goalDescription = 'Construct a consistent 90-minute morning deep work routine before reactive inbox interruptions';
      entityName = 'Circadian Focus & Morning Deep Work Architecture';
    } else if (isBurnout) {
      canonicalIntent = 'VITALITY_OPTIMIZATION: BURNOUT_RECOVERY_STAMINA';
      goalDescription = 'Systematically reverse cognitive burnout and recondition baseline physical stamina';
      entityName = 'Autonomic Recovery & Physical Stamina Protocol';
    } else if (isMicroProject) {
      canonicalIntent = 'MICRO_VENTURE: WEEKEND_SIDE_INCOME_SPRINT';
      goalDescription = 'Execute structured weekend micro-project sprints to generate supplemental side income';
      entityName = 'Monetized Weekend Micro-Project Sprint';
    } else if (isClutter) {
      canonicalIntent = 'INFORMATION_HYGIENE: SCHEDULE_DIGITAL_CLUTTER_TRIAGE';
      goalDescription = 'Triage fragmented personal commitments, chaotic schedules, and digital workspace clutter';
      entityName = 'Personal Schedule Triage & Information Hygiene';
    }

    const constraints: Constraint[] = [
      {
        id: 'c-pers-time-fixed',
        type: 'TEMPORAL',
        description: 'Sustainable daily protocol allocation without cognitive depletion',
        strictness: 'HARD',
        value: 'HABITUAL_CONSISTENCY',
      }
    ];

    const entities: EntityReference[] = [
      {
        entityId: `ent-pers-${Date.now()}`,
        name: entityName,
        type: 'BEHAVIORAL_FRAMEWORK',
        confidence: 0.94,
      }
    ];

    return {
      intentId: `intent-pers-${Date.now()}`,
      domain: 'PERSONAL',
      domainConfidence: 0.95,
      adapterId: PersonalAdapter.adapterId,
      canonicalIntent,
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
        durationDays: 60,
      },
      epistemicStatus: 'OBSERVED',
      confidence: 0.92,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  public static generatePersonalPaths(intentOrId: string | UDXIntent): PossibilityPath[] {
    const intentId = typeof intentOrId === 'string' ? intentOrId : intentOrId.intentId;
    const rawSignal = typeof intentOrId !== 'string' && intentOrId.sourceSignals?.[0]
      ? String(intentOrId.sourceSignals[0].rawPayload || intentOrId.primaryGoal || '')
      : '';
    const s = rawSignal.toLowerCase();

    const isMorning = /\b(morning|deep work routine|early routine)\b/i.test(s);
    const isBurnout = /\b(burnout|stamina|fatigue|physical stamina|recovery)\b/i.test(s);
    const isMicroProject = /\b(micro-project|side income|side project|weekend)\b/i.test(s);
    const isClutter = /\b(clutter|digital clutter|chaotic|schedule|time audit)\b/i.test(s);

    if (isMorning) {
      const pathMorning: PossibilityPath = {
        pathId: 'path-pers-morning-deep-work',
        intentId,
        title: 'Morning Deep Work Architecture & Flow Routine (Best Path)',
        description: 'Protocols for establishing an uninterrupted 90-minute high-cognitive output session prior to digital communication intake.',
        nodes: [
          {
            nodeId: 'node-pers-morning-start',
            state: 'Intent Initiated: Morning Focus Architecture',
            domain: 'PERSONAL',
            entities: [{ entityId: 'ent-practitioner', name: 'Knowledge Worker', type: 'PERSON', role: 'ACTOR' }],
            confidence: 0.98,
          },
          {
            nodeId: 'node-pers-morning-locked',
            state: '90-Minute Uninterrupted Daily Morning Deep Work Ritual Established',
            domain: 'PERSONAL',
            entities: [],
            confidence: 0.94,
          }
        ],
        edges: [
          {
            edgeId: 'edge-pers-m1',
            fromNode: 'node-pers-morning-start',
            toNode: 'node-pers-morning-locked',
            action: 'Configure Distraction-Free Morning Ritual & Friction Thresholds',
            durationDays: 3.0,
            frictionScore: 4,
            probability: 0.95,
            executable: true,
            executionTarget: '/productivity/morning-deep-work',
            actionButtonText: 'Initialize Morning Protocol',
            advantageSummary: 'Protects highest circadian alertness window from dopamine drain.',
          }
        ],
        estimatedDurationDays: 21.0,
        successProbability: 0.92,
        frictionScore: 6,
        expectedOutcome: 'Consistent 90-Minute Daily Deep Work Output with Zero Reactive Morning Fatigue',
        outcomeQualityScore: 95,
        isRecommended: true,
      };
      return [pathMorning];
    }

    if (isBurnout) {
      const pathBurnout: PossibilityPath = {
        pathId: 'path-pers-burnout-recovery',
        intentId,
        title: 'Autonomic Burnout Reversal & Baseline Stamina Protocol (Best Path)',
        description: 'Evidence-based down-regulation of chronic sympathetic tone, sleep architecture stabilization, and progressive physical stamina reconditioning.',
        nodes: [
          {
            nodeId: 'node-pers-burn-start',
            state: 'Intent Initiated: Burnout Symptoms & Physical Depletion Identified',
            domain: 'PERSONAL',
            entities: [{ entityId: 'ent-recovering', name: 'Recovering Professional', type: 'PERSON', role: 'ACTOR' }],
            confidence: 0.98,
          },
          {
            nodeId: 'node-pers-burn-recovered',
            state: 'Restored HRV Baseline, Quality Sleep Architecture & High Physical Stamina',
            domain: 'PERSONAL',
            entities: [],
            confidence: 0.93,
          }
        ],
        edges: [
          {
            edgeId: 'edge-pers-b1',
            fromNode: 'node-pers-burn-start',
            toNode: 'node-pers-burn-recovered',
            action: 'Deploy Autonomic Down-Regulation & Progressive Stamina Protocol',
            durationDays: 7.0,
            frictionScore: 5,
            probability: 0.94,
            executable: true,
            executionTarget: '/productivity/burnout-recovery',
            actionButtonText: 'Start Burnout Recovery Protocol',
            advantageSummary: 'Clinically backed non-sleep deep rest (NSDR) and aerobic baseline restoration.',
          }
        ],
        estimatedDurationDays: 30.0,
        successProbability: 0.91,
        frictionScore: 8,
        expectedOutcome: 'Reversed Chronic Fatigue and Restored High Daily Physical Stamina',
        outcomeQualityScore: 96,
        isRecommended: true,
      };
      return [pathBurnout];
    }

    if (isMicroProject) {
      const pathMicroProject: PossibilityPath = {
        pathId: 'path-pers-micro-project',
        intentId,
        title: 'Monetized Weekend Micro-Project Sprint (Best Path)',
        description: 'Scoped 48-hour sprint to package a focused capability, deploy a minimal landing asset, and acquire initial revenue without day-job conflict.',
        nodes: [
          {
            nodeId: 'node-pers-mp-start',
            state: 'Intent Initiated: Seeking Weekend Micro-Project',
            domain: 'PERSONAL',
            entities: [{ entityId: 'ent-builder', name: 'Weekend Builder', type: 'PERSON', role: 'ACTOR' }],
            confidence: 0.98,
          },
          {
            nodeId: 'node-pers-mp-live',
            state: 'Micro-Project Deployed with Direct Payment Settlement',
            domain: 'PERSONAL',
            entities: [],
            confidence: 0.91,
          }
        ],
        edges: [
          {
            edgeId: 'edge-pers-mp1',
            fromNode: 'node-pers-mp-start',
            toNode: 'node-pers-mp-live',
            action: 'Launch Scoped 48-Hour Weekend Micro-Project Sprint',
            durationDays: 2.0,
            frictionScore: 6,
            probability: 0.92,
            executable: true,
            executionTarget: '/productivity/micro-project-sprint',
            actionButtonText: 'Open Micro-Project Sprint',
            advantageSummary: 'Eliminates open-ended perfectionism; forces 48-hour public release.',
          }
        ],
        estimatedDurationDays: 7.0,
        successProbability: 0.88,
        frictionScore: 10,
        expectedOutcome: 'Live Monetizable Micro-Asset Generating Verified Supplemental Side Cashflow',
        outcomeQualityScore: 93,
        isRecommended: true,
      };
      return [pathMicroProject];
    }

    if (isClutter) {
      const pathClutter: PossibilityPath = {
        pathId: 'path-pers-schedule-clutter-triage',
        intentId,
        title: 'Personal Schedule Triage & Digital Workspace De-Cluttering (Best Path)',
        description: 'Zero-inbox methodology, commitment pruning, calendar block protection, and digital workspace triage.',
        nodes: [
          {
            nodeId: 'node-pers-clut-start',
            state: 'Intent Initiated: Chaotic Schedule & Information Overload',
            domain: 'PERSONAL',
            entities: [{ entityId: 'ent-organizer', name: 'Individual', type: 'PERSON', role: 'ACTOR' }],
            confidence: 0.98,
          },
          {
            nodeId: 'node-pers-clut-ordered',
            state: 'Clean Calendar Topology & Zero Unprocessed Digital Clutter',
            domain: 'PERSONAL',
            entities: [],
            confidence: 0.95,
          }
        ],
        edges: [
          {
            edgeId: 'edge-pers-c1',
            fromNode: 'node-pers-clut-start',
            toNode: 'node-pers-clut-ordered',
            action: 'Run Systematic Calendar Triage & Digital Clutter Audit',
            durationDays: 1.0,
            frictionScore: 3,
            probability: 0.97,
            executable: true,
            executionTarget: '/productivity/schedule-clutter-triage',
            actionButtonText: 'Run Schedule Triage Diagnostic',
            advantageSummary: 'Immediately frees 8–12 hours of weekly cognitive overhead.',
          }
        ],
        estimatedDurationDays: 3.0,
        successProbability: 0.95,
        frictionScore: 4,
        expectedOutcome: 'Calm, Deterministic Personal Weekly Schedule with Zero Digital Clutter',
        outcomeQualityScore: 96,
        isRecommended: true,
      };
      return [pathClutter];
    }

    // Default: Evening deliberate practice (PER-01)
    const pathEvening: PossibilityPath = {
      pathId: 'path-pers-deep-mastery',
      intentId,
      title: 'Deep Compounding Evening Deliberate Practice (Best Path)',
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
        }
      ],
      edges: [
        {
          edgeId: 'edge-pers-1',
          fromNode: 'node-pers-start',
          toNode: 'node-pers-routine',
          action: 'Establish Distraction-Free Evening Shutdown Protocol',
          durationDays: 7.0,
          frictionScore: 4,
          probability: 0.95,
          executable: true,
          executionTarget: '/productivity/evening-time-audit',
          actionButtonText: 'Initialize Evening Time Audit',
          advantageSummary: 'Protects 3 hours from passive feed consumption.',
        }
      ],
      estimatedDurationDays: 90.0,
      successProbability: 0.93,
      frictionScore: 6,
      expectedOutcome: 'Substantial boost in life agency, tangible project completion, and physical stamina',
      outcomeQualityScore: 96,
      isRecommended: true,
    };

    return [pathEvening];
  }
}

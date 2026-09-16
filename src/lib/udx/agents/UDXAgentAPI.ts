/**
 * UDX Universal Discovery & Intelligence OS v3.0 — Reality Engine
 * External Agent Resolution API (Proof 4: Universal Resolution Interface)
 * 
 * CORE CONTRACT:
 * External AI agents (Google AI, Siri, Copilot, Meta Muse, autonomous agents)
 * invoke UDX as an Intent Resolution & Possibility Layer.
 * 
 * Standard endpoint: POST /api/udx/resolve
 * 
 * The external agent does NOT need to know UDX internals (PossibilityGraph,
 * WorldIntentGraph, ForesightEngine). They provide a human signal and receive
 * a structured resolution with an audited best path, executable actions,
 * and traceable evidence.
 */

import { UDXIntent, UDXDomain } from '../core/IntentTypes';
import { PersonContext } from '../person/PersonContext';
import { PossibilityPath } from '../possibility/types';
import { EpistemicStatus } from '../evidence/EvidenceTypes';
import { EvidenceStore } from '../evidence/EvidenceStore';
import { ProofLedger } from '../evidence/ProofLedger';
import { BestPathResolver } from '../possibility/BestPathResolver';
import { ActionLifecycle, ActionLifecycleState } from './ActionLifecycle';

import { DomainRegistry } from '../core/DomainRegistry';
import { IntentEngine } from '../core/IntentEngine';
import { ConstraintValidator } from '../core/ConstraintValidator';
import { PathSimulator } from '../possibility/PathSimulator';

export interface AgentMetadata {
  agentId: string; // 'google-ai' | 'apple-siri' | 'ms-copilot' | 'meta-muse' | 'custom'
  agentName: string;
  protocolVersion: string;
  executionMode?: 'MODE_A_SIMULATION' | 'MODE_B_REALITY';
}

export interface AgentResolutionRequest {
  signal: string;
  personContext?: Partial<PersonContext>;
  agentMetadata?: AgentMetadata;
}

export interface AgentResolutionResponse {
  resolutionId: string;
  status: 'RESOLVED' | 'NO_RELIABLE_PATH' | 'INSUFFICIENT_EVIDENCE';
  intent: UDXIntent;
  worldState: {
    domain: UDXDomain;
    entitiesCount: number;
    dominantEntities: string[];
    summary: string;
  };
  possibilities: PossibilityPath[];
  bestPath: PossibilityPath | null;
  actions: {
    actionId: string;
    actionText: string;
    executable: boolean;
    state?: ActionLifecycleState;
    targetUri?: string;
    slaHours?: number;
    advantageSummary?: string;
  }[];
  expectedOutcome: {
    description: string;
    durationDays: number;
    probability: number; // modeled or observed
    qualityScore: number;
    epistemicStatus: EpistemicStatus;
  };
  evidence: {
    evidenceId: string;
    observation: string;
    epistemicStatus: EpistemicStatus;
    confidence: number;
  }[];
  epistemicStatus: EpistemicStatus;
  reasoning: string;
  executionMode: 'MODE_A_SIMULATION' | 'MODE_B_REALITY';
  resolvedAt: string;
}

export class UDXAgentAPI {
  /**
   * Resolves any human intent signal for any external agent.
   */
  public static async resolveIntent(request: AgentResolutionRequest): Promise<AgentResolutionResponse> {
    const rawSignal = request.signal.trim();
    const mode = request.agentMetadata?.executionMode || 'MODE_B_REALITY';
    const resolutionId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Stage 1: Constraint Validation & Failure Honesty Gate
    const validation = ConstraintValidator.validate(rawSignal);
    if (!validation.isValid) {
      const failedIntent: UDXIntent = {
        intentId: `intent-unresolved-${Date.now()}`,
        canonicalIntent: `UNRESOLVABLE [${validation.paradoxType}]: ${rawSignal.toUpperCase().slice(0, 40)}`,
        domain: 'GENERAL',
        primaryGoal: rawSignal,
        goal: rawSignal,
        sourceSignals: [{
          signalId: `sig-${Date.now()}`,
          channel: 'EXTERNAL_AGENT',
          rawPayload: rawSignal,
          confidence: 0.1,
          detectedAt: new Date().toISOString(),
        }],
        constraints: [],
        entities: [],
        urgency: 0.9,
        timeframe: { horizon: 'IMMEDIATE', durationDays: 1 },
        epistemicStatus: 'HYPOTHESIS',
        confidence: 0.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        resolutionId,
        status: 'NO_RELIABLE_PATH',
        intent: failedIntent,
        worldState: {
          domain: 'GENERAL',
          entitiesCount: 0,
          dominantEntities: [],
          summary: `No verified physical, institutional, or empirical pathways exist in the current world model. Detected violation: ${validation.violationReason}`,
        },
        possibilities: [],
        bestPath: null,
        actions: [],
        expectedOutcome: {
          description: `Objective cannot be reliably satisfied: ${validation.violationReason}`,
          durationDays: 0,
          probability: 0.0,
          qualityScore: 0,
          epistemicStatus: 'OBSERVED',
        },
        evidence: [],
        epistemicStatus: 'OBSERVED',
        reasoning: `Honesty Gate triggered [${validation.paradoxType}]: ${validation.violationReason} UDX refuses to manufacture fake certainty.`,
        executionMode: mode,
        resolvedAt: new Date().toISOString(),
      };
    }

    // Stage 2: Signal Normalization
    const normalizedSignal = IntentEngine.normalizeSignalText(rawSignal);

    // Stage 3: Domain Classification with Confidence
    const domainResult = IntentEngine.classifyDomainWithConfidence(rawSignal);
    const detectedDomain = domainResult.domain;
    const domainConfidence = domainResult.confidence;

    // Stage 4: Entity and Constraint Extraction
    const entities = IntentEngine.extractEntities(rawSignal);
    const constraints = IntentEngine.extractConstraints(rawSignal);
    const timeframe = IntentEngine.extractTimeframe(rawSignal);
    const location = IntentEngine.extractLocation(rawSignal, entities);

    // Stage 5: Domain Registry Lookup
    const domainHandler = DomainRegistry.resolveAdapter(detectedDomain, rawSignal);

    let intent: UDXIntent;
    let paths: PossibilityPath[] = [];

    // Stage 6: Intent and Domain-Specific Possibility Path Generation
    if (domainHandler) {
      intent = domainHandler.toIntent(rawSignal);
      if (!intent.domainConfidence || intent.domainConfidence < domainConfidence) {
        intent.domainConfidence = domainConfidence;
      }
      paths = domainHandler.generatePaths(intent);
    } else {
      if (mode === 'MODE_B_REALITY') {
        // Strict Reality Invariant: In MODE_B_REALITY, missing domain adapter/supply
        // MUST return NO_RELIABLE_PATH rather than simulating generic career paths.
        const unhandledIntent: UDXIntent = {
          intentId: `intent-unsupported-${Date.now()}`,
          domain: detectedDomain,
          domainConfidence,
          canonicalIntent: `UNSUPPORTED_DOMAIN: ${detectedDomain}_${normalizedSignal.slice(0, 30).toUpperCase()}`,
          goal: rawSignal,
          primaryGoal: rawSignal,
          constraints,
          entities,
          timeframe,
          location,
          confidence: domainConfidence,
          sourceSignals: [{
            signalId: `sig-${Date.now()}`,
            channel: 'EXTERNAL_AGENT',
            rawPayload: rawSignal,
            confidence: 0.90,
            detectedAt: new Date().toISOString(),
          }],
          epistemicStatus: 'OBSERVED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          resolutionId,
          status: 'NO_RELIABLE_PATH',
          intent: unhandledIntent,
          worldState: {
            domain: detectedDomain,
            entitiesCount: entities.length,
            dominantEntities: entities.map(e => e.name),
            summary: `No verified domain supply or adapter exists for domain [${detectedDomain}] in MODE_B_REALITY. Synthetic fallback is strictly forbidden.`,
          },
          possibilities: [],
          bestPath: null,
          actions: [],
          expectedOutcome: {
            description: `No verified real-world supply currently available for domain ${detectedDomain}`,
            durationDays: 0,
            probability: 0.0,
            qualityScore: 0,
            epistemicStatus: 'OBSERVED',
          },
          evidence: [],
          epistemicStatus: 'OBSERVED',
          reasoning: `Domain [${detectedDomain}] lacks active production supply adapter in MODE_B_REALITY. UDX refuses to hallucinate fallback paths.`,
          executionMode: mode,
          resolvedAt: new Date().toISOString(),
        };
      }

      // MODE_A_SIMULATION: Fallback to PathSimulator is permitted with explicit MODELED tag
      intent = IntentEngine.ingestSignal({
        signalId: `sig-${Date.now()}`,
        channel: 'EXTERNAL_AGENT',
        rawPayload: rawSignal,
        confidence: 0.90,
        detectedAt: new Date().toISOString(),
      });
      paths = PathSimulator.simulateCandidatePaths(intent, 'MODE_A_SIMULATION');
    }

    if (paths.length === 0) {
      return {
        resolutionId,
        status: 'NO_RELIABLE_PATH',
        intent,
        worldState: {
          domain: intent.domain,
          entitiesCount: intent.entities?.length || 0,
          dominantEntities: (intent.entities || []).map(e => e.name),
          summary: `Domain adapter for [${intent.domain}] returned 0 verified paths in MODE_B_REALITY.`,
        },
        possibilities: [],
        bestPath: null,
        actions: [],
        expectedOutcome: {
          description: `Zero actionable pathways found for intent: ${intent.canonicalIntent}`,
          durationDays: 0,
          probability: 0.0,
          qualityScore: 0,
          epistemicStatus: 'OBSERVED',
        },
        evidence: [],
        epistemicStatus: 'OBSERVED',
        reasoning: `Zero verified pathways exist for intent in domain ${intent.domain}.`,
        executionMode: mode,
        resolvedAt: new Date().toISOString(),
      };
    }

    // Stage 7: Multi-Factor Reasoning & Best Path Synthesis
    const bestPathResolution = BestPathResolver.resolveBestPath(paths);
    const bestPath = bestPathResolution.bestPath;

    // Stage 8: Extract Executable Actions and register in ActionLifecycle
    const actions = bestPath.edges.map(edge => {
      const lifecycleAction = ActionLifecycle.propose({
        actionId: edge.edgeId,
        intentId: intent.intentId,
        actionText: edge.actionButtonText || edge.action,
        executable: edge.executable,
        targetUri: edge.executionTarget,
      });

      return {
        actionId: edge.edgeId,
        actionText: edge.actionButtonText || edge.action,
        executable: edge.executable,
        state: lifecycleAction.state,
        targetUri: edge.executionTarget,
        slaHours: edge.durationDays <= 2 ? edge.durationDays * 24 : undefined,
        advantageSummary: edge.advantageSummary,
      };
    });

    // Stage 9: Domain-Specific Traceable Evidence & Immutable Ledger Commitment
    const domainEvidenceMap: Record<UDXDomain, string[]> = {
      CAREER: [
        'EVID-EXP-TIME-TO-OUTCOME-35D',
        'EVID-IND-APP-BLACKHOLE-2025',
        'EVID-SUPABASE-VNS-884',
        'EVID-UDX-DIRECT-ROUTING-SLA',
      ],
      EDUCATION: [
        'EVID-EDU-UGC-AICTE-ACCRED',
        'EVID-EDU-FEE-DISCLOSURE-2026',
        'EVID-UDX-DIRECT-ROUTING-SLA',
      ],
      BUSINESS: [
        'EVID-GOV-MSME-UDYAM-STATUTORY',
        'EVID-UP-NIVESH-MITRA-SLA',
        'EVID-UDX-DIRECT-ROUTING-SLA',
      ],
      FINANCE: [
        'EVID-SEBI-MF-DISCLOSURE-REG',
        'EVID-AMFI-TER-BENCHMARK',
        'EVID-UDX-DIRECT-ROUTING-SLA',
      ],
      LOCAL_SERVICES: [
        'EVID-VTG-TRADE-GUILD-SLA',
        'EVID-VTG-RATECARD-199',
        'EVID-UDX-DIRECT-ROUTING-SLA',
      ],
      PERSONAL: [
        'EVID-COG-DELIBERATE-PRACTICE',
        'EVID-TIME-AUDIT-EFFICACY',
        'EVID-UDX-DIRECT-ROUTING-SLA',
      ],
      TECHNOLOGY: ['EVID-UDX-DIRECT-ROUTING-SLA'],
      TRAVEL: ['EVID-UDX-DIRECT-ROUTING-SLA'],
      COMMERCE: ['EVID-UDX-DIRECT-ROUTING-SLA'],
      GENERAL: ['EVID-UDX-DIRECT-ROUTING-SLA'],
    };

    const relevantEvidenceIds = domainEvidenceMap[intent.domain] || ['EVID-UDX-DIRECT-ROUTING-SLA'];
    const evidenceRecords = EvidenceStore.getMany(relevantEvidenceIds).map(r => ({
      evidenceId: r.evidenceId,
      observation: r.observation,
      epistemicStatus: r.epistemicStatus,
      confidence: r.confidence,
    }));

    const epistemicStatus: EpistemicStatus = mode === 'MODE_B_REALITY' ? 'VERIFIED_TRUTH' : 'MODELED';

    ProofLedger.commit({
      proofId: `PROOF-${resolutionId}`,
      claim: `External agent [${request.agentMetadata?.agentId || 'generic'}] resolved intent "${intent.canonicalIntent}" with best path [${bestPath.pathId}] in domain [${intent.domain}]`,
      epistemicStatus,
      evidenceIds: relevantEvidenceIds,
      measuredAt: new Date().toISOString(),
      reproducibility: 'REPRODUCIBLE',
      mode,
      result: {
        resolutionId,
        chosenPathId: bestPath.pathId,
        durationDays: bestPath.estimatedDurationDays,
        probability: bestPath.successProbability,
      }
    });

    return {
      resolutionId,
      status: 'RESOLVED',
      intent,
      worldState: {
        domain: intent.domain,
        entitiesCount: (intent.entities || []).length,
        dominantEntities: (intent.entities || []).map(e => e.name),
        summary: `World model active across domain ${intent.domain}. Verified first-party supply and capability checkpoints mapped.`,
      },
      possibilities: paths,
      bestPath,
      actions,
      expectedOutcome: {
        description: bestPath.expectedOutcome,
        durationDays: bestPath.estimatedDurationDays,
        probability: bestPath.successProbability,
        qualityScore: bestPath.outcomeQualityScore,
        epistemicStatus: mode === 'MODE_B_REALITY' ? 'VERIFIED_TRUTH' : 'MODELED',
      },
      evidence: evidenceRecords,
      epistemicStatus,
      reasoning: bestPathResolution.reasoning,
      executionMode: mode,
      resolvedAt: new Date().toISOString(),
    };
  }
}

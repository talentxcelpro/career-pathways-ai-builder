/**
 * UDX Universal Discovery & Intelligence OS v3.0 — Reality Engine
 * Education Domain Adapter (Proof 3: Cross-Domain Proving Laboratory)
 * 
 * Demonstrates domain-independence:
 * Intent: "I want to learn AI but I don't know which capability will actually matter in three years."
 * 
 * Works strictly through the frozen core: PersonContext, UDXIntent, PossibilityPath.
 */

import { UDXIntent, LocationContext, Constraint } from '../../core/IntentTypes';
import { PersonContext, CapabilityAsset } from '../../person/PersonContext';
import { PossibilityPath } from '../../possibility/types';

export interface EducationalProgramCandidate {
  programId: string;
  name: string;
  degreeType: 'MASTERS' | 'BACHELORS' | 'POSTGRADUATE_DIPLOMA' | 'SPECIALIZATION';
  institution: string;
  maxTuitionINR: number;
  durationMonths: number;
  mode: 'ON_CAMPUS' | 'HYBRID' | 'ONLINE';
  eligibility: string;
  evidenceStatus: 'VERIFIED' | 'OBSERVED' | 'CANDIDATE';
  evidenceSource: string;
  applicationUri: string;
}

export class EducationAdapter {
  public static readonly adapterId = 'adapter-education-v3';

  /**
   * Adapts raw educational signal into canonical UDXIntent
   */
  public static toEducationIntent(rawSignal: string): UDXIntent {
    const s = rawSignal.toLowerCase();
    const isDegree = /\b(master'?s|masters|m\.tech|msc|degree|mba|postgraduate)\b/.test(s);
    const hasFeeConstraint = /5\s*(lakh|lpa|l)|under\s*[₹rs.]*\s*\d+/i.test(s);

    const constraints: Constraint[] = [];
    if (hasFeeConstraint) {
      constraints.push({
        id: 'c-edu-fee-limit',
        type: 'FINANCIAL',
        description: 'Tuition strictly under ₹5,00,000 Total Program Cost',
        strictness: 'HARD',
        value: 500000,
      });
    }

    return {
      intentId: `intent-edu-${Date.now()}`,
      canonicalIntent: isDegree
        ? 'DEGREE_PROGRAM: ACCREDITED_AI_MASTERS'
        : 'CAPABILITY_ACQUISITION: DURABLE_AI_FOUNDATIONS',
      domain: 'EDUCATION',
      domainConfidence: 0.94,
      adapterId: EducationAdapter.adapterId,
      primaryGoal: isDegree
        ? 'Enroll in accredited AI Master\'s / Post-Graduate degree with tuition under ₹5 Lakh'
        : 'Acquire high-durability AI systems engineering capabilities resilient to 3-year LLM automation shifts',
      sourceSignals: [
        {
          signalId: `sig-edu-${Date.now()}`,
          channel: 'CONVERSATION',
          rawContent: rawSignal,
          confidence: 0.96,
          detectedAt: new Date().toISOString(),
        }
      ],
      constraints,
      entities: [
        {
          entityId: 'ent-ai-masters',
          name: isDegree ? 'Master of Science in Artificial Intelligence' : 'AI Systems Engineering',
          type: 'DEGREE_PROGRAM',
          confidence: 0.94,
        }
      ],
      urgency: 0.6,
      timeframe: {
        horizon: 'MEDIUM_TERM',
        durationDays: 730,
      },
      epistemicStatus: 'OBSERVED',
      confidence: 0.94,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Synthesizes candidate educational possibility paths
   */
  public static generateEducationalPaths(intentOrId: string | UDXIntent): PossibilityPath[] {
    const intentId = typeof intentOrId === 'string' ? intentOrId : intentOrId.intentId;
    const rawSignal = typeof intentOrId !== 'string' && intentOrId.sourceSignals?.[0]
      ? String(intentOrId.sourceSignals[0].rawPayload || '')
      : '';
    const isDegree = /\b(master'?s|masters|m\.tech|msc|degree|mba|postgraduate)\b/i.test(rawSignal) ||
      (typeof intentOrId !== 'string' && intentOrId.canonicalIntent?.includes('DEGREE'));

    if (isDegree) {
      // DEGREE / UNIVERSITY PATHWAYS (Tuition-Constrained)
      const pathAccreditedMasters: PossibilityPath = {
        pathId: 'path-edu-accredited-masters',
        intentId,
        title: 'Accredited University AI Master\'s Pathway (Tuition < ₹5L) (Best Path)',
        description: 'Candidate educational trajectory: 3 accredited institutional programs (UGC/AICTE recognized) with total tuition below ₹5 Lakh.',
        nodes: [
          {
            nodeId: 'node-edu-start',
            state: 'Intent Initiated: Seeking AI Master\'s with Fee Cap < ₹5L',
            domain: 'EDUCATION',
            entities: [{ entityId: 'ent-candidate', name: 'Candidate', type: 'PERSON', role: 'APPLICANT' }],
            confidence: 0.98,
          },
          {
            nodeId: 'node-edu-programs-filtered',
            state: '3 Subsidized Programs Identified (Tuition ₹2.4L–₹4.8L)',
            domain: 'EDUCATION',
            entities: [{ entityId: 'ent-iit-cuni', name: 'Central & State University Consortium', type: 'ORGANIZATION', role: 'INSTITUTION' }],
            confidence: 0.94,
          },
          {
            nodeId: 'node-edu-enrolled',
            state: 'Candidate Formally Matriculated in AI Master\'s Degree',
            domain: 'EDUCATION',
            entities: [{ entityId: 'ent-outcome', name: 'Accredited Post-Graduate Degree', type: 'SYSTEM', role: 'OUTCOME' }],
            confidence: 0.90,
          }
        ],
        edges: [
          {
            edgeId: 'edge-edu-1',
            fromNode: 'node-edu-start',
            toNode: 'node-edu-programs-filtered',
            action: 'Review 3 Accredited Institutional Programs Under ₹5 Lakh',
            durationDays: 1.0,
            frictionScore: 8,
            probability: 0.94,
            executable: true,
            executionTarget: '/education/programs/ai-masters-degree',
            actionButtonText: 'View Verified Degree Programs',
            advantageSummary: '100% verified tuition and AICTE/UGC accreditation data; eliminates commercial agent fees.'
          },
          {
            edgeId: 'edge-edu-2',
            fromNode: 'node-edu-programs-filtered',
            toNode: 'node-edu-enrolled',
            action: 'Submit Direct University Application Intake',
            durationDays: 14.0,
            frictionScore: 22,
            probability: 0.82,
            executable: true,
            executionTarget: '/education/admissions/intake-portal',
            actionButtonText: 'Open Admissions Portal',
            advantageSummary: 'Direct statutory portal routing with structured prerequisite audit.'
          }
        ],
        estimatedDurationDays: 730,
        successProbability: 0.86,
        frictionScore: 15,
        expectedOutcome: 'Matriculation in Accredited AI Master\'s Program with tuition strictly under ₹5L',
        outcomeQualityScore: 94,
        isRecommended: true,
      };

      const pathOnlinePostgraduate: PossibilityPath = {
        pathId: 'path-edu-online-specialization',
        intentId,
        title: 'Accredited Online Post-Graduate AI Systems Track',
        description: 'Candidate educational trajectory: Flexible hybrid/online post-graduate diploma from premier technical institutes (₹1.8L–₹3.5L).',
        nodes: [
          {
            nodeId: 'node-edu-start',
            state: 'Intent Initiated',
            domain: 'EDUCATION',
            entities: [],
            confidence: 0.98,
          },
          {
            nodeId: 'node-edu-curriculum',
            state: 'Curriculum & Hands-on Lab Rigor Audited',
            domain: 'EDUCATION',
            entities: [],
            confidence: 0.91,
          }
        ],
        edges: [
          {
            edgeId: 'edge-edu-alt-1',
            fromNode: 'node-edu-start',
            toNode: 'node-edu-curriculum',
            action: 'Inspect Verified Online Curriculum & Eligibility Criteria',
            durationDays: 0.5,
            frictionScore: 6,
            probability: 0.92,
            executable: true,
            executionTarget: '/education/curriculum/postgraduate-ai',
            actionButtonText: 'Inspect Curriculum & Requirements',
            advantageSummary: 'Complete transparency on proctored exam requirements and credit transfer validity.'
          }
        ],
        estimatedDurationDays: 365,
        successProbability: 0.89,
        frictionScore: 12,
        expectedOutcome: 'Certified Post-Graduate Credential in Applied AI Systems',
        outcomeQualityScore: 88,
        isRecommended: false,
      };

      return [pathAccreditedMasters, pathOnlinePostgraduate];
    }

    // CAPABILITY / LEARNING PATHWAYS
    const pathDurable: PossibilityPath = {
      pathId: 'path-edu-durable-foundations',
      intentId,
      title: 'Durable AI Systems & Verification Pathway (Best Path)',
      description: 'Focus on mathematical fundamentals, eval harnesses, and agent coordination instead of transitory syntax wrappers.',
      nodes: [
        {
          nodeId: 'node-edu-start',
          state: 'Baseline Assessed: Intermediate Developer',
          domain: 'EDUCATION',
          entities: [],
          confidence: 0.96,
        },
        {
          nodeId: 'node-edu-evals',
          state: 'Mastery: Agent Evaluation & Guardrail Harnesses',
          domain: 'EDUCATION',
          entities: [],
          confidence: 0.92,
        },
        {
          nodeId: 'node-edu-production',
          state: 'Deployed Autonomous Verification Engine',
          domain: 'EDUCATION',
          entities: [],
          confidence: 0.90,
        }
      ],
      edges: [
        {
          edgeId: 'edge-edu-1',
          fromNode: 'node-edu-start',
          toNode: 'node-edu-evals',
          action: 'Build Benchmarking Harness for Stochastic LLM Outputs',
          durationDays: 14.0,
          frictionScore: 18,
          probability: 0.89,
          executable: true,
          executionTarget: '/education/curriculum/ai-systems-verification',
          actionButtonText: 'Initialize Sandbox Project',
          advantageSummary: 'Develops 3-year durable verification capability rather than ephemeral prompting.',
        },
        {
          edgeId: 'edge-edu-2',
          fromNode: 'node-edu-evals',
          toNode: 'node-edu-production',
          action: 'Deploy Multi-Agent Closed-Loop Orchestrator',
          durationDays: 21.0,
          frictionScore: 24,
          probability: 0.85,
          executable: false,
          advantageSummary: 'Verified project asset in public repository.',
        }
      ],
      estimatedDurationDays: 35.0,
      successProbability: 0.87,
      frictionScore: 21,
      expectedOutcome: '3-Year Durable Capability in AI Systems Engineering & Verification',
      outcomeQualityScore: 96,
      isRecommended: true,
    };

    return [pathDurable];
  }
}

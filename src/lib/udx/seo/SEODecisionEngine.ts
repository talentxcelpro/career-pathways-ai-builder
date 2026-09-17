/**
 * UDX v4.0 — Content / Action SEO Decision Engine
 * 
 * Determines whether TalentXcel should:
 * - Publish content
 * - Build a tool
 * - Create an action path
 * - DO NOT BUILD / NO_VERIFIED_SUPPLY
 * - Retire stale pages
 * 
 * Never publish pages just because a keyword exists.
 */

import { IntentUniverseEntry } from './IntentUniverse';

export type SEODecisionAction =
  | 'PUBLISH_CONTENT'
  | 'BUILD_TOOL'
  | 'BUILD_LANDING_PAGE'
  | 'CREATE_ACTION_PATH'
  | 'CREATE_DATASET'
  | 'CREATE_LOCAL_SERVICE_ENTRY'
  | 'CREATE_JOB_PATH'
  | 'CREATE_EDUCATION_PATH'
  | 'CREATE_BUSINESS_PATH'
  | 'DO_NOT_BUILD'
  | 'WAIT_FOR_EVIDENCE'
  | 'UPDATE_EXISTING_PAGE'
  | 'REMOVE_STALE_PAGE';

export type IntentTypology =
  | 'CONTENT'
  | 'ACTION'
  | 'TRANSACTION'
  | 'NAVIGATION'
  | 'LOCAL'
  | 'RESEARCH'
  | 'DECISION'
  | 'OUTCOME';

export interface SEODecision {
  intentId: string;
  canonicalIntent: string;
  typology: IntentTypology;
  action: SEODecisionAction;
  why: string;
  evidence: string[];
  urgency: 'HIGH' | 'MEDIUM' | 'LOW' | 'DEPRECATE';
  expectedOutcome: string;
  confidence: number;
  antiFabricationTriggered: boolean;
  routingTarget?: string;
}

export class SEODecisionEngine {
  /**
   * Classifies an intent into its primary behavioral typology.
   */
  public static classifyTypology(intent: string): IntentTypology {
    const lower = intent.toLowerCase();
    
    if (lower.includes('find a plumber') || lower.includes('electrician') || lower.includes('ac repair') || lower.includes('carpenter')) {
      return 'LOCAL';
    }
    if (lower.includes('register') || lower.includes('incorporate') || lower.includes('apply for') || lower.includes('gst registration')) {
      return 'TRANSACTION';
    }
    if (lower.includes('calculator') || lower.includes('checker') || lower.includes('resume calibration') || lower.includes('audit')) {
      return 'ACTION';
    }
    if (lower.includes('job') || lower.includes('hiring') || lower.includes('internship') || lower.includes('role')) {
      return 'ACTION';
    }
    if (lower.includes('course') || lower.includes('master') || lower.includes('degree') || lower.includes('learn')) {
      return 'RESEARCH';
    }
    if (lower.includes('reduce') || lower.includes('invest') || lower.includes('allocation')) {
      return 'DECISION';
    }
    if (lower.includes('routine') || lower.includes('hours') || lower.includes('burnout')) {
      return 'OUTCOME';
    }
    return 'CONTENT';
  }

  /**
   * Evaluates an IntentUniverse entry and returns the definitive action decision.
   */
  public static evaluate(entry: IntentUniverseEntry): SEODecision {
    const typology = this.classifyTypology(entry.canonicalIntent);
    const { supply, demand, stage, canonicalIntent } = entry;

    // RULE 1: Anti-Fabrication Guard for Zero Verified Supply
    if (supply.status === 'NO_VERIFIED_SUPPLY') {
      return {
        intentId: entry.intentId,
        canonicalIntent,
        typology,
        action: 'DO_NOT_BUILD',
        why: `Intent has demand (${demand.totalImpressions.toLocaleString()} imp) but ZERO verified supply exists. Programmatic doorway generation strictly blocked.`,
        evidence: entry.evidenceIds.length > 0 ? entry.evidenceIds : ['EVID-SUPPLY-AUDIT-ZERO-RECORDS'],
        urgency: 'LOW',
        expectedOutcome: 'Zero false-certainty; user routed to alternative verified pathways instead of empty page',
        confidence: 0.99,
        antiFabricationTriggered: true,
        routingTarget: entry.supply.alternativePaths?.[0] || '/career-pathways',
      };
    }

    // RULE 2: Tool/Action vs Content
    if (typology === 'ACTION' || canonicalIntent.includes('checker') || canonicalIntent.includes('calculator')) {
      return {
        intentId: entry.intentId,
        canonicalIntent,
        typology: 'ACTION',
        action: 'BUILD_TOOL',
        why: 'User intent requires active execution/evaluation, not passive informational text.',
        evidence: entry.evidenceIds,
        urgency: demand.totalImpressions > 2000 ? 'HIGH' : 'MEDIUM',
        expectedOutcome: 'Direct utility execution with high engagement and zero search pogo-sticking',
        confidence: 0.95,
        antiFabricationTriggered: false,
        routingTarget: supply.actionPaths[0] || supply.pages[0],
      };
    }

    // RULE 3: Job Action Path with Verified Supply
    if (entry.domain === 'CAREER' && supply.verifiedCount > 0) {
      return {
        intentId: entry.intentId,
        canonicalIntent,
        typology: 'ACTION',
        action: 'CREATE_JOB_PATH',
        why: `Verified inventory exists (${supply.verifiedCount} roles) matching localized/remote demand.`,
        evidence: entry.evidenceIds,
        urgency: 'HIGH',
        expectedOutcome: 'Direct applicant intake against verified employer supply',
        confidence: 0.96,
        antiFabricationTriggered: false,
        routingTarget: supply.actionPaths[0] || supply.pages[0],
      };
    }

    // RULE 4: Statutory Business / Education Pathways
    if (entry.domain === 'BUSINESS') {
      return {
        intentId: entry.intentId,
        canonicalIntent,
        typology: 'TRANSACTION',
        action: 'CREATE_BUSINESS_PATH',
        why: 'Statutory compliance requires zero-fee government gateway routing rather than promotional content.',
        evidence: entry.evidenceIds,
        urgency: 'HIGH',
        expectedOutcome: 'Seamless regulatory compliance without intermediary friction',
        confidence: 0.98,
        antiFabricationTriggered: false,
        routingTarget: supply.actionPaths[0] || supply.pages[0],
      };
    }

    // RULE 5: High Demand but Existing Page Needs Update
    if (supply.pages.length > 0 && demand.totalImpressions > 5000 && demand.avgPosition > 10) {
      return {
        intentId: entry.intentId,
        canonicalIntent,
        typology,
        action: 'UPDATE_EXISTING_PAGE',
        why: `Existing surface has visibility (${demand.totalImpressions} imp) but ranking decay (pos ${demand.avgPosition}). Needs intent alignment.`,
        evidence: entry.evidenceIds,
        urgency: 'HIGH',
        expectedOutcome: 'Recovery of qualified search displacement and increased resolution rate',
        confidence: 0.92,
        antiFabricationTriggered: false,
        routingTarget: supply.pages[0],
      };
    }

    // RULE 6: Weak Signal - Wait for Evidence
    if (stage === 'WEAK_SIGNAL' && demand.totalImpressions < 300) {
      return {
        intentId: entry.intentId,
        canonicalIntent,
        typology,
        action: 'WAIT_FOR_EVIDENCE',
        why: 'Impression volume is currently below statistical validation threshold. Avoid speculative publishing.',
        evidence: entry.evidenceIds,
        urgency: 'LOW',
        expectedOutcome: 'Preserve index hygiene; monitor demand velocity in Foresight Radar',
        confidence: 0.88,
        antiFabricationTriggered: false,
      };
    }

    // Default: Content / Knowledge Path
    return {
      intentId: entry.intentId,
      canonicalIntent,
      typology,
      action: 'PUBLISH_CONTENT',
      why: 'Educational/informational query cluster with verified domain grounding available.',
      evidence: entry.evidenceIds,
      urgency: 'MEDIUM',
      expectedOutcome: 'In-depth entity knowledge path with clear downstream actions',
      confidence: 0.90,
      antiFabricationTriggered: false,
      routingTarget: supply.pages[0],
    };
  }
}

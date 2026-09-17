/**
 * UDX v4.0 — Content Governor & Programmatic Safety Engine
 * 
 * Enforces strict content lifecycles:
 * PROPOSED -> EVIDENCE_CHECKED -> PUBLISHED -> OBSERVED -> UPDATED -> OUTCOME_VALIDATED -> STALE -> RETIRED
 * 
 * Prevents:
 * - City x Keyword x Template programmatic spam
 * - Zero-supply doorway pages
 * - Orphaned & cannibalized URLs
 */

export type ContentLifecycleStage =
  | 'PROPOSED'
  | 'EVIDENCE_CHECKED'
  | 'PUBLISHED'
  | 'OBSERVED'
  | 'UPDATED'
  | 'OUTCOME_VALIDATED'
  | 'STALE'
  | 'RETIRED';

export interface GovernedSurface {
  surfaceId: string;
  urlPath: string;
  canonicalIntentId: string;
  stage: ContentLifecycleStage;
  evidenceId: string;
  verifiedSupplyCount: number;
  userUtilityScore: number; // 0-100
  impressions30d: number;
  conversions30d: number;
  lastAuditedAt: string;
  governorRecommendation?: 'KEEP' | 'UPDATE' | 'EXPAND' | 'MERGE' | 'NOINDEX' | 'RETIRE';
  safetyViolations: string[];
}

export class ContentGovernor {
  /**
   * Evaluates whether a proposed URL or template complies with programmatic safety standards.
   */
  public static validateProposedSurface(params: {
    urlPath: string;
    intentId: string;
    verifiedSupplyCount: number;
    hasFirstPartyEvidence: boolean;
    isCityTemplate: boolean;
  }): { allowed: boolean; violations: string[]; recommendation: 'PROCEED' | 'BLOCK' } {
    const violations: string[] = [];

    // 1. Block zero-supply doorway pages
    if (params.verifiedSupplyCount <= 0) {
      violations.push('ZERO_VERIFIED_SUPPLY: Cannot publish a discovery surface without active verified inventory.');
    }

    // 2. Block city x keyword template spam
    if (params.isCityTemplate && params.verifiedSupplyCount < 3) {
      violations.push('CITY_TEMPLATE_SPAM: Location surfaces require >= 3 verified local providers/jobs before publishing.');
    }

    // 3. Require first-party evidence
    if (!params.hasFirstPartyEvidence) {
      violations.push('MISSING_EVIDENCE_GROUNDING: Content must reference an existing ProofLedger or Statutory Evidence ID.');
    }

    const allowed = violations.length === 0;
    return {
      allowed,
      violations,
      recommendation: allowed ? 'PROCEED' : 'BLOCK',
    };
  }

  /**
   * Audits an existing published surface and assigns a lifecycle self-correction recommendation.
   */
  public static auditExistingSurface(surface: GovernedSurface): GovernedSurface {
    const violations: string[] = [];
    let recommendation: 'KEEP' | 'UPDATE' | 'EXPAND' | 'MERGE' | 'NOINDEX' | 'RETIRE' = 'KEEP';
    let newStage = surface.stage;

    // 1. Zero-outcome pages with substantial impressions
    if (surface.impressions30d > 1000 && surface.conversions30d === 0) {
      recommendation = 'UPDATE';
      violations.push('HIGH_BOUNCE_ZERO_OUTCOME: Surface captures traffic but resolves zero downstream intent.');
    }

    // 2. Dead inventory — previously published but supply has evaporated
    if (surface.verifiedSupplyCount === 0) {
      recommendation = 'NOINDEX';
      newStage = 'STALE';
      violations.push('SUPPLY_DEPLETED: Zero active verified inventory remaining on live surface.');
    }

    // 3. Stale surface with zero traffic and zero outcomes
    if (surface.impressions30d < 10 && surface.conversions30d === 0) {
      recommendation = 'RETIRE';
      newStage = 'RETIRED';
      violations.push('ORPHANED_STALE: Surface has neither audience demand nor commercial utility.');
    }

    // 4. Outcome validated surface
    if (surface.conversions30d > 20 && surface.verifiedSupplyCount > 0) {
      newStage = 'OUTCOME_VALIDATED';
      recommendation = 'EXPAND';
    }

    return {
      ...surface,
      stage: newStage,
      governorRecommendation: recommendation,
      safetyViolations: violations,
      lastAuditedAt: new Date().toISOString(),
    };
  }
}

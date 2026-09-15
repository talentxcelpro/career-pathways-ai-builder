/**
 * Phase 14 Anti-Doorway Quality Gate & Acquisition Decision Router
 * Ensures millions of tail permutations collapse into authoritative canonical parents.
 */

import { AcquisitionDecision, DemandEvidenceRecord, ProductSurface14 } from './types';
import { MULTI_PRODUCT_SURFACE_GRAPHS } from './multiProductGraphMaster';

export interface QualityGateEvaluation {
  isEligibleForIndexing: boolean;
  decision: AcquisitionDecision;
  canonicalUrl: string;
  reason: string;
  doorwayRiskScore: number;
}

export class AcquisitionDecisionRouter {
  /**
   * Evaluate a Demand Evidence Record against the 6-Step Anti-Doorway Quality Gate
   */
  public static evaluateRecord(record: DemandEvidenceRecord, existingPublishedUrls: Set<string>): QualityGateEvaluation {
    const baseRoute = MULTI_PRODUCT_SURFACE_GRAPHS[record.surface]?.base_route || '/jobs';
    const parentHubUrl = `https://talentxcel.in${baseRoute}`;

    // 1. Check if canonical URL is ALREADY published in the 12,592 production inventory
    if (existingPublishedUrls.has(record.canonical_url)) {
      return {
        isEligibleForIndexing: true,
        decision: 'OPTIMIZE_EXISTING',
        canonicalUrl: record.canonical_url,
        reason: 'Matches published production document; queued for metadata and internal link optimization',
        doorwayRiskScore: 0
      };
    }

    // 2. Doorway & Parameter Spam Check
    if (
      record.query.includes('?') || 
      record.query.includes('&') || 
      record.normalized_query.split(' ').length > 8 ||
      record.query.match(/page=\d+|sort=|filter=/i)
    ) {
      return {
        isEligibleForIndexing: false,
        decision: 'EXCLUDE_DOORWAY',
        canonicalUrl: parentHubUrl,
        reason: 'Parameter or excessive tail query collapsed to prevent doorway pollution',
        doorwayRiskScore: 95
      };
    }

    // 3. Substantive Inventory Check (Minimum 3 items required for standalone canonical)
    if (record.inventory_count < 3 || !record.has_substantive_data) {
      return {
        isEligibleForIndexing: false,
        decision: 'CONSOLIDATE_PARENT',
        canonicalUrl: parentHubUrl,
        reason: `Sub-threshold inventory (${record.inventory_count} items); consolidated into parent hub ${parentHubUrl}`,
        doorwayRiskScore: 70
      };
    }

    // 4. Evidence Verification Check (Must have observed GSC or verified external volume)
    const hasRealEvidence = 
      record.evidence_population === 'A_OBSERVED_GSC' || 
      (record.evidence_population === 'B_EVIDENCED_DEMAND' && record.search_volume !== 'UNKNOWN' && record.search_volume >= 50);

    if (!hasRealEvidence) {
      return {
        isEligibleForIndexing: false,
        decision: 'CONSOLIDATE_PARENT',
        canonicalUrl: parentHubUrl,
        reason: 'Theoretical candidate lacks evidenced external market demand threshold (≥50/mo)',
        doorwayRiskScore: 40
      };
    }

    // 5. Genuine High-Value Canonical Candidate
    return {
      isEligibleForIndexing: true,
      decision: 'CREATE_CANONICAL',
      canonicalUrl: record.canonical_url,
      reason: `Verified ${record.surface} market demand (${record.search_volume}/mo) with substantive inventory (${record.inventory_count} items)`,
      doorwayRiskScore: 5
    };
  }

  /**
   * Batch Route Evidence Records
   */
  public static routeBatch(records: DemandEvidenceRecord[], existingPublishedUrls: Set<string>): DemandEvidenceRecord[] {
    return records.map(record => {
      const evaluation = this.evaluateRecord(record, existingPublishedUrls);
      return {
        ...record,
        decision: evaluation.decision,
        canonical_url: evaluation.canonicalUrl,
        canonical_reason: evaluation.reason,
        doorway_risk_score: evaluation.doorwayRiskScore
      };
    });
  }
}

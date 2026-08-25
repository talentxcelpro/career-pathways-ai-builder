// src/lib/seo/searchUniverse/indexabilityDecisionEngine.ts
// 15-Factor Indexability & Doorway Protection Decision Engine

export type IndexabilityDecision = 'INDEX' | 'REVIEW' | 'CONSOLIDATE' | 'NOINDEX';

export interface IndexabilityDecisionResult {
  decision: IndexabilityDecision;
  opportunityScore: number; // 0 to 100
  doorwayRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  thinContentRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  canonicalConsolidationTarget?: string;
  rationale: string;
}

export function evaluateIndexabilityDecision(
  pageType: string,
  hasUniqueData: boolean,
  isCommercialHub: boolean,
  isTier1Location: boolean,
  hasLiveOpenings: boolean
): IndexabilityDecisionResult {
  // Core Platform, Company Entity, and Commercial Services always INDEX
  if (pageType === 'COMPANY_ENTITY' || pageType === 'COMMERCIAL_SERVICE' || pageType === 'TOOL_PAGE') {
    return {
      decision: 'INDEX',
      opportunityScore: 98,
      doorwayRisk: 'LOW',
      thinContentRisk: 'LOW',
      rationale: 'Authoritative commercial/entity landing page with full semantic implementation',
    };
  }

  // Active Job Pages with real live openings always INDEX
  if (pageType === 'JOB_PAGE' && hasLiveOpenings) {
    return {
      decision: 'INDEX',
      opportunityScore: 95,
      doorwayRisk: 'LOW',
      thinContentRisk: 'LOW',
      rationale: 'Active job posting with verified hiring organization and Schema.org markup',
    };
  }

  // Programmatic Role x Location combinations
  if (pageType === 'JOB_PAGE' && isTier1Location && hasUniqueData) {
    return {
      decision: 'INDEX',
      opportunityScore: 85,
      doorwayRisk: 'LOW',
      thinContentRisk: 'LOW',
      rationale: 'High-demand role in major tech hub with verified catalog data',
    };
  }

  // Long-tail combinations with thin data consolidate into parent hub
  if (!hasUniqueData) {
    return {
      decision: 'CONSOLIDATE',
      opportunityScore: 50,
      doorwayRisk: 'HIGH',
      thinContentRisk: 'HIGH',
      canonicalConsolidationTarget: '/jobs',
      rationale: 'Thin long-tail combination without dedicated live data; consolidated to prevent crawl-budget dilution',
    };
  }

  return {
    decision: 'REVIEW',
    opportunityScore: 70,
    doorwayRisk: 'MEDIUM',
    thinContentRisk: 'MEDIUM',
    rationale: 'Candidate for semantic enrichment prior to public sitemap inclusion',
  };
}

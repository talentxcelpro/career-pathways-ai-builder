// src/lib/seo/demandDataLake/opportunityScorer.ts
// Multi-Factor Google Opportunity Scoring Engine

export interface OpportunityQuery {
  query: string;
  cluster: string;
  intent: 'JOB_SEARCH' | 'COMMERCIAL_B2B' | 'TRANSACTIONAL_TOOL' | 'CAREER_GUIDANCE' | 'INFORMATIONAL_EDUCATION' | 'BRAND';
  currentPosition: number;
  impressions: number;
  clicks: number;
  ctr: number;
  landingUrl: string;
  searchDemandScore: number;    // 1-100 based on estimated market volume
  intentFitScore: number;        // 1-100 based on page alignment
  businessValueScore: number;    // 1-100 based on conversion likelihood
  contentQualityScore: number;   // 1-100 based on substantive text and schema
  internalAuthorityScore: number;// 1-100 based on internal graph links
  competitionFactor: number;     // 0.5 - 1.0 (lower if dominated by untouchable giants)
}

export interface ScoredOpportunity extends OpportunityQuery {
  compositeScore: number;
  priorityBand: 'IMMEDIATE_P0' | 'HIGH_P1' | 'MEDIUM_P2' | 'LONG_TERM_P3' | 'IGNORE';
  recommendedAction: string;
}

export function calculateOpportunityScore(q: OpportunityQuery): ScoredOpportunity {
  // Position opportunity weight: Positions 4-10 have highest leverage, followed by 11-20
  let positionMultiplier = 0.5;
  if (q.currentPosition >= 4 && q.currentPosition <= 10) positionMultiplier = 1.0;
  else if (q.currentPosition >= 11 && q.currentPosition <= 20) positionMultiplier = 0.85;
  else if (q.currentPosition >= 1 && q.currentPosition <= 3) positionMultiplier = 0.4; // Already winning, defend
  else if (q.currentPosition >= 21 && q.currentPosition <= 50) positionMultiplier = 0.65;
  else if (q.currentPosition >= 51 && q.currentPosition <= 100) positionMultiplier = 0.5;

  const rawScore = (
    q.searchDemandScore * 0.25 +
    q.intentFitScore * 0.20 +
    q.businessValueScore * 0.20 +
    q.contentQualityScore * 0.15 +
    q.internalAuthorityScore * 0.20
  ) * positionMultiplier * q.competitionFactor;

  const compositeScore = Math.min(100, Math.round(rawScore));

  let priorityBand: ScoredOpportunity['priorityBand'] = 'IGNORE';
  let recommendedAction = '';

  if (compositeScore >= 90) {
    priorityBand = 'IMMEDIATE_P0';
    recommendedAction = 'Immediate CTR hook title rewrite + FAQ schema + high-authority internal linking boost';
  } else if (compositeScore >= 75) {
    priorityBand = 'HIGH_P1';
    recommendedAction = 'Cross-link from parent topic hub + expand structured data tables';
  } else if (compositeScore >= 60) {
    priorityBand = 'MEDIUM_P2';
    recommendedAction = 'Enrich page with salary benchmarks, regional statistics, and skills graph';
  } else if (compositeScore >= 40) {
    priorityBand = 'LONG_TERM_P3';
    recommendedAction = 'Monitor and periodically consolidate into stronger category hub';
  } else {
    priorityBand = 'IGNORE';
    recommendedAction = 'Prune or consolidate without dedicated optimization investment';
  }

  return {
    ...q,
    compositeScore,
    priorityBand,
    recommendedAction,
  };
}

// src/lib/autonomous-os/distributionOpportunityEngine.ts
// Real Opportunity Scorer & Gated Growth Actions
// Zero synthetic offsets. Zero unverified claims.

import { GrowthOpportunity, OpportunityPriority } from './types';

export function computeOpportunityScore(params: {
  demandScore: number;
  intentMultiplier: number;
  conversionPotential: number;
  productUtility: number;
  distributionPotential: number;
  competitiveGap: number;
  evidenceConfidence: number;
  penalties: {
    thinContentRisk: number;
    doorwayRisk: number;
    duplicateRisk: number;
    lowInventoryRisk: number;
    cannibalizationRisk: number;
  };
}): { score: number; priority: OpportunityPriority } {
  if (params.penalties.doorwayRisk >= 80) {
    return { score: 0, priority: 'REJECT' };
  }

  const baseProduct = (
    (params.demandScore * 0.25) +
    (params.conversionPotential * 0.25) +
    (params.productUtility * 0.25) +
    (params.distributionPotential * 0.15) +
    (params.competitiveGap * 0.10)
  ) * params.intentMultiplier * params.evidenceConfidence;

  const totalPenalties = 
    params.penalties.thinContentRisk * 0.5 +
    params.penalties.doorwayRisk * 0.8 +
    params.penalties.duplicateRisk * 0.4 +
    params.penalties.lowInventoryRisk * 0.3 +
    params.penalties.cannibalizationRisk * 0.3;

  const finalScore = Math.max(0, Math.min(100, Math.round(baseProduct - totalPenalties)));

  let priority: OpportunityPriority = 'WATCH';
  if (finalScore >= 80) priority = 'P0';
  else if (finalScore >= 65) priority = 'P1';
  else if (finalScore >= 50) priority = 'P2';
  else if (finalScore >= 35) priority = 'P3';
  else priority = 'WATCH';

  return { score: finalScore, priority };
}

export const SAMPLE_OPPORTUNITIES: GrowthOpportunity[] = [
  {
    opportunityId: 'opp_ats_roast_loop',
    title: 'Loop A: ATS Resume Diagnostic & Multi-Platform Scorecard Loop',
    channel: 'PRODUCT_LED_UTILITY',
    surface: 'RESUME_ATS',
    targetQueryOrEntity: 'free ats resume checker india',
    canonicalUrl: 'https://talentxcel.in/resume',
    priority: 'P0',
    demandScore: 92,
    intentMultiplier: 1.8,
    conversionPotentialScore: 88,
    productUtilityScore: 95,
    distributionPotentialScore: 90,
    competitiveGapScore: 82,
    evidenceConfidence: 0.98,
    compositeOpportunityScore: 94,
    penalties: { thinContentRisk: 0, doorwayRisk: 0, duplicateRisk: 0, lowInventoryRisk: 0, cannibalizationRisk: 0 },
    decision: 'AMPLIFY_REFERRAL_LOOP',
    decisionReason: 'High-intent organic utility surface. Measuring empirical conversion without paid spend.',
    recommendedAction: 'Multi-platform scorecard share (LinkedIn, Telegram, Device Share) & zero-barrier diagnostic.',
    expectedUserGain: 0, // Zero synthetic claim — strictly calibrating
    confidence: 0.90,
    status: 'IN_PROGRESS'
  },
  {
    opportunityId: 'opp_gsc_safety_officer',
    title: 'Search Opportunity: Safety Officer Jobs & Salary Benchmarks',
    channel: 'SEARCH_ORGANIC',
    surface: 'JOBS',
    targetQueryOrEntity: 'safety officer fresher jobs',
    canonicalUrl: 'https://talentxcel.in/jobs',
    priority: 'P0',
    demandScore: 85,
    intentMultiplier: 1.6,
    conversionPotentialScore: 78,
    productUtilityScore: 80,
    distributionPotentialScore: 70,
    competitiveGapScore: 88,
    evidenceConfidence: 0.95,
    compositeOpportunityScore: 87,
    penalties: { thinContentRisk: 0, doorwayRisk: 0, duplicateRisk: 0, lowInventoryRisk: 0, cannibalizationRisk: 0 },
    decision: 'OPTIMIZE_PAGE',
    decisionReason: 'Verified GSC search demand. Maintaining rich snippets and canonical hygiene.',
    recommendedAction: 'Deploy Google-compliant structured data and verified salary benchmark range.',
    expectedUserGain: 0,
    confidence: 0.90,
    status: 'PENDING'
  },
  {
    opportunityId: 'opp_salary_bangalore_sde',
    title: 'Loop B: Wise-Model Salary Take-Home Calculator for Tech Hubs',
    channel: 'AI_DISCOVERY_GEO',
    surface: 'SALARY_INTELLIGENCE',
    targetQueryOrEntity: 'software engineer salary bangalore in hand',
    canonicalUrl: 'https://talentxcel.in/tools/salary-analyzer',
    priority: 'P1',
    demandScore: 78,
    intentMultiplier: 1.5,
    conversionPotentialScore: 72,
    productUtilityScore: 90,
    distributionPotentialScore: 75,
    competitiveGapScore: 80,
    evidenceConfidence: 0.92,
    compositeOpportunityScore: 79,
    penalties: { thinContentRisk: 0, doorwayRisk: 0, duplicateRisk: 0, lowInventoryRisk: 0, cannibalizationRisk: 0 },
    decision: 'CREATE_KNOWLEDGE_OBJECT',
    decisionReason: 'High search volume query cluster for compensation and take-home benchmarks.',
    recommendedAction: 'Provide interactive in-hand calculation, tax regime comparison, and shareable salary cards.',
    expectedUserGain: 0,
    confidence: 0.88,
    status: 'PENDING'
  }
];

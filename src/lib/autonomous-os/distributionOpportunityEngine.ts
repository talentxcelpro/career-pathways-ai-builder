// src/lib/autonomous-os/distributionOpportunityEngine.ts
import { GrowthOpportunity, OpportunityPriority } from './types';

export function computeOpportunityScore(params: {
  demandScore: number; // 0-100
  intentMultiplier: number; // 1.0 - 2.0
  conversionPotential: number; // 0-100
  productUtility: number; // 0-100
  distributionPotential: number; // 0-100
  competitiveGap: number; // 0-100
  evidenceConfidence: number; // 0-1.0
  penalties: {
    thinContentRisk: number; // 0-50
    doorwayRisk: number; // 0-100
    duplicateRisk: number; // 0-50
    lowInventoryRisk: number; // 0-50
    cannibalizationRisk: number; // 0-50
  };
}): { score: number; priority: OpportunityPriority } {
  // If doorway risk is severe (>= 80), instant reject
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
    title: 'Amplify ATS Resume Roast & Shareable Scorecard Loop',
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
    decisionReason: 'Highest empirical conversion (24%) and viral K-factor (0.33) across all surfaces.',
    recommendedAction: 'Attach 1-Click WhatsApp Scorecard Share Trigger and 3-invite HR unlock queue.',
    expectedUserGain: 15000,
    confidence: 0.96,
    status: 'IN_PROGRESS'
  },
  {
    opportunityId: 'opp_gsc_safety_officer',
    title: 'Optimize Page 1 Live Winner: Safety Officer Fresher Jobs',
    channel: 'SEARCH_ORGANIC',
    surface: 'JOBS',
    targetQueryOrEntity: 'safety officer fresher jobs',
    canonicalUrl: 'https://talentxcel.in/jobs/safety-officer-fresher',
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
    decisionReason: 'Live GSC position 1.33 with strong search demand. High short-term ranking stability.',
    recommendedAction: 'Inject JobPosting Schema, refresh salary benchmark range, and add 5 fresh active listings.',
    expectedUserGain: 4500,
    confidence: 0.94,
    status: 'PENDING'
  },
  {
    opportunityId: 'opp_salary_bangalore_sde',
    title: 'Scale Wise-Model Salary Take-Home Calculator for Bangalore Tech',
    channel: 'AI_DISCOVERY_GEO',
    surface: 'SALARY_INTELLIGENCE',
    targetQueryOrEntity: 'software engineer salary bangalore in hand',
    canonicalUrl: 'https://talentxcel.in/tools/salary-calculator',
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
    decisionReason: 'High AI search citation potential on Perplexity and ChatGPT for compensation benchmarks.',
    recommendedAction: 'Publish structured JSON-LD dataset with Indian tax regime comparison and city multipliers.',
    expectedUserGain: 8000,
    confidence: 0.91,
    status: 'PENDING'
  }
];

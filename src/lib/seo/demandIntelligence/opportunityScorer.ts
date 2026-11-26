// src/lib/seo/demandIntelligence/opportunityScorer.ts
// Transparent, configurable 7-factor opportunity scoring engine.
// Never fabricates demand metrics: unknown volume reduces confidence and explains every score factor.

import {
  DEFAULT_SCORING_WEIGHTS,
  type OpportunityScoreInput,
  type ScoreBreakdown,
  type ScoringWeights,
} from './types';

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n * 100) / 100));
}

export function validateScoringWeights(weights: ScoringWeights): ScoringWeights {
  const sum =
    weights.demandEvidence +
    weights.gscOpportunity +
    weights.talentxcelRelevance +
    weights.inventoryAvailability +
    weights.conversionPotential +
    weights.contentQualityGap +
    weights.competition;

  if (Math.abs(sum - 1.0) > 0.01) {
    throw new Error(`Invalid ScoringWeights: weights must sum to 1.0, received ${sum.toFixed(4)}`);
  }
  return weights;
}

const INTENT_CONVERSION_BASE: Record<string, number> = {
  resume_ats: 92,
  assessment_score: 90,
  career_passport: 88,
  recruiter_b2b: 94,
  fresher_entry: 82,
  internship: 78,
  job_search: 80,
  remote_work: 81,
  salary_benchmark: 72,
  visa_international: 76,
  government_jobs: 75,
  interview_prep: 68,
  skill_learning: 66,
  career_roadmap: 62,
  college_placement: 70,
  company_research: 65,
  community_network: 64,
};

/**
 * Computes an explainable 7-factor SEO opportunity score with strict honest uncertainty modeling.
 */
export function scoreOpportunity(
  input: OpportunityScoreInput,
  customWeights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): ScoreBreakdown {
  const weights = validateScoringWeights(customWeights);
  const explainability: string[] = [];
  const { classified } = input;

  // 1. Search Demand Evidence (25%) — verified GSC/volume only; unknown receives conservative baseline 15 + confidence penalty
  const hasGsc = typeof input.gscImpressions === 'number' && input.gscImpressions > 0;
  const hasVerifiedVol = input.searchVolumeStatus === 'verified' && typeof input.verifiedMonthlyVolume === 'number' && input.verifiedMonthlyVolume > 0;

  let demandEvidenceScore = 15;
  let demandStatus: 'VERIFIED' | 'UNKNOWN' = 'UNKNOWN';
  if (hasGsc || hasVerifiedVol) {
    demandStatus = 'VERIFIED';
    const signal = Math.max(input.gscImpressions || 0, input.verifiedMonthlyVolume || 0);
    demandEvidenceScore = clamp(Math.log10(signal + 1) * 28);
    explainability.push(`demand=VERIFIED(${signal} -> ${demandEvidenceScore}/100)`);
  } else {
    explainability.push('demand=UNKNOWN(conservative baseline 15/100; generated/unverified volume not fabricated)');
  }

  // 2. GSC Opportunity (20%) — strike zone positions (4-20) or high impression / low CTR gap
  let gscOpportunityScore = 15;
  if (hasGsc) {
    const pos = input.gscPosition ?? 50;
    const ctr = input.gscCtr ?? 0;
    const imp = input.gscImpressions ?? 0;
    if (pos >= 4 && pos <= 20) {
      gscOpportunityScore = clamp(72 + Math.min(28, Math.log10(imp + 1) * 10));
      explainability.push(`gscOpportunity=STRIKE_ZONE(pos=${pos}, ${gscOpportunityScore}/100)`);
    } else if (pos <= 10 && imp >= 50 && ctr < 0.03) {
      gscOpportunityScore = clamp(78 + Math.min(22, Math.log10(imp + 1) * 8));
      explainability.push(`gscOpportunity=LOW_CTR_GAP(pos=${pos}, ctr=${(ctr * 100).toFixed(2)}%)`);
    } else if (pos > 20) {
      gscOpportunityScore = clamp(40 + Math.min(35, Math.log10(imp + 1) * 12));
      explainability.push(`gscOpportunity=PAGE2PLUS_GROWTH(pos=${pos})`);
    } else {
      gscOpportunityScore = clamp(55 + Math.min(25, (input.gscClicks || 0) * 0.5));
      explainability.push(`gscOpportunity=ACTIVE_TOP3(pos=${pos})`);
    }
  } else {
    explainability.push('gscOpportunity=NO_GSC_TELEMETRY(baseline 15/100)');
  }

  // 3. TalentXcel Relevance & Surface Alignment (20%)
  let talentxcelRelevanceScore = 55;
  if (classified.isClassified) talentxcelRelevanceScore += 20;
  if (classified.jobRoleSlug) talentxcelRelevanceScore += 10;
  if (
    classified.searchIntent === 'resume_ats' ||
    classified.searchIntent === 'assessment_score' ||
    classified.searchIntent === 'career_passport' ||
    classified.searchIntent === 'recruiter_b2b'
  ) {
    talentxcelRelevanceScore += 15;
  } else if (classified.citySlug || classified.skillSlug) {
    talentxcelRelevanceScore += 10;
  }
  talentxcelRelevanceScore = clamp(talentxcelRelevanceScore);
  explainability.push(`relevance=${talentxcelRelevanceScore}/100(intent=${classified.searchIntent})`);

  // 4. Inventory Availability (15%) — real DB jobs / profiles / courses
  const inv = input.liveInventoryCount ?? 0;
  let inventoryAvailabilityScore = 10;
  if (inv >= 25) inventoryAvailabilityScore = 95;
  else if (inv >= 10) inventoryAvailabilityScore = 82;
  else if (inv >= 3) inventoryAvailabilityScore = 68;
  else if (inv >= 1) inventoryAvailabilityScore = 40;
  else if (
    classified.searchIntent === 'resume_ats' ||
    classified.searchIntent === 'assessment_score' ||
    classified.searchIntent === 'career_passport'
  ) {
    // Interactive utility tools don't depend on active job listing count
    inventoryAvailabilityScore = 85;
  }
  explainability.push(`inventory=${inv}->${inventoryAvailabilityScore}/100`);

  // 5. Conversion Potential (10%) — intent conversion base + real GA4 conversions if present
  let conversionPotentialScore = INTENT_CONVERSION_BASE[classified.searchIntent] ?? 60;
  if (typeof input.ga4Conversions === 'number' && input.ga4Conversions > 0) {
    conversionPotentialScore = clamp(conversionPotentialScore + Math.min(12, input.ga4Conversions * 2));
    explainability.push(`ga4Conversions=${input.ga4Conversions}`);
  }
  conversionPotentialScore = clamp(conversionPotentialScore);

  // 6. Content Quality / Gap Potential (5%)
  const contentQualityGapScore =
    typeof input.existingContentScore === 'number'
      ? clamp(input.existingContentScore)
      : classified.isClassified
        ? 65
        : 45;

  // 7. Competition Feasibility (5%) — higher feasibility score for specific long-tail modifiers vs ultra-broad head terms
  let competitionScore = 55;
  if (typeof input.competitionIndex === 'number') {
    competitionScore = clamp(100 - input.competitionIndex);
  } else {
    const tokenCount = classified.normalizedKeyword.split(' ').length;
    if (tokenCount >= 4) competitionScore = 80;
    else if (tokenCount === 3) competitionScore = 65;
    else competitionScore = 40;
  }

  const compositeScore = clamp(
    demandEvidenceScore * weights.demandEvidence +
      gscOpportunityScore * weights.gscOpportunity +
      talentxcelRelevanceScore * weights.talentxcelRelevance +
      inventoryAvailabilityScore * weights.inventoryAvailability +
      conversionPotentialScore * weights.conversionPotential +
      contentQualityGapScore * weights.contentQualityGap +
      competitionScore * weights.competition
  );

  // Data confidence explicitly drops when demand & inventory lack empirical verification
  let dataConfidence = 0.25;
  if (hasGsc) dataConfidence += 0.40;
  else if (hasVerifiedVol) dataConfidence += 0.30;
  if (typeof input.liveInventoryCount === 'number' && input.liveInventoryCount > 0) dataConfidence += 0.20;
  if (typeof input.ga4Conversions === 'number' && input.ga4Conversions > 0) dataConfidence += 0.15;
  dataConfidence = Math.min(1, Math.round(dataConfidence * 100) / 100);

  return {
    demandEvidenceScore,
    gscOpportunityScore,
    talentxcelRelevanceScore,
    inventoryAvailabilityScore,
    conversionPotentialScore,
    contentQualityGapScore,
    competitionScore,
    compositeScore,
    dataConfidence,
    demandStatus,
    weightsUsed: weights,
    explainability,
  };
}

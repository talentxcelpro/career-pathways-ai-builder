// src/lib/seo/demandIntelligence/keywordQualityEngine.ts
// Phase 6 Keyword Quality & Semantic Deduplication Engine.
// Audits candidate/observed keywords for duplicate intent, redundant token noise, missing/unvalidated geo,
// unsupported claims, missing inventory, cannibalization risk, and assigns 11 lifecycle states.

import type { WorkModeTag } from './types';

export type QualityLifecycleState =
  | 'GENERATED'
  | 'NORMALIZED'
  | 'DEDUPLICATED'
  | 'VALIDATED'
  | 'GSC_OBSERVED'
  | 'SOURCE_OBSERVED'
  | 'INVENTORY_MATCHED'
  | 'OPPORTUNITY'
  | 'QUALIFIED'
  | 'REJECTED'
  | 'NEEDS_REVIEW';

export type QualityIssueCode =
  | 'DUPLICATE_INTENT'
  | 'SYNTACTIC_PERMUTATION'
  | 'REDUNDANT_TOKEN_NOISE'
  | 'UNLOCATED_DEFAULT_GEO'
  | 'INVALID_JOB_TITLE'
  | 'INVALID_SKILL_PAIR'
  | 'NONSENSICAL_COMBINATION'
  | 'WEAK_INTENT'
  | 'UNSUPPORTED_CLAIM'
  | 'MISSING_INVENTORY'
  | 'MISSING_DEMAND_DATA'
  | 'CANNIBALIZATION_RISK';

export interface KeywordQualityInput {
  rawKeyword: string;
  normalizedKeyword: string;
  dedupKey: string;
  searchIntent: string;
  jobRoleSlug: string | null;
  skillSlug: string | null;
  industrySlug: string | null;
  countryCode: string;
  regionCode?: string | null;
  citySlug: string | null;
  workMode: WorkModeTag;
  isExplicitGeo: boolean;
  isGeoValidated: boolean;
  isRoleValidated: boolean;
  isSkillValidated: boolean;
  sourceType: string;
  gscImpressions: number;
  publicSuggestObserved: boolean;
  realInventoryCount: number;
  isDuplicateSyntacticVariant: boolean;
  isDuplicateIntentWithinPageGroup: boolean;
  competingCanonicalCount?: number;
}

export interface KeywordQualityEvaluation {
  qualityLifecycleState: QualityLifecycleState;
  qualityScore: number;
  issues: QualityIssueCode[];
  semanticGroupKey: string;
  shouldShareCanonicalPage: boolean;
  distinctPageRequired: boolean;
  diagnosticReason: string;
}

const UNSUPPORTED_CLAIM_REGEX =
  /\b(100%\s*(placement|job\s*guarantee)|guaranteed\s*job|get\s*hired\s*in\s*24\s*hours|no\s*interview\s*direct\s*joining|earn\s*1\s*lakh\s*daily)\b/i;

const CONTRADICTORY_MODIFIERS: ReadonlyArray<[RegExp, RegExp]> = [
  [/\bfresher\b/, /\b(director|vp|vice president|cto|ceo|cfo|principal|15\+? years)\b/],
  [/\binternship\b/, /\b(senior|director|vp|principal|chief)\b/],
  [/\bremote\b/, /\bwalk[- ]?in\b/],
];

function hasRedundantRepeatedWordsOrStem(normalized: string): boolean {
  const words = normalized.split(/\s+/).filter(Boolean);
  const seenContentWords = new Map<string, number>();
  for (const w of words) {
    if (w === 'in' || w === 'for' || w === 'and' || w === 'with' || w === 'to' || w === 'of' || w === 'jobs') continue;
    const prev = seenContentWords.get(w) || 0;
    if (prev >= 1) return true; // e.g. "fresher fresher jobs", "sales executive jobs in sales"
    seenContentWords.set(w, prev + 1);
  }
  return false;
}

/**
 * Computes normalized intent-equivalent group key so near-synonymous wrappers like
 * "jobs", "vacancies", "openings", "careers" map cleanly onto one shared canonical page.
 */
export function buildSemanticGroupKey(params: {
  searchIntent: string;
  jobRoleSlug: string | null;
  skillSlug: string | null;
  industrySlug: string | null;
  countryCode: string;
  regionCode?: string | null;
  citySlug: string | null;
  workMode: string;
}): string {
  const core = params.jobRoleSlug
    ? `role:${params.jobRoleSlug}`
    : params.skillSlug
      ? `skill:${params.skillSlug}`
      : params.industrySlug
        ? `ind:${params.industrySlug}`
        : 'broad';
  const geo = params.citySlug
    ? `city:${params.citySlug}`
    : params.regionCode
      ? `reg:${params.regionCode}`
      : params.workMode === 'remote'
        ? 'remote'
        : `cc:${params.countryCode || 'GLB'}`;
  return `${params.searchIntent}|${core}|${geo}`;
}

export function evaluateKeywordQuality(input: KeywordQualityInput): KeywordQualityEvaluation {
  const issues: QualityIssueCode[] = [];
  const norm = input.normalizedKeyword;

  // 1. Check unsupported / spam / nonsensical / contradictory claims
  if (UNSUPPORTED_CLAIM_REGEX.test(input.rawKeyword)) {
    issues.push('UNSUPPORTED_CLAIM');
  }

  for (const [rxA, rxB] of CONTRADICTORY_MODIFIERS) {
    if (rxA.test(norm) && rxB.test(norm)) {
      issues.push('NONSENSICAL_COMBINATION');
      break;
    }
  }

  if (hasRedundantRepeatedWordsOrStem(norm)) {
    issues.push('REDUNDANT_TOKEN_NOISE');
  }

  // 2. Check taxonomy & geo validity
  if (!input.isExplicitGeo && !input.citySlug && input.workMode !== 'remote') {
    issues.push('UNLOCATED_DEFAULT_GEO');
  } else if (!input.isGeoValidated && input.citySlug) {
    issues.push('INVALID_JOB_TITLE');
  }

  if (!input.jobRoleSlug && !input.skillSlug && !input.industrySlug && input.searchIntent === 'job_search') {
    issues.push('WEAK_INTENT');
  }

  if (input.jobRoleSlug && !input.isRoleValidated) {
    issues.push('INVALID_JOB_TITLE');
  }

  if (input.skillSlug && !input.isSkillValidated) {
    issues.push('INVALID_SKILL_PAIR');
  }

  // 3. Duplicate intent vs syntactic permutation
  if (input.isDuplicateSyntacticVariant) {
    issues.push('SYNTACTIC_PERMUTATION');
  }
  if (input.isDuplicateIntentWithinPageGroup) {
    issues.push('DUPLICATE_INTENT');
  }

  // 4. Demand & inventory checks
  if (input.gscImpressions <= 0 && !input.publicSuggestObserved) {
    issues.push('MISSING_DEMAND_DATA');
  }
  if (input.realInventoryCount <= 0 && input.searchIntent === 'job_search') {
    issues.push('MISSING_INVENTORY');
  }
  if ((input.competingCanonicalCount ?? 0) > 1) {
    issues.push('CANNIBALIZATION_RISK');
  }

  const semanticGroupKey = buildSemanticGroupKey({
    searchIntent: input.searchIntent,
    jobRoleSlug: input.jobRoleSlug,
    skillSlug: input.skillSlug,
    industrySlug: input.industrySlug,
    countryCode: input.countryCode,
    regionCode: input.regionCode,
    citySlug: input.citySlug,
    workMode: input.workMode,
  });

  // Compute quality score (0..100)
  let qualityScore = 70;
  if (input.isRoleValidated || input.isSkillValidated) qualityScore += 12;
  if (input.isExplicitGeo && input.isGeoValidated) qualityScore += 8;
  if (input.gscImpressions > 0) qualityScore += 10;
  if (input.realInventoryCount >= 3) qualityScore += 10;

  if (issues.includes('UNSUPPORTED_CLAIM') || issues.includes('NONSENSICAL_COMBINATION')) qualityScore -= 55;
  if (issues.includes('REDUNDANT_TOKEN_NOISE')) qualityScore -= 30;
  if (issues.includes('WEAK_INTENT')) qualityScore -= 20;
  if (issues.includes('SYNTACTIC_PERMUTATION')) qualityScore -= 15;
  if (issues.includes('MISSING_INVENTORY')) qualityScore -= 15;
  qualityScore = Math.max(0, Math.min(100, qualityScore));

  // Assign one of the 11 authoritative Phase 6 lifecycle states
  let qualityLifecycleState: QualityLifecycleState = 'GENERATED';
  if (issues.includes('UNSUPPORTED_CLAIM') || issues.includes('NONSENSICAL_COMBINATION') || issues.includes('REDUNDANT_TOKEN_NOISE')) {
    qualityLifecycleState = 'REJECTED';
  } else if (issues.includes('WEAK_INTENT')) {
    qualityLifecycleState = 'NEEDS_REVIEW';
  } else if (input.gscImpressions > 0 && input.realInventoryCount >= 3 && !issues.includes('CANNIBALIZATION_RISK')) {
    qualityLifecycleState = 'QUALIFIED';
  } else if (input.gscImpressions > 0 && input.realInventoryCount > 0) {
    qualityLifecycleState = 'OPPORTUNITY';
  } else if (input.gscImpressions > 0) {
    qualityLifecycleState = 'GSC_OBSERVED';
  } else if (input.publicSuggestObserved) {
    qualityLifecycleState = 'SOURCE_OBSERVED';
  } else if (input.realInventoryCount >= 3 && input.isGeoValidated) {
    qualityLifecycleState = 'INVENTORY_MATCHED';
  } else if (input.isRoleValidated && (input.isGeoValidated || input.isSkillValidated)) {
    qualityLifecycleState = input.isDuplicateSyntacticVariant ? 'DEDUPLICATED' : 'VALIDATED';
  } else if (norm.length >= 4) {
    qualityLifecycleState = 'NORMALIZED';
  }

  return {
    qualityLifecycleState,
    qualityScore,
    issues,
    semanticGroupKey,
    shouldShareCanonicalPage: input.isDuplicateIntentWithinPageGroup || input.isDuplicateSyntacticVariant,
    distinctPageRequired: !input.isDuplicateIntentWithinPageGroup && !input.isDuplicateSyntacticVariant && qualityScore >= 60,
    diagnosticReason:
      issues.length === 0
        ? `Clean validated keyword in group ${semanticGroupKey}.`
        : `Flags: ${issues.join(', ')}`,
  };
}

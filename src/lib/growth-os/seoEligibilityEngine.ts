// src/lib/growth-os/seoEligibilityEngine.ts
// TalentXcel SEO Eligibility Engine
// Hard quality gate determining whether any TalentXcel entity should become an indexable URL.
// Prevents scaled content abuse per Google's spam policies:
// https://developers.google.com/search/docs/essentials/spam-policies
//
// PRINCIPLE: More pages does not equal more traffic.
// Every indexed URL must be:
//   - Public and consented
//   - Unique and non-duplicate
//   - Backed by real inventory or real tool utility
//   - Meeting minimum content quality thresholds
//   - Not expired (for job listings)

export type EntityType =
  | 'JOB'
  | 'PROFILE'
  | 'COMPANY'
  | 'POST'
  | 'ROLE_HUB'
  | 'LOCATION_HUB'
  | 'SKILL_HUB'
  | 'SALARY_PAGE'
  | 'CAREER_PAGE'
  | 'RESUME_TOOL';

export interface SeoEligibilityInput {
  entityType: EntityType;
  // Content quality
  contentWordCount: number;
  hasStructuredData: boolean;
  hasCanonicalUrl: boolean;
  // Inventory / freshness
  activeInventoryCount: number;
  lastUpdatedAt: string;       // ISO date string
  // Privacy / compliance (HARD GATES)
  isPublic: boolean;
  hasUserConsent: boolean;      // Required for PROFILE entities
  containsSensitivePII: boolean;
  // Uniqueness
  isDuplicateContent: boolean;
  hasDuplicateIntent: boolean;
  duplicateCanonicalTarget?: string;
  // Demand signal
  weeklyImpressions?: number;
  hasSearchDemandEvidence: boolean;
  // Quality flags
  spamProbabilityScore: number;     // 0–100
  contentOriginalityScore: number;  // 0–100
  // Job-specific fields
  isExpiredJob?: boolean;
  hasValidThrough?: boolean;
  hasJobPostingSchema?: boolean;
  hasBaseSalary?: boolean;
}

export interface SeoEligibilityDecision {
  eligible: boolean;
  robotsDirective: 'index, follow' | 'noindex, follow' | 'noindex, nofollow';
  reason: string;
  blockers: string[];
  recommendations: string[];
  eligibilityScore: number;   // 0–100
  mustUseIndexingApi: boolean;
  sitemap: 'INCLUDE' | 'EXCLUDE' | 'EXCLUDE_UNTIL_ENRICHED';
}

const ELIGIBILITY_THRESHOLD = 50;

export function evaluateSeoEligibility(input: SeoEligibilityInput): SeoEligibilityDecision {
  const blockers: string[] = [];
  const recommendations: string[] = [];
  let score = 100; // Start full, deduct for quality gaps

  // === HARD GATES — any failure = not eligible, noindex ===

  if (!input.isPublic) {
    blockers.push('Entity is not public. Private content must never be indexed.');
  }

  if (input.containsSensitivePII) {
    blockers.push('Contains sensitive PII. Must be removed before indexing is considered.');
  }

  if (input.entityType === 'PROFILE' && !input.hasUserConsent) {
    blockers.push('Profile entity requires explicit user consent for public indexing.');
  }

  if (input.isExpiredJob === true) {
    blockers.push('Expired job listing. Must be removed from index immediately (URL_DELETED via Indexing API).');
  }

  if (input.isDuplicateContent) {
    blockers.push(`Duplicate content detected. Canonical consolidation required${input.duplicateCanonicalTarget ? ` → ${input.duplicateCanonicalTarget}` : ''}.`);
  }

  if (input.spamProbabilityScore >= 80) {
    blockers.push(`High spam probability score (${input.spamProbabilityScore}/100). Fails Google spam policy threshold.`);
  }

  // If any hard gate fails, return immediately
  if (blockers.length > 0) {
    return {
      eligible: false,
      robotsDirective: input.containsSensitivePII ? 'noindex, nofollow' : 'noindex, follow',
      reason: `Failed ${blockers.length} hard gate(s). Not eligible for indexing.`,
      blockers,
      recommendations: ['Resolve all blockers before re-evaluating eligibility.'],
      eligibilityScore: 0,
      mustUseIndexingApi: false,
      sitemap: 'EXCLUDE',
    };
  }

  // === QUALITY GATES — reduce score, don't hard-block ===

  if (input.contentWordCount < 200) {
    score -= 30;
    recommendations.push(`Increase content depth. Current estimate: ~${input.contentWordCount} words. Minimum 200 words of substantive content.`);
  } else if (input.contentWordCount < 400) {
    score -= 10;
    recommendations.push('Consider expanding content to at least 400 words for stronger quality signals.');
  }

  const isHubPage = ['ROLE_HUB', 'LOCATION_HUB', 'SKILL_HUB'].includes(input.entityType);
  if (isHubPage && input.activeInventoryCount < 3) {
    score -= 25;
    recommendations.push(`Hub pages require at least 3 active inventory items. Current: ${input.activeInventoryCount}. Add real jobs/listings before indexing.`);
  }

  if (!input.hasStructuredData) {
    score -= 20;
    recommendations.push('Add structured data (JobPosting, BreadcrumbList, or relevant schema.org type).');
  }

  if (!input.hasCanonicalUrl) {
    score -= 15;
    recommendations.push('Add a self-referencing canonical URL to prevent duplicate signals.');
  }

  if (!input.hasSearchDemandEvidence) {
    score -= 10;
    recommendations.push('No confirmed search demand signal. Verify query volume via GSC before publishing.');
  }

  if (input.contentOriginalityScore < 50) {
    score -= 15;
    recommendations.push(`Low content originality score (${input.contentOriginalityScore}/100). Ensure unique value vs. existing pages.`);
  } else if (input.contentOriginalityScore < 70) {
    score -= 5;
  }

  if (input.hasDuplicateIntent) {
    score -= 20;
    recommendations.push('Another TalentXcel URL targets the same search intent. Risk of cannibalization. Consolidate or differentiate.');
  }

  // Job-specific quality factors
  if (input.entityType === 'JOB') {
    if (!input.hasValidThrough) {
      score -= 20;
      recommendations.push('Job missing validThrough date. Required by Google JobPosting spec and Indexing API guidelines.');
    }
    if (!input.hasBaseSalary) {
      score -= 5;
      recommendations.push('Add baseSalary to JobPosting schema for richer Google for Jobs display.');
    }
  }

  score = Math.max(0, score);

  const eligible = score >= ELIGIBILITY_THRESHOLD;

  // mustUseIndexingApi: only for JOB entities with valid JobPosting schema
  const mustUseIndexingApi = input.entityType === 'JOB' && (input.hasJobPostingSchema === true);

  // Sitemap decision
  let sitemap: SeoEligibilityDecision['sitemap'];
  if (!eligible) {
    sitemap = 'EXCLUDE';
  } else if (score >= 70) {
    sitemap = 'INCLUDE';
  } else {
    sitemap = 'EXCLUDE_UNTIL_ENRICHED';
  }

  const reasonParts: string[] = [];
  if (eligible) {
    reasonParts.push(`Eligible (score: ${score}/100).`);
    if (recommendations.length > 0) reasonParts.push(`${recommendations.length} quality recommendation(s) to improve score.`);
  } else {
    reasonParts.push(`Not eligible (score: ${score}/100 < threshold ${ELIGIBILITY_THRESHOLD}).`);
  }

  return {
    eligible,
    robotsDirective: eligible ? 'index, follow' : 'noindex, follow',
    reason: reasonParts.join(' '),
    blockers,
    recommendations,
    eligibilityScore: score,
    mustUseIndexingApi,
    sitemap,
  };
}

export function evaluateSeoEligibilityBatch(
  inputs: Array<{ id: string; input: SeoEligibilityInput }>
): Array<{ id: string; decision: SeoEligibilityDecision }> {
  return inputs.map(({ id, input }) => ({ id, decision: evaluateSeoEligibility(input) }));
}

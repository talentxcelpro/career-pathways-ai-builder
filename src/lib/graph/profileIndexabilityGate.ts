// src/lib/graph/profileIndexabilityGate.ts
// Profile Quality Scoring Model & Privacy Gate for TalentXcel Professional Search Graph
// Invariant: Privacy strictly overrides SEO. Zero requirement of 2 verified skills. Configurable 0-100 quality scoring.

import type { ProfileQualityScoreBreakdown, ProfileIndexabilityDecision, EntityLifecycleStatus } from './types';

export const QUALITY_SCORE_THRESHOLD = 50; // Out of 100

export interface RawProfileEvaluationData {
  id: string;
  fullName?: string;
  headline?: string;
  about?: string;
  experiences?: Array<any>;
  skills?: Array<string | any>;
  educations?: Array<any>;
  postsCount?: number;
  isVerified?: boolean;
  isPrivate?: boolean;
  isSuspended?: boolean;
  isDeleted?: boolean;
  username?: string;
}

/**
 * Computes granular 0-100 quality score for a professional profile
 */
export function computeProfileQualityScore(
  profile: RawProfileEvaluationData,
  threshold: number = QUALITY_SCORE_THRESHOLD
): ProfileQualityScoreBreakdown {
  let nameScore = 0;
  let headlineScore = 0;
  let aboutScore = 0;
  let experienceScore = 0;
  let skillsScore = 0;
  let educationScore = 0;
  let activityScore = 0;
  let identityVerifiedScore = 0;

  // 1. Name (+20)
  if (profile.fullName && profile.fullName.trim().length >= 3) {
    nameScore = 20;
  }

  // 2. Professional Headline (+20)
  if (profile.headline && profile.headline.trim().length >= 4) {
    headlineScore = 20;
  }

  // 3. About / Summary (+15)
  if (profile.about && profile.about.trim().length >= 20) {
    aboutScore = 15;
  } else if (profile.about && profile.about.trim().length > 0) {
    aboutScore = 8;
  }

  // 4. Experience (+15)
  if (profile.experiences && profile.experiences.length > 0) {
    experienceScore = 15;
  }

  // 5. Skills (+10) (At least 1 skill provides full skill score)
  if (profile.skills && profile.skills.length > 0) {
    skillsScore = 10;
  }

  // 6. Education (+5)
  if (profile.educations && profile.educations.length > 0) {
    educationScore = 5;
  }

  // 7. Public Activity / Posts (+10)
  if (profile.postsCount && profile.postsCount > 0) {
    activityScore = 10;
  }

  // 8. Identity Verified Signal (+5)
  if (profile.isVerified) {
    identityVerifiedScore = 5;
  }

  const totalScore = 
    nameScore + 
    headlineScore + 
    aboutScore + 
    experienceScore + 
    skillsScore + 
    educationScore + 
    activityScore + 
    identityVerifiedScore;

  return {
    nameScore,
    headlineScore,
    aboutScore,
    experienceScore,
    skillsScore,
    educationScore,
    activityScore,
    identityVerifiedScore,
    totalScore,
    thresholdRequired: threshold,
    isQualityPass: totalScore >= threshold,
  };
}

/**
 * Evaluates profile indexability enforcing privacy hierarchy and quality gates
 * Privacy strictly overrides SEO
 */
export function evaluateProfileIndexability(
  profile: RawProfileEvaluationData,
  threshold: number = QUALITY_SCORE_THRESHOLD
): ProfileIndexabilityDecision {
  const quality = computeProfileQualityScore(profile, threshold);

  // 1. Explicit Deletion or Suspension
  if (profile.isDeleted) {
    return {
      isIndexable: false,
      entityStatus: 'DELETED',
      indexabilityStatus: 'NOT_ELIGIBLE',
      robotsDirective: 'noindex, nofollow',
      eligibleForSitemap: false,
      qualityScoreBreakdown: quality,
      reason: 'Profile is soft-deleted. Stripped from search discovery.',
    };
  }

  if (profile.isSuspended) {
    return {
      isIndexable: false,
      entityStatus: 'SUSPENDED',
      indexabilityStatus: 'NOT_ELIGIBLE',
      robotsDirective: 'noindex, nofollow',
      eligibleForSitemap: false,
      qualityScoreBreakdown: quality,
      reason: 'Profile is suspended by moderation. Blocked from indexing.',
    };
  }

  // 2. Privacy Gate: Private profiles are strictly non-indexable
  if (profile.isPrivate) {
    return {
      isIndexable: false,
      entityStatus: 'PRIVATE',
      indexabilityStatus: 'NOT_ELIGIBLE',
      robotsDirective: 'noindex, nofollow',
      eligibleForSitemap: false,
      qualityScoreBreakdown: quality,
      reason: 'Profile set to private by user. Immediate internal de-indexing enforced.',
    };
  }

  // 3. Public but below quality threshold: NOINDEX, FOLLOW (protects domain reputation)
  if (!quality.isQualityPass) {
    return {
      isIndexable: false,
      entityStatus: 'ACTIVE',
      indexabilityStatus: 'NOT_ELIGIBLE',
      robotsDirective: 'noindex, follow',
      eligibleForSitemap: false,
      qualityScoreBreakdown: quality,
      reason: `Profile completeness score (${quality.totalScore}/100) is below threshold (${threshold}). Excluded from XML sitemaps to prevent thin profile penalties.`,
    };
  }

  // 4. Quality Pass: Eligible for search indexing
  return {
    isIndexable: true,
    entityStatus: 'ACTIVE',
    indexabilityStatus: 'ELIGIBLE',
    robotsDirective: 'index, follow',
    eligibleForSitemap: true,
    qualityScoreBreakdown: quality,
    reason: `Profile satisfies all quality conditions (Score: ${quality.totalScore}/100 >= ${threshold}). Approved for public search discovery.`,
  };
}

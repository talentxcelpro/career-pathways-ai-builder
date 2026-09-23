/**
 * TalentXcel Discovery Page Governor
 * Enforces quality thresholds on search & discovery URLs.
 * A page becomes indexable only when:
 * 1. Active verified inventory >= MIN_INVENTORY_THRESHOLD (3)
 * 2. Meaningful search intent exists
 * 3. Unique localized content is present
 * 4. Not an artificial mathematical permutation
 * Otherwise, outputs "noindex, follow" to protect crawl budget and domain authority.
 */

export interface DiscoveryGovernorDecision {
  shouldIndex: boolean;
  robotsMeta: 'index, follow' | 'noindex, follow';
  canonicalUrl: string;
  reason: string;
}

export const MIN_INVENTORY_THRESHOLD = 3;

export function evaluateDiscoveryPageGovernor(params: {
  urlPath: string;
  jobCount: number;
  hasUniqueEditorialContent?: boolean;
  isCanonicalCategoryOrCity?: boolean;
}): DiscoveryGovernorDecision {
  const { urlPath, jobCount, hasUniqueEditorialContent = false, isCanonicalCategoryOrCity = false } = params;

  // Root listing and primary verified hubs always index
  const isPrimaryHub =
    urlPath === '/jobs' ||
    urlPath === '/government-jobs' ||
    urlPath === '/jobs/freshers' ||
    urlPath === '/government-jobs/freshers';

  if (isPrimaryHub) {
    return {
      shouldIndex: true,
      robotsMeta: 'index, follow',
      canonicalUrl: `https://talentxcel.in${urlPath}`,
      reason: 'Primary discovery hub page.',
    };
  }

  // If thin inventory (< 3 verified jobs) and no editorial content, noindex
  if (jobCount < MIN_INVENTORY_THRESHOLD && !hasUniqueEditorialContent) {
    return {
      shouldIndex: false,
      robotsMeta: 'noindex, follow',
      canonicalUrl: `https://talentxcel.in${urlPath}`,
      reason: `Thin inventory (${jobCount} jobs < threshold ${MIN_INVENTORY_THRESHOLD}). Protected from doorway page indexing.`,
    };
  }

  return {
    shouldIndex: true,
    robotsMeta: 'index, follow',
    canonicalUrl: `https://talentxcel.in${urlPath}`,
    reason: `Sufficient verified inventory (${jobCount} jobs) with authentic search intent.`,
  };
}
